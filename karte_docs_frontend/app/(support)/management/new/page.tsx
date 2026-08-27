'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { BlurCanvas } from '@/components/blur-tool/blur-canvas';
import {
    Save,
    ArrowLeft,
    Image as ImageIcon,
    Eye,
    Loader2,
    ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";

export default function NewTutorialPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [audience, setAudience] = useState('MEDICAL');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = async () => {
        if (!title.trim() || !content.trim()) {
            return alert("Please fill in both the title and content.");
        }
        setIsSubmitting(true);
        try {
            await api.post('/tutorials', {
                title,
                content,
                targetAudience: audience,
                changelog: "Initial Release"
            });
            router.push('/management');
        } catch (error) {
            console.error("Failed to save tutorial:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const onBlurImageSaved = (blob: Blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64data = reader.result;
            setContent(prev => prev + `\n\n![Blurred Image](${base64data})\n`);
            alert("Image redacted and appended to content!");
        };
        reader.readAsDataURL(blob);
    };

    return (
        <div className="space-y-6">
            {/* Header / Top Navigation */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <Button 
                    variant="ghost" 
                    onClick={() => router.back()} 
                    className="text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <Button 
                    onClick={handleSave} 
                    disabled={isSubmitting} 
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-2 transition-colors shadow-sm"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="animate-spin h-4 w-4" />
                            <span>Publishing...</span>
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            <span>Publish Tutorial</span>
                        </>
                    )}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Editor Main Content */}
                <div className="lg:col-span-2 space-y-4">
                    <Card className="p-6 bg-slate-900/60 border-slate-800/80 backdrop-blur-sm shadow-sm space-y-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tutorial Title</Label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. How to use Karte Lab Results"
                                className="bg-slate-950/80 border-slate-800 text-slate-100 text-lg py-6 placeholder:text-slate-500 focus-visible:ring-emerald-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Guide Content (Markdown)</Label>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="h-8 text-xs border-slate-700 bg-slate-800/50 text-slate-200 hover:bg-slate-800 hover:text-white gap-1.5 transition-colors"
                                        >
                                            <ImageIcon className="h-3.5 w-3.5 text-emerald-400" />
                                            <span>Blur Screenshot</span>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl bg-slate-900 border-slate-800 text-slate-100">
                                        <DialogHeader>
                                            <DialogTitle className="text-slate-100 flex items-center gap-2">
                                                <ShieldAlert className="h-5 w-5 text-emerald-400" /> Image Redaction Tool
                                            </DialogTitle>
                                        </DialogHeader>
                                        <div className="pt-2">
                                            <BlurCanvas onSave={onBlurImageSaved} />
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write your guide instructions here using Markdown..."
                                className="bg-slate-950/80 border-slate-800 text-slate-200 min-h-[420px] font-mono text-sm leading-relaxed placeholder:text-slate-500 focus-visible:ring-emerald-500 resize-y"
                            />
                        </div>
                    </Card>
                </div>

                {/* Settings Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="p-6 bg-slate-900/60 border-slate-800/80 backdrop-blur-sm shadow-sm space-y-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Audience</Label>
                            <Select value={audience} onValueChange={(val) => { if (val) setAudience(val); }}>
                                <SelectTrigger className="bg-slate-950/80 border-slate-800 text-slate-200 focus:ring-emerald-500">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                                    <SelectItem value="MEDICAL" className="focus:bg-slate-800 focus:text-emerald-400">
                                        Medical Staff (Doctors/Nurses)
                                    </SelectItem>
                                    <SelectItem value="SUPPORT" className="focus:bg-slate-800 focus:text-emerald-400">
                                        Support Staff (Internal)
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                                <Eye className="h-3.5 w-3.5 text-emerald-400" /> Visibility Status
                            </h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Tutorials published for <strong className="text-slate-200 font-semibold">{audience === 'MEDICAL' ? 'Medical Staff' : 'Support Staff'}</strong> will be immediately available on their dashboard.
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
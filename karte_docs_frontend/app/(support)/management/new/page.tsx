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
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
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
        if (!title || !content) return alert("Please fill title and content");
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
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const onBlurImageSaved = (blob: Blob) => {
        // In a real app, you'd upload this to your /tutorials/images/upload endpoint
        // and get a URL back. For the sprint, we'll convert to Base64 to show it works!
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64data = reader.result;
            setContent(prev => prev + `\n\n![Blurred Image](${base64data})\n`);
            alert("Image blurred and appended to content!");
        };
        reader.readAsDataURL(blob);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.back()} className="text-slate-400">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <Button onClick={handleSave} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-500">
                    {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : <><Save className="h-4 w-4 mr-2" /> Publish Tutorial</>}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Editor Side */}
                <div className="lg:col-span-2 space-y-4">
                    <Card className="p-6 bg-slate-900 border-slate-800 space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Tutorial Title</label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. How to use Karte Lab Results"
                                className="bg-slate-950 border-slate-800 text-lg py-6"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <label className="text-xs font-bold text-slate-500 uppercase">Guide Content (Markdown)</label>
                                <Dialog>
                                    <DialogTrigger>
                                        <Button variant="outline" size="sm" className="h-7 text-xs border-slate-800 gap-1.5">
                                            <ImageIcon className="h-3 w-3" /> Blur Screenshot
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl bg-slate-900 border-slate-800 text-white">
                                        <DialogHeader><DialogTitle>Image Redaction Tool</DialogTitle></DialogHeader>
                                        <BlurCanvas onSave={onBlurImageSaved} />
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write your guide instructions here..."
                                className="bg-slate-950 border-slate-800 min-h-[400px] font-mono text-sm leading-relaxed"
                            />
                        </div>
                    </Card>
                </div>

                {/* Settings Side */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="p-6 bg-slate-900 border-slate-800 space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Target Audience</label>
                            <Select value={audience} onValueChange={(val) => { if (val) setAudience(val); }}>
                                <SelectTrigger className="bg-slate-950 border-slate-800">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-800">
                                    <SelectItem value="MEDICAL">Medical Staff (Doctors/Nurses)</SelectItem>
                                    <SelectItem value="SUPPORT">Support Staff (Internal)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <h4 className="text-xs font-bold text-blue-400 uppercase mb-2 flex items-center gap-2">
                                <Eye className="h-3 w-3" /> Live Preview
                            </h4>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                                Tutorials published for <strong>{audience}</strong> will be immediately visible on their dashboard.
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { BlurCanvas } from '@/components/blur-tool/blur-canvas';
import { TutorialContent } from '@/components/tutorial/tutorial-content'; // Import your renderer
import {
    Save, ArrowLeft, Image as ImageIcon, Eye, EyeOff, Loader2, ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ApiResponse } from '@/types';

export default function NewTutorialPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [audience, setAudience] = useState('MEDICAL');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isPreview, setIsPreview] = useState(false); // New state for preview

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
            setIsSubmitting(false); // Reset if failed
        }
    };

    const onBlurImageSaved = async (blob: Blob) => {
        // FIX: Use isUploadingImage, not isSubmitting
        setIsUploadingImage(true);

        const formData = new FormData();
        formData.append('file', blob, 'redacted_screenshot.png');

        try {
            const response = await api.post<ApiResponse<string>>('/tutorials/images/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const imageUrl = response.data.data;
            setContent(prev => prev + `\n\n![Tutorial Step](${imageUrl})\n`);
            alert("Image uploaded and added to editor.");
        } catch (error) {
            console.error("Cloudinary upload failed:", error);
            alert("Failed to upload image to cloud");
        } finally {
            setIsUploadingImage(false); // Reset the correct state
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <Button variant="ghost" onClick={() => router.back()} className="text-slate-400">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <div className="flex gap-3">
                    {/* Toggle Preview Button */}
                    <Button
                        variant="outline"
                        onClick={() => setIsPreview(!isPreview)}
                        className="border-slate-800 text-slate-300"
                    >
                        {isPreview ? <><EyeOff className="mr-2 h-4 w-4" /> Edit</> : <><Eye className="mr-2 h-4 w-4" /> Preview</>}
                    </Button>

                    <Button
                        onClick={handleSave}
                        disabled={isSubmitting || isUploadingImage}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                        {isSubmitting ? <><Loader2 className="animate-spin h-4 w-4 mr-2" /> Publishing...</> : <><Save className="h-4 w-4 mr-2" /> Publish Tutorial</>}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <Card className="p-6 bg-slate-900/60 border-slate-800/80 min-h-[600px]">
                        {isPreview ? (
                            // PREVIEW MODE: Uses your TutorialContent component to show real images
                            <div className="space-y-4 text-white">
                                <h1 className="text-2xl font-bold text-white border-b border-slate-800 pb-4">{title || "Untitled Tutorial"}</h1>
                                <div className="text-white prose prose-invert max-w-none prose-p:text-white prose-headings:text-white prose-strong:text-white">
                                    <TutorialContent content={content} />
                                </div>
                            </div>
                        ) : (
                            // EDIT MODE: Standard Textarea
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-400 uppercase">Tutorial Title</Label>
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="bg-slate-950/80 border-slate-800 text-slate-100 text-lg py-6"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-xs font-bold text-slate-400 uppercase">Guide Content (Markdown)</Label>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" disabled={isUploadingImage} className="border-slate-700 bg-slate-800/50 text-slate-200">
                                                    {isUploadingImage ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <ImageIcon className="h-3.5 w-3.5 text-emerald-400 mr-1.5" />}
                                                    {isUploadingImage ? "Uploading..." : "Blur Screenshot"}
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-4xl bg-slate-900 border-slate-800 text-slate-100">
                                                <DialogHeader>
                                                    <DialogTitle className="flex items-center gap-2"><ShieldAlert className="text-emerald-400" /> Image Redaction Tool</DialogTitle>
                                                </DialogHeader>
                                                <BlurCanvas onSave={onBlurImageSaved} />
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    <Textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="bg-slate-950/80 border-slate-800 text-slate-200 min-h-[450px] font-mono"
                                    />
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <Card className="p-6 bg-slate-900/60 border-slate-800/80 space-y-6">
                        <Label className="text-xs font-bold text-slate-400 uppercase">Target Audience</Label>
                        <Select value={audience} onValueChange={setAudience}>
                            <SelectTrigger className="bg-slate-950/80 border-slate-800 text-slate-200">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                                <SelectItem value="MEDICAL">Medical Staff</SelectItem>
                                <SelectItem value="SUPPORT">Support Staff</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 leading-relaxed">
                            <Eye className="h-4 w-4 text-emerald-400 mb-2" />
                            Tutorials published for <strong>{audience}</strong> will be visible immediately.
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
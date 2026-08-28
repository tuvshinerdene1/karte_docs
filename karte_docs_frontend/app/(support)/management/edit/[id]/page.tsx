'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ApiResponse, Tutorial } from '@/types';
import { BlurCanvas } from '@/components/blur-tool/blur-canvas';
import { TutorialContent } from '@/components/tutorial/tutorial-content';
import {
    Save,
    ArrowLeft,
    ImageIcon,
    History,
    Loader2,
    AlertCircle,
    ShieldAlert,
    Eye,
    EyeOff
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
import { Badge } from '@/components/ui/badge';

export default function EditTutorialPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const tutorialId = resolvedParams.id;
    const router = useRouter();

    // Page States
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isPreview, setIsPreview] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [audience, setAudience] = useState('MEDICAL');
    const [changelog, setChangelog] = useState('');
    const [currentVersion, setCurrentVersion] = useState(0);

    useEffect(() => {
        const fetchTutorial = async () => {
            try {
                const response = await api.get<ApiResponse<Tutorial>>(`/tutorials/${tutorialId}`);
                const data = response.data.data;
                setTitle(data.title);
                setContent(data.content);
                setAudience(data.targetAudience);
                setCurrentVersion(data.currentVersionNumber);
            } catch (error) {
                console.error("Failed to load tutorial:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTutorial();
    }, [tutorialId]);

    const handleUpdate = async () => {
        if (!title.trim() || !content.trim() || !changelog.trim()) {
            alert("Title, content, and changelog are required for version updates.");
            return;
        }

        setIsSubmitting(true);
        try {
            await api.put(`/tutorials/${tutorialId}`, {
                title,
                content,
                targetAudience: audience,
                changelog: changelog
            });
            router.push('/management');
        } catch (error) {
            console.error("Failed to update tutorial:", error);
            setIsSubmitting(false);
        }
    };

    const onBlurImageSaved = async (blob: Blob) => {
        setIsUploadingImage(true);
        const formData = new FormData();
        formData.append('file', blob, 'redacted_screenshot.png');

        try {
            const response = await api.post<ApiResponse<string>>('/tutorials/images/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const imageUrl = response.data.data;
            setContent(prev => prev + `\n\n![Redacted Screenshot](${imageUrl})\n`);
            alert("Image redacted and uploaded to cloud!");
        } catch (error) {
            console.error("Cloudinary upload failed:", error);
            alert("Failed to upload image to cloud");
        } finally {
            setIsUploadingImage(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-24 text-emerald-500 gap-2">
                <Loader2 className="animate-spin h-6 w-6" />
                <span className="text-sm font-medium text-slate-400">Loading tutorial data...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Navigation */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="text-slate-400 hover:text-slate-100 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-2.5 py-1">
                        Editing Version {currentVersion}
                    </Badge>
                </div>

                <div className="flex gap-3">
                    {/* Preview Toggle */}
                    <Button
                        variant="outline"
                        onClick={() => setIsPreview(!isPreview)}
                        className="border-slate-800 text-slate-300 hover:bg-slate-800"
                    >
                        {isPreview ? <><EyeOff className="mr-2 h-4 w-4" /> Edit</> : <><Eye className="mr-2 h-4 w-4" /> Preview</>}
                    </Button>

                    <Button
                        onClick={handleUpdate}
                        disabled={isSubmitting || isUploadingImage}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-2 shadow-sm"
                    >
                        {isSubmitting ? (
                            <><Loader2 className="animate-spin h-4 w-4" /> Publishing...</>
                        ) : (
                            <><Save className="h-4 w-4" /> Publish Version {currentVersion + 1}</>
                        )}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Editor/Preview Area */}
                <div className="lg:col-span-2 space-y-4">
                    <Card className="p-6 bg-slate-900/60 border-slate-800/80 backdrop-blur-sm min-h-[600px]">
                        {isPreview ? (
                            <div className="space-y-4 text-white">
                                <h1 className="text-2xl font-bold text-white border-b border-slate-800 pb-4">{title || "Untitled Tutorial"}</h1>
                                <div className="text-white prose prose-invert max-w-none prose-p:text-white prose-headings:text-white prose-strong:text-white">
                                    <TutorialContent content={content} />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Guide Title</Label>
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="bg-slate-950/80 border-slate-800 text-slate-100 text-lg font-semibold py-6 focus:ring-emerald-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Content Editor (Markdown)</Label>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={isUploadingImage}
                                                    className="h-8 text-xs border-slate-700 bg-slate-800/50 text-slate-200 hover:bg-slate-800 gap-1.5"
                                                >
                                                    {isUploadingImage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5 text-emerald-400" />}
                                                    <span>{isUploadingImage ? "Uploading..." : "Blur Screenshot"}</span>
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-4xl bg-slate-900 border-slate-800 text-slate-100">
                                                <DialogHeader>
                                                    <DialogTitle className="text-slate-100 flex items-center gap-2">
                                                        <ShieldAlert className="h-5 w-5 text-emerald-400" /> Image Redaction Tool
                                                    </DialogTitle>
                                                </DialogHeader>
                                                <BlurCanvas onSave={onBlurImageSaved} />
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    <Textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="bg-slate-950/80 border-slate-800 text-slate-200 min-h-[480px] font-mono text-sm leading-relaxed focus:ring-emerald-500 resize-y"
                                    />
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="p-6 bg-slate-900/60 border-slate-800/80 backdrop-blur-sm shadow-sm space-y-6">
                        <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                                <History className="h-4 w-4" /> Versioning Info
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Saving changes archives <strong className="text-slate-200">Version {currentVersion}</strong> and creates <strong className="text-slate-200">Version {currentVersion + 1}</strong>.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">What changed? (Changelog)</Label>
                            <Textarea
                                value={changelog}
                                onChange={(e) => setChangelog(e.target.value)}
                                placeholder="e.g. Updated billing workflow screenshots..."
                                className="bg-slate-950/80 border-slate-800 text-slate-200 min-h-[110px] text-xs resize-y"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Audience</Label>
                            <Select value={audience} onValueChange={setAudience}>
                                <SelectTrigger className="bg-slate-950/80 border-slate-800 text-slate-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                                    <SelectItem value="MEDICAL">Medical Staff</SelectItem>
                                    <SelectItem value="SUPPORT">Support Staff</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
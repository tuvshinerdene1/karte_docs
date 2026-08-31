'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ApiResponse, Tutorial } from '@/types';
import { BlurCanvas } from '@/components/blur-tool/blur-canvas';
import { TutorialContent } from '@/components/tutorial/tutorial-content';
import { EditorToolbar } from '@/components/tutorial/editor-toolbar';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import {
    Save, ArrowLeft, ImageIcon, History, Loader2, AlertCircle, ShieldAlert, Eye, EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

export default function EditTutorialPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const tutorialId = resolvedParams.id;
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState(''); // Stores the HTML
    const [audience, setAudience] = useState('MEDICAL');
    const [changelog, setChangelog] = useState('');
    const [currentVersion, setCurrentVersion] = useState(0);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                // Ensure these are enabled
                heading: {
                    levels: [1, 2, 3],
                },
                bulletList: {},
                orderedList: {},
            }),
            Image,
        ],
        content: content,
        onUpdate: ({ editor }) => {
            setContent(editor.getHTML());
        },
        editorProps: {
            attributes: {
                // Ensure 'tiptap' class is here so the CSS above applies
                class: 'tiptap prose prose-invert max-w-none focus:outline-none p-4 min-h-[500px] text-slate-200',
            },
        },
        immediatelyRender: false,
    });

    useEffect(() => {
        const fetchTutorial = async () => {
            try {
                const response = await api.get<ApiResponse<Tutorial>>(`/tutorials/${tutorialId}`);
                const data = response.data.data;
                setTitle(data.title);
                setAudience(data.targetAudience);
                setCurrentVersion(data.currentVersionNumber);
                setContent(data.content);

                // CRITICAL: Inject existing content into the editor
                if (editor) {
                    editor.commands.setContent(data.content);
                }
            } catch (error) {
                console.error("Failed to load tutorial:", error);
            } finally {
                setLoading(false);
            }
        };
        if (editor) fetchTutorial();
    }, [tutorialId, editor]);

    const handleUpdate = async () => {
        if (!title.trim() || !content.trim() || !changelog.trim()) {
            alert("Title, content, and changelog are required.");
            return;
        }

        setIsSubmitting(true);
        try {
            await api.put(`/tutorials/${tutorialId}`, {
                title,
                content, // Sending HTML string
                targetAudience: audience,
                changelog: changelog
            });
            router.push('/management');
        } catch (error) {
            console.error("Failed to update:", error);
            setIsSubmitting(false);
        }
    };

    const onBlurImageSaved = async (blob: Blob) => {
        setIsUploadingImage(true);
        const formData = new FormData();
        // Ensure the key is exactly "file" to match @RequestParam("file")
        formData.append('file', blob, 'redacted.png');

        try {
            const response = await api.post<ApiResponse<string>>('/tutorials/images/upload', formData, {
                // CRITICAL: Overriding the global JSON header
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const imageUrl = response.data.data;
            editor?.chain().focus().setImage({ src: imageUrl }).run();
        } catch (error: any) {
            // Log the specific response from Spring Boot to see the error message
            console.error("Server Error Detail:", error.response?.data);
            alert(`Upload error: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsUploadingImage(false);
        }
    };

    if (loading) return <div className="p-20 text-center text-emerald-500"><Loader2 className="animate-spin inline mr-2" /> Loading...</div>;

    return (
        <div className="space-y-6">
            {/* Header stays identical to New Page */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={() => router.back()} className="text-slate-400"><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Editing Version {currentVersion}</Badge>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setIsPreview(!isPreview)} className="border-slate-800 text-slate-300">
                        {isPreview ? <><EyeOff className="mr-2 h-4 w-4" /> Edit</> : <><Eye className="mr-2 h-4 w-4" /> Preview</>}
                    </Button>
                    <Button onClick={handleUpdate} disabled={isSubmitting || isUploadingImage} className="bg-emerald-600 hover:bg-emerald-500">
                        {isSubmitting ? "Publishing..." : `Publish Version ${currentVersion + 1}`}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card className="p-6 bg-slate-900/60 border-slate-800/80 min-h-[600px]">
                        {isPreview ? (
                            <div className="space-y-4">
                                <h1 className="text-2xl font-bold text-white border-b border-slate-800 pb-4">{title}</h1>
                                <TutorialContent content={content} />
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-white border-slate-800 text-lg py-6" />
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-xs font-bold text-slate-400 uppercase">Editor</Label>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" disabled={isUploadingImage} className="border-slate-700 bg-slate-800/50 text-slate-200">
                                                    <ImageIcon className="h-3.5 w-3.5 text-emerald-400 mr-2" /> Blur Screenshot
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-4xl bg-slate-900 border-slate-800"><BlurCanvas onSave={onBlurImageSaved} /></DialogContent>
                                        </Dialog>
                                    </div>
                                    {/* USE TIPTAP INSTEAD OF TEXTAREA */}
                                    <div className="bg-slate-950/80 border border-slate-800 rounded-md">
                                        <EditorToolbar editor={editor} />
                                        <EditorContent editor={editor} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Sidebar for Changelog */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="p-6 bg-slate-900/60 border-slate-800/80">
                        <div className="space-y-4">
                            <Label className="text-xs font-bold text-slate-400 uppercase">Version Notes (Required)</Label>
                            <Textarea
                                value={changelog}
                                onChange={(e) => setChangelog(e.target.value)}
                                placeholder="Explain what you updated..."
                                className="bg-white border-slate-800 text-xs min-h-[100px]"
                            />
                            <Label className="text-xs font-bold text-slate-400 uppercase block mt-4">Audience</Label>
                            <Select value={audience} onValueChange={setAudience}>
                                <SelectTrigger className="bg-white border-slate-800"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-white border-slate-800"><SelectItem value="MEDICAL">Medical</SelectItem><SelectItem value="SUPPORT">Support</SelectItem></SelectContent>
                            </Select>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
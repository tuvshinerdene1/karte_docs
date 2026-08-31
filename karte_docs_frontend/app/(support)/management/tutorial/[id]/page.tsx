'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Tutorial, ApiResponse } from '@/types';
import { TutorialHeader } from "@/components/tutorial/tutorial-header";
import { TutorialContent } from "@/components/tutorial/tutorial-content";
import { VersionHistory } from "@/components/tutorial/version-history";
import { CommentSection } from "@/components/tutorial/comment-section";
import {
    ArrowLeft,
    FileEdit,
    Eye,
    ShieldCheck,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SupportTutorialViewPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const tutorialId = resolvedParams.id;
    const router = useRouter();

    const [tutorial, setTutorial] = useState<Tutorial | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTutorial = async () => {
            try {
                const response = await api.get<ApiResponse<Tutorial>>(`/tutorials/${tutorialId}`);
                setTutorial(response.data.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchTutorial();
    }, [tutorialId]);

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>;
    if (!tutorial) return <div className="p-20 text-center">Tutorial not found.</div>;

    return (
        <div className="space-y-8">
            {/* Admin Controls Header */}
            <div className="flex items-center justify-between bg-slate-900/80 p-4 rounded-xl border border-slate-800 sticky top-0 z-20 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-slate-400">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
                    </Button>
                    <div className="h-4 w-px bg-slate-800" />
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                        <Eye className="h-4 w-4" /> Admin Preview Mode
                    </div>
                </div>

                <Link href={`/management/edit/${tutorial.id}`}>
                    <Button className="bg-blue-600 hover:bg-blue-500 gap-2">
                        <FileEdit className="h-4 w-4" /> Edit this Guide
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-10">
                    <TutorialHeader tutorial={tutorial} />

                    <div className="bg-slate-900/30 p-8 rounded-2xl border border-slate-800/50">
                        <TutorialContent content={tutorial.content} />
                    </div>

                    <hr className="border-slate-800" />

                    {/* Support can also see and respond to comments here */}
                    {/* Find the CommentSection line and change it to this: */}
                    <div className="bg-slate-900/20 p-6 rounded-xl border border-slate-800/50">
                        <CommentSection tutorialId={tutorial.id} canModerate={true} />
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-6">
                        <VersionHistory tutorialId={tutorial.id} currentVersion={tutorial.currentVersionNumber} />

                        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 space-y-2">
                            <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                                <ShieldCheck className="h-3.5 w-3.5" /> Support Context
                            </h4>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                                You are viewing this as a Support Staff member. The Likes and Bookmarks are hidden in this preview to focus on content accuracy.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
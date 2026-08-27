'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Tutorial, News, ApiResponse } from '@/types';
import { 
  Plus, 
  FileEdit, 
  Trash2, 
  FileText, 
  Newspaper, 
  PlusCircle, 
  Loader2,
  UserCheck,
  Megaphone
} from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

export default function ManagementPage() {
    const [tutorials, setTutorials] = useState<Tutorial[]>([]);
    const [news, setNews] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);

    // News Form State
    const [newsTitle, setNewsTitle] = useState('');
    const [newsContent, setNewsContent] = useState('');
    const [isNewsDialogOpen, setIsNewsDialogOpen] = useState(false);
    const [isSubmittingNews, setIsSubmittingNews] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const [tutRes, newsRes] = await Promise.all([
                api.get<ApiResponse<Tutorial[]>>('/tutorials?audience=MEDICAL'),
                api.get<ApiResponse<News[]>>('/news')
            ]);
            setTutorials(tutRes.data.data);
            setNews(newsRes.data.data);
        } catch (error) {
            console.error("management fetch error: ", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            await loadData();
        };

        if (isMounted) {
            fetchData();
        }

        return () => {
            isMounted = false;
        };
    }, [loadData]);

    const refreshData = async () => {
        setLoading(true);
        await loadData();
    };

    const handleDeleteTutorial = async (id: number) => {
        if (!confirm("Move this tutorial to trash?")) return;
        try {
            await api.delete(`/tutorials/${id}`);
            refreshData();
        } catch (error) {
            console.error("Failed to delete tutorial", error);
        }
    };

    const handleDeleteNews = async (id: number) => {
        if (!confirm("Delete this news announcement?")) return;
        try {
            await api.delete(`/news/${id}`);
            refreshData();
        } catch (error) {
            console.error("Failed to delete news", error);
        }
    };

    const handleCreateNews = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingNews(true);
        try {
            await api.post('/news', { title: newsTitle, content: newsContent });
            setNewsTitle('');
            setNewsContent('');
            setIsNewsDialogOpen(false);
            refreshData();
        } catch (error) {
            console.error("Failed to create news", error);
        } finally {
            setIsSubmittingNews(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-100">Content Management</h1>
                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[11px]">
                            Admin Portal
                        </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">Create, update, and publish documentation and system news.</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <Link href="/management/new">
                        <Button className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/20 font-medium gap-2 h-9 text-xs transition-colors">
                            <PlusCircle className="h-4 w-4" /> New Tutorial
                        </Button>
                    </Link>

                    <Dialog open={isNewsDialogOpen} onOpenChange={setIsNewsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white font-medium gap-2 h-9 text-xs transition-colors">
                                <Plus className="h-4 w-4 text-emerald-400" /> Post News
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-md">
                            <DialogHeader className="space-y-1">
                                <DialogTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                                    <Megaphone className="h-4 w-4 text-emerald-400" />
                                    New System Announcement
                                </DialogTitle>
                                <DialogDescription className="text-xs text-slate-400">
                                    Publish updates or news items visible to platform users.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateNews} className="space-y-4 pt-2">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300">Title</label>
                                    <Input 
                                        placeholder="e.g., System Maintenance Schedule" 
                                        value={newsTitle} 
                                        onChange={(e) => setNewsTitle(e.target.value)} 
                                        className="bg-slate-950/80 border-slate-800 text-slate-200 text-sm placeholder:text-slate-500 focus-visible:ring-emerald-500"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300">Content</label>
                                    <Textarea 
                                        placeholder="Write your announcement message here..." 
                                        value={newsContent} 
                                        onChange={(e) => setNewsContent(e.target.value)} 
                                        className="bg-slate-950/80 border-slate-800 text-slate-200 text-sm placeholder:text-slate-500 focus-visible:ring-emerald-500 min-h-[140px] resize-y"
                                        required
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={isSubmittingNews} size="sm" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium h-9 text-xs transition-colors">
                                        {isSubmittingNews ? (
                                            <Loader2 className="animate-spin h-4 w-4" />
                                        ) : (
                                            "Post Announcement"
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-slate-900/60 border-slate-800/80 p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-400">Total Tutorials</span>
                        <div className="p-2 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <FileText className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-slate-100 mt-2">{loading ? "..." : tutorials.length}</p>
                </Card>

                <Card className="bg-slate-900/60 border-slate-800/80 p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-400">Announcements</span>
                        <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Newspaper className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-slate-100 mt-2">{loading ? "..." : news.length}</p>
                </Card>

                <Card className="bg-slate-900/60 border-slate-800/80 p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-400">Target Audience</span>
                        <div className="p-2 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            <UserCheck className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-slate-100 mt-2">Medical</p>
                </Card>
            </div>

            {/* Main Tabs Section */}
            <Tabs defaultValue="tutorials" className="w-full space-y-6">
                <TabsList className="bg-slate-900/80 border border-slate-800 p-1">
                    <TabsTrigger 
                        value="tutorials" 
                        className="text-xs text-slate-400 shadow-none border-none data-[state=active]:bg-transparent data-[state=active]:text-slate-400 data-[state=active]:shadow-none gap-2"
                    >
                        <FileText className="h-3.5 w-3.5" /> Tutorials ({tutorials.length})
                    </TabsTrigger>
                    <TabsTrigger 
                        value="news" 
                        className="text-xs text-slate-400 shadow-none border-none data-[state=active]:bg-transparent data-[state=active]:text-slate-400 data-[state=active]:shadow-none gap-2"
                    >
                        <Newspaper className="h-3.5 w-3.5" /> News ({news.length})
                    </TabsTrigger>
                </TabsList>

                {/* Tutorials Tab */}
                <TabsContent value="tutorials" className="m-0">
                    <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-sm overflow-hidden shadow-sm">
                        <Table>
                            <TableHeader className="bg-slate-900/80 border-b border-slate-800">
                                <TableRow className="border-slate-800 hover:bg-transparent">
                                    <TableHead className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Title</TableHead>
                                    <TableHead className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Audience</TableHead>
                                    <TableHead className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Version</TableHead>
                                    <TableHead className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Last Updated</TableHead>
                                    <TableHead className="text-right text-slate-400 text-xs font-semibold uppercase tracking-wider">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12 text-slate-400">
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="animate-spin h-5 w-5 text-emerald-400" />
                                                <span className="text-sm font-medium">Loading documentation...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : tutorials.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12 text-slate-500 text-xs">
                                            No tutorials found. Click "New Tutorial" to create one.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    tutorials.map((t) => (
                                        <TableRow key={t.id} className="border-slate-800/60 hover:bg-slate-800/40 transition-colors">
                                            <TableCell className="font-semibold text-slate-100 text-sm">
                                                {t.title}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`gap-1 text-[10px] font-medium px-2 py-0.5 ${
                                                    t.targetAudience === 'MEDICAL' 
                                                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                                                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                }`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${t.targetAudience === 'MEDICAL' ? 'bg-blue-400' : 'bg-emerald-400'}`} />
                                                    {t.targetAudience}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-slate-400 font-mono">
                                                v{t.currentVersionNumber}
                                            </TableCell>
                                            <TableCell className="text-slate-400 text-xs">
                                                {new Date(t.updatedAt).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end items-center gap-1">
                                                    <Link href={`/management/edit/${t.id}`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80">
                                                            <FileEdit className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </Link>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                                                        onClick={() => handleDeleteTutorial(t.id)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                {/* News Tab */}
                <TabsContent value="news" className="m-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
                            <Loader2 className="animate-spin h-5 w-5 text-emerald-400" />
                            <span className="text-sm font-medium">Loading news...</span>
                        </div>
                    ) : news.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
                            <Megaphone className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                            <h3 className="text-sm font-medium text-slate-300">No Announcements</h3>
                            <p className="text-xs text-slate-500 mt-1">Post system news to keep your users informed.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {news.map((item) => (
                                <Card key={item.id} className="bg-slate-900/60 border-slate-800/80 hover:border-slate-700/80 transition-all shadow-sm flex flex-col justify-between">
                                    <CardContent className="p-5 space-y-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="font-semibold text-slate-100 text-sm leading-snug line-clamp-2">
                                                {item.title}
                                            </h3>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-7 w-7 text-slate-500 hover:text-red-400 hover:bg-red-500/10 shrink-0 -mr-1 -mt-1" 
                                                onClick={() => handleDeleteNews(item.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-4 whitespace-pre-wrap">
                                            {item.content}
                                        </p>
                                    </CardContent>
                                    <div className="px-5 py-3 border-t border-slate-800/50 bg-slate-950/30 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                                        <span className="flex items-center gap-1.5 text-slate-400">
                                            <div className="h-4 w-4 rounded-full bg-slate-800 flex items-center justify-center text-[9px] font-bold text-emerald-400">
                                                {item.authorName ? item.authorName.charAt(0).toUpperCase() : 'A'}
                                            </div>
                                            {item.authorName || 'Admin'}
                                        </span>
                                        <span>
                                            {new Date(item.createdAt).toLocaleDateString(undefined, {
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
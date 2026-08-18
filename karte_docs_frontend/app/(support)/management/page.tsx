'use client';
import React, {useEffect ,useState} from 'react';
import {api} from '@/lib/api';
import {Tutorial, News, ApiResponse} from '@/types';
import { 
  Plus, 
  FileEdit, 
  Trash2, 
  FileText, 
  Newspaper, 
  Search, 
  ExternalLink,
  MoreVertical,
  PlusCircle,
  Loader2
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
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import {Card} from '@/components/ui/card';

export default function ManagementPage(){
    const [tutorials, setTutorials] = useState<Tutorial[]>([]);
    const [news, setNews] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);

    // News Form State
    const [newsTitle, setNewsTitle] = useState('');
    const [newsContent, setNewsContent] = useState('');
    const [isNewsDialogOpen, setIsNewsDialogOpen] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tutRes, newsRes] = await Promise.all([
                api.get<ApiResponse<Tutorial[]>>('/tutorials?audience=MEDICAL'),
                api.get<ApiResponse<News[]>>('/news')
            ]);
            setTutorials(tutRes.data.data);
            setNews(newsRes.data.data);
        } catch (error){
            console.error("management fetch error: ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(()=>{
        fetchData();
    }, []);

    const handleDeleteTutorial = async (id: number) => {
        if (!confirm("Move this tutorial to trash?"))return;
        await api.delete(`/tutorials/${id}`);
        fetchData();
    };

    const handleDeleteNews = async (id: number) => {
        if (!confirm("Delete this news announcement? "))return;
        await api.delete(`/news/${id}`);
        fetchData();
    };

    const handleCreateNews = async (e: React.FormEvent) => {
        e.preventDefault();
        await api.post('/news', {title:newsTitle, content:newsContent});
        setNewsTitle('');
        setNewsContent('');
        setIsNewsDialogOpen(false);
        fetchData();
    };

      return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Content Management</h1>
          <p className="text-slate-400">Create, update, and moderate documentation and news.</p>
        </div>

        <div className="flex gap-3">
          <Link href="/management/new">
            <Button className="bg-emerald-600 hover:bg-emerald-500 gap-2">
              <PlusCircle className="h-4 w-4" /> New Tutorial
            </Button>
          </Link>
          
          <Dialog open={isNewsDialogOpen} onOpenChange={setIsNewsDialogOpen}>
            <DialogTrigger>
              <Button variant="outline" className="border-slate-800 gap-2">
                <Plus className="h-4 w-4" /> Post News
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 text-white">
              <DialogHeader><DialogTitle>New System Announcement</DialogTitle></DialogHeader>
              <form onSubmit={handleCreateNews} className="space-y-4 pt-4">
                <Input 
                  placeholder="News Title" 
                  value={newsTitle} 
                  onChange={(e) => setNewsTitle(e.target.value)} 
                  className="bg-slate-950 border-slate-800"
                  required
                />
                <Textarea 
                  placeholder="Content..." 
                  value={newsContent} 
                  onChange={(e) => setNewsContent(e.target.value)} 
                  className="bg-slate-950 border-slate-800 min-h-[150px]"
                  required
                />
                <DialogFooter>
                  <Button type="submit" className="bg-emerald-600">Post Announcement</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="tutorials" className="w-full">
        <TabsList className="bg-slate-900 border-slate-800">
          <TabsTrigger value="tutorials" className="gap-2">
            <FileText className="h-4 w-4" /> Tutorials
          </TabsTrigger>
          <TabsTrigger value="news" className="gap-2">
            <Newspaper className="h-4 w-4" /> News
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tutorials" className="pt-4">
          <div className="rounded-md border border-slate-800 bg-slate-900/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-900">
                <TableRow className="border-slate-800">
                  <TableHead className="text-slate-300">Title</TableHead>
                  <TableHead className="text-slate-300">Audience</TableHead>
                  <TableHead className="text-slate-300">Version</TableHead>
                  <TableHead className="text-slate-300">Last Updated</TableHead>
                  <TableHead className="text-right text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow> :
                  tutorials.map((t) => (
                    <TableRow key={t.id} className="border-slate-800 hover:bg-slate-800/30">
                      <TableCell className="font-medium text-white">{t.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={t.targetAudience === 'MEDICAL' ? 'text-blue-400 border-blue-400/20' : 'text-emerald-400 border-emerald-400/20'}>
                          {t.targetAudience}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-400">v{t.currentVersionNumber}</TableCell>
                      <TableCell className="text-slate-500 text-xs">{new Date(t.updatedAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/management/edit/${t.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white"><FileEdit className="h-4 w-4" /></Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-red-400"
                            onClick={() => handleDeleteTutorial(t.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="news" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {news.map((item) => (
              <Card key={item.id} className="bg-slate-900 border-slate-800 p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-white truncate">{item.title}</h3>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleDeleteNews(item.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-slate-400 line-clamp-3">{item.content}</p>
                <div className="text-[10px] text-slate-500 flex justify-between">
                  <span>By {item.authorName}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

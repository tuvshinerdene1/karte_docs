'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Tutorial, News, Question, CommentResponse, ApiResponse } from '@/types';
import { 
  RotateCcw, 
  Trash2, 
  FileText, 
  Newspaper, 
  MessageSquare, 
  HelpCircle,
  Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function RecycleBinPage(){
    const [tutorials, setTutorials] = useState<Tutorial[]>([]);
    const [news, setNews] = useState<News[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [comments, setComments] = useState<CommentResponse[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTrash = async () => {
        try {
            setLoading(true);
            const [tutRes, newsRes, quesRes, comRes] = await Promise.all([
                api.get<ApiResponse<Tutorial[]>>('/tutorials/trash'),
                api.get<ApiResponse<News[]>>('/news/trash'),
                api.get<ApiResponse<Question[]>>('/questions/trash'),
                api.get<ApiResponse<CommentResponse[]>>('/comments/trash')
            ]);

            setTutorials(tutRes.data.data);
            setNews(newsRes.data.data);
            setQuestions(quesRes.data.data);
            setComments(comRes.data.data);
        } catch (error) {
            console.error("trash fetch error: ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTrash(); }, []);

    const handleRestore = async (type: string, id: number) => {
        try {
            const endpoint = type === 'tutorial' ? 'tutorials' : type + 's';
            await api.put(`/${endpoint}/${id}/restore`);
            fetchTrash();
            alert(`${type.charAt(0).toUpperCase() + type.slice(1)} restored`);
        } catch (error) {
            console.error(error);
        }
    };

    if (loading){
        return (
           <div className="flex justify-center items-center py-20 text-emerald-500 gap-2">
             <Loader2 className="animate-spin h-6 w-6" />
             <span className="text-sm font-medium text-slate-400">Loading trash items...</span>
           </div> 
        );
    }

    // Shared TabTrigger styles for high contrast and consistent dark-theme integration
    const tabTriggerClass = "gap-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 data-[state=active]:bg-slate-800 data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all";

    return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
          <Trash2 className="h-6 w-6 text-red-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Recycle Bin</h1>
          <p className="text-slate-400 text-sm">Review and restore soft-deleted content.</p>
        </div>
      </div>

      <Tabs defaultValue="tutorials" className="w-full">
        <TabsList className="bg-slate-900/80 border border-slate-800 p-1">
          <TabsTrigger value="tutorials" className={tabTriggerClass}>
            <FileText className="h-4 w-4" /> Tutorials ({tutorials.length})
          </TabsTrigger>
          <TabsTrigger value="news" className={tabTriggerClass}>
            <Newspaper className="h-4 w-4" /> News ({news.length})
          </TabsTrigger>
          <TabsTrigger value="questions" className={tabTriggerClass}>
            <HelpCircle className="h-4 w-4" /> Questions ({questions.length})
          </TabsTrigger>
          <TabsTrigger value="comments" className={tabTriggerClass}>
            <MessageSquare className="h-4 w-4" /> Comments ({comments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tutorials" className="pt-4">{renderTable(tutorials, 'tutorial', handleRestore)}</TabsContent>
        <TabsContent value="news" className="pt-4">{renderTable(news, 'news', handleRestore)}</TabsContent>
        <TabsContent value="questions" className="pt-4">{renderTable(questions, 'question', handleRestore)}</TabsContent>
        <TabsContent value="comments" className="pt-4">{renderTable(comments, 'comment', handleRestore)}</TabsContent>
      </Tabs>
    </div>
  );
}

function renderTable(items: any[], type: string, onRestore: any) {
  if (items.length === 0) return (
    <div className="py-20 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/30 text-slate-500 text-sm">
      No deleted {type}s found.
    </div>
  );

  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-sm overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-slate-900/80 border-b border-slate-800">
          <TableRow className="border-slate-800 hover:bg-transparent">
            <TableHead className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Content / Title</TableHead>
            <TableHead className="text-slate-400 text-xs font-semibold uppercase tracking-wider text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="border-slate-800/60 hover:bg-slate-800/40 transition-colors">
              <TableCell>
                <p className="font-medium text-slate-100 text-sm">{item.title || (item.content ? item.content.substring(0, 60) + '...' : 'Untitled')}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Deleted: {item.deletedAt ? new Date(item.deletedAt).toLocaleDateString() : 'Recently'}</p>
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onRestore(type, item.id)} 
                  className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 hover:text-emerald-300 gap-2 h-8 text-xs font-medium transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Restore
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
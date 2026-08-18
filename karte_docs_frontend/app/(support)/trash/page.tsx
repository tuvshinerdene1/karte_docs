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
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner"; // Or any toast library you use
import { patchConsoleMethod } from 'next/dist/next-devtools/shared/forward-logs-shared';

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

    useEffect(() => {fetchTrash();}, []);

    const handleRestore = async (type: string, id:number) =>{
        try {
            const endpoint = type === 'tutorial' ? 'tutorials' : type + 's';
            await api.put(`/${endpoint}/${id}/restore`);
            fetchTrash();
            alert(`${type.charAt(0).toUpperCase() + type.slice(1)}`);
        } catch (error) {
            console.error(error);
        }
    };

    if (loading){
        return(
           <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" /></div> 
        );
    }

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
        <TabsList className="bg-slate-900 border-slate-800">
          <TabsTrigger value="tutorials" className="gap-2"><FileText className="h-4 w-4" /> Tutorials ({tutorials.length})</TabsTrigger>
          <TabsTrigger value="news" className="gap-2"><Newspaper className="h-4 w-4" /> News ({news.length})</TabsTrigger>
          <TabsTrigger value="questions" className="gap-2"><HelpCircle className="h-4 w-4" /> Questions ({questions.length})</TabsTrigger>
          <TabsTrigger value="comments" className="gap-2"><MessageSquare className="h-4 w-4" /> Comments ({comments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="tutorials" className="pt-4">{renderTable(tutorials, 'tutorial', handleRestore)}</TabsContent>
        <TabsContent value="news" className="pt-4">{renderTable(news, 'news', handleRestore)}</TabsContent>
        <TabsContent value="questions" className="pt-4">{renderTable(questions, 'question', handleRestore)}</TabsContent>
        <TabsContent value="comments" className="pt-4">{renderTable(comments, 'comment', handleRestore)}</TabsContent>
      </Tabs>
    </div>
  );
}

function renderTable(items: any[], type: string, onRestore: any){
      if (items.length === 0) return (
    <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-xl text-slate-600">
      No deleted {type}s found.
    </div>);


  return (
    <div className="rounded-md border border-slate-800 bg-slate-900/50">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-800">
            <TableHead className="text-slate-300">Content / Title</TableHead>
            <TableHead className="text-slate-300 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="border-slate-800">
              <TableCell>
                <p className="font-medium text-white">{item.title || item.content.substring(0, 60) + '...'}</p>
                <p className="text-[10px] text-slate-500">Deleted: {item.deletedAt || 'Recently'}</p>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" onClick={() => onRestore(type, item.id)} className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/20 gap-2">
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


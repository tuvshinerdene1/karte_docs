'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Question, ApiResponse } from '@/types';
import { 
  HelpCircle, 
  Plus, 
  MessageCircle, 
  Globe, 
  Clock, 
  CheckCircle2, 
  Send,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";

export default function MedicalQuestionsPage() {
  const [myQuestions, setMyQuestions] = useState<Question[]>([]);
  const [publicQuestions, setPublicQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [myRes, publicRes] = await Promise.all([
        api.get<ApiResponse<Question[]>>('/questions'),
        api.get<ApiResponse<Question[]>>('/questions/public')
      ]);
      setMyQuestions(myRes.data.data);
      setPublicQuestions(publicRes.data.data);
    } catch (error) {
      console.error("Failed to fetch questions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/questions', { title, content });
      setTitle('');
      setContent('');
      setIsDialogOpen(false);
      fetchData(); // Refresh list
    } catch (error) {
      console.error("Failed to submit question", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'WAITING':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 gap-1"><Clock className="h-3 w-3" /> Waiting</Badge>;
      case 'ANSWERED':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 gap-1"><MessageCircle className="h-3 w-3" /> Answered</Badge>;
      case 'PUBLISHED':
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1"><Globe className="h-3 w-3" /> FAQ</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Help & Support</h1>
          <p className="text-slate-400">Ask the support team or browse frequently asked questions.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger >
            <Button className="bg-blue-600 hover:bg-blue-500 gap-2">
              <Plus className="h-4 w-4" /> Ask a Question
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-white">
            <DialogHeader>
              <DialogTitle>New Support Request</DialogTitle>
              <DialogDescription className="text-slate-400">
                Describe your issue. Our support team will respond shortly.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500">Subject</label>
                <Input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g., Cannot upload patient files" 
                  className="bg-slate-950 border-slate-800"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500">Description</label>
                <Textarea 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)} 
                  placeholder="Provide details about what happened..." 
                  className="bg-slate-950 border-slate-800 min-h-[120px]"
                  required
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-500">
                {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : <><Send className="h-4 w-4 mr-2" /> Submit Ticket</>}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="bg-slate-900 border border-slate-800">
          <TabsTrigger value="faq" className="data-[state=active]:bg-slate-800">Public FAQ</TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-slate-800">My Questions</TabsTrigger>
        </TabsList>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="pt-6">
          <div className="grid gap-4">
            {loading ? <div className="text-slate-500 animate-pulse">Loading FAQ...</div> :
              publicQuestions.length > 0 ? publicQuestions.map(q => (
                <QuestionCard key={q.id} question={q} showBadge={false} />
              )) : <EmptyState message="No public FAQ items available yet." />
            }
          </div>
        </TabsContent>

        {/* Private History Tab */}
        <TabsContent value="history" className="pt-6">
          <div className="grid gap-4">
            {loading ? <div className="text-slate-500 animate-pulse">Loading your history...</div> :
              myQuestions.length > 0 ? myQuestions.map(q => (
                <QuestionCard key={q.id} question={q} showBadge={true} getStatusBadge={getStatusBadge} />
              )) : <EmptyState message="You haven't asked any questions yet." />
            }
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function QuestionCard({ question, showBadge, getStatusBadge }: { question: Question, showBadge: boolean, getStatusBadge?: any }) {
  return (
    <Card className="bg-slate-900/50 border-slate-800 overflow-hidden">
      <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-lg text-white">{question.title}</CardTitle>
          <div className="flex items-center gap-3 text-[10px] text-slate-500">
             <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(question.createdAt).toLocaleDateString()}</span>
             {showBadge && getStatusBadge(question.status)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-300 leading-relaxed">{question.content}</p>
        
        {question.answer && (
          <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20 mt-4">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
              <CheckCircle2 className="h-4 w-4" /> Support Response
            </div>
            <p className="text-sm text-slate-200">{question.answer}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-800 rounded-xl">
      <HelpCircle className="h-10 w-10 text-slate-700 mb-3" />
      <p className="text-slate-500 text-sm">{message}</p>
    </div>
  );
}
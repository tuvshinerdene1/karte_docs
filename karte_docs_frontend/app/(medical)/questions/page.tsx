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
  ChevronDown
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      fetchData();
    } catch (error) {
      console.error("Failed to submit question", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'WAITING':
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 gap-1 text-[10px] font-medium px-2 py-0.5">
            <Clock className="h-3 w-3" /> Waiting
          </Badge>
        );
      case 'ANSWERED':
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 gap-1 text-[10px] font-medium px-2 py-0.5">
            <MessageCircle className="h-3 w-3" /> Answered
          </Badge>
        );
      case 'PUBLISHED':
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1 text-[10px] font-medium px-2 py-0.5">
            <Globe className="h-3 w-3" /> FAQ
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100">Help & Support</h1>
          <p className="text-sm text-slate-400 mt-1">Ask the support team or browse frequently asked questions.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white font-medium gap-2 h-9 px-4 text-xs transition-colors self-start md:self-auto">
              <Plus className="h-4 w-4" /> Ask a Question
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-md">
            <DialogHeader className="space-y-1.5">
              <DialogTitle className="text-lg font-semibold text-slate-100">New Support Request</DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Describe your issue. Our support team will respond shortly.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Subject</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Cannot upload patient files"
                  className="bg-slate-950/80 border-slate-800 text-sm text-slate-200 placeholder:text-slate-500 focus-visible:ring-blue-500"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Provide details about what happened..."
                  className="bg-slate-950/80 border-slate-800 text-sm text-slate-200 placeholder:text-slate-500 focus-visible:ring-blue-500 min-h-[120px] resize-y"
                  required
                />
              </div>
              <Button type="submit" disabled={isSubmitting} size="sm" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium h-9 text-xs transition-colors">
                {isSubmitting ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-3.5 w-3.5" /> Submit Ticket
                  </span>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Navigation Tabs */}
      <Tabs defaultValue="faq" className="w-full space-y-6">
        <TabsList className="bg-slate-900/80 border border-slate-800 p-1">
          <TabsTrigger
            value="faq"
            className="text-xs text-slate-400 data-[state=active]:bg-black data-[state=active]:text-white hover:text-slate-200 transition-colors"
          >
            Public FAQ
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="text-xs text-slate-400 data-[state=active]:bg-black data-[state=active]:text-white hover:text-slate-200 transition-colors"
          >
            My Questions
          </TabsTrigger>
        </TabsList>

        {/* Public FAQ Content */}
        <TabsContent value="faq" className="m-0">
          {loading ? (
            <LoadingState message="Loading FAQ..." />
          ) : publicQuestions.length > 0 ? (
            <div className="grid gap-4">
              {publicQuestions.map(q => (
                <QuestionCard key={q.id} question={q} showBadge={false} />
              ))}
            </div>
          ) : (
            <EmptyState message="No public FAQ items available yet." />
          )}
        </TabsContent>

        {/* My Questions Content */}
        <TabsContent value="history" className="m-0">
          {loading ? (
            <LoadingState message="Loading your history..." />
          ) : myQuestions.length > 0 ? (
            <div className="grid gap-4">
              {myQuestions.map(q => (
                <QuestionCard key={q.id} question={q} showBadge={true} getStatusBadge={getStatusBadge} />
              ))}
            </div>
          ) : (
            <EmptyState message="You haven't asked any questions yet." />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function QuestionCard({
  question,
  showBadge,
  getStatusBadge
}: {
  question: Question;
  showBadge: boolean;
  getStatusBadge?: (status: string) => React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasAnswer = Boolean(question.answer && question.answer.trim().length > 0);

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <Card 
      className={`bg-slate-900/60 border-slate-800/80 transition-all shadow-sm overflow-hidden select-none ${
        hasAnswer ? 'cursor-pointer hover:border-slate-700/80 hover:bg-slate-900/90' : ''
      }`}
      onClick={toggleOpen}
      role={hasAnswer ? "button" : undefined}
      tabIndex={hasAnswer ? 0 : undefined}
      onKeyDown={(e) => {
        if (hasAnswer && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          toggleOpen();
        }
      }}
    >
      <CardHeader className="p-5 pb-3 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-start gap-3">
            {hasAnswer && (
              <div className={`mt-0.5 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-blue-400' : 'text-slate-500'}`}>
                <ChevronDown className="h-4 w-4" />
              </div>
            )}
            <CardTitle className={`text-base font-semibold leading-snug transition-colors ${isOpen ? 'text-blue-400' : 'text-slate-100'}`}>
              {question.title}
            </CardTitle>
          </div>
          
          <div className="flex items-center gap-3 shrink-0 ml-7 sm:ml-0">
            {showBadge && getStatusBadge && getStatusBadge(question.status)}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              <span>
                {new Date(question.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      {/* Content displays if question is expanded OR if there is no answer yet (so user sees their question details) */}
      <CardContent className={`p-5 pt-0 space-y-4 ${!hasAnswer || isOpen ? 'block' : 'hidden'}`}>
        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap pl-7 border-l-2 border-slate-800">
          {question.content}
        </p>

        {question.answer && (
          <div className="p-4 rounded-lg bg-slate-950/60 border border-blue-500/20 space-y-2 ml-7 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold tracking-wide">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Support Response</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed pl-6 whitespace-pre-wrap">
              {question.answer}
            </p>
          </div>
        )}
      </CardContent>
      
      {hasAnswer && !isOpen && (
        <div className="px-5 py-2 bg-slate-950/40 border-t border-slate-800/40 flex justify-center">
          <span className="text-[10px] text-blue-400 font-medium tracking-wide uppercase">
            Click to view answer
          </span>
        </div>
      )}
    </Card>
  );
}

function LoadingState({ message }: { message: string }) {
  return (
    <div className="flex h-64 items-center justify-center text-slate-400">
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
      <div className="bg-slate-900 p-3.5 rounded-full mb-3 border border-slate-800">
        <HelpCircle className="h-6 w-6 text-slate-500" />
      </div>
      <h3 className="text-base font-semibold text-slate-200">No Questions Found</h3>
      <p className="text-slate-400 text-xs max-w-sm mx-auto mt-1 leading-relaxed">
        {message}
      </p>
    </div>
  );
}
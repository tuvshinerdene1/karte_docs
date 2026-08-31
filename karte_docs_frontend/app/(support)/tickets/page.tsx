'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import { Question, ApiResponse } from '@/types';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  Globe, 
  User, 
  Trash2, 
  Loader2,
  Inbox
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function SupportTicketPage(){
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    // Answering state
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [answerContent, setAnswerContent] = useState('');
    const [makePublic, setMakePublic] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const response = await api.get<ApiResponse<Question[]>>('/questions');
            setQuestions(response.data.data);
        } catch (error){
            console.error("Failed to fetch tickets", error);
        } finally{
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    // Reset dialog state when selected question changes
    const handleOpenModal = (question: Question) => {
        setSelectedQuestion(question);
        setAnswerContent('');
        setMakePublic(false);
    };

    const handleAnswer = async () => {
        if (!selectedQuestion || !answerContent.trim()) return;

        setIsSubmitting(true);
        try {
            await api.post(`/questions/${selectedQuestion.id}/answer`, {
                content: answerContent,
                makePublic: makePublic
            });
            setSelectedQuestion(null);
            setAnswerContent('');
            setMakePublic(false);
            await fetchQuestions();
        } catch (error){
            console.error("Error answering question", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteQuestion = async (id: number) => {
        if (!confirm("Are you sure you want to delete this ticket?")) return;
        try {
            await api.delete(`/questions/${id}`);
            await fetchQuestions();
        } catch (error) {
            console.error("Failed to delete ticket", error);
        }
    };

    const waitingTickets = useMemo(() => questions.filter(q => q.status === 'WAITING'), [questions]);
    const resolvedTickets = useMemo(() => questions.filter(q => q.status !== 'WAITING'), [questions]);

    const tabTriggerClass = "gap-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 data-[state=active]:bg-slate-800 data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all";

    return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Support Tickets</h1>
        <p className="text-slate-400 text-sm">Manage user inquiries and maintain the public FAQ.</p>
      </div>

      <Tabs defaultValue="inbox" className="w-full">
        <TabsList className="bg-slate-900/80 border border-slate-800 p-1">
          <TabsTrigger value="inbox" className={tabTriggerClass}>
            <Inbox className="h-4 w-4" /> New ({waitingTickets.length})
          </TabsTrigger>
          <TabsTrigger value="resolved" className={tabTriggerClass}>
            <CheckCircle2 className="h-4 w-4" /> Resolved ({resolvedTickets.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="pt-4 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12 text-emerald-500 gap-2">
              <Loader2 className="animate-spin h-5 w-5" />
              <span className="text-sm font-medium text-slate-400">Loading new tickets...</span>
            </div>
          ) : waitingTickets.length > 0 ? (
            waitingTickets.map(q => (
              <TicketCard 
                key={q.id} 
                question={q} 
                onAnswer={() => handleOpenModal(q)}
                onDelete={() => deleteQuestion(q.id)}
              />
            ))
          ) : (
            <EmptyTickets message="No new tickets. All caught up!" />
          )}
        </TabsContent>

        <TabsContent value="resolved" className="pt-4 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12 text-emerald-500 gap-2">
              <Loader2 className="animate-spin h-5 w-5" />
              <span className="text-sm font-medium text-slate-400">Loading resolved tickets...</span>
            </div>
          ) : resolvedTickets.length > 0 ? (
            resolvedTickets.map(q => (
              <TicketCard 
                key={q.id} 
                question={q} 
                onDelete={() => deleteQuestion(q.id)}
                isResolved 
              />
            ))
          ) : (
            <EmptyTickets message="No resolved tickets found." />
          )}
        </TabsContent>
      </Tabs>

      {/* Answering Modal */}
      <Dialog open={!!selectedQuestion} onOpenChange={(open) => !open && setSelectedQuestion(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-100">Respond to Ticket</DialogTitle>
          </DialogHeader>
          
          {selectedQuestion && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">User Question:</p>
                <p className="text-sm font-semibold mb-2 text-slate-100">{selectedQuestion.title}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{selectedQuestion.content}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-400 uppercase">Your Response</Label>
                <Textarea 
                  placeholder="Type your helpful answer here..."
                  className="bg-slate-950/80 border-slate-800 text-slate-200 text-sm placeholder:text-slate-500 focus-visible:ring-emerald-500 min-h-[150px] resize-y"
                  value={answerContent}
                  onChange={(e) => setAnswerContent(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <div className="space-y-0.5">
                  <Label className="text-sm text-emerald-400 font-semibold cursor-pointer">Publish to FAQ</Label>
                  <p className="text-[10px] text-slate-500">Make this Q&A visible to all medical staff.</p>
                </div>
                <Switch checked={makePublic} onCheckedChange={setMakePublic} />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setSelectedQuestion(null)} className="text-slate-400 hover:text-white hover:bg-slate-800">Cancel</Button>
            <Button 
                onClick={handleAnswer} 
                disabled={isSubmitting || !answerContent.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium min-w-[120px] transition-colors"
            >
              {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Send Answer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TicketCard({ question, onAnswer, onDelete, isResolved = false }: any) {
  // Extract answer text whether it's directly on question, nested object, or array
  const extractedAnswer = 
    question.answerContent || 
    question.answer?.content || 
    (Array.isArray(question.answers) && question.answers[0]?.content) || 
    "";

  return (
    <Card className="bg-slate-900/60 border-slate-800/80 hover:border-slate-700/80 transition-all shadow-sm">
      <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <CardTitle className="text-base text-slate-100">{question.title}</CardTitle>
            {question.status === 'PUBLISHED' && (
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] gap-1 px-1.5 py-0.5">
                <Globe className="h-2.5 w-2.5" /> FAQ
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1"><User className="h-3 w-3 text-slate-400" /> {question.authorEmail}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-slate-400" /> {new Date(question.createdAt).toLocaleString()}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-500/10" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-slate-300 leading-relaxed">{question.content}</p>
        {isResolved && extractedAnswer && (
          <div className="mt-3 p-3.5 rounded-lg bg-slate-950/80 border-l-2 border-emerald-500 space-y-1">
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Response</p>
            <p className="text-xs text-slate-300 whitespace-pre-wrap">{extractedAnswer}</p>
          </div>
        )}
      </CardContent>
      {!isResolved && (
        <CardFooter className="pt-0 flex justify-end">
          <Button size="sm" onClick={onAnswer} className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs h-8 gap-2 transition-colors">
            <MessageSquare className="h-3.5 w-3.5" /> Respond
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

function EmptyTickets({ message }: { message: string }){
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
      <CheckCircle2 className="h-10 w-10 text-emerald-500/40 mb-3" />
      <p className="text-slate-400 text-sm">{message}</p>
    </div>
  );
}
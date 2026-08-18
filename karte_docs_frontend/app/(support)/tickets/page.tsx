'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Question, ApiResponse } from '@/types';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  Globe, 
  User, 
  Send, 
  Trash2, 
  AlertCircle,
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
import { SelectRoot } from '@base-ui/react';

export default function SupportTicketPage(){
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    // answering state
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

    const handleAnswer = async () =>{
        if (!selectedQuestion || !answerContent.trim()) return;

        setIsSubmitting(true);
        try {
            await api.post(`/questions/${selectedQuestion.id}/answer`,{
                content: answerContent,
                makePublic: makePublic
            });
            setSelectedQuestion(null);
            setAnswerContent('');
            setMakePublic(false);
            fetchQuestions();
        } catch (error){
            console.error("Error answering question", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteQuestion = async (id: number) => {
        if (!confirm("Are you sure you want to delete this ticket?")) return;
        await api.delete(`/questions/${id}`);
        fetchQuestions();
    };

    const waitingTickets = questions.filter(q => q.status === 'WAITING');
    const resolvedTickets = questions.filter(q => q.status !== 'WAITING');

     return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Support Tickets</h1>
        <p className="text-slate-400">Manage user inquiries and maintain the public FAQ.</p>
      </div>

      <Tabs defaultValue="inbox" className="w-full">
        <TabsList className="bg-slate-900 border-slate-800">
          <TabsTrigger value="inbox" className="gap-2">
            <Inbox className="h-4 w-4" /> New ({waitingTickets.length})
          </TabsTrigger>
          <TabsTrigger value="resolved" className="gap-2">
            <CheckCircle2 className="h-4 w-4" /> Resolved ({resolvedTickets.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="pt-4 space-y-4">
          {loading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-emerald-500" /></div> :
            waitingTickets.length > 0 ? waitingTickets.map(q => (
              <TicketCard 
                key={q.id} 
                question={q} 
                onAnswer={() => setSelectedQuestion(q)}
                onDelete={() => deleteQuestion(q.id)}
              />
            )) : <EmptyTickets message="No new tickets. All caught up!" />
          }
        </TabsContent>

        <TabsContent value="resolved" className="pt-4 space-y-4">
          {resolvedTickets.map(q => (
            <TicketCard 
              key={q.id} 
              question={q} 
              onDelete={() => deleteQuestion(q.id)}
              isResolved 
            />
          ))}
        </TabsContent>
      </Tabs>

      {/* Answering Modal */}
      <Dialog open={!!selectedQuestion} onOpenChange={(open) => !open && setSelectedQuestion(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Respond to Ticket</DialogTitle>
          </DialogHeader>
          
          {selectedQuestion && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">User Question:</p>
                <p className="text-sm font-semibold mb-2">{selectedQuestion.title}</p>
                <p className="text-sm text-slate-400">{selectedQuestion.content}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase">Your Response</Label>
                <Textarea 
                  placeholder="Type your helpful answer here..."
                  className="bg-slate-950 border-slate-800 min-h-[150px]"
                  value={answerContent}
                  onChange={(e) => setAnswerContent(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <div className="space-y-0.5">
                  <Label className="text-sm text-emerald-400 font-semibold">Publish to FAQ</Label>
                  <p className="text-[10px] text-slate-500">Make this Q&A visible to all medical staff.</p>
                </div>
                <Switch checked={makePublic} onCheckedChange={setMakePublic} />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setSelectedQuestion(null)}>Cancel</Button>
            <Button 
                onClick={handleAnswer} 
                disabled={isSubmitting || !answerContent.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 min-w-[120px]"
            >
              {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Send Answer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TicketCard({question, onAnswer, onDelete, isResolved = false}: any){
     return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <CardTitle className="text-lg text-white">{question.title}</CardTitle>
            {question.status === 'PUBLISHED' && <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] gap-1"><Globe className="h-2 w-2" /> FAQ</Badge>}
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-500">
            <span className="flex items-center gap-1"><User className="h-3 w-3" /> {question.authorEmail}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(question.createdAt).toLocaleString()}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-red-400" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-300">{question.content}</p>
        {isResolved && question.answer && (
            <div className="mt-4 p-4 rounded bg-slate-950 border-l-2 border-emerald-500">
                <p className="text-[10px] font-bold text-emerald-500 uppercase mb-1">Response:</p>
                <p className="text-sm text-slate-400 italic">{question.answer}</p>
            </div>
        )}
      </CardContent>
      {!isResolved && (
        <CardFooter className="pt-0 flex justify-end">
          <Button size="sm" onClick={onAnswer} className="bg-emerald-600 hover:bg-emerald-500 gap-2">
            <MessageSquare className="h-4 w-4" /> Respond
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

function EmptyTickets({message}: {message:string}){
      return (
    <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-800 rounded-xl">
      <CheckCircle2 className="h-10 w-10 text-emerald-900 mb-3" />
      <p className="text-slate-500 text-sm">{message}</p>
    </div>
  );
}
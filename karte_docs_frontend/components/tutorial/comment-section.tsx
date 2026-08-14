'use client';
import React, {useEffect, useState} from "react";
import { api } from "@/lib/api";
import { CommentResponse, ApiResponse } from "@/types";
import { useAuth } from "@/context/auth-context";
import { MessageSquare, Send, User, Clock, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

export function CommentSection({tutorialId}:{tutorialId: number}){
    const {user} = useAuth();
    const [comments, setComments] = useState<CommentResponse[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const fetchComments = async () => {
        try {
         const response = await api.get<ApiResponse<CommentResponse[]>>(`/comments/tutorial/${tutorialId}`);
         setComments(response.data.data);   
        } catch (error){
            console.error("Failed to fetch comments ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(()=>{
        fetchComments();
    }, [tutorialId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            setSubmitting(true);
            await api.post('/comments',{
                content:newComment,
                tutorialId: tutorialId
            });
            setNewComment('');
            fetchComments(); // refresh the list
        } catch (error) {
            console.error("Failed to post comment", error);
        } finally{
            setSubmitting(false);
        }
    };

    return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center gap-2 text-white font-semibold">
        <MessageSquare className="h-5 w-5 text-blue-500" />
        <h3>Discussion ({comments.length})</h3>
      </div>

      {/* Post Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          placeholder="Leave a comment or ask for clarification..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="bg-slate-950 border-slate-800 focus-visible:ring-blue-500 min-h-[100px]"
        />
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={submitting || !newComment.trim()}
            className="bg-blue-600 hover:bg-blue-500 gap-2"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Post Comment
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4 mt-8">
        {loading ? (
          <div className="flex justify-center py-4"><Loader2 className="animate-spin text-slate-700" /></div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 p-4 rounded-lg bg-slate-900/50 border border-slate-800">
              <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                <User className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-white">{comment.authorName}</span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Clock className="h-3 w-3" />
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center py-10 text-slate-500 text-sm italic">No comments yet. Be the first to start the discussion!</p>
        )}
      </div>
    </div>
  );
}
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { CommentResponse, ApiResponse } from '@/types';
import { MessageSquare, User, Clock, Loader2, Trash2, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface CommentSectionProps {
  tutorialId: number;
  canModerate?: boolean;
}

export function CommentSection({ tutorialId, canModerate = false }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Wrap fetch in useCallback to fix exhaustive-deps and effect render warnings
  const fetchComments = useCallback(async () => {
    try {
      const response = await api.get<ApiResponse<CommentResponse[]>>(`/comments/tutorial/${tutorialId}`);
      setComments(response.data.data);
    } catch (error) {
      console.error("Failed to fetch comments", error);
    } finally {
      setLoading(false);
    }
  }, [tutorialId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setSubmitting(true); // Fixed typo from setIsSubmitting
    try {
      await api.post('/comments', { content: newComment, tutorialId });
      setNewComment('');
      await fetchComments();
    } finally {
      setSubmitting(false); // Fixed typo from setIsSubmitting
    }
  };

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center gap-2 text-white font-semibold">
        <MessageSquare className="h-5 w-5 text-blue-500" />
        <h3>Discussion</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="bg-slate-950 border-slate-800 min-h-20 text-sm" // Updated tailwind class
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={submitting || !newComment.trim()} size="sm" className="bg-blue-600">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post Comment"}
          </Button>
        </div>
      </form>

      <div className="space-y-6 mt-8">
        {loading ? (
          <div className="flex justify-center"><Loader2 className="animate-spin text-slate-700" /></div>
        ) : (
          comments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              tutorialId={tutorialId} 
              onRefresh={fetchComments} 
              canModerate={canModerate}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Define interface to remove "any" errors
interface CommentItemProps {
  comment: CommentResponse;
  tutorialId: number;
  onRefresh: () => Promise<void>;
  canModerate: boolean;
}

function CommentItem({ comment, tutorialId, onRefresh, canModerate }: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReply = async () => {
    if (!replyText.trim()) return;
    await api.post('/comments', {
      content: replyText,
      tutorialId: tutorialId,
      parentId: comment.id
    });
    setReplyText('');
    setIsReplying(false);
    await onRefresh();
  };

  const handleDelete = async () => {
    if (!confirm("Delete this comment? This will also hide all replies.")) return;
    await api.delete(`/comments/${comment.id}`);
    await onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="group relative flex gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800/50 hover:border-slate-700 transition-colors">
        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
          <User className="h-4 w-4" />
        </div>
        
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-200">{comment.authorName}</span>
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Clock className="h-3 w-3" /> {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" onClick={() => setIsReplying(!isReplying)} className="h-7 px-2 text-[10px] text-blue-400 gap-1 hover:bg-blue-500/10">
                <Reply className="h-3 w-3" /> Reply
              </Button>
              {canModerate && (
                <Button variant="ghost" size="sm" onClick={handleDelete} className="h-7 px-2 text-[10px] text-red-400 gap-1 hover:bg-red-500/10">
                  <Trash2 className="h-3 w-3" /> Delete
                </Button>
              )}
            </div>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{comment.content}</p>
        </div>
      </div>

      {isReplying && (
        <div className="ml-12 flex gap-2 animate-in slide-in-from-left-2">
          <Input 
            value={replyText} 
            onChange={(e) => setReplyText(e.target.value)} 
            className="h-8 bg-slate-950 border-slate-800 text-xs" 
            placeholder={`Reply to ${comment.authorName}...`} 
          />
          <Button size="sm" className="h-8 px-3 text-[10px] bg-blue-600" onClick={handleReply}>Send</Button>
          <Button size="sm" variant="ghost" className="h-8 text-[10px]" onClick={() => setIsReplying(false)}>Cancel</Button>
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-12 border-l border-slate-800/60 pl-6 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              tutorialId={tutorialId} 
              onRefresh={onRefresh} 
              canModerate={canModerate} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
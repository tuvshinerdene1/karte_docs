'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { ApiResponse, Tutorial } from '@/types';
import { ThumbsUp, ThumbsDown, Bookmark, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  tutorialId: number;
  initialLikes: number;
  initialDislikes: number;
  initialBookmarked: boolean;
}

export function TutorialActions({ tutorialId, initialLikes, initialDislikes, initialBookmarked }: Props) {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    setLikes(initialLikes);
    setDislikes(initialDislikes);
    setIsBookmarked(initialBookmarked)
  }, [initialLikes, initialDislikes, initialBookmarked]);

  // Function to get fresh stats from backend
  const refreshStats = async () => {
    try {
      const response = await api.get<ApiResponse<any>>(`/tutorials/reactions/${tutorialId}/stats`);
      setLikes(response.data.data.likeCount);
      setDislikes(response.data.data.dislikeCount);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };

  const handleReaction = async (type: 'LIKE' | 'DISLIKE') => {
    try {
      // 1. Send reaction to backend
      await api.post('/tutorials/reactions', { tutorialId, type });
      // 2. Immediately get the new counts (handles toggle/switch logic)
      refreshStats();
    } catch (error) {
      console.error("Reaction failed:", error);
    }
  };

  const handleBookmark = async () => {
    try {
      await api.post(`/tutorials/bookmarks/${tutorialId}`);
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error("Bookmark failed:", error);
    }
  };

  return (
    <div className="flex items-center gap-4 py-4 border-y border-slate-800/60">
      <div className="flex items-center bg-slate-900 rounded-lg border border-slate-800 p-1">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleReaction('LIKE')}
          className="hover:text-emerald-400 gap-2 h-8"
        >
          <ThumbsUp className="h-4 w-4" />
          <span className="text-xs font-bold">{likes}</span>
        </Button>
        
        <div className="w-[1px] h-4 bg-slate-800 mx-1" />

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleReaction('DISLIKE')}
          className="hover:text-red-400 gap-2 h-8"
        >
          <ThumbsDown className="h-4 w-4" />
          <span className="text-xs font-bold">{dislikes}</span>
        </Button>
      </div>

      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleBookmark}
        className={`h-9 gap-2 border-slate-800 transition-colors ${
          isBookmarked ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' : 'text-slate-400'
        }`}
      >
        <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
        <span className="text-xs font-medium">{isBookmarked ? 'Saved' : 'Bookmark'}</span>
      </Button>
    </div>
  );
}
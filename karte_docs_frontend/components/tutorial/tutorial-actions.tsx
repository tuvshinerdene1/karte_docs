'use client'
import { useState } from "react";
import { api } from "@/lib/api";
import { ThumbsUp, ThumbsDown, Bookmark, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TutorialActions({tutorialId, initialLikes, initialDislikes}: any){
    const [likes, setLikes] = useState(initialLikes);
    const [bookmarked, setBookmarked] = useState(false);

    const handleReaction = async (type: 'LIKE' | 'DISLIKE') => {
        try {
            await api.post('/tutorials/reactions', {tutorialId, type});
            // TODO, fetch the updated stats from the backend here
            if (type === 'LIKE') setLikes((prev: number) => prev + 1);
        }
        catch(error) {console.error(error);}
    };

    const handleBookmark = async () => {
        try {
            await api.post(`/tutorials/bookmarks/${tutorialId}`);
            setBookmarked(!bookmarked);
        }
        catch(error){console.error(error);}
    };

    return (
    <div className="flex items-center gap-2 py-4 border-y border-slate-800">
      <Button variant="ghost" size="sm" onClick={() => handleReaction('LIKE')} className="gap-2 text-slate-300 hover:text-emerald-400">
        <ThumbsUp className="h-4 w-4" /> {likes}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => handleReaction('DISLIKE')} className="gap-2 text-slate-300 hover:text-red-400">
        <ThumbsDown className="h-4 w-4" />
      </Button>
      <div className="flex-1" />
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleBookmark}
        className={`gap-2 ${bookmarked ? 'text-yellow-500' : 'text-slate-300'}`}
      >
        <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
        {bookmarked ? 'Saved' : 'Bookmark'}
      </Button>
    </div>
  );
}

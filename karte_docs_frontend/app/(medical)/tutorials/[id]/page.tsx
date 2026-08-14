'use client';

import React, {useEffect, useState, use} from "react";
import { api } from "@/lib/api";
import { Tutorial, ApiResponse, TutorialVersion } from "@/types";
import { TutorialHeader } from "@/components/tutorial/tutorial-header";
import { TutorialContent } from "@/components/tutorial/tutorial-content";
import { TutorialActions } from "@/components/tutorial/tutorial-actions";
import { VersionHistory } from "@/components/tutorial/version-history";
import { CommentSection } from "@/components/tutorial/comment-section";
import { Loader2, AlertCircle } from "lucide-react";

export default function TutorialDetailPage({params}:{params: Promise<{id:string}>}){
    // use React.use() to unwrap params in Next.js 15
    const resolvedParams = use(params);
    const tutorialId = resolvedParams.id;

    const [tutorial, setTutorial] = useState<Tutorial | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTutorial = async () => {
        try{
            setLoading(true);
            const response = await api.get<ApiResponse<Tutorial>>(`/tutorials/${tutorialId}`);
            setTutorial(response.data.data);
        } catch (err){
            setError("Failed to load tutorial. It may have been deleted.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(()=>{
        fetchTutorial();
    }, [tutorialId]);

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;
    if (error || !tutorial) return <div className="text-red-400 flex items-center gap-2"><AlertCircle /> {error}</div>;

    return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Main Content Area */}
      <div className="lg:col-span-3 space-y-8">
        <TutorialHeader tutorial={tutorial} />
        
        <TutorialActions 
          tutorialId={tutorial.id} 
          initialLikes={tutorial.likeCount || 0}
          initialDislikes={tutorial.dislikeCount || 0}
        />

        <TutorialContent content={tutorial.content} />
        
        <hr className="border-slate-800" />
        
        <CommentSection tutorialId={tutorial.id} />
      </div>

      {/* Sidebar for Version History */}
      <div className="lg:col-span-1">
        <VersionHistory tutorialId={tutorial.id} currentVersion={tutorial.currentVersionNumber} />
      </div>
    </div>
  );
}
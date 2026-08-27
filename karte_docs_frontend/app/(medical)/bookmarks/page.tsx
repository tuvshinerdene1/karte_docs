'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Tutorial, ApiResponse } from '@/types';
import { 
  Bookmark, 
  BookOpen, 
  ChevronRight, 
  Clock, 
  Loader2,
  BookmarkX
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const response = await api.get<ApiResponse<Tutorial[]>>('/tutorials/bookmarks');
        if (isMounted) setBookmarks(response.data.data);
      } catch (error) {
        console.error("Failed to fetch bookmarks:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRemoveBookmark = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.post(`/tutorials/bookmarks/${id}`);
      setBookmarks(prev => prev.filter(b => b.id !== id));
    } catch (error) {
      console.error("Failed to remove bookmark", error);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 shrink-0">
            <Bookmark className="h-5 w-5 text-amber-400 fill-amber-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-100">My Bookmarks</h1>
            <p className="text-sm text-slate-400 mt-1">Quick access to your most frequently used guides.</p>
          </div>
        </div>

        {bookmarks.length > 0 && (
          <Link href="/tutorials">
            <Button size="sm" variant="outline" className="text-xs border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-slate-100 h-9 px-4">
              <BookOpen className="h-3.5 w-3.5 mr-2" /> Browse all guides
            </Button>
          </Link>
        )}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex h-64 items-center justify-center text-slate-400">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
            <span className="text-sm font-medium">Loading bookmarks...</span>
          </div>
        </div>
      ) : bookmarks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((tutorial) => (
            <Link key={tutorial.id} href={`/tutorials/${tutorial.id}`} className="block h-full">
              <Card className="bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50 transition-all group flex flex-col h-full shadow-sm relative">
                <CardHeader className="p-5 pb-3 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base font-semibold text-slate-100 group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug pr-6">
                      {tutorial.title}
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => handleRemoveBookmark(e, tutorial.id)}
                      className="absolute top-3.5 right-3.5 h-7 w-7 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Remove Bookmark"
                    >
                      <BookmarkX className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="p-5 pt-0 flex-1">
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {tutorial.content}
                  </p>
                </CardContent>

                <CardFooter className="p-5 pt-3 border-t border-slate-800/40 mt-auto flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    <span>Saved on {new Date(tutorial.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 font-medium group-hover:translate-x-0.5 transition-transform">
                    <span>Read</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
          <div className="bg-slate-900 p-3.5 rounded-full mb-3 border border-slate-800">
            <Bookmark className="h-6 w-6 text-slate-500" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">No bookmarks yet</h3>
          <p className="text-slate-400 text-xs max-w-xs mx-auto mt-1 leading-relaxed">
            Bookmarked tutorials will appear here for quick access. 
            Click the bookmark icon on any guide to save it.
          </p>
          <Link href="/tutorials" className="mt-4">
            <Button size="sm" variant="outline" className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-slate-100 text-xs h-8">
              <BookOpen className="h-3.5 w-3.5 mr-2 text-slate-400" /> Browse Tutorials
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
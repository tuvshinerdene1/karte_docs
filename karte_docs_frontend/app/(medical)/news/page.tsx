'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { News, ApiResponse } from '@/types';
import { 
  Newspaper, 
  Calendar, 
  User, 
  Search, 
  Clock, 
  Loader2,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function NewsPage() {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse<News[]>>('/news');
      setNewsList(response.data.data);
    } catch (error) {
      console.error("Failed to fetch news:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Client-side filtering for news search
  const filteredNews = newsList.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <Newspaper className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">System News</h1>
            <p className="text-slate-400 text-sm">Official updates and announcements regarding the Karte platform.</p>
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Search news..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-900 border-slate-800 text-sm focus-visible:ring-blue-500"
          />
        </div>
      </div>

      <hr className="border-slate-800" />

      {/* News Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
          <p className="text-slate-500">Fetching latest updates...</p>
        </div>
      ) : filteredNews.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredNews.map((news) => (
            <Card key={news.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(news.createdAt).toLocaleDateString(undefined, { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {news.authorName || 'System Admin'}
                    </span>
                  </div>
                  {/* Highlight very recent news */}
                  {isRecent(news.createdAt) && (
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[9px]">
                      New
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl text-white">{news.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {news.content}
                </p>
                <div className="mt-6 pt-4 border-t border-slate-800/50 flex justify-end items-center gap-2 text-[10px] text-slate-500">
                  <Clock className="h-3 w-3" />
                  Published at {new Date(news.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-2xl">
          <Newspaper className="h-12 w-12 text-slate-700 mb-4" />
          <h3 className="text-lg font-medium text-white">No news found</h3>
          <p className="text-slate-500 max-w-xs mx-auto mt-1">
            {searchQuery 
              ? `We couldn't find any announcements matching "${searchQuery}".`
              : "Check back later for system updates and announcements."}
          </p>
        </div>
      )}
    </div>
  );
}

// Helper to highlight news from the last 48 hours
function isRecent(dateString: string) {
  const newsDate = new Date(dateString).getTime();
  const now = new Date().getTime();
  const fortyEightHours = 48 * 60 * 60 * 1000;
  return now - newsDate < fortyEightHours;
}
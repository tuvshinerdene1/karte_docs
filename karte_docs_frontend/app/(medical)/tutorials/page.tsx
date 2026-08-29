'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Tutorial, ApiResponse } from '@/types';
import { 
  Search, 
  BookOpen, 
  Clock, 
  ChevronRight, 
  Loader2,
  X,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TutorialsPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const fetchTutorials = useCallback(async (query?: string) => {
    try {
      setIsSearching(true);
      let url = '/tutorials?audience=MEDICAL';

      if (query && query.trim() !== '') {
        url = `/tutorials/search?q=${encodeURIComponent(query)}`;
      }

      const response = await api.get<ApiResponse<Tutorial[]>>(url);
      setTutorials(response.data.data);
    } catch (error) {
      console.error("Failed to fetch tutorials:", error);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    fetchTutorials();
  }, [fetchTutorials]);

  // Handle instant clearing
  const handleClearSearch = () => {
    setSearchQuery('');
    fetchTutorials('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTutorials(searchQuery);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header & Search Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1 text-xs uppercase tracking-wider">
            <FileText className="h-4 w-4" />
            <span>Documentation</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100">Medical Guides</h1>
          <p className="text-sm text-slate-400 mt-1">Search and browse official system documentation and clinical workflows.</p>
        </div>
        
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-80 md:w-96">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input 
              placeholder="Search guides..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 bg-slate-900 border-slate-800 text-sm focus-visible:ring-1 focus-visible:ring-emerald-500/50 text-slate-200 placeholder:text-slate-500 h-9"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Button 
            type="submit" 
            disabled={isSearching} 
            size="sm"
            variant="outline"
            className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-slate-100 h-9 px-3 text-xs"
          >
            {isSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Search"}
          </Button>
        </form>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-slate-900/40 border border-slate-800/60 animate-pulse p-5 space-y-3">
              <div className="h-4 w-12 bg-slate-800 rounded" />
              <div className="h-5 w-3/4 bg-slate-800 rounded" />
              <div className="h-12 w-full bg-slate-800/50 rounded" />
            </div>
          ))}
        </div>
      ) : tutorials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tutorials.map((tutorial) => (
            <Link key={tutorial.id} href={`/tutorials/${tutorial.id}`} className="block h-full">
              <Card className="bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90 transition-all group flex flex-col h-full shadow-sm">
                <CardHeader className="p-5 pb-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] bg-emerald-950/40 text-emerald-400 border-emerald-800/50 font-mono px-2 py-0.5">
                      v{tutorial.currentVersionNumber}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-semibold text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                    {tutorial.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="px-5 py-0 flex-1">
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {tutorial.content}
                  </p>
                </CardContent>

                <CardFooter className="p-5 pt-3 border-t border-slate-800/40 mt-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-100 font-medium">
                    <Clock className="h-3.5 w-3.5 text-slate-100" />
                    <span>{new Date(tutorial.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-700 group-hover:text-blue-400 font-medium transition-colors">
                    <span>Read Guide</span>
                    <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-800/80 rounded-xl bg-slate-900/20">
          <div className="bg-slate-900 p-3.5 rounded-full mb-3 border border-slate-800">
            <BookOpen className="h-6 w-6 text-slate-500" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">No tutorials found</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto mt-1 leading-relaxed">
            {searchQuery 
              ? `We couldn't find anything matching "${searchQuery}".`
              : "There are currently no tutorials available for the medical staff."}
          </p>
          {searchQuery && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleClearSearch}
              className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 text-xs mt-4 h-8"
            >
              Clear search filter
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
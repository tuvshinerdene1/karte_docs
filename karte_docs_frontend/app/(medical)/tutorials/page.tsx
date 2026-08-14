'use client';
import React, {useEffect, useState} from 'react';
import { api } from '@/lib/api';
import { Tutorial, ApiResponse } from '@/types';
import { 
  Search, 
  BookOpen, 
  Clock, 
  ChevronRight, 
  Filter,
  AlertCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TutorialsPage(){
    const [tutorials, setTutorials] = useState<Tutorial[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);

    // fetch initial list of medical tutorials
    const fetchTutorials = async (query?: string) => {
        try{
            setLoading(true);
            let url = '/tutorials?audience=MEDICAL';

            // if there is a query, use the search endpoint
            if (query && query.trim() !== ''){
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
    };

    useEffect(() => {
        fetchTutorials();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSearching(true);
        fetchTutorials(searchQuery);
    };


  return (
    <div className="space-y-6">
      {/* Header & Search Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Medical Guides</h1>
          <p className="text-sm text-slate-400">Search and browse official system documentation.</p>
        </div>
        
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-96">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input 
              placeholder="Search by title or content..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900 border-slate-800 text-sm focus-visible:ring-blue-500"
            />
          </div>
          <Button type="submit" disabled={isSearching} className="bg-blue-600 hover:bg-blue-500 px-6">
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </form>
      </div>

      <hr className="border-slate-800" />

      {/* Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Loader2 className="h-10 w-10 animate-spin mb-4 text-blue-500" />
          <p>Loading tutorials...</p>
        </div>
      ) : tutorials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutorials.map((tutorial) => (
            <Link key={tutorial.id} href={`/tutorials/${tutorial.id}`}>
              <Card className="bg-slate-900 border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/40 transition-all group flex flex-col h-full">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/20">
                      v{tutorial.currentVersionNumber}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                    {tutorial.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="flex-1">
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {tutorial.content}
                  </p>
                </CardContent>

                <CardFooter className="pt-0 pb-5 px-6 border-t border-slate-800/50 mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-4">
                    <Clock className="h-3 w-3" />
                    {new Date(tutorial.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-blue-500 font-medium mt-4">
                    Read Guide
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-800 rounded-xl">
          <div className="bg-slate-900 p-4 rounded-full mb-4">
            <BookOpen className="h-8 w-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-medium text-white">No tutorials found</h3>
          <p className="text-slate-400 max-w-xs mx-auto mt-1">
            {searchQuery 
              ? `We couldn't find anything matching "${searchQuery}".`
              : "There are currently no tutorials available for the medical staff."}
          </p>
          {searchQuery && (
            <Button 
              variant="link" 
              onClick={() => { setSearchQuery(''); fetchTutorials(''); }}
              className="text-blue-500 mt-2"
            >
              Clear search and show all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
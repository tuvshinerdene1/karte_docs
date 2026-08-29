'use client';

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { News, Tutorial, ApiResponse } from "@/types";
import { Calendar, ArrowRight, FileText, Newspaper, ChevronRight } from "lucide-react";
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MedicalDashboard() {
  const [news, setNews] = useState<News[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [newsRes, tutorialRes] = await Promise.all([
          api.get<ApiResponse<News[]>>('/news'),
          api.get<ApiResponse<Tutorial[]>>('/tutorials?audience=MEDICAL')
        ]);
        setNews(newsRes.data.data.slice(0, 3));
        setTutorials(tutorialRes.data.data.slice(0, 4));
      } catch (error) {
        console.error("Dashboard fetch error: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
          <span className="text-sm font-medium">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">Welcome back</h1>
        <p className="text-slate-400 mt-1 text-sm">Stay updated with the latest system news and medical tutorials.</p>
      </div>

      <div className="space-y-10">
        {/* Row 1: News Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <Newspaper className="h-4 w-4 text-blue-400" />
              <h2 className="text-lg">Recent News</h2>
            </div>
            <Link href="/news">
              <Button size="sm" variant="outline" className="text-xs border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-slate-100">
                View all <ChevronRight className="h-3 w-3 ml-1 text-slate-400" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {news.map((item) => (
              <Card 
                key={item.id} 
                className="bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 transition-all shadow-sm flex flex-col justify-between"
              >
                <CardHeader className="p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    <span>{new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <CardTitle className="text-sm font-semibold text-slate-100 leading-snug">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-xs text-slate-400 leading-relaxed">
                    {item.content}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Row 2: Recent Tutorials Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <FileText className="h-4 w-4 text-emerald-400" />
              <h2 className="text-lg">New Tutorials</h2>
            </div>
            <Link href="/tutorials">
              <Button size="sm" variant="outline" className="text-xs border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-slate-100">
                View all <ChevronRight className="h-3 w-3 ml-1 text-slate-400" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tutorials.map((tutorial) => (
              <Link key={tutorial.id} href={`/tutorials/${tutorial.id}`} className="block h-full">
                <Card className="bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50 transition-all group h-full flex flex-col justify-between shadow-sm">
                  <CardHeader className="p-4 space-y-2">
                    <CardTitle className="text-base font-semibold text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                      {tutorial.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex items-center justify-between text-xs text-slate-400 mt-auto border-t border-slate-800/40 pt-3">
                    <span>v{tutorial.currentVersionNumber} • {new Date(tutorial.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
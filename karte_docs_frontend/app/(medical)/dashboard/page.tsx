'use client';

import React, {useEffect, useState} from "react";
import { api } from "@/lib/api";
import { News, Tutorial, ApiResponse } from "@/types";
import { Calendar, ArrowRight, FileText, Newspaper } from "lucide-react";
import Link from 'next/link';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";

export default function MedicalDashboard(){
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
                setNews(newsRes.data.data.slice(0, 3)); // latest 3 news
                setTutorials(tutorialRes.data.data.slice(0,4)); // latest 4 tutorials
            }
            catch(error){
                console.error("Dashboard fetch error: ", error);
            }
            finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <div className="animate-pulse">Loading dashboard...</div>;
     return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Welcome back</h1>
        <p className="text-slate-400 mt-1">Stay updated with the latest system news and tutorials.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* News Section */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2 text-blue-400 font-semibold mb-2">
            <Newspaper className="h-5 w-5" />
            <h2>Recent News</h2>
          </div>
          {news.map((item) => (
            <Card key={item.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
              <CardHeader className="p-4">
                <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
                <CardTitle className="text-base text-white">{item.title}</CardTitle>
                <CardDescription className="line-clamp-2 text-xs text-slate-400">
                  {item.content}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
          <Button variant="link" className="text-blue-500 text-xs p-0 h-auto">
            View all news
          </Button>
        </div>

        {/* Recent Tutorials Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <FileText className="h-5 w-5" />
              <h2>New Tutorials</h2>
            </div>
            <Link href="/tutorials">
              <Button size="sm" variant="outline" className="text-xs border-slate-800">
                Browse all
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tutorials.map((tutorial) => (
              <Link key={tutorial.id} href={`/tutorials/${tutorial.id}`}>
                <Card className="bg-slate-900 border-slate-800 hover:bg-slate-800/50 transition-all group h-full">
                  <CardHeader className="p-5">
                    <CardTitle className="text-lg text-white group-hover:text-blue-400 transition-colors">
                      {tutorial.title}
                    </CardTitle>
                    <CardDescription className="text-slate-500 text-xs mt-2">
                      Version {tutorial.currentVersionNumber} • Updated {new Date(tutorial.updatedAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 flex justify-end">
                    <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-blue-400" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
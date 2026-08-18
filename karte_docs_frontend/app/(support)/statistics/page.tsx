'use client';
import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Tutorial, ApiResponse, Question } from '@/types';
import { BarChart3, ThumbsUp, ThumbsDown, FileText, HelpCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StatisticsPage(){
    const [tutorials, setTutorials] = useState<Tutorial[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [tutRes, quesRes] = await Promise.all([
                    api.get<ApiResponse<Tutorial[]>>('/tutorials?audience=MEDICAL'),
                    api.get<ApiResponse<Question[]>>('/questions')
                ]);
                setTutorials(tutRes.data.data);
                setQuestions(quesRes.data.data);            
            }catch(error){
                console.error(error);
            } finally{
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const totalLikes = tutorials.reduce((acc, curr) => acc + (curr.likeCount || 0),0);
    const unansweredCount = questions.filter(q => q.status === 'WAITING').length;
    const topTutorials = [...tutorials].sort((a,b) => (b.likeCount || 0) - (a.likeCount || 0)).slice(0,5);

    if (loading) {
        return (
            <div className="p-8 text-slate-500">Calculating metrics...</div>
        );
    }

    return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">System Analytics</h1>
        <p className="text-slate-400 mt-1">Overview of documentation performance and support activity.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Guides" value={tutorials.length} icon={<FileText className="text-blue-500" />} />
        <StatCard title="Total Likes" value={totalLikes} icon={<ThumbsUp className="text-emerald-500" />} />
        <StatCard title="Open Tickets" value={unansweredCount} icon={<HelpCircle className="text-yellow-500" />} />
        <StatCard title="Engagement Rate" value={`${Math.round((totalLikes / (tutorials.length || 1)) * 10) / 10} avg`} icon={<TrendingUp className="text-purple-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Content (Requirement 1.7) */}
        <Card className="lg:col-span-2 bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Most Helpful Tutorials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topTutorials.map((t, index) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-600">0{index + 1}</span>
                    <span className="text-sm text-slate-200 font-medium">{t.title}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
                        <ThumbsUp className="h-3 w-3" /> {t.likeCount || 0}
                    </div>
                    <div className="flex items-center gap-1.5 text-red-400 text-xs">
                        <ThumbsDown className="h-3 w-3" /> {t.dislikeCount || 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Small Distribution Info */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader><CardTitle className="text-lg text-white">Audience Distribution</CardTitle></CardHeader>
          <CardContent className="space-y-6">
             <DistributionRow label="Medical Staff" count={tutorials.filter(t => t.targetAudience === 'MEDICAL').length} total={tutorials.length} color="bg-blue-500" />
             <DistributionRow label="Support Staff" count={tutorials.filter(t => t.targetAudience === 'SUPPORT').length} total={tutorials.length} color="bg-emerald-500" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({title, value, icon} : any){
      return (
    <Card className="bg-slate-900 border-slate-800">
      <CardContent className="p-6 flex items-center gap-4">
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">{icon}</div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}


function DistributionRow({label, count, total, color}: any){
    const percentage = Math.round((count / (total || 1)) * 100);
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-xs">
                <span className="text-slate-400">{label}</span>
                <span className="text-white font-bold">{percentage}%</span>
            </div>
            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                <div className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
}
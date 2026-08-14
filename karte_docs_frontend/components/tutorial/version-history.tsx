'use client';

import React, {useEffect, useState} from "react";
import { api } from "@/lib/api";
import { TutorialVersion, ApiResponse } from "@/types";
import { History, GitBranch, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "../ui/badge";

export function VersionHistory({tutorialId, currentVersion}:{tutorialId:number, currentVersion:number}){
    const [versions, setVersions] = useState<TutorialVersion[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        const fetchVersions = async () => {
            try{
                // this assumes there is backend endpoint to get versions
                const response = await api.get<ApiResponse<TutorialVersion[]>>(`/tutorials/${tutorialId}/versions`);
                setVersions(response.data.data);
            } catch(error){
                console.error("Failed to fetch versions", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVersions();
    }, [tutorialId]);

  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6 sticky top-24">
      <div className="flex items-center gap-2 text-white font-semibold mb-6">
        <History className="h-5 w-5 text-emerald-500" />
        <h3>Changelog</h3>
      </div>

      <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
        {loading ? (
          <div className="text-slate-600 text-xs px-8">Loading history...</div>
        ) : versions.map((v) => (
          <div key={v.id} className="relative pl-8">
            {/* Timeline Dot */}
            <div className={`absolute left-0 top-1 h-6 w-6 rounded-full border-4 border-slate-950 flex items-center justify-center z-10 
              ${v.versionNumber === currentVersion ? 'bg-emerald-500' : 'bg-slate-700'}`}>
              {v.versionNumber === currentVersion ? (
                <CheckCircle2 className="h-3 w-3 text-white" />
              ) : (
                <GitBranch className="h-2 w-2 text-slate-300" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${v.versionNumber === currentVersion ? 'text-emerald-400' : 'text-slate-300'}`}>
                  Version {v.versionNumber}
                </span>
                {v.versionNumber === currentVersion && (
                  <Badge variant="outline" className="text-[9px] h-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    Current
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-slate-400 italic">
                "{v.changelog || 'No notes provided'}"
              </p>
              <div className="flex items-center gap-1 text-[9px] text-slate-600">
                <Clock className="h-2 w-2" />
                {new Date(v.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
import { Tutorial } from "@/types";
import { Calendar, User, ShieldCheck } from "lucide-react";

export function TutorialHeader({tutorial}:{tutorial: Tutorial}){
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-blue-500 text-xs font-bold uppercase tracking-widest">
        <ShieldCheck className="h-4 w-4" />
        Official Medical Guide
      </div>
      <h1 className="text-4xl font-extrabold text-white leading-tight">{tutorial.title}</h1>
      <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-slate-500" />
          <span>Support Team</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-500" />
          <span>Last updated {new Date(tutorial.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
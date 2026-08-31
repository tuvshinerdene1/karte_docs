'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { AuditLog, ApiResponse } from '@/types';
import { History, Loader2 } from 'lucide-react'; // Cleaned up unused icons
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<ApiResponse<AuditLog[]>>('/audit')
      .then(res => {
        // FIXED: Changed 'response' to 'res' to match the parameter above
        setLogs(res.data.data);
      })
      .catch(err => {
        console.error("Failed to fetch audit logs:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'DELETE': return 'text-red-400 border-red-500/20 bg-red-500/10';
      case 'CREATE': return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10';
      case 'RESTORE': return 'text-blue-400 border-blue-500/20 bg-blue-500/10';
      case 'UPDATE': return 'text-amber-400 border-amber-500/20 bg-amber-500/10';
      default: return 'text-slate-400 border-slate-500/20 bg-slate-500/10';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
          <History className="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Security Audit Logs</h1>
          <p className="text-slate-400 text-sm">Track all administrative actions performed by support staff.</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden shadow-xl">
        <Table>
          <TableHeader className="bg-slate-900/80">
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-xs uppercase font-bold text-slate-500 py-4">Timestamp</TableHead>
              <TableHead className="text-xs uppercase font-bold text-slate-500 py-4">Staff Member</TableHead>
              <TableHead className="text-xs uppercase font-bold text-slate-500 py-4">Action</TableHead>
              <TableHead className="text-xs uppercase font-bold text-slate-500 py-4">Module</TableHead>
              <TableHead className="text-xs uppercase font-bold text-slate-500 py-4">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20">
                  <div className="flex items-center justify-center gap-2 text-slate-400">
                    <Loader2 className="animate-spin h-5 w-5 text-blue-500" />
                    <span>Loading audit records...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : logs.length > 0 ? (
              logs.map((log) => (
                <TableRow key={log.id} className="border-slate-800 hover:bg-slate-800/30 transition-colors">
                  <TableCell className="text-slate-400 text-[11px] whitespace-nowrap font-mono">
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-blue-400 shadow-inner">
                        {log.performedByName?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-100">{log.performedByName}</span>
                        <span className="text-[10px] text-slate-500">{log.performedByEmail}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[9px] font-bold tracking-wider px-2 py-0.5 border ${getActionColor(log.action)}`}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                      {log.module}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-300 max-w-xs leading-relaxed italic">
                    {log.details}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-slate-500 text-sm">
                  No administrative actions have been recorded yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
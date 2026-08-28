'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import {
  FileText,
  HelpCircle,
  BarChart3,
  History,
  Trash2,
  LogOut,
  ShieldCheck,
  Headphones,
  User as UserIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const SUPPORT_NAV_ITEMS = [
  { href: '/management', label: 'Tutorials & News', icon: FileText },
  { href: '/tickets', label: 'Support Tickets', icon: HelpCircle },
  { href: '/statistics', label: 'Analytics', icon: BarChart3 },
  // { href: '/audit-logs', label: 'Audit Logs', icon: History },
  { href: '/trash', label: 'Recycle Bin', icon: Trash2 },
];

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div className="bg-slate-950 h-screen" />;
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col justify-between shrink-0">
        <div>
          {/* Header Branding */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <ShieldCheck className="h-6 w-6" />
              <span className="text-lg text-white">Karte Docs</span>
            </div>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px]">
              Support
            </Badge>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <div className="px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Workspace
            </div>
            {SUPPORT_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start text-sm gap-3 h-10 ${isActive
                        ? 'bg-emerald-500/10 text-emerald-400 font-medium hover:bg-emerald-500/20 hover:text-emerald-300'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-emerald-400 shrink-0">
                <Headphones className="h-4 w-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user.fullName || 'Support Staff'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              title="Log out"
              className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
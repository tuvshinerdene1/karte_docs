'use client'

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import {
  LayoutDashboard,
  BookOpen,
  Bookmark,
  MessageSquare,
  LogOut,
  ShieldCheck,
  User as UserIcon,
  Search,
  Newspaper
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const MEDICAL_NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tutorials', label: 'Tutorials', icon: BookOpen },
  { href: '/news', label: 'News', icon: Newspaper },
  { href: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { href: '/questions', label: 'My questions', icon: MessageSquare },


];

export default function MedicalLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

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
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center gap-2 text-blue-500 font-bold">
            <ShieldCheck className="h-6 w-6" />
            <span className="text-lg text-white">Karte Docs</span>
          </div>

          <nav className="p-4 space-y-1">
            {MEDICAL_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start text-sm gap-3 h-11 ${isActive
                        ? 'bg-blue-500/10 text-blue-400 font-medium'
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

        <div className="p-4 border-t border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-8 w-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <UserIcon className="h-4 w-4" />
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{user.fullName}</p>
              <p className="text-[10px] text-slate-500 truncate">Medical Staff</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-slate-400 border-slate-800 hover:bg-red-500/10 hover:text-red-400"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/30">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input 
              placeholder="Search for guides, protocols..." 
              className="pl-10 bg-slate-950 border-slate-800 h-9 text-sm"
            />
          </div>
          <div className="text-xs text-slate-500">
            s: <span className="text-emerald-500">Online</span>
          </div>
        </header> */}

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}


function LoaderComponent() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      <span className="text-sm">Initializing Medical Portal...</span>
    </div>
  );
}
'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ApiResponse, Tutorial } from '@/types';
import { BlurCanvas } from '@/components/blur-tool/blur-canvas';
import { 
  Save, 
  ArrowLeft, 
  ImageIcon, 
  History,
  Loader2,
  AlertCircle,
  ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger 
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';

export default function EditTutorialPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const tutorialId = resolvedParams.id;
  const router = useRouter();

  // State
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState('MEDICAL');
  const [changelog, setChangelog] = useState('');
  const [currentVersion, setCurrentVersion] = useState(0);

  useEffect(() => {
    const fetchTutorial = async () => {
      try {
        const response = await api.get<ApiResponse<Tutorial>>(`/tutorials/${tutorialId}`);
        const data = response.data.data;
        setTitle(data.title);
        setContent(data.content);
        setAudience(data.targetAudience);
        setCurrentVersion(data.currentVersionNumber);
      } catch (error) {
        console.error("Failed to load tutorial:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTutorial();
  }, [tutorialId]);

  const handleUpdate = async () => {
    if (!title.trim() || !content.trim() || !changelog.trim()) {
        alert("Title, content, and changelog are required for version updates.");
        return;
    }
    
    setIsSubmitting(true);
    try {
      await api.put(`/tutorials/${tutorialId}`, {
        title,
        content,
        targetAudience: audience,
        changelog: changelog
      });
      router.push('/management');
    } catch (error) {
      console.error("Failed to update tutorial:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onBlurImageSaved = (blob: Blob) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result;
      setContent(prev => prev + `\n\n![Redacted Screenshot](${base64data})\n`);
      alert("Image redacted and appended to content!");
    };
    reader.readAsDataURL(blob);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 text-emerald-500 gap-2">
        <Loader2 className="animate-spin h-6 w-6" />
        <span className="text-sm font-medium text-slate-400">Loading tutorial data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header / Navigation */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
            <Button 
                variant="ghost" 
                onClick={() => router.back()} 
                className="text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
            >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs px-2.5 py-1">
                Editing Version {currentVersion}
            </Badge>
        </div>
        <Button 
            onClick={handleUpdate} 
            disabled={isSubmitting} 
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-2 transition-colors shadow-sm"
        >
            {isSubmitting ? (
                <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    <span>Publishing...</span>
                </>
            ) : (
                <>
                    <Save className="h-4 w-4" />
                    <span>Publish Version {currentVersion + 1}</span>
                </>
            )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor Side */}
        <div className="lg:col-span-2 space-y-4">
            <Card className="p-6 bg-slate-900/60 border-slate-800/80 backdrop-blur-sm shadow-sm space-y-6">
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Guide Title</Label>
                    <Input 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder="e.g. How to use Karte Lab Results"
                        className="bg-slate-950/80 border-slate-800 text-slate-100 text-lg font-semibold py-6 placeholder:text-slate-500 focus-visible:ring-emerald-500"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Content Editor (Markdown)</Label>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 text-xs border-slate-700 bg-slate-800/50 text-slate-200 hover:bg-slate-800 hover:text-white gap-1.5 transition-colors"
                                >
                                    <ImageIcon className="h-3.5 w-3.5 text-emerald-400" />
                                    <span>Redact & Insert Image</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl bg-slate-900 border-slate-800 text-slate-100">
                                <DialogHeader>
                                    <DialogTitle className="text-slate-100 flex items-center gap-2">
                                        <ShieldAlert className="h-5 w-5 text-emerald-400" /> Image Redaction Tool
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="pt-2">
                                    <BlurCanvas onSave={onBlurImageSaved} />
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <Textarea 
                        value={content} 
                        onChange={(e) => setContent(e.target.value)} 
                        placeholder="Write your guide instructions here using Markdown..."
                        className="bg-slate-950/80 border-slate-800 text-slate-200 min-h-[480px] font-mono text-sm leading-relaxed placeholder:text-slate-500 focus-visible:ring-emerald-500 resize-y"
                    />
                </div>
            </Card>
        </div>

        {/* Versioning & Metadata Side */}
        <div className="lg:col-span-1 space-y-4">
            <Card className="p-6 bg-slate-900/60 border-slate-800/80 backdrop-blur-sm shadow-sm space-y-6">
                <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                        <History className="h-4 w-4" /> Versioning Info
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Saving these changes will archive the current text as <strong className="text-slate-200 font-semibold">Version {currentVersion}</strong> and publish the new content as <strong className="text-slate-200 font-semibold">Version {currentVersion + 1}</strong>.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">What changed in this version?</Label>
                    <Textarea 
                        value={changelog} 
                        onChange={(e) => setChangelog(e.target.value)} 
                        placeholder="e.g. Added screenshots for the new login flow..." 
                        className="bg-slate-950/80 border-slate-800 text-slate-200 min-h-[110px] text-xs leading-relaxed placeholder:text-slate-500 focus-visible:ring-emerald-500 resize-y"
                        required
                    />
                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-1">
                        <AlertCircle className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>This note is visible to medical staff in the changelog history.</span>
                    </p>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Audience</Label>
                    <Select value={audience} onValueChange={(val) => { if (val) setAudience(val); }}>
                        <SelectTrigger className="bg-slate-950/80 border-slate-800 text-slate-200 focus:ring-emerald-500">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                            <SelectItem value="MEDICAL" className="focus:bg-slate-800 focus:text-emerald-400">
                                Medical Staff
                            </SelectItem>
                            <SelectItem value="SUPPORT" className="focus:bg-slate-800 focus:text-emerald-400">
                                Support Staff Only
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
}
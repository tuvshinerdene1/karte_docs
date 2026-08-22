'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';
import { ApiResponse, AuthResponse, Role } from '@/types';
import { 
  Stethoscope, 
  Headphones, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ShieldCheck,
  Loader2
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
}

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Expect the wrapper ApiResponse containing your flat AuthResponse record
      const response = await api.post<ApiResponse<{ token: string; email: string; role: Role; fullName: string }>>('/auth/login', {
        email,
        password,
      });

      const result = response.data.data;
      
      // Reconstruct the token and user object to match your frontend state expectation
      const token = result.token;
      const user = {
        id: 1, // Fallback ID since your backend record doesn't send it yet
        email: result.email,
        fullName: result.fullName,
        role: result.role,
      };

      login(token, user);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      if (apiError.response?.status === 401) {
        setError('Invalid email or password. Please check your credentials.');
      } else if (apiError.response?.data?.message) {
        setError(apiError.response.data.message);
      } else {
        setError('Cannot connect to Spring Boot backend. Ensure localhost:8080 is running.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fillPreset = (presetEmail: string, presetPass: string) => {
    setEmail(presetEmail);
    setPassword(presetPass);
    setError(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900 text-slate-100 shadow-2xl">
        <CardHeader className="space-y-2 pb-4">
          <div className="flex items-center gap-2 text-blue-500 mb-1">
            <ShieldCheck className="h-6 w-6" />
            <span className="font-bold text-lg text-white">Karte Docs</span>
          </div>
          <CardTitle className="text-2xl font-bold text-white">Sign in</CardTitle>
          <CardDescription className="text-slate-400">
            Access the documentation & ticket management portal.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Preset Quick Login Buttons (Dev Helper) */}
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 space-y-2">
            <span className="text-xs font-medium text-slate-400 block">Quick test credentials:</span>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillPreset('support@karte.mn', 'support123')}
                className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-200 text-xs h-8"
              >
                <Headphones className="mr-1.5 h-3.5 w-3.5" /> Support
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillPreset('doctor@hospital.mn', 'doctor123')}
                className="border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 hover:text-blue-200 text-xs h-8"
              >
                <Stethoscope className="mr-1.5 h-3.5 w-3.5" /> Medical
              </Button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <Alert variant="destructive" className="border-red-500/50 bg-red-500/10 text-red-300">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertTitle className="text-xs font-semibold">Authentication Error</AlertTitle>
              <AlertDescription className="text-xs leading-relaxed">{error}</AlertDescription>
            </Alert>
          )}

          <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@hospital.mn"
                  className="pl-9 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 pr-9 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </form>
        </CardContent>

        <CardFooter>
          <Button
            form="login-form"
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
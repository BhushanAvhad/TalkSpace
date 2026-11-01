import React, { useState } from 'react';
import { User, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/useAuthStore';

export function AuthModal() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, register, isLoading, authError } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    if (isRegister) {
      register(username.trim(), password.trim());
    } else {
      login(username.trim(), password.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-md p-8 rounded-2xl border border-border bg-card/95 text-card-foreground shadow-glow-lg transition-all relative overflow-hidden">
        {/* Subtle decorative gradient aura */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6 space-y-2">
          <Logo variant="full" size="lg" showTagline={true} />
          <h2 className="text-xl font-bold tracking-tight text-foreground mt-4">
            {isRegister ? 'Create your TalkSpace account' : 'Welcome back to TalkSpace'}
          </h2>
          <p className="text-xs text-muted-foreground">
            {isRegister
              ? 'Enter your details to join the live workspace'
              : 'Sign in to access your direct chats and channels'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 p-1 mb-6 rounded-xl bg-muted/80 border border-border/80 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`py-2 rounded-lg transition-all ${
              !isRegister
                ? 'bg-card text-foreground shadow-subtle'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`py-2 rounded-lg transition-all ${
              isRegister
                ? 'bg-card text-foreground shadow-subtle'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Username</label>
            <Input
              type="text"
              placeholder="e.g. alex_rivers"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              icon={<User className="w-4 h-4" />}
              autoComplete="username"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              required
            />
          </div>

          {authError && (
            <div className="p-3 rounded-lg bg-destructive/15 border border-destructive/20 text-xs text-destructive font-medium animate-fade-in">
              {authError}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full h-11 text-sm font-semibold mt-2"
            isLoading={isLoading}
          >
            {isRegister ? 'Register & Start Chatting' : 'Sign In to TalkSpace'}
            {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </form>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-border/50 text-center text-[11px] text-muted-foreground">
          Live encrypted communication platform &bull; Powered by Supabase & Socket.IO
        </div>
      </div>
    </div>
  );
}

export default AuthModal;

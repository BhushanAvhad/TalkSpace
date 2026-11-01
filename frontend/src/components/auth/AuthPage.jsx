import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export function AuthPage({ initialMode = 'login', onBackToHome, onSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const isLogin = mode === 'login';

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-background text-foreground relative overflow-hidden select-none font-sans">
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[400px] bg-gradient-to-tr from-indigo-500/15 via-purple-500/10 to-transparent blur-[120px] pointer-events-none rounded-full" />

      {/* Top Bar with Back and Theme Toggle */}
      <header className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between max-w-7xl mx-auto w-full z-20">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackToHome}
          className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing</span>
        </Button>

        <ThemeToggle />
      </header>

      {/* Center Auth Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md p-6 sm:p-8 rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl text-card-foreground shadow-2xl relative z-10"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2 mb-6">
          <Logo variant="full" size="lg" showTagline={false} />
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground pt-2">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-xs text-muted-foreground max-w-xs">
            {isLogin
              ? 'Enter your credentials to access your conversations'
              : 'Join TalkSpace to connect with friends and communities'}
          </p>
        </div>

        {/* Tab Toggle Switch */}
        <div className="grid grid-cols-2 p-1 mb-6 rounded-xl bg-muted/60 border border-border/60 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2 rounded-lg transition-all ${
              isLogin
                ? 'bg-card text-foreground shadow-subtle font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`py-2 rounded-lg transition-all ${
              !isLogin
                ? 'bg-card text-foreground shadow-subtle font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Animated Form Render */}
        <AnimatePresence mode="wait">
          {isLogin ? (
            <LoginForm
              key="login"
              onSwitchToRegister={() => setMode('register')}
            />
          ) : (
            <RegisterForm
              key="register"
              onSwitchToLogin={() => setMode('login')}
            />
          )}
        </AnimatePresence>

        {/* Security badge footer */}
        <div className="mt-6 pt-4 border-t border-border/40 text-center flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>PBKDF2 SHA-512 Encrypted &bull; Supabase Realtime</span>
        </div>
      </motion.div>
    </div>
  );
}

export default AuthPage;


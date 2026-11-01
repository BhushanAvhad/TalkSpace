import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export function AuthModal({ initialMode = 'login', onClose, onSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const isLogin = mode === 'login';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl animate-fade-in">
      {/* Click backdrop to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md p-6 sm:p-8 rounded-3xl border border-border/80 bg-card/95 text-card-foreground shadow-2xl relative overflow-hidden z-10"
      >
        {/* Close Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close authentication modal"
          >
            <X className="w-4 h-4" />
          </button>
        )}

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

        {/* Tab Toggle */}
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

        {/* Forms with AnimatePresence */}
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

export default AuthModal;

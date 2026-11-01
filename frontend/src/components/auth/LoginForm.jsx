import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/useAuthStore';

const REMEMBER_ME_KEY = 'talkspace-remember-username';

export function LoginForm({ onSwitchToRegister }) {
  const { login, isLoading, authError, setAuthError } = useAuthStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Load remembered username if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(REMEMBER_ME_KEY);
      if (saved) {
        setUsername(saved);
        setRememberMe(true);
      }
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');
    setAuthError(null);

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setValidationError('Please enter your username.');
      return;
    }
    if (cleanUsername.length < 3) {
      setValidationError('Username must be at least 3 characters.');
      return;
    }
    if (!password) {
      setValidationError('Please enter your password.');
      return;
    }

    // Save or clear remembered username
    if (typeof window !== 'undefined') {
      if (rememberMe) {
        localStorage.setItem(REMEMBER_ME_KEY, cleanUsername);
      } else {
        localStorage.removeItem(REMEMBER_ME_KEY);
      }
    }

    login(cleanUsername, password);
  };

  const errorMessage = validationError || authError;

  return (
    <motion.form
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.25 }}
      onSubmit={handleSubmit}
      className="space-y-4 select-none"
    >
      {/* Username Field */}
      <div className="space-y-1.5 text-left">
        <label className="text-xs font-semibold text-foreground">Username</label>
        <Input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (validationError) setValidationError('');
          }}
          icon={<User className="w-4 h-4 text-muted-foreground" />}
          autoComplete="username"
          autoFocus
          required
        />
      </div>

      {/* Password Field with Show/Hide toggle */}
      <div className="space-y-1.5 text-left">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-foreground">Password</label>
        </div>

        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (validationError) setValidationError('');
            }}
            icon={<Lock className="w-4 h-4 text-muted-foreground" />}
            autoComplete="current-password"
            className="pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Remember Me Option */}
      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-ring focus:ring-offset-0 cursor-pointer accent-indigo-600"
          />
          <span>Remember username</span>
        </label>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </motion.div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        className="w-full h-11 text-xs sm:text-sm font-semibold shadow-glow mt-2"
        isLoading={isLoading}
      >
        Sign In
        {!isLoading && <ArrowRight className="w-4 h-4 ml-1.5" />}
      </Button>

      {/* Switch to Registration */}
      <div className="pt-3 text-center text-xs text-muted-foreground">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-semibold text-primary hover:underline focus:outline-none"
        >
          Create account
        </button>
      </div>
    </motion.form>
  );
}

export default LoginForm;


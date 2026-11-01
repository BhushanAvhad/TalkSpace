import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/useAuthStore';

export function RegisterForm({ onSwitchToLogin }) {
  const { register, isLoading, authError, setAuthError } = useAuthStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Password requirement checks
  const isLengthValid = password.length >= 4;
  const isUsernameValid = username.trim().length >= 3;
  const doPasswordsMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');
    setAuthError(null);

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setValidationError('Please choose a username.');
      return;
    }
    if (cleanUsername.length < 3) {
      setValidationError('Username must be at least 3 characters long.');
      return;
    }
    if (password.length < 4) {
      setValidationError('Password must be at least 4 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match. Please verify.');
      return;
    }
    if (!agreeTerms) {
      setValidationError('Please agree to the Terms of Service to continue.');
      return;
    }

    register(cleanUsername, password);
  };

  const errorMessage = validationError || authError;

  return (
    <motion.form
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.25 }}
      onSubmit={handleSubmit}
      className="space-y-4 select-none"
    >
      {/* Username Field */}
      <div className="space-y-1.5 text-left">
        <label className="text-xs font-semibold text-foreground">Choose Username</label>
        <Input
          type="text"
          placeholder="e.g. alex_rivers"
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
        <div className="text-[11px] text-muted-foreground">
          Must be at least 3 characters. Unique to your profile.
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-1.5 text-left">
        <label className="text-xs font-semibold text-foreground">Password</label>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (validationError) setValidationError('');
            }}
            icon={<Lock className="w-4 h-4 text-muted-foreground" />}
            autoComplete="new-password"
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

      {/* Confirm Password Field */}
      <div className="space-y-1.5 text-left">
        <label className="text-xs font-semibold text-foreground">Confirm Password</label>
        <div className="relative">
          <Input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (validationError) setValidationError('');
            }}
            icon={<Lock className="w-4 h-4 text-muted-foreground" />}
            autoComplete="new-password"
            className="pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Password Guidance Checklist */}
      <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1.5">
        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
          Requirements
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2
            className={`w-3.5 h-3.5 ${
              isLengthValid ? 'text-emerald-500' : 'text-muted-foreground/50'
            }`}
          />
          <span className={isLengthValid ? 'text-foreground' : 'text-muted-foreground'}>
            At least 4 characters long
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2
            className={`w-3.5 h-3.5 ${
              doPasswordsMatch ? 'text-emerald-500' : 'text-muted-foreground/50'
            }`}
          />
          <span className={doPasswordsMatch ? 'text-foreground' : 'text-muted-foreground'}>
            Passwords match
          </span>
        </div>
      </div>

      {/* Terms Acceptance Checkbox */}
      <div className="pt-1 text-left">
        <label className="flex items-start gap-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => {
              setAgreeTerms(e.target.checked);
              if (validationError) setValidationError('');
            }}
            className="w-4 h-4 mt-0.5 rounded border-border text-primary focus:ring-ring focus:ring-offset-0 cursor-pointer accent-indigo-600"
            required
          />
          <span className="leading-tight">
            I agree to the TalkSpace Terms of Service and community communication guidelines.
          </span>
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
        Create Account
        {!isLoading && <ArrowRight className="w-4 h-4 ml-1.5" />}
      </Button>

      {/* Switch to Login */}
      <div className="pt-3 text-center text-xs text-muted-foreground">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-semibold text-primary hover:underline focus:outline-none"
        >
          Sign in
        </button>
      </div>
    </motion.form>
  );
}

export default RegisterForm;


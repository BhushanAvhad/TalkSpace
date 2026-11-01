import React, { useState } from 'react';
import {
  Settings,
  User,
  Volume2,
  VolumeX,
  ShieldCheck,
  LogOut,
  Moon,
  Sun,
  Laptop,
  Check,
  AlertTriangle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuthStore } from '@/stores/useAuthStore';
import { useChatStore } from '@/stores/useChatStore';

export function SettingsModal({ open, onOpenChange }) {
  const { user, logout } = useAuthStore();
  const { soundEnabled, toggleSound, connectionStatus } = useChatStore();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleLogout = () => {
    onOpenChange(false);
    logout();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 bg-card border-border text-foreground shadow-2xl rounded-3xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Preferences & Account</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Manage your TalkSpace settings and session details
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* User Profile Card */}
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar name={user?.username || 'You'} size="md" status="online" />
              <div className="min-w-0">
                <div className="font-bold text-sm text-foreground truncate">
                  @{user?.username}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  <span>Online &bull; WebSocket {connectionStatus}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sound Notifications Toggle */}
          <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-background border border-border text-foreground">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-primary" />
                ) : (
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div>
                <div className="text-xs font-semibold text-foreground">Audio Notifications</div>
                <div className="text-[11px] text-muted-foreground">
                  Play notification chime on incoming messages
                </div>
              </div>
            </div>

            <Button
              size="xs"
              variant={soundEnabled ? 'primary' : 'outline'}
              onClick={toggleSound}
              className="h-7 text-xs px-3"
            >
              {soundEnabled ? 'Enabled' : 'Muted'}
            </Button>
          </div>

          {/* Theme Preference */}
          <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-background border border-border text-foreground">
                <Moon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-xs font-semibold text-foreground">Interface Theme</div>
                <div className="text-[11px] text-muted-foreground">
                  Toggle between deep graphite and slate themes
                </div>
              </div>
            </div>

            <ThemeToggle />
          </div>

          {/* Security & Cryptography info */}
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div className="text-[11px] text-muted-foreground leading-relaxed">
              <strong className="text-foreground">PBKDF2 SHA-512 Security</strong>: Your session
              is authenticated against Supabase with salt hashing. Real-time message exchange runs on
              dedicated WebSockets.
            </div>
          </div>

          {/* Logout Section */}
          <div className="pt-2 border-t border-border/60">
            {confirmLogout ? (
              <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Are you sure you want to sign out?</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="xs"
                    variant="destructive"
                    onClick={handleLogout}
                    className="flex-1 h-7 text-xs font-semibold"
                  >
                    Yes, Sign Out
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => setConfirmLogout(false)}
                    className="flex-1 h-7 text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                onClick={() => setConfirmLogout(true)}
                className="w-full justify-center text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive h-9 gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out of TalkSpace
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SettingsModal;


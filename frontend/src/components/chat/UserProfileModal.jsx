import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Settings,
  Camera,
  Check,
  LogOut,
  Volume2,
  VolumeX,
  Shield,
  MessageSquare,
  BellOff,
  Bell,
  Sparkles,
  Loader2,
  Smile,
  X,
  Trash2,
  Upload,
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
import { Input } from '@/components/ui/Input';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuthStore } from '@/stores/useAuthStore';
import { useChatStore } from '@/stores/useChatStore';
import { getApiUrl } from '@/lib/api';
import socket from '@/socket/socket';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const STATUS_PRESETS = [
  '🚀 Building something cool',
  '💬 Open to chat',
  '🎯 Deep work / Focus',
  '☕ Taking a quick break',
  '🌴 Out of office',
];

const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Milo',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Gizmo',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Sparky',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Buster',
];

export function UserProfileModal({ open, onOpenChange, targetUsername }) {
  const { user: currentUser, updateProfile, logout } = useAuthStore();
  const {
    soundEnabled,
    toggleSound,
    connectionStatus,
    mutedChats,
    toggleMuteChat,
    setCurrentChat,
    userProfiles,
    setUserProfileCache,
  } = useChatStore();

  const isMe = !targetUsername || targetUsername === currentUser?.username;
  const username = isMe ? currentUser?.username : targetUsername;

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'settings'
  const [avatarUrl, setAvatarUrl] = useState('');
  const [statusText, setStatusText] = useState('');
  const [bio, setBio] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const fileInputRef = useRef(null);

  // Initialize profile when modal opens
  useEffect(() => {
    if (!open) return;

    if (isMe) {
      setAvatarUrl(currentUser?.avatarUrl || '');
      setStatusText(currentUser?.statusText || '');
      setBio(currentUser?.bio || '');
    } else {
      const cached = userProfiles[username];
      if (cached) {
        setAvatarUrl(cached.avatarUrl || '');
        setStatusText(cached.statusText || '');
        setBio(cached.bio || '');
      } else {
        socket.emit('getUserProfile', { username });
      }
    }
  }, [open, isMe, username]);

  // If viewing peer and their profile arrives from server, update view
  useEffect(() => {
    if (!open || isMe || !username) return;
    const cached = userProfiles[username];
    if (cached) {
      setAvatarUrl(cached.avatarUrl || '');
      setStatusText(cached.statusText || '');
      setBio(cached.bio || '');
    }
  }, [open, isMe, username, userProfiles[username]?.avatarUrl, userProfiles[username]?.statusText, userProfiles[username]?.bio]);

  // Handle avatar image file upload
  const handleAvatarFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, WEBP, GIF)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Avatar file must be under 10 MB');
      return;
    }

    const formData = new FormData();
    formData.append('profilePic', file);
    formData.append('file', file);
    formData.append('username', currentUser?.username || '');

    setIsUploading(true);
    try {
      const res = await fetch(getApiUrl('/uploadProfilePic'), {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload failed with status ${res.status}`);
      }

      const data = await res.json();
      const newUrl = data.avatarUrl || data.fileURL;

      if (newUrl) {
        setAvatarUrl(newUrl);

        // Instantly save to profile and notify peers
        socket.emit('updateProfile', {
          avatarUrl: newUrl,
          statusText: statusText.trim(),
          bio: bio.trim(),
        });

        updateProfile({
          avatarUrl: newUrl,
          statusText: statusText.trim(),
          bio: bio.trim(),
        });

        toast.success('Profile image updated successfully!');
      } else {
        toast.error(data.error || 'Failed to process avatar');
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
      toast.error('Avatar upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle choosing a preset avatar
  const handleSelectPresetAvatar = (presetUrl) => {
    setAvatarUrl(presetUrl);

    socket.emit('updateProfile', {
      avatarUrl: presetUrl,
      statusText: statusText.trim(),
      bio: bio.trim(),
    });

    updateProfile({
      avatarUrl: presetUrl,
      statusText: statusText.trim(),
      bio: bio.trim(),
    });

    toast.success('Avatar updated to preset!');
  };

  // Remove avatar (reset to initials)
  const handleRemoveAvatar = () => {
    setAvatarUrl('');

    socket.emit('updateProfile', {
      avatarUrl: '',
      statusText: statusText.trim(),
      bio: bio.trim(),
    });

    updateProfile({
      avatarUrl: '',
      statusText: statusText.trim(),
      bio: bio.trim(),
    });

    toast.info('Avatar removed. Initials will be displayed.');
  };

  // Save profile changes (Status and Bio)
  const handleSaveProfile = () => {
    setIsSaving(true);
    socket.emit('updateProfile', {
      avatarUrl,
      statusText: statusText.trim(),
      bio: bio.trim(),
    });

    updateProfile({
      avatarUrl,
      statusText: statusText.trim(),
      bio: bio.trim(),
    });

    setTimeout(() => {
      setIsSaving(false);
      toast.success('Profile saved successfully!');
      onOpenChange(false);
    }, 300);
  };

  const handleStartDM = () => {
    if (username) {
      setCurrentChat(username);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 bg-card border-border text-foreground shadow-2xl rounded-3xl animate-scale-in">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <User className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">
                  {isMe ? 'My Profile & Preferences' : `@${username}'s Profile`}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {isMe ? 'Personalize your avatar, status, and app settings' : 'View user details'}
                </DialogDescription>
              </div>
            </div>

            {isMe && (
              <div className="flex items-center gap-1 p-0.5 rounded-xl bg-muted/60 border border-border/80">
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className={cn(
                    'px-2.5 py-1 text-xs font-semibold rounded-lg transition-all',
                    activeTab === 'profile'
                      ? 'bg-background text-foreground shadow-subtle'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Profile
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className={cn(
                    'px-2.5 py-1 text-xs font-semibold rounded-lg transition-all',
                    activeTab === 'settings'
                      ? 'bg-background text-foreground shadow-subtle'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Settings
                </button>
              </div>
            )}
          </div>
        </DialogHeader>

        {activeTab === 'profile' ? (
          <div className="space-y-4 pt-3">
            {/* Avatar Section */}
            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 space-y-3">
              <div className="flex items-center gap-4">
                {/* Avatar Display */}
                <div
                  className={cn(
                    'relative group flex-shrink-0',
                    isMe && 'cursor-pointer'
                  )}
                  onClick={() => isMe && fileInputRef.current?.click()}
                  title={isMe ? 'Click to upload a new photo' : `@${username}`}
                >
                  <Avatar
                    src={avatarUrl}
                    name={username}
                    size="xl"
                    status="online"
                    className="ring-2 ring-primary/30 shadow-glow"
                  />
                  {isMe && (
                    <div className="absolute inset-0 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {isUploading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Camera className="w-5 h-5" />
                      )}
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarFileSelect}
                  />
                </div>

                {/* Name & Avatar Action Buttons */}
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div>
                    <div className="font-bold text-base text-foreground truncate">
                      @{username}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      <span>Online &bull; Realtime</span>
                    </div>
                  </div>

                  {/* Explicit Upload and Remove buttons */}
                  {isMe && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <Button
                        size="xs"
                        variant="primary"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="h-7 text-[11px] gap-1 px-2.5"
                      >
                        {isUploading ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Upload className="w-3 h-3" />
                        )}
                        <span>{isUploading ? 'Uploading...' : 'Upload Photo'}</span>
                      </Button>

                      {avatarUrl && (
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={handleRemoveAvatar}
                          className="h-7 text-[11px] gap-1 px-2 text-muted-foreground hover:text-destructive"
                          title="Remove custom avatar and show initials"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Avatar Presets (Quick selection) */}
              {isMe && (
                <div className="pt-2 border-t border-border/40 space-y-1.5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    <span>Or choose an avatar style:</span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {AVATAR_PRESETS.map((preset, index) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleSelectPresetAvatar(preset)}
                        className={cn(
                          'w-9 h-9 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 flex-shrink-0 bg-muted/60',
                          avatarUrl === preset
                            ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                            : 'border-border/60 hover:border-indigo-400'
                        )}
                        title={`Select Avatar Style ${index + 1}`}
                      >
                        <img
                          src={preset}
                          alt={`Preset ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Status Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Status Message</span>
                {isMe && <span className="text-[10px] text-muted-foreground">Broadcast to teammates</span>}
              </label>

              {isMe ? (
                <>
                  <Input
                    placeholder="Set a status message..."
                    value={statusText}
                    onChange={(e) => setStatusText(e.target.value)}
                    className="h-9 text-xs bg-muted/40 rounded-xl"
                  />
                  {/* Status Presets */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {STATUS_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setStatusText(preset)}
                        className={cn(
                          'text-[10px] px-2 py-0.5 rounded-lg border transition-colors',
                          statusText === preset
                            ? 'bg-primary/10 border-primary text-primary font-medium'
                            : 'bg-muted/40 border-border/80 text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="p-2.5 rounded-xl bg-muted/30 border border-border/60 text-xs text-foreground">
                  {statusText || <span className="text-muted-foreground italic">No status message set</span>}
                </div>
              )}
            </div>

            {/* Bio Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                About / Bio
              </label>
              {isMe ? (
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short bio or description about yourself..."
                  rows={3}
                  maxLength={240}
                  className="w-full text-xs p-3 rounded-xl bg-muted/40 border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              ) : (
                <div className="p-3 rounded-xl bg-muted/30 border border-border/60 text-xs text-foreground min-h-[60px] whitespace-pre-wrap">
                  {bio || <span className="text-muted-foreground italic">No bio provided yet</span>}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center justify-end gap-2">
              {isMe ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Close
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="gap-1.5 shadow-glow"
                  >
                    {isSaving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Save Changes</span>
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleStartDM}
                  className="gap-1.5 w-full shadow-glow"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Direct Message</span>
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* Settings Tab */
          <div className="space-y-4 pt-3">
            {/* Audio Notifications */}
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
                  <div className="text-xs font-semibold text-foreground">Sound Chimes</div>
                  <div className="text-[11px] text-muted-foreground">
                    Play sound on incoming messages
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
              <div>
                <div className="text-xs font-semibold text-foreground">Appearance</div>
                <div className="text-[11px] text-muted-foreground">
                  Switch between Dark and Light mode
                </div>
              </div>
              <ThemeToggle />
            </div>

            {/* Muted Chats List */}
            {mutedChats.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 space-y-2">
                <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <BellOff className="w-3.5 h-3.5 text-amber-500" />
                  <span>Muted Conversations ({mutedChats.length})</span>
                </div>
                <div className="space-y-1">
                  {mutedChats.map((chatId) => (
                    <div
                      key={chatId}
                      className="flex items-center justify-between py-1 px-2 rounded-lg bg-background/50 border border-border/40 text-xs"
                    >
                      <span className="font-medium text-foreground">
                        {chatId === 'group' ? '#general' : `@${chatId}`}
                      </span>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => toggleMuteChat(chatId)}
                        className="h-6 text-[11px] text-muted-foreground hover:text-foreground"
                      >
                        Unmute
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sign Out Card */}
            <div className="p-3.5 rounded-2xl bg-destructive/5 border border-destructive/20 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-destructive">Account Session</div>
                  <div className="text-[11px] text-muted-foreground">
                    Sign out of TalkSpace on this device
                  </div>
                </div>

                {!confirmLogout ? (
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => setConfirmLogout(true)}
                    className="border-destructive/30 text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-1" />
                    Sign Out
                  </Button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => setConfirmLogout(false)}
                      className="text-xs h-7"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="xs"
                      variant="danger"
                      onClick={() => {
                        onOpenChange(false);
                        logout();
                      }}
                      className="text-xs h-7"
                    >
                      Confirm
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default UserProfileModal;

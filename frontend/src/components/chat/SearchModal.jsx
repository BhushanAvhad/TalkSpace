import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MessageSquare,
  User,
  Hash,
  Clock,
  ArrowRight,
  Loader2,
  X,
  FileText,
  Filter,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useChatStore } from '@/stores/useChatStore';
import { useAuthStore } from '@/stores/useAuthStore';
import socket from '@/socket/socket';
import { cn } from '@/lib/utils';

export function SearchModal({ open, onOpenChange }) {
  const { user: currentUser } = useAuthStore();
  const { setCurrentChat, activeUsers } = useChatStore();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'messages' | 'users'
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState({ users: [], messages: [] });
  const inputRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ users: [], messages: [] });
    }
  }, [open]);

  // Listen to search results from socket
  useEffect(() => {
    const handleResults = (data) => {
      setResults(data.results || { users: [], messages: [] });
      setIsLoading(false);
    };

    socket.on('searchResults', handleResults);
    return () => {
      socket.off('searchResults', handleResults);
    };
  }, []);

  // Debounced search trigger
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults({ users: [], messages: [] });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      socket.emit('searchTalkSpace', { query: trimmed, filter });
    }, 200);

    return () => clearTimeout(timer);
  }, [query, filter]);

  const highlightText = (text, term) => {
    if (!term || !text) return text;
    const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === term.toLowerCase() ? (
        <mark key={i} className="bg-indigo-500/30 text-indigo-300 rounded px-0.5 font-medium">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const handleSelectUser = (username) => {
    if (!username) return;
    setCurrentChat(username);
    onOpenChange(false);
  };

  const handleSelectMessage = (msg) => {
    const isGroup = msg.type === 'group';
    const targetChat = isGroup
      ? 'group'
      : msg.sender === currentUser?.username
      ? msg.target
      : msg.sender;

    setCurrentChat(targetChat);
    onOpenChange(false);

    // Scroll and highlight message in view
    setTimeout(() => {
      const el = document.getElementById(`msg-${msg.messageId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-indigo-500', 'bg-indigo-500/10');
        setTimeout(() => el.classList.remove('ring-2', 'ring-indigo-500', 'bg-indigo-500/10'), 2500);
      }
    }, 300);
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const hasUsers = results.users && results.users.length > 0;
  const hasMessages = results.messages && results.messages.length > 0;
  const hasAnyResults = hasUsers || hasMessages;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-card border-border text-foreground shadow-2xl rounded-3xl animate-scale-in">
        {/* Search Header Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-muted/20">
          <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages, users, files (e.g. hello, Alice, project)..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted border border-border/80 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border/40 bg-muted/10 text-xs">
          <span className="text-muted-foreground text-[11px] font-medium flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {['all', 'messages', 'users'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                'px-2.5 py-0.5 rounded-lg text-xs capitalize transition-colors',
                filter === f
                  ? 'bg-primary text-primary-foreground font-semibold shadow-subtle'
                  : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!query.trim() ? (
            <div className="py-12 text-center space-y-2 text-muted-foreground">
              <Search className="w-8 h-8 mx-auto text-muted-foreground/40" />
              <div className="text-sm font-medium text-foreground">Search TalkSpace</div>
              <div className="text-xs">
                Type keywords to find public messages, your direct messages, or team members.
              </div>
            </div>
          ) : !hasAnyResults && !isLoading ? (
            <div className="py-12 text-center space-y-2 text-muted-foreground">
              <div className="text-sm font-semibold text-foreground">No results found for "{query}"</div>
              <div className="text-xs">
                Check your spelling or try searching for another keyword.
              </div>
            </div>
          ) : (
            <>
              {/* Matched Users */}
              {(filter === 'all' || filter === 'users') && hasUsers && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1">
                    Users ({results.users.length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {results.users.map((u) => {
                      const isOnline = activeUsers.includes(u.username);
                      return (
                        <div
                          key={u.username}
                          onClick={() => handleSelectUser(u.username)}
                          className="flex items-center gap-3 p-2.5 rounded-2xl bg-muted/30 hover:bg-muted/70 border border-border/60 hover:border-border transition-all cursor-pointer group"
                        >
                          <Avatar
                            src={u.avatar_url}
                            name={u.username}
                            size="sm"
                            status={isOnline ? 'online' : 'offline'}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                              @{highlightText(u.username, query)}
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate">
                              {u.status_text || (isOnline ? 'Active now' : 'Offline')}
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Matched Messages */}
              {(filter === 'all' || filter === 'messages') && hasMessages && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1">
                    Messages ({results.messages.length})
                  </div>
                  <div className="space-y-2">
                    {results.messages.map((m) => {
                      const isGroup = m.type === 'group';
                      const displayText = m.message || (m.fileName ? `Attachment: ${m.fileName}` : '');

                      return (
                        <div
                          key={m.messageId}
                          onClick={() => handleSelectMessage(m)}
                          className="p-3 rounded-2xl bg-muted/30 hover:bg-muted/70 border border-border/60 hover:border-primary/40 transition-all cursor-pointer space-y-1.5 group"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              {isGroup ? (
                                <Badge variant="glow" className="text-[10px] py-0 px-1.5">
                                  <Hash className="w-2.5 h-2.5 mr-0.5 inline" /> general
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                                  <User className="w-2.5 h-2.5 mr-0.5 inline" /> DM with @{m.sender === currentUser?.username ? m.target : m.sender}
                                </Badge>
                              )}
                              <span className="font-semibold text-foreground text-xs">
                                @{m.sender}
                              </span>
                            </div>

                            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatTime(m.created_at)}</span>
                            </div>
                          </div>

                          <p className="text-xs text-foreground/90 line-clamp-2 leading-relaxed">
                            {highlightText(displayText, query)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SearchModal;


import React, { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';
import socket from '@/socket/socket';
import { useAuthStore } from '@/stores/useAuthStore';
import { useChatStore } from '@/stores/useChatStore';
import { LandingPage } from '@/pages/LandingPage';
import { AuthPage } from '@/components/auth/AuthPage';
import { Sidebar } from '@/components/chat/Sidebar';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { SharedMediaPanel } from '@/components/chat/SharedMediaPanel';
import { SearchModal } from '@/components/chat/SearchModal';

export function App() {
  const { user, isAuthenticated, setUser, setAuthError, updateProfile } = useAuthStore();
  const {
    setActiveUsers,
    setGroupMessages,
    setPrivateMessages,
    addMessage,
    addChatRequest,
    setTypingUser,
    setCurrentChat,
    setConnectionStatus,
    sharedMediaOpen,
    setSharedMediaOpen,
    searchModalOpen,
    setSearchModalOpen,
    onMessageEdited,
    onMessageDeleted,
    onReactionUpdated,
    onConversationRead,
    setUserProfileCache,
  } = useChatStore();

  // 'landing' | 'auth' | 'chat'
  const [currentView, setCurrentView] = useState('landing');
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [conversationSearchQuery, setConversationSearchQuery] = useState('');

  // Global Ctrl+K / Cmd+K listener for Search Modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchModalOpen]);

  // Global Socket.IO event listeners
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => setConnectionStatus('connected');
    const handleDisconnect = () => setConnectionStatus('disconnected');
    const handleConnectError = () => setConnectionStatus('disconnected');

    const handleAuthResult = (result) => {
      if (result.success) {
        setUser({
          username: result.username,
          avatarUrl: result.avatarUrl,
          statusText: result.statusText,
          bio: result.bio,
        });
        toast.success(`Welcome to TalkSpace, @${result.username}!`);
        setCurrentView('chat');
      } else {
        setAuthError(result.message || 'Authentication failed');
        toast.error(result.message || 'Authentication failed');
      }
    };

    const handleMessage = (msg) => {
      addMessage(msg, user?.username);
    };

    const handleUpdateUsers = (users) => {
      setActiveUsers(users);
    };

    const handleLoadGroupHistory = (history) => {
      setGroupMessages(history);
    };

    const handleLoadPrivateHistory = ({ partner, history }) => {
      setPrivateMessages(partner, history);
    };

    const handleChatRequest = ({ from }) => {
      addChatRequest(from);
      toast.info(`@${from} sent you a private chat request!`);
    };

    const handleChatResponse = ({ from, accepted }) => {
      if (accepted) {
        toast.success(`@${from} accepted your chat request!`);
        setCurrentChat(from);
      } else {
        toast.warning(`@${from} declined the chat request.`);
      }
    };

    const handleDisplayTyping = ({ user: typingUsername, isTyping }) => {
      setTypingUser(isTyping ? typingUsername : null);
    };

    const handleStopTyping = () => {
      setTypingUser(null);
    };

    const handleGroupHistoryPurged = () => {
      if (socket.connected) {
        socket.emit('requestGroupHistory');
      }
    };

    // Phase 6 Socket Event Reducers
    const handleMessageEdited = (data) => {
      onMessageEdited(data);
    };

    const handleMessageDeleted = (data) => {
      onMessageDeleted(data);
    };

    const handleReactionUpdated = (data) => {
      onReactionUpdated(data);
    };

    const handleConversationRead = (data) => {
      onConversationRead(data);
    };

    const handleUserProfileChanged = (profile) => {
      setUserProfileCache(profile.username, profile);
      if (profile.username === user?.username) {
        updateProfile(profile);
      }
    };

    const handleUserProfileResult = (profile) => {
      if (profile?.username) {
        setUserProfileCache(profile.username, profile);
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('authResult', handleAuthResult);
    socket.on('message', handleMessage);
    socket.on('updateUsers', handleUpdateUsers);
    socket.on('loadGroupHistory', handleLoadGroupHistory);
    socket.on('loadPrivateHistory', handleLoadPrivateHistory);
    socket.on('chatRequest', handleChatRequest);
    socket.on('chatResponse', handleChatResponse);
    socket.on('displayTyping', handleDisplayTyping);
    socket.on('stopTyping', handleStopTyping);
    socket.on('groupHistoryPurged', handleGroupHistoryPurged);
    socket.on('messageEdited', handleMessageEdited);
    socket.on('messageDeleted', handleMessageDeleted);
    socket.on('reactionUpdated', handleReactionUpdated);
    socket.on('conversationRead', handleConversationRead);
    socket.on('userProfileChanged', handleUserProfileChanged);
    socket.on('userProfileResult', handleUserProfileResult);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('authResult', handleAuthResult);
      socket.off('message', handleMessage);
      socket.off('updateUsers', handleUpdateUsers);
      socket.off('loadGroupHistory', handleLoadGroupHistory);
      socket.off('loadPrivateHistory', handleLoadPrivateHistory);
      socket.off('chatRequest', handleChatRequest);
      socket.off('chatResponse', handleChatResponse);
      socket.off('displayTyping', handleDisplayTyping);
      socket.off('stopTyping', handleStopTyping);
      socket.off('groupHistoryPurged', handleGroupHistoryPurged);
      socket.off('messageEdited', handleMessageEdited);
      socket.off('messageDeleted', handleMessageDeleted);
      socket.off('reactionUpdated', handleReactionUpdated);
      socket.off('conversationRead', handleConversationRead);
      socket.off('userProfileChanged', handleUserProfileChanged);
      socket.off('userProfileResult', handleUserProfileResult);
    };
  }, [user?.username, onMessageEdited, onMessageDeleted, onReactionUpdated, onConversationRead, setUserProfileCache, updateProfile]);

  // Request group history when user enters the chat view
  useEffect(() => {
    if (isAuthenticated && socket.connected && currentView === 'chat') {
      socket.emit('requestGroupHistory');
    }
  }, [isAuthenticated, currentView]);

  // Guard chat view against unauthenticated access
  useEffect(() => {
    if (!isAuthenticated && currentView === 'chat') {
      setCurrentView('landing');
    }
  }, [isAuthenticated, currentView]);

  return (
    <>
      <Toaster position="top-right" richColors />

      {currentView === 'landing' ? (
        <LandingPage
          onEnterChat={() => {
            if (isAuthenticated) {
              setCurrentView('chat');
            } else {
              setAuthMode('login');
              setCurrentView('auth');
            }
          }}
          onOpenAuth={(mode) => {
            setAuthMode(mode);
            setCurrentView('auth');
          }}
        />
      ) : currentView === 'auth' ? (
        <AuthPage
          initialMode={authMode}
          onBackToHome={() => setCurrentView('landing')}
          onSuccess={() => setCurrentView('chat')}
        />
      ) : isAuthenticated ? (
        <div className="h-screen w-screen flex overflow-hidden bg-background text-foreground font-sans antialiased">
          {/* Desktop Persistent Sidebar */}
          <div className="hidden md:block h-full">
            <Sidebar
              onBackToHome={() => setCurrentView('landing')}
              onOpenSearchModal={() => setSearchModalOpen(true)}
            />
          </div>

          {/* Mobile Slide-Over Drawer */}
          {mobileSidebarOpen && (
            <div className="fixed inset-0 z-50 md:hidden flex">
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setMobileSidebarOpen(false)}
              />
              <div className="relative z-10 w-80 h-full bg-sidebar shadow-2xl">
                <Sidebar
                  onCloseMobile={() => setMobileSidebarOpen(false)}
                  onBackToHome={() => {
                    setMobileSidebarOpen(false);
                    setCurrentView('landing');
                  }}
                  onOpenSearchModal={() => {
                    setMobileSidebarOpen(false);
                    setSearchModalOpen(true);
                  }}
                />
              </div>
            </div>
          )}

          {/* Main Realtime Chat Viewport */}
          <main className="flex-1 flex flex-col h-full overflow-hidden bg-background">
            <ChatHeader
              onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
              onOpenSearchModal={() => setSearchModalOpen(true)}
              onSearchConversation={setConversationSearchQuery}
              conversationSearchQuery={conversationSearchQuery}
            />
            <MessageList searchQuery={conversationSearchQuery} />
            <MessageInput />
          </main>

          {/* Shared Media Gallery Drawer Panel */}
          <SharedMediaPanel
            open={sharedMediaOpen}
            onClose={() => setSharedMediaOpen(false)}
          />

          {/* Global Search Palette Modal (Ctrl+K) */}
          <SearchModal
            open={searchModalOpen}
            onOpenChange={setSearchModalOpen}
          />
        </div>
      ) : null}
    </>
  );
}

export default App;

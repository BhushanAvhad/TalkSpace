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

export function App() {
  const { user, isAuthenticated, setUser, setAuthError } = useAuthStore();
  const {
    setActiveUsers,
    setGroupMessages,
    setPrivateMessages,
    addMessage,
    addChatRequest,
    setTypingUser,
    setCurrentChat,
  } = useChatStore();

  // 'landing' | 'auth' | 'chat'
  const [currentView, setCurrentView] = useState('landing');
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Global Socket.IO event listeners
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleAuthResult = (result) => {
      if (result.success) {
        setUser({ username: result.username });
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

    socket.on('authResult', handleAuthResult);
    socket.on('message', handleMessage);
    socket.on('updateUsers', handleUpdateUsers);
    socket.on('loadGroupHistory', handleLoadGroupHistory);
    socket.on('loadPrivateHistory', handleLoadPrivateHistory);
    socket.on('chatRequest', handleChatRequest);
    socket.on('chatResponse', handleChatResponse);
    socket.on('displayTyping', handleDisplayTyping);
    socket.on('stopTyping', handleStopTyping);

    return () => {
      socket.off('authResult', handleAuthResult);
      socket.off('message', handleMessage);
      socket.off('updateUsers', handleUpdateUsers);
      socket.off('loadGroupHistory', handleLoadGroupHistory);
      socket.off('loadPrivateHistory', handleLoadPrivateHistory);
      socket.off('chatRequest', handleChatRequest);
      socket.off('chatResponse', handleChatResponse);
      socket.off('displayTyping', handleDisplayTyping);
      socket.off('stopTyping', handleStopTyping);
    };
  }, [user?.username]);

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
            <Sidebar onBackToHome={() => setCurrentView('landing')} />
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
                />
              </div>
            </div>
          )}

          {/* Main Realtime Chat Viewport */}
          <main className="flex-1 flex flex-col h-full overflow-hidden bg-background">
            <ChatHeader onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
            <MessageList />
            <MessageInput />
          </main>
        </div>
      ) : null}
    </>
  );
}

export default App;

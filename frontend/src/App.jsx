import React, { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';
import socket from '@/socket/socket';
import { useAuthStore } from '@/stores/useAuthStore';
import { useChatStore } from '@/stores/useChatStore';
import { AuthModal } from '@/components/auth/AuthModal';
import { Sidebar } from '@/components/chat/Sidebar';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';

export function App() {
  const { user, isAuthenticated, setUser, setAuthError } = useAuthStore();
  const {
    currentChat,
    setActiveUsers,
    setGroupMessages,
    setPrivateMessages,
    addMessage,
    addChatRequest,
    setTypingUser,
    setCurrentChat,
  } = useChatStore();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Setup Socket listeners
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    // Socket Event: Auth Result
    const handleAuthResult = (result) => {
      if (result.success) {
        setUser({ username: result.username });
        toast.success(`Welcome to TalkSpace, @${result.username}!`);
      } else {
        setAuthError(result.message || 'Authentication failed');
        toast.error(result.message || 'Authentication failed');
      }
    };

    // Socket Event: Inbound Message
    const handleMessage = (msg) => {
      addMessage(msg, user?.username);
    };

    // Socket Event: Online Users Update
    const handleUpdateUsers = (users) => {
      setActiveUsers(users);
    };

    // Socket Event: Load Group History
    const handleLoadGroupHistory = (history) => {
      setGroupMessages(history);
    };

    // Socket Event: Load Private History
    const handleLoadPrivateHistory = ({ partner, history }) => {
      setPrivateMessages(partner, history);
    };

    // Socket Event: Inbound Chat Request
    const handleChatRequest = ({ from }) => {
      addChatRequest(from);
      toast.info(`@${from} sent you a private chat request!`);
    };

    // Socket Event: Chat Response
    const handleChatResponse = ({ from, accepted }) => {
      if (accepted) {
        toast.success(`@${from} accepted your chat request!`);
        setCurrentChat(from);
      } else {
        toast.warning(`@${from} declined the chat request.`);
      }
    };

    // Socket Event: Typing Indicator
    const handleDisplayTyping = ({ user: typingUsername, isTyping }) => {
      setTypingUser(isTyping ? typingUsername : null);
    };

    const handleStopTyping = () => {
      setTypingUser(null);
    };

    // Register listeners
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

  // Request group history upon authentication
  useEffect(() => {
    if (isAuthenticated && socket.connected) {
      socket.emit('requestGroupHistory');
    }
  }, [isAuthenticated]);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background text-foreground font-sans antialiased">
      <Toaster position="top-right" richColors />

      {/* Show Auth Modal if user is not authenticated */}
      {!isAuthenticated && <AuthModal />}

      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block h-full">
        <Sidebar />
      </div>

      {/* Mobile Slide-Over Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-80 h-full bg-sidebar shadow-2xl">
            <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
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
  );
}

export default App;

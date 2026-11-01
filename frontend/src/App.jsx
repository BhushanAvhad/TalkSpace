import React, { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';
import socket from '@/socket/socket';
import { useAuthStore } from '@/stores/useAuthStore';
import { useChatStore } from '@/stores/useChatStore';
import { LandingPage } from '@/pages/LandingPage';
import { ChatAppPage } from '@/pages/ChatAppPage';

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

  // Control whether viewing the Landing Page or Live Chat App
  // Default to landing page first
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'app'

  // Global Socket.IO event listeners
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleAuthResult = (result) => {
      if (result.success) {
        setUser({ username: result.username });
        toast.success(`Welcome to TalkSpace, @${result.username}!`);
        setCurrentView('app'); // Navigate into the live chat app on successful login
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

  // Request group history when entering the app
  useEffect(() => {
    if (isAuthenticated && socket.connected && currentView === 'app') {
      socket.emit('requestGroupHistory');
    }
  }, [isAuthenticated, currentView]);

  return (
    <>
      <Toaster position="top-right" richColors />

      {currentView === 'landing' ? (
        <LandingPage onEnterApp={() => setCurrentView('app')} />
      ) : (
        <ChatAppPage onBackToHome={() => setCurrentView('landing')} />
      )}
    </>
  );
}

export default App;

import React, { useState } from 'react';
import { ArrowLeft, Home } from 'lucide-react';
import { Sidebar } from '@/components/chat/Sidebar';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { Button } from '@/components/ui/Button';

export function ChatAppPage({ onBackToHome }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background text-foreground font-sans antialiased">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:flex flex-col h-full border-r border-sidebar-border bg-sidebar">
        {/* Back to Landing Page shortcut */}
        <div className="p-2 border-b border-sidebar-border/60 bg-muted/30 flex items-center justify-between">
          <Button
            size="sm"
            variant="ghost"
            onClick={onBackToHome}
            className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-7 px-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Landing Page</span>
          </Button>
          <span className="text-[10px] text-muted-foreground font-mono">TalkSpace v2.0</span>
        </div>

        <div className="flex-1 overflow-hidden">
          <Sidebar />
        </div>
      </div>

      {/* Mobile Slide-Over Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-80 h-full bg-sidebar shadow-2xl flex flex-col">
            <div className="p-2 border-b border-sidebar-border/60 bg-muted/30">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setMobileSidebarOpen(false);
                  onBackToHome();
                }}
                className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-7 px-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Landing Page</span>
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
            </div>
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

export default ChatAppPage;

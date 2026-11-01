import React, { useState } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { WhyTalkSpace } from '@/components/landing/WhyTalkSpace';
import { FinalCta } from '@/components/landing/FinalCta';
import { Footer } from '@/components/landing/Footer';
import { AuthModal } from '@/components/auth/AuthModal';

export function LandingPage({ onEnterChat, onOpenAuth }) {
  const [authModalMode, setAuthModalMode] = useState(null); // optional fallback modal

  const handleOpenAuth = (mode) => {
    if (onOpenAuth) {
      onOpenAuth(mode);
    } else {
      setAuthModalMode(mode);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden flex flex-col font-sans antialiased">
      {/* Navigation */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        onEnterChat={onEnterChat}
      />

      {/* Main Landing Sections */}
      <main className="flex-1">
        <Hero
          onOpenAuth={handleOpenAuth}
          onEnterChat={onEnterChat}
        />
        <Features />
        <WhyTalkSpace />
        <FinalCta
          onOpenAuth={handleOpenAuth}
          onEnterChat={onEnterChat}
        />
      </main>

      {/* Footer */}
      <Footer onOpenAuth={handleOpenAuth} />

      {/* Auth Modal Overlay fallback if onOpenAuth is not used */}
      {authModalMode && (
        <AuthModal
          initialMode={authModalMode}
          onClose={() => setAuthModalMode(null)}
          onSuccess={() => {
            setAuthModalMode(null);
            onEnterChat();
          }}
        />
      )}
    </div>
  );
}

export default LandingPage;


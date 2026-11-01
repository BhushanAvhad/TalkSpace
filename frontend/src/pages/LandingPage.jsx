import React, { useState } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Highlights } from '@/components/landing/Highlights';
import { Features } from '@/components/landing/Features';
import { ProductShowcase } from '@/components/landing/ProductShowcase';
import { WhyTalkSpace } from '@/components/landing/WhyTalkSpace';
import { Faq } from '@/components/landing/Faq';
import { FinalCta } from '@/components/landing/FinalCta';
import { Footer } from '@/components/landing/Footer';
import { AuthModal } from '@/components/auth/AuthModal';

export function LandingPage({ onEnterApp }) {
  const [authMode, setAuthMode] = useState(null); // 'login' | 'register' | null

  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode);
  };

  const handleCloseAuth = () => {
    setAuthMode(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden flex flex-col font-sans antialiased">
      {/* Sticky Navigation Bar */}
      <Navbar onOpenAuth={handleOpenAuth} />

      {/* Main Page Content */}
      <main className="flex-1">
        <Hero onOpenAuth={handleOpenAuth} />
        <Highlights />
        <Features />
        <ProductShowcase onOpenAuth={handleOpenAuth} />
        <WhyTalkSpace />
        <Faq />
        <FinalCta onOpenAuth={handleOpenAuth} />
      </main>

      {/* Footer */}
      <Footer onOpenAuth={handleOpenAuth} />

      {/* Auth Modal Popup if open */}
      {authMode && (
        <AuthModal
          initialMode={authMode}
          onClose={handleCloseAuth}
          onSuccess={onEnterApp}
        />
      )}
    </div>
  );
}

export default LandingPage;

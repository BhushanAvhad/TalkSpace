import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'What is TalkSpace?',
      a: 'TalkSpace is a modern real-time communication platform built with React 19, Node.js, and Supabase. It provides instant messaging, private 1-on-1 chats, public group channels, live presence detection, and file sharing in a unified, beautifully designed space.',
    },
    {
      q: 'Can I send private messages?',
      a: 'Yes. You can initiate dedicated private conversations with any active user in the space. TalkSpace includes an interactive chat request system allowing users to accept or decline chat invitations before starting.',
    },
    {
      q: 'Does TalkSpace support group conversations?',
      a: 'Absolutely. TalkSpace features public community rooms (such as the #general channel) where all connected users can participate in real-time group conversations simultaneously.',
    },
    {
      q: 'Can I share files and images?',
      a: 'Yes. You can upload images, documents, and supported files directly using the attachment button in the message composer. Images are rendered inline with preview cards, and documents provide one-click download links.',
    },
    {
      q: 'Can I switch between dark and light mode?',
      a: 'Yes. TalkSpace includes a high-contrast dual theme system. You can switch between deep graphite dark mode and crisp slate light mode anytime via the theme toggle, and your preference is saved automatically in your browser.',
    },
    {
      q: 'How do I create an account?',
      a: 'Simply click "Get Started" in the navigation bar, choose a unique username and password, and click Register. Your account will be created immediately with salted cryptographic password hashing stored in our Supabase database.',
    },
  ];

  const toggleAccordion = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section id="faq" className="py-24 bg-muted/20 border-t border-border/60 relative select-none">
      <div className="container max-w-4xl mx-auto px-4 sm:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked Questions
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Questions? We have answers.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Everything you need to know about TalkSpace features, security, and setup.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={cn(
                  'rounded-2xl border transition-all duration-200 overflow-hidden bg-card',
                  isOpen
                    ? 'border-primary/50 shadow-glow'
                    : 'border-border/70 hover:border-border'
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-foreground focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-muted-foreground transition-transform duration-300 flex-shrink-0',
                      isOpen && 'rotate-180 text-primary'
                    )}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Faq;

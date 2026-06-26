import React from 'react';
import { SignInButton } from '@clerk/clerk-react';
import { Sparkles, MessageSquareShare } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header className="shrink-0 z-50 glass-nav border-b border-black/5 dark:border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-14 sm:h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#D6EFC1] flex items-center justify-center text-[#1E2022] shadow-xs transform hover:rotate-6 transition-transform">
            <MessageSquareShare className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E2022] dark:text-white flex items-center gap-1.5">
            Kite <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-[#E8DFF5] text-[#2d233c] font-semibold tracking-wide">2.0</span>
          </span>
        </div>

        {/* Single CTA Button */}
        <div className="flex items-center gap-4">
          <SignInButton mode="modal">
            <button className="relative group overflow-hidden px-5 py-2 rounded-full bg-[#D6EFC1] hover:bg-[#bde4a1] text-[#1E2022] font-semibold text-xs sm:text-sm shadow-xs transition-all duration-300 active:scale-95 cursor-pointer flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 fill-[#1E2022]" />
              <span>Get Started</span>
            </button>
          </SignInButton>
        </div>
      </div>
    </header>
  );
};

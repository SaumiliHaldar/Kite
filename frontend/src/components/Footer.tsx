import React from 'react';
import { MessageSquareShare } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="shrink-0 py-2.5 sm:py-3 border-t border-black/5 dark:border-white/10 px-6 bg-white/40 dark:bg-black/20 text-[11px] sm:text-xs text-[#64686e] dark:text-[#9ea4ac]">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 text-[#1E2022] dark:text-white font-semibold">
          <div className="w-5 h-5 rounded-md bg-[#D6EFC1] flex items-center justify-center text-[#1E2022]">
            <MessageSquareShare className="w-3 h-3 stroke-[2.5]" />
          </div>
          <span>Kite Collaboration Inc.</span>
        </div>
        <p className="hidden sm:block text-center">
          Designed for velocity. Sub-millisecond real-time workspace.
        </p>
        <div className="flex gap-4 font-medium">
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Status</a>
        </div>
      </div>
    </footer>
  );
};

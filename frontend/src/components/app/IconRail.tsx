import React from 'react';
import { MessageSquare, Users, Radio, Bell, Settings } from 'lucide-react';
import { UserButton } from '@clerk/clerk-react';
import { motion } from 'framer-motion';

export type NavSection = 'dms' | 'rooms' | 'communities';

interface IconRailProps {
  activeSection: NavSection;
  onSectionChange: (section: NavSection) => void;
}

const navItems: { section: NavSection; Icon: React.ElementType; label: string }[] = [
  { section: 'dms', Icon: MessageSquare, label: 'Direct Messages' },
  { section: 'rooms', Icon: Users, label: 'Rooms' },
  { section: 'communities', Icon: Radio, label: 'Communities' },
];

export const IconRail: React.FC<IconRailProps> = ({ activeSection, onSectionChange }) => {
  return (
    <aside className="w-16 bg-white dark:bg-[#1E2022] border-r border-[#E8DFF5] dark:border-white/10 flex flex-col items-center py-4 justify-between z-20 shadow-sm shrink-0">
      {/* Logo */}
      <div className="flex flex-col items-center gap-5">
        <div className="w-10 h-10 rounded-xl bg-[#D6EFC1] flex items-center justify-center text-[#1E2022] font-black text-lg shadow-sm select-none">
          K
        </div>

        <div className="flex flex-col items-center gap-2 mt-1">
          {navItems.map(({ section, Icon, label }) => {
            const isActive = activeSection === section;
            return (
              <motion.button
                key={section}
                whileTap={{ scale: 0.9 }}
                onClick={() => onSectionChange(section)}
                title={label}
                className={`relative p-2.5 rounded-xl transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#E8DFF5] dark:bg-white/10 text-[#2d233c] dark:text-white'
                    : 'text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="rail-active-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-[#D6EFC1] -ml-px"
                  />
                )}
                <Icon className="w-5 h-5 stroke-[2]" />
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Bottom: Bell + Settings + Avatar */}
      <div className="flex flex-col items-center gap-3">
        <button
          title="Notifications"
          className="p-2.5 rounded-xl text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer relative"
        >
          <Bell className="w-5 h-5 stroke-[2]" />
          {/* Placeholder badge */}
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#D6EFC1]" />
        </button>
        <button
          title="Settings"
          className="p-2.5 rounded-xl text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
        >
          <Settings className="w-5 h-5 stroke-[2]" />
        </button>
        <UserButton afterSignOutUrl="/" />
      </div>
    </aside>
  );
};

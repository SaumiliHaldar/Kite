import React, { useState } from 'react';
import { SignInButton } from '@clerk/clerk-react';
import { ArrowRight, Heart, Flame, ThumbsUp, Zap, Smile, Radio, Search } from 'lucide-react';
import Carousel, { type CarouselItem } from './Carousel';

export const Hero: React.FC = () => {
  const [reactionCounts, setReactionCounts] = useState({
    heart: 4,
    flame: 2,
    thumbs: 12
  });

  const triggerReaction = (type: 'heart' | 'flame' | 'thumbs') => {
    setReactionCounts(prev => ({
      ...prev,
      [type]: prev[type] + 1
    }));
  };

  const carouselItems: CarouselItem[] = [
    {
      id: 1,
      title: 'Live Reaction Engine',
      description: 'Interactive chat preview.',
      content: (
        <div className="w-full glass-panel rounded-3xl p-4 sm:p-8 border border-white/60 dark:border-white/10 text-left h-full flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 sm:pb-4 mb-3 sm:mb-6 border-b border-black/5 dark:border-white/10">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-400" />
            </div>
            <div className="text-[10px] sm:text-xs font-semibold text-[#64686e] dark:text-[#9ea4ac] flex items-center gap-1 sm:gap-1.5">
              <span># engineering-hq</span>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-5 flex-1 flex flex-col justify-center">
            <div className="flex items-start gap-2 sm:gap-3">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Sarah" className="w-7 h-7 sm:w-9 sm:h-9 rounded-full object-cover shadow-xs pointer-events-none" />
              <div className="flex-1">
                <div className="flex items-baseline gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                  <span className="text-xs sm:text-sm font-bold text-[#1E2022] dark:text-white">Sarah Jenkins</span>
                  <span className="text-[9px] sm:text-[10px] text-gray-400">10:48 AM</span>
                </div>
                <div className="p-2 sm:p-3.5 rounded-2xl rounded-tl-none bg-white dark:bg-[#1E2022] text-xs sm:text-sm text-[#1E2022] dark:text-gray-200 shadow-xs border border-black/5 dark:border-white/5 leading-normal">
                  Just pushed the new Beanie ODM integration — Kite channels are live! 🚀
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 sm:gap-3">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Alex" className="w-7 h-7 sm:w-9 sm:h-9 rounded-full object-cover shadow-xs pointer-events-none" />
              <div className="flex-1">
                <div className="flex items-baseline gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                  <span className="text-xs sm:text-sm font-bold text-[#1E2022] dark:text-white">Alex Rivera</span>
                  <span className="text-[9px] sm:text-[10px] text-gray-400">10:49 AM</span>
                </div>
                <div className="p-2 sm:p-3.5 rounded-2xl rounded-tl-none bg-[#E8DFF5]/60 dark:bg-[#2d233c] text-xs sm:text-sm text-[#1E2022] dark:text-gray-100 shadow-xs border border-[#E8DFF5] dark:border-white/10 font-medium leading-normal">
                  Nice. Did the live reaction counters update across all sessions?
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 mt-1.5 sm:mt-2 ml-1">
                  <button onClick={() => triggerReaction('heart')} className="px-2 py-0.5 rounded-full bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-[10px] sm:text-xs font-semibold shadow-xs flex items-center gap-1 hover:border-[#D6EFC1] cursor-pointer active:scale-95 transition-all">
                    <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-red-500 text-red-500" />
                    <span>{reactionCounts.heart}</span>
                  </button>
                  <button onClick={() => triggerReaction('flame')} className="px-2 py-0.5 rounded-full bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-[10px] sm:text-xs font-semibold shadow-xs flex items-center gap-1 hover:border-[#D6EFC1] cursor-pointer active:scale-95 transition-all">
                    <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-500 text-amber-500" />
                    <span>{reactionCounts.flame}</span>
                  </button>
                  <button onClick={() => triggerReaction('thumbs')} className="px-2 py-0.5 rounded-full bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 text-[10px] sm:text-xs font-semibold shadow-xs flex items-center gap-1 hover:border-[#D6EFC1] cursor-pointer active:scale-95 transition-all">
                    <ThumbsUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-blue-500 text-blue-500" />
                    <span>{reactionCounts.thumbs}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: 'Sub-millisecond WebSockets',
      description: 'Multiplexed real-time packets.',
      content: (
        <div className="w-full glass-panel rounded-3xl p-4 sm:p-8 relative overflow-hidden group hover:border-[#D6EFC1] transition-all duration-300 text-left h-full flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#D6EFC1] flex items-center justify-center text-[#1E2022] mb-3 sm:mb-6 shadow-xs group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-base sm:text-2xl font-bold text-[#1E2022] dark:text-white mb-1.5 sm:mb-3">Sub-millisecond WebSockets</h3>
            <p className="text-[#64686e] dark:text-[#9ea4ac] leading-normal sm:leading-relaxed max-w-lg mb-3 sm:mb-6 text-xs sm:text-sm">
              Multiplexed FastAPI WebSocket streams deliver chat packets and live typing indicators across your entire organization instantly. Zero polling, zero lag.
            </p>
          </div>
          <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-black/5 dark:bg-white/5 font-mono text-[10px] sm:text-xs text-emerald-700 dark:text-[#D6EFC1] flex items-center justify-between border border-black/5 dark:border-white/5">
            <span className="truncate">&gt; ws://api.kite.app/ws/alpha</span>
            <span className="shrink-0 ml-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold">CONNECTED</span>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: 'Universal Reactions',
      description: 'Express more with less.',
      content: (
        <div className="w-full glass-panel rounded-3xl p-4 sm:p-8 relative overflow-hidden group hover:border-[#E8DFF5] transition-all duration-300 flex flex-col justify-between text-left h-full">
          <div>
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#E8DFF5] flex items-center justify-center text-[#2d233c] mb-3 sm:mb-6 shadow-xs group-hover:scale-110 transition-transform">
              <Smile className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-base sm:text-2xl font-bold text-[#1E2022] dark:text-white mb-1.5 sm:mb-3">Universal Reactions</h3>
            <p className="text-[#64686e] dark:text-[#9ea4ac] leading-normal sm:leading-relaxed text-xs sm:text-sm">
              One hover, infinite expression. Kite's inline emoji engine surfaces context-aware quick reactions with sub-10ms propagation across every connected session.
            </p>
          </div>
          <div className="mt-4 sm:mt-8 flex gap-2 justify-center py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-white dark:bg-[#1E2022] shadow-inner text-base sm:text-xl">
            <span className="hover:scale-125 transition-transform cursor-pointer">🥑</span>
            <span className="hover:scale-125 transition-transform cursor-pointer">🚀</span>
            <span className="hover:scale-125 transition-transform cursor-pointer">💯</span>
            <span className="hover:scale-125 transition-transform cursor-pointer">🦖</span>
            <span className="hover:scale-125 transition-transform cursor-pointer">🔥</span>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: 'Instant Nanoid Channels',
      description: '1-click team onboarding.',
      content: (
        <div className="w-full glass-panel rounded-3xl p-4 sm:p-8 relative overflow-hidden group hover:border-[#D6EFC1] transition-all duration-300 text-left h-full flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#D6EFC1] flex items-center justify-center text-[#1E2022] mb-3 sm:mb-6 shadow-xs group-hover:scale-110 transition-transform">
              <Radio className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-base sm:text-2xl font-bold text-[#1E2022] dark:text-white mb-1.5 sm:mb-3">Instant Nanoid Channels</h3>
            <p className="text-[#64686e] dark:text-[#9ea4ac] leading-normal sm:leading-relaxed mb-3 sm:mb-6 text-xs sm:text-sm">
              Spin up voice-enabled or text channels in 1 click. Share 8-character nanoid invite links (`join/k8x9pL2m`) for effortless team onboarding.
            </p>
          </div>
          <div className="inline-flex items-center self-start gap-1 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-[#E8DFF5] dark:bg-white/10 text-[10px] sm:text-xs font-mono font-semibold">
            <span>kite.app/join/x8K9mP2q</span>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: 'Instant Regex Search',
      description: 'Sub-15ms aggregation queries.',
      content: (
        <div className="w-full glass-panel rounded-3xl p-4 sm:p-8 relative overflow-hidden group hover:border-[#E8DFF5] transition-all duration-300 text-left h-full flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#E8DFF5] flex items-center justify-center text-[#2d233c] mb-3 sm:mb-6 shadow-xs group-hover:scale-110 transition-transform">
              <Search className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-base sm:text-2xl font-bold text-[#1E2022] dark:text-white mb-1.5 sm:mb-3">Instant Regex Search</h3>
            <p className="text-[#64686e] dark:text-[#9ea4ac] leading-normal sm:leading-relaxed max-w-lg mb-3 sm:mb-6 text-xs sm:text-sm">
              Find needle-in-a-haystack decisions instantly. Kite’s MongoDB aggregation layer performs case-insensitive regular expression filtering across thousands of messages in under 15ms.
            </p>
          </div>
          <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white dark:bg-[#1E2022] flex items-center gap-2 sm:gap-3 border border-black/5 dark:border-white/10 shadow-xs">
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 ml-1" />
            <span className="text-[10px] sm:text-sm font-mono text-gray-800 dark:text-gray-200">query: <span className="text-purple-600 dark:text-purple-400 font-bold">/beanie.*odm/i</span></span>
          </div>
        </div>
      )
    }
  ];

  return (
    <section className="relative flex-1 flex flex-col lg:items-center lg:justify-center overflow-hidden w-full min-h-0">

      {/* ── MOBILE layout: full-height flex column ── */}
      <div className="flex flex-col lg:hidden w-full h-full px-4 pt-3 pb-4 gap-4">

        {/* Carousel — takes the top ~58% */}
        <div className="flex-[58] min-h-0 relative flex flex-col items-center justify-center">
          {/* Ambient glows */}
          <div className="absolute w-52 h-52 rounded-full bg-[#D6EFC1]/40 blur-3xl top-0 left-0 animate-float-slow pointer-events-none" />
          <div className="absolute w-52 h-52 rounded-full bg-[#E8DFF5]/60 blur-3xl bottom-0 right-0 animate-float-fast pointer-events-none" />
          <div className="w-full h-full relative z-10">
            <Carousel
              baseWidth={440}
              autoplay={true}
              autoplayDelay={4000}
              pauseOnHover={true}
              loop={true}
              round={false}
              items={carouselItems}
            />
          </div>
        </div>

        {/* Text + CTA — takes the bottom ~42% */}
        <div className="flex-[42] min-h-0 flex flex-col items-center justify-center text-center gap-3">
          <h1 className="text-[clamp(1.6rem,7vw,2.4rem)] font-extrabold tracking-tight text-[#1E2022] dark:text-white leading-[1.1]">
            Collaborate at the speed of{' '}
            <span className="underline decoration-[#D6EFC1] decoration-wavy decoration-3 underline-offset-4">
              thought
            </span>.
            
          </h1>
          <p className="text-[clamp(0.78rem,3.2vw,0.95rem)] text-[#64686e] dark:text-[#9ea4ac] leading-relaxed max-w-sm">
            Real-time channels. Regex-powered search. Emoji reactions that propagate in under 10ms. Kite is where fast teams ship faster.
          </p>
          <SignInButton mode="modal">
            <button className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#D6EFC1] hover:bg-[#bde4a1] text-[#1E2022] font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer mt-1">
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </SignInButton>
        </div>
      </div>

      {/* ── DESKTOP layout: two-column grid ── */}
      <div className="hidden lg:grid max-w-7xl mx-auto grid-cols-12 gap-12 items-center w-full px-6 py-6">

        {/* Left Column - Copy & CTA */}
        <div className="col-span-6 text-left z-10">
          <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-[#1E2022] dark:text-white leading-[1.1] mb-6">
            Collaborate at the speed of{' '}
            <span className="underline decoration-[#D6EFC1] decoration-wavy decoration-4 underline-offset-8">thought</span>.
          </h1>
          <p className="text-lg text-[#64686e] dark:text-[#9ea4ac] font-normal leading-relaxed mb-8 max-w-xl">
            Real-time channels. Regex-powered search. Emoji reactions that propagate in under 10ms. Kite is where fast teams ship faster.
          </p>
          <SignInButton mode="modal">
            <button className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#D6EFC1] hover:bg-[#bde4a1] text-[#1E2022] font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer">
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </SignInButton>
        </div>

        {/* Right Column - Carousel */}
        <div className="col-span-6 relative flex flex-col items-center justify-center">
          <div className="absolute w-72 h-72 rounded-full bg-[#D6EFC1]/40 blur-3xl -top-10 -left-10 animate-float-slow pointer-events-none" />
          <div className="absolute w-72 h-72 rounded-full bg-[#E8DFF5]/60 blur-3xl -bottom-10 -right-10 animate-float-fast pointer-events-none" />
          <div className="w-full max-w-lg relative z-10 min-h-[420px] flex items-center">
            <Carousel
              baseWidth={440}
              autoplay={true}
              autoplayDelay={4000}
              pauseOnHover={true}
              loop={true}
              round={false}
              items={carouselItems}
            />
          </div>
        </div>

      </div>
    </section>
  );
};

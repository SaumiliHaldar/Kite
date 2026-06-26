import React from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { Footer } from '../components/Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="h-screen max-h-[100dvh] w-full overflow-hidden bg-[#FCF8F3] dark:bg-[#121316] text-[#1E2022] dark:text-[#F4F6F8] flex flex-col justify-between selection:bg-[#D6EFC1] selection:text-[#1E2022]">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center overflow-hidden min-h-0 w-full">
        <Hero />
      </main>
      <Footer />
    </div>
  );
};

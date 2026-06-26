import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { LandingPage } from './pages/LandingPage';
import { AppLayout } from './pages/AppLayout';

export const App: React.FC = () => {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FCF8F3] dark:bg-[#121316] flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl bg-[#D6EFC1] animate-bounce flex items-center justify-center font-black text-xl text-[#1E2022]">
          K
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Landing Page Guard: if signed in, redirect to /app */}
      <Route 
        path="/" 
        element={isSignedIn ? <Navigate to="/app" replace /> : <LandingPage />} 
      />

      {/* App Workspace Guard: if signed out, redirect to / */}
      <Route 
        path="/app" 
        element={isSignedIn ? <AppLayout /> : <Navigate to="/" replace />} 
      />

      {/* Catch-all redirect to / */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;

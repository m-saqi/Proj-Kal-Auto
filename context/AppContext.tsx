import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Profile } from '../types';

interface AppContextType {
  activeProfile: Profile | null;
  setActiveProfile: (profile: Profile | null) => void;
  saveProfile: (profile: Profile) => void;
  savedProfiles: Profile[];
  removeProfile: (id: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [savedProfiles, setSavedProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  // Apply Theme to HTML tag
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const saved = localStorage.getItem('uaf_profiles');
    if (saved) {
      try {
        setSavedProfiles(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load profiles", e);
      }
    }
  }, []);

  const saveProfile = (profile: Profile) => {
    setActiveProfile(profile);
    setSavedProfiles(prev => {
      const filtered = prev.filter(p => p.studentInfo.registration !== profile.studentInfo.registration);
      const updated = [profile, ...filtered];
      localStorage.setItem('uaf_profiles', JSON.stringify(updated));
      return updated;
    });
  };

  const removeProfile = (id: string) => {
    setSavedProfiles(prev => {
      const updated = prev.filter(p => p.studentInfo.registration !== id);
      localStorage.setItem('uaf_profiles', JSON.stringify(updated));
      return updated;
    });
    if (activeProfile?.studentInfo.registration === id) {
      setActiveProfile(null);
    }
  };

  return (
    <AppContext.Provider value={{ 
      activeProfile, setActiveProfile, saveProfile, savedProfiles, removeProfile, 
      isLoading, setIsLoading, theme, toggleTheme 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface UserPreferences {
  viewMode: 'grid' | 'list';
  sortPreference: string;
  filterPreference: string;
  colorMode: 'light' | 'dark';
  notificationsEnabled: boolean;
  transactionsToShow: number;
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  toggleColorMode: () => void;
  toggleNotifications: () => void;
  resetPreferences: () => void;
}

const defaultPreferences: UserPreferences = {
  viewMode: 'grid',
  sortPreference: 'ending-soon',
  filterPreference: 'active',
  colorMode: 'light',
  notificationsEnabled: true,
  transactionsToShow: 5,
};

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>(
    'rafflerocket-preferences',
    defaultPreferences
  );

  const updatePreferences = (newPreferences: Partial<UserPreferences>) => {
    setPreferences((prev) => ({
      ...prev,
      ...newPreferences,
    }));
  };

  const toggleColorMode = () => {
    updatePreferences({
      colorMode: preferences.colorMode === 'light' ? 'dark' : 'light',
    });
  };

  const toggleNotifications = () => {
    updatePreferences({
      notificationsEnabled: !preferences.notificationsEnabled,
    });
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
  };

  return (
    <UserPreferencesContext.Provider
      value={{
        preferences,
        updatePreferences,
        toggleColorMode,
        toggleNotifications,
        resetPreferences,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
} 
'use client';

import { useState, useEffect } from 'react';

/**
 * Hook for using localStorage with type safety
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Initialize state on component mount
  useEffect(() => {
    try {
      // Get value from localStorage by key
      const item = localStorage.getItem(key);
      // Parse stored json or return initialValue
      setStoredValue(item ? JSON.parse(item) : initialValue);
    } catch (error) {
      // If error, use initialValue
      console.error(`Error reading localStorage key "${key}":`, error);
      setStoredValue(initialValue);
    }
  }, [key, initialValue]);

  // Function to update localStorage and state
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
} 
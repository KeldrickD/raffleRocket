import { useCallback } from 'react';
import { useRaffles } from './useRaffles';

export function useRaffleRefresh() {
  const { mutate } = useRaffles();

  const refreshRaffles = useCallback(() => {
    console.log('Refreshing raffle data...');
    mutate();
  }, [mutate]);

  return refreshRaffles;
} 
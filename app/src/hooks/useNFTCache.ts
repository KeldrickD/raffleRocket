import { useState, useCallback } from 'react';
import { NFTListItem } from './useNFTList';

interface NFTCache {
  [key: string]: NFTListItem;
}

export function useNFTCache() {
  const [cache, setCache] = useState<NFTCache>({});

  const addToCache = useCallback((nft: NFTListItem) => {
    setCache((prevCache) => ({
      ...prevCache,
      [nft.mint]: nft,
    }));
  }, []);

  const removeFromCache = useCallback((mint: string) => {
    setCache((prevCache) => {
      const newCache = { ...prevCache };
      delete newCache[mint];
      return newCache;
    });
  }, []);

  const clearCache = useCallback(() => {
    setCache({});
  }, []);

  const getCachedNFT = useCallback(
    (mint: string) => {
      return cache[mint] || null;
    },
    [cache]
  );

  return {
    cache,
    addToCache,
    removeFromCache,
    clearCache,
    getCachedNFT,
  };
} 
import { useRef, useCallback } from 'react';
import { NFTListItem } from '../types/nft';

export function useNFTRef() {
  const nftRef = useRef<NFTListItem | null>(null);

  const setNFTRef = useCallback((nft: NFTListItem | null) => {
    nftRef.current = nft;
  }, []);

  const getNFTRef = useCallback(() => {
    return nftRef.current;
  }, []);

  return {
    nftRef,
    setNFTRef,
    getNFTRef,
  };
} 
import { useDebugValue, useState, useCallback } from 'react';
import { NFTListItem } from '../types/nft';

export function useNFTDebugValue() {
  const [nfts, setNFTs] = useState<NFTListItem[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<NFTListItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useDebugValue(
    { nfts, selectedNFT, isLoading, error },
    (state) => ({
      nftCount: state.nfts.length,
      hasSelection: !!state.selectedNFT,
      status: state.isLoading ? 'loading' : state.error ? 'error' : 'idle',
    })
  );

  const addNFT = useCallback((nft: NFTListItem) => {
    setNFTs((prev) => [...prev, nft]);
  }, []);

  const removeNFT = useCallback((nftToRemove: NFTListItem) => {
    setNFTs((prev) => prev.filter((nft) => nft !== nftToRemove));
  }, []);

  const selectNFT = useCallback((nft: NFTListItem) => {
    setSelectedNFT(nft);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedNFT(null);
  }, []);

  return {
    nfts,
    selectedNFT,
    isLoading,
    error,
    addNFT,
    removeNFT,
    selectNFT,
    clearSelection,
    setIsLoading,
    setError,
  };
} 
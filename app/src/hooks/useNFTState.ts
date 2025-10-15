import { useState, useCallback } from 'react';
import { NFTListItem } from '../types/nft';

interface NFTState {
  nfts: NFTListItem[];
  selectedNFT: NFTListItem | null;
  isLoading: boolean;
  error: string | null;
}

export function useNFTState() {
  const [state, setState] = useState<NFTState>({
    nfts: [],
    selectedNFT: null,
    isLoading: false,
    error: null,
  });

  const setNFTs = useCallback((nfts: NFTListItem[]) => {
    setState((prev) => ({ ...prev, nfts }));
  }, []);

  const selectNFT = useCallback((nft: NFTListItem) => {
    setState((prev) => ({ ...prev, selectedNFT: nft }));
  }, []);

  const clearSelection = useCallback(() => {
    setState((prev) => ({ ...prev, selectedNFT: null }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  return {
    ...state,
    setNFTs,
    selectNFT,
    clearSelection,
    setLoading,
    setError,
  };
} 
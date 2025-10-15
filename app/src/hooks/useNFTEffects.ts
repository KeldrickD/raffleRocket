import { useEffect } from 'react';
import { useNFTState } from './useNFTState';
import { useNFTList } from './useNFTList';

export function useNFTEffects() {
  const { setNFTs, setLoading, setError } = useNFTState();
  const { nfts, isLoading, error } = useNFTList();

  useEffect(() => {
    setNFTs(nfts);
  }, [nfts, setNFTs]);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  useEffect(() => {
    setError(error);
  }, [error, setError]);
} 
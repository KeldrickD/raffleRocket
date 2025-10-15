import { useState, useCallback } from 'react';
import { NFTListItem } from '../types/nft';

type ErrorType = Error | null;

export function useNFTError() {
  const [error, setError] = useState<ErrorType>(null);
  const [handlingError, setHandlingError] = useState(false);

  const handleError = useCallback((err: Error) => {
    setError(err);
    setHandlingError(true);
    
    // Log the error
    console.error('NFT operation error:', err);

    // Simulate error handling
    setTimeout(() => {
      setHandlingError(false);
    }, 2000);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setHandlingError(false);
  }, []);

  return {
    error,
    handlingError,
    handleError,
    clearError
  };
} 
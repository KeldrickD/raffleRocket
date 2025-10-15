import { useState } from 'react';
import { NFTMetadata, NFTListItem } from '../types/nft';
import { createNFT } from '../utils/nft';

interface UseNFTCreationOptions {
  onSuccess?: (nft: NFTListItem) => void;
  onError?: (error: Error) => void;
}

export const useNFTCreation = (options: UseNFTCreationOptions = {}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [creationError, setCreationError] = useState<Error | null>(null);
  const [lastCreatedNFT, setLastCreatedNFT] = useState<NFTListItem | null>(null);

  const handleCreateNFT = async (metadata: NFTMetadata): Promise<NFTListItem | null> => {
    setIsCreating(true);
    setCreationError(null);
    
    try {
      // Use the API utility function
      const newNFT = await createNFT(metadata);
      
      setLastCreatedNFT(newNFT);
      
      // Call success callback if provided
      if (options.onSuccess) {
        options.onSuccess(newNFT);
      }
      
      return newNFT;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error during NFT creation');
      setCreationError(err);
      
      // Call error callback if provided
      if (options.onError) {
        options.onError(err);
      }
      
      return null;
    } finally {
      setIsCreating(false);
    }
  };
  
  return {
    createNFT: handleCreateNFT,
    isCreating,
    creationError,
    lastCreatedNFT,
  };
}; 
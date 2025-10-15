import { experimental_useOptimistic as useOptimistic } from 'react';
import { NFTListItem } from '../types/nft';

interface OptimisticState {
  nfts: NFTListItem[];
  pendingNFTs: NFTListItem[];
}

export function useNFTOptimistic(initialNFTs: NFTListItem[]) {
  const [state, addOptimisticNFT] = useOptimistic<
    OptimisticState,
    NFTListItem
  >(
    { nfts: initialNFTs, pendingNFTs: [] },
    (currentState, newNFT) => ({
      ...currentState,
      pendingNFTs: [...currentState.pendingNFTs, newNFT],
    })
  );

  const addNFT = async (nft: NFTListItem) => {
    try {
      addOptimisticNFT(nft);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Failed to add NFT:', error);
      return false;
    }
  };

  return {
    nfts: state.nfts,
    pendingNFTs: state.pendingNFTs,
    addNFT,
  };
} 
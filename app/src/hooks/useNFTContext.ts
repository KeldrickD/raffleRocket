import { createContext, useContext } from 'react';
import { NFTListItem } from './useNFTList';

interface NFTContextType {
  nfts: NFTListItem[];
  selectedNFT: NFTListItem | null;
  selectNFT: (nft: NFTListItem) => void;
  clearSelection: () => void;
  isLoading: boolean;
  error: string | null;
}

const NFTContext = createContext<NFTContextType | null>(null);

export function useNFTContext() {
  const context = useContext(NFTContext);
  if (!context) {
    throw new Error('useNFTContext must be used within a NFTProvider');
  }
  return context;
}

export const NFTProvider = NFTContext.Provider; 
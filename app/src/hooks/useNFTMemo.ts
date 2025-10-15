import { useMemo } from 'react';
import { NFTListItem } from '../types/nft';

export function useNFTMemo(nfts: NFTListItem[]) {
  const sortedNFTs = useMemo(() => {
    return [...nfts].sort((a, b) => {
      if (!a.metadata?.name || !b.metadata?.name) return 0;
      return a.metadata.name.localeCompare(b.metadata.name);
    });
  }, [nfts]);

  const filteredNFTs = useMemo(() => {
    return sortedNFTs.filter((nft) => {
      return nft.metadata?.name && nft.metadata?.image;
    });
  }, [sortedNFTs]);

  return {
    sortedNFTs,
    filteredNFTs,
  };
} 
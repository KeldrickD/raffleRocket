import { useDeferredValue, useState, useEffect } from 'react';
import { NFTListItem } from '../types/nft';

export function useNFTDeferredValue(nfts: NFTListItem[]) {
  const [filteredNFTs, setFilteredNFTs] = useState<NFTListItem[]>([]);
  const deferredNFTs = useDeferredValue(nfts);

  useEffect(() => {
    const filterNFTs = () => {
      const filtered = deferredNFTs.filter((nft) => {
        return nft.metadata?.name && nft.metadata?.image;
      });
      setFilteredNFTs(filtered);
    };

    filterNFTs();
  }, [deferredNFTs]);

  return {
    filteredNFTs,
    isStale: deferredNFTs !== nfts,
  };
} 
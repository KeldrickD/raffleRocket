import { useMemo } from 'react';
import { NFTListItem } from './useNFTList';

export function useNFTValidation(nft: NFTListItem | null) {
  return useMemo(() => {
    if (!nft) return { isValid: false, error: 'No NFT selected' };
    if (!nft.metadata) return { isValid: false, error: 'No metadata found' };
    if (!nft.metadata.name) return { isValid: false, error: 'No name found' };
    if (!nft.metadata.image) return { isValid: false, error: 'No image found' };

    return { isValid: true, error: null };
  }, [nft]);
}

export function useNFTListValidation(nfts: NFTListItem[]) {
  return useMemo(() => {
    if (!nfts.length) return { isValid: false, error: 'No NFTs found' };

    const invalidNFTs = nfts.filter((nft) => {
      if (!nft.metadata) return true;
      if (!nft.metadata.name) return true;
      if (!nft.metadata.image) return true;
      return false;
    });

    if (invalidNFTs.length) {
      return {
        isValid: false,
        error: `${invalidNFTs.length} invalid NFTs found`,
      };
    }

    return { isValid: true, error: null };
  }, [nfts]);
} 
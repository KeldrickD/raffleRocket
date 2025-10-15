import { useId, useMemo } from 'react';
import { NFTListItem } from '../types/nft';

export function useNFTId(nft: NFTListItem) {
  const baseId = useId();

  const ids = useMemo(
    () => ({
      container: `nft-${baseId}`,
      image: `nft-image-${baseId}`,
      name: `nft-name-${baseId}`,
      description: `nft-description-${baseId}`,
      attributes: `nft-attributes-${baseId}`,
      actions: `nft-actions-${baseId}`,
    }),
    [baseId]
  );

  return ids;
} 
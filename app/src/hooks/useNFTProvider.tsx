import { ReactNode, useMemo } from 'react';
import { useNFTList } from './useNFTList';
import { useNFTSelection } from './useNFTSelection';
import { useNFTLoading } from './useNFTLoading';
import { NFTProvider } from './useNFTContext';

interface Props {
  children: ReactNode;
}

export function NFTProviderComponent({ children }: Props) {
  const nfts = useNFTList();
  const { selectedNFT, selectNFT, clearSelection } = useNFTSelection();
  const { isLoading, error } = useNFTLoading();

  const value = useMemo(
    () => ({
      nfts,
      selectedNFT,
      selectNFT,
      clearSelection,
      isLoading,
      error,
    }),
    [nfts, selectedNFT, selectNFT, clearSelection, isLoading, error]
  );

  return <NFTProvider value={value}>{children}</NFTProvider>;
} 
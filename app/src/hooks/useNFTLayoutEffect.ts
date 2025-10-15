import { useLayoutEffect, useCallback, useState } from 'react';
import { NFTListItem } from '../types/nft';

interface NFTLayout {
  width: number;
  height: number;
  columns: number;
  rows: number;
}

export function useNFTLayout(nfts: NFTListItem[], containerRef: React.RefObject<HTMLElement>) {
  const [layout, setLayout] = useState<NFTLayout>({
    width: 0,
    height: 0,
    columns: 0,
    rows: 0,
  });

  const calculateLayout = useCallback(() => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;
    const itemWidth = 200; // Assuming each NFT card is 200px wide
    const itemHeight = 300; // Assuming each NFT card is 300px tall
    const gap = 16; // Gap between items

    const columns = Math.floor((containerWidth + gap) / (itemWidth + gap));
    const rows = Math.ceil(nfts.length / columns);

    setLayout({
      width: containerWidth,
      height: containerHeight,
      columns,
      rows,
    });
  }, [containerRef, nfts.length]);

  useLayoutEffect(() => {
    calculateLayout();
    window.addEventListener('resize', calculateLayout);
    return () => window.removeEventListener('resize', calculateLayout);
  }, [calculateLayout]);

  return layout;
} 
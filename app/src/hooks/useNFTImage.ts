import { useConnection } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { PublicKey } from '@solana/web3.js';
import { getNFTImage } from '../utils/nft';

export function useNFTImage(mint: string | null) {
  const { connection } = useConnection();

  return useMemo(async () => {
    if (!mint) return null;

    try {
      const mintPubkey = new PublicKey(mint);
      return await getNFTImage(connection, mintPubkey);
    } catch (error) {
      console.error('Error fetching NFT image:', error);
      return null;
    }
  }, [connection, mint]);
} 
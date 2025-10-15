import { useConnection } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { PublicKey } from '@solana/web3.js';
import { getNFTMetadata } from '../utils/nft';

export function useNFTMetadata(mint: string | null) {
  const { connection } = useConnection();

  return useMemo(async () => {
    if (!mint) return null;

    try {
      const mintPubkey = new PublicKey(mint);
      return await getNFTMetadata(connection, mintPubkey);
    } catch (error) {
      console.error('Error fetching NFT metadata:', error);
      return null;
    }
  }, [connection, mint]);
} 
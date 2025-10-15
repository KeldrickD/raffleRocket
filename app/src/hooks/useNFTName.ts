import { useConnection } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { PublicKey } from '@solana/web3.js';
import { getNFTName } from '../utils/nft';

export function useNFTName(mint: string | null) {
  const { connection } = useConnection();

  return useMemo(async () => {
    if (!mint) return null;

    try {
      const mintPubkey = new PublicKey(mint);
      return await getNFTName(connection, mintPubkey);
    } catch (error) {
      console.error('Error fetching NFT name:', error);
      return null;
    }
  }, [connection, mint]);
} 
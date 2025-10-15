import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { getNFTMetadata } from '../utils/nft';

export interface UserNFT {
  mint: string;
  tokenAccount: string;
  metadata: {
    name: string;
    symbol: string;
    image: string;
    description: string;
  } | null;
}

export function useUserNFTs() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  return useMemo(async () => {
    if (!publicKey) return [];

    try {
      // Get all token accounts owned by the user
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: TOKEN_PROGRAM_ID }
      );

      // Filter for NFTs (amount = 1)
      const nftAccounts = tokenAccounts.value.filter(
        (account) => account.account.data.parsed.info.tokenAmount.amount === '1'
      );

      // Fetch metadata for each NFT
      const nfts = await Promise.all(
        nftAccounts.map(async (account) => {
          const mint = account.account.data.parsed.info.mint;
          const metadata = await getNFTMetadata(connection, mint);

          return {
            mint,
            tokenAccount: account.pubkey.toBase58(),
            metadata,
          };
        })
      );

      return nfts;
    } catch (error) {
      console.error('Error fetching user NFTs:', error);
      return [];
    }
  }, [connection, publicKey]);
} 
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { formatSOL } from '../utils/format';

export function useWalletBalance() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const balance = useMemo(async () => {
    if (!publicKey) return null;

    try {
      const balance = await connection.getBalance(publicKey);
      return formatSOL(balance);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      return null;
    }
  }, [connection, publicKey]);

  return balance;
} 
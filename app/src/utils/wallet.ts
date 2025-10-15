import { useWallet } from '@solana/wallet-adapter-react';
import { handleWalletError } from './error';

export function useWalletConnection() {
  const wallet = useWallet();

  const checkWalletConnection = () => {
    if (!wallet.connected) {
      handleWalletError(new Error('Please connect your wallet first'));
      return false;
    }
    return true;
  };

  return {
    wallet,
    checkWalletConnection,
  };
} 
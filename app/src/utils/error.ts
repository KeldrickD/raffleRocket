import { TransactionError } from '@solana/web3.js';
import toast from 'react-hot-toast';

export function handleTransactionError(error: any): void {
  console.error('Transaction error:', error);

  if (error instanceof TransactionError) {
    toast.error(`Transaction failed: ${error.message}`);
  } else if (error.message) {
    toast.error(error.message);
  } else {
    toast.error('Transaction failed. Please try again.');
  }
}

export function handleWalletError(error: any): void {
  console.error('Wallet error:', error);

  if (error.message) {
    toast.error(error.message);
  } else {
    toast.error('Wallet error. Please try again.');
  }
} 
import { Connection, TransactionSignature } from '@solana/web3.js';
import toast from 'react-hot-toast';

export const confirmTransaction = async (
  connection: Connection,
  signature: TransactionSignature
) => {
  const latestBlockHash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature,
  });
};

export const handleTransactionError = (error: any) => {
  console.error('Transaction error:', error);
  const message = error.message || 'An error occurred during the transaction';
  toast.error(message);
}; 
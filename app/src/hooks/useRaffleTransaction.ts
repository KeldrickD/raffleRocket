import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useCallback } from 'react';
import { Transaction, TransactionInstruction } from '@solana/web3.js';
import { confirmTransaction } from '../utils/transaction';
import { handleTransactionError } from '../utils/error';

export function useRaffleTransaction() {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();

  const sendTransaction = useCallback(
    async (instructions: TransactionInstruction[]) => {
      if (!publicKey || !signTransaction) {
        throw new Error('Wallet not connected');
      }

      try {
        // Create a new transaction
        const transaction = new Transaction();

        // Add instructions to transaction
        transaction.add(...instructions);

        // Get the latest blockhash
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

        // Sign transaction
        const signedTransaction = await signTransaction(transaction);

        // Send transaction
        const signature = await connection.sendRawTransaction(
          signedTransaction.serialize()
        );

        // Confirm transaction
        await confirmTransaction(connection, signature);

        return signature;
      } catch (error) {
        handleTransactionError(error);
        throw error;
      }
    },
    [connection, publicKey, signTransaction]
  );

  return sendTransaction;
} 
import { useCallback } from 'react';
import { useRaffleTransaction } from './useRaffleTransaction';
import { useRaffleProgram } from './useRaffleProgram';
import { useRaffleRefresh } from './useRaffleRefresh';
import { validateRaffleParams } from '../utils/validation';
import { createRaffleInstruction } from '../utils/instructions';
import { NFTListItem } from './useNFTList';

export function useNFTActions() {
  const program = useRaffleProgram();
  const sendTransaction = useRaffleTransaction();
  const refreshRaffles = useRaffleRefresh();

  const createRaffleWithNFT = useCallback(
    async (nft: NFTListItem, params: {
      ticketPrice: number;
      ticketCap: number;
      duration: number;
    }) => {
      if (!program) throw new Error('Program not initialized');

      // Validate parameters
      validateRaffleParams({
        ...params,
        nftMint: nft.mint,
        nftTokenAccount: nft.tokenAccount,
      });

      // Create instruction
      const instruction = await createRaffleInstruction(program, {
        ...params,
        authority: program.provider.publicKey,
        nftMint: nft.mint,
        nftTokenAccount: nft.tokenAccount,
      });

      // Send transaction
      await sendTransaction([instruction]);

      // Refresh raffles
      refreshRaffles();
    },
    [program, sendTransaction, refreshRaffles]
  );

  return {
    createRaffleWithNFT,
  };
} 
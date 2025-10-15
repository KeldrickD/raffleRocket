import { useCallback } from 'react';
import { useRaffleTransaction } from './useRaffleTransaction';
import { useRaffleProgram } from './useRaffleProgram';
import { useRaffleRefresh } from './useRaffleRefresh';
import { validateRaffleParams, validateQuantity } from '../utils/validation';
import { createRaffleInstruction, buyTicketsInstruction, endRaffleInstruction } from '../utils/instructions';

export function useRaffleActions() {
  const program = useRaffleProgram();
  const sendTransaction = useRaffleTransaction();
  const refreshRaffles = useRaffleRefresh();

  const createRaffle = useCallback(
    async (params: {
      ticketPrice: number;
      ticketCap: number;
      duration: number;
      nftMint: string;
      nftTokenAccount: string;
    }) => {
      if (!program) throw new Error('Program not initialized');

      // Validate parameters
      validateRaffleParams(params);

      // Create instruction
      const instruction = await createRaffleInstruction(program, {
        ...params,
        authority: program.provider.publicKey,
      });

      // Send transaction
      await sendTransaction([instruction]);

      // Refresh raffles
      refreshRaffles();
    },
    [program, sendTransaction, refreshRaffles]
  );

  const buyTickets = useCallback(
    async (params: {
      raffle: string;
      quantity: number;
      maxQuantity: number;
    }) => {
      if (!program) throw new Error('Program not initialized');

      // Validate parameters
      validateQuantity(params.quantity, params.maxQuantity);

      // Create instruction
      const instruction = await buyTicketsInstruction(program, {
        buyer: program.provider.publicKey,
        raffle: params.raffle,
        quantity: params.quantity,
      });

      // Send transaction
      await sendTransaction([instruction]);

      // Refresh raffles
      refreshRaffles();
    },
    [program, sendTransaction, refreshRaffles]
  );

  const endRaffle = useCallback(
    async (raffle: string) => {
      if (!program) throw new Error('Program not initialized');

      // Create instruction
      const instruction = await endRaffleInstruction(program, {
        authority: program.provider.publicKey,
        raffle,
      });

      // Send transaction
      await sendTransaction([instruction]);

      // Refresh raffles
      refreshRaffles();
    },
    [program, sendTransaction, refreshRaffles]
  );

  return {
    createRaffle,
    buyTickets,
    endRaffle,
  };
} 
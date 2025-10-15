import { useConnection } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { useRaffleProgram } from './useRaffleProgram';
import { formatRaffleData } from '../utils/raffle';
import { PublicKey } from '@solana/web3.js';

export function useRaffles() {
  const { connection } = useConnection();
  const program = useRaffleProgram();

  return useMemo(async () => {
    if (!program) return [];

    try {
      const accounts = await program.account.raffle.all();
      return accounts.map((account) => formatRaffleData(account.account));
    } catch (error) {
      console.error('Error fetching raffles:', error);
      return [];
    }
  }, [program]);
}

export function useRaffle(nftMint: string | null) {
  const { connection } = useConnection();
  const program = useRaffleProgram();

  return useMemo(async () => {
    if (!program || !nftMint) return null;

    try {
      const mint = new PublicKey(nftMint);
      const [raffle] = await PublicKey.findProgramAddress(
        [Buffer.from('raffle'), mint.toBuffer()],
        program.programId
      );

      const account = await program.account.raffle.fetch(raffle);
      return formatRaffleData(account);
    } catch (error) {
      console.error('Error fetching raffle:', error);
      return null;
    }
  }, [program, nftMint]);
}

export function useUserRaffles(authority: string | null) {
  const { connection } = useConnection();
  const program = useRaffleProgram();

  return useMemo(async () => {
    if (!program || !authority) return [];

    try {
      const accounts = await program.account.raffle.all([
        {
          memcmp: {
            offset: 8, // After discriminator
            bytes: authority,
          },
        },
      ]);

      return accounts.map((account) => formatRaffleData(account.account));
    } catch (error) {
      console.error('Error fetching user raffles:', error);
      return [];
    }
  }, [program, authority]);
}

export function useUserTickets(buyer: string | null) {
  const { connection } = useConnection();
  const program = useRaffleProgram();

  return useMemo(async () => {
    if (!program || !buyer) return [];

    try {
      const accounts = await program.account.ticket.all([
        {
          memcmp: {
            offset: 8, // After discriminator
            bytes: buyer,
          },
        },
      ]);

      return accounts;
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      return [];
    }
  }, [program, buyer]);
} 
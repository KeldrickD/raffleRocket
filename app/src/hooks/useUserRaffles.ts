'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useRaffleProgram } from './useRaffleProgram';
import { RaffleAccount } from '@/idl/types';

// Interfaces for the hook return types
interface RaffleEntry {
  timestamp: number;
  tickets: number;
  buyer: PublicKey;
}

interface ParticipatedRaffle {
  raffle: RaffleAccount & { publicKey: PublicKey };
  entry: RaffleEntry;
}

export function useUserRaffles() {
  const [createdRaffles, setCreatedRaffles] = useState<(RaffleAccount & { publicKey: PublicKey })[]>([]);
  const [participatedRaffles, setParticipatedRaffles] = useState<ParticipatedRaffle[]>([]);
  const [winningRaffles, setWinningRaffles] = useState<(RaffleAccount & { publicKey: PublicKey; claimed: boolean })[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const wallet = useWallet();
  const { program } = useRaffleProgram();

  useEffect(() => {
    const fetchUserRaffles = async () => {
      if (!program || !wallet.publicKey) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch all raffles
        const allRaffles = await program.account.raffle.all();

        // Filter raffles created by the user
        const userCreatedRaffles = allRaffles
          .filter(({ account }) => account.creator.equals(wallet.publicKey!))
          .map(({ account, publicKey }) => ({
            ...account,
            publicKey,
          })) as (RaffleAccount & { publicKey: PublicKey })[];

        setCreatedRaffles(userCreatedRaffles);

        // Filter raffles the user has participated in
        const userParticipatedRaffles: ParticipatedRaffle[] = [];
        const userWinningRaffles: (RaffleAccount & { publicKey: PublicKey; claimed: boolean })[] = [];

        for (const { account, publicKey } of allRaffles) {
          // Check if user has entries in this raffle
          const userEntries = account.entries.filter(entry =>
            entry.buyer.equals(wallet.publicKey!)
          );

          // Add to participated raffles
          if (userEntries.length > 0) {
            userEntries.forEach(entry => {
              userParticipatedRaffles.push({
                raffle: { ...account, publicKey },
                entry,
              });
            });
          }

          // Check if user is the winner
          if (
            account.winner && 
            account.winner.equals(wallet.publicKey!)
          ) {
            userWinningRaffles.push({
              ...account,
              publicKey,
              claimed: account.claimed || false,
            });
          }
        }

        setParticipatedRaffles(userParticipatedRaffles);
        setWinningRaffles(userWinningRaffles);
      } catch (err) {
        console.error('Error fetching user raffles:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRaffles();
  }, [program, wallet.publicKey]);

  return {
    createdRaffles,
    participatedRaffles,
    winningRaffles,
    loading,
    error,
  };
} 
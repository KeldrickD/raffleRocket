'use client';

import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useRaffleProgram } from './useRaffleProgram';
import { RaffleAccount } from '@/idl/types';

interface RaffleState {
  raffle: RaffleAccount | null;
  loading: boolean;
  error: Error | null;
  jackpotAmount: number;
  refreshRaffle: () => Promise<void>;
}

export function useRaffleState(rafflePublicKey: string): RaffleState {
  const [raffle, setRaffle] = useState<RaffleAccount | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [jackpotAmount, setJackpotAmount] = useState<number>(0);

  const { connection } = useConnection();
  const wallet = useWallet();
  const { program } = useRaffleProgram();

  const fetchRaffle = async () => {
    if (!program || !connection) return;

    try {
      setLoading(true);
      setError(null);

      // Convert string to PublicKey
      const raffleKey = new PublicKey(rafflePublicKey);

      // Fetch raffle account data
      const raffleAccount = await program.account.raffle.fetch(raffleKey);
      setRaffle(raffleAccount as unknown as RaffleAccount);

      // Fetch jackpot balance if available
      if (raffleAccount.jackpot) {
        const jackpotInfo = await connection.getAccountInfo(raffleAccount.jackpot);
        if (jackpotInfo) {
          const lamports = jackpotInfo.lamports;
          setJackpotAmount(lamports / 1e9); // Convert lamports to SOL
        }
      }
    } catch (err) {
      console.error('Error fetching raffle:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const refreshRaffle = async () => {
    await fetchRaffle();
  };

  useEffect(() => {
    if (rafflePublicKey && program) {
      fetchRaffle();
    }
  }, [rafflePublicKey, program, connection]);

  return { raffle, loading, error, jackpotAmount, refreshRaffle };
} 
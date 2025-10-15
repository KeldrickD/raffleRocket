import { Program, AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { IDL } from '../idl/raffle';

export function useRaffleProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const program = useMemo(() => {
    if (!wallet) return null;

    const provider = new AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
    });

    return new Program(IDL, 'YOUR_PROGRAM_ID', provider);
  }, [connection, wallet]);

  return program;
}

export function useProgramAccount<T>(
  program: Program | null,
  accountName: string,
  address: string | null
) {
  const { connection } = useConnection();

  return useMemo(async () => {
    if (!program || !address) return null;

    try {
      const account = await program.account[accountName].fetch(new PublicKey(address));
      return account as T;
    } catch (error) {
      console.error(`Error fetching ${accountName}:`, error);
      return null;
    }
  }, [program, accountName, address]);
} 
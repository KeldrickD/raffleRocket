import { useEffect, useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  SYSVAR_CLOCK_PUBKEY,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import * as anchor from '@project-serum/anchor';
import { Program, Idl } from '@project-serum/anchor';
import { IDL, RaffleRocketProgram } from '@/idl/rafflerocket';
import { getProgramErrorMessage } from '@/utils/errorHandling';

// Program ID from the deployed contract
const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID || 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');

// PDAs and account derivation constants
const TREASURY_SEED = 'treasury';
const RAFFLE_SEED = 'raffle';
const VAULT_SEED = 'vault';
const JACKPOT_SEED = 'jackpot';
const BUYER_STATS_SEED = 'buyer_stats';

export const useRaffleProgram = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  
  const [program, setProgram] = useState<RaffleRocketProgram | null>(null);
  const [treasuryPDA, setTreasuryPDA] = useState<PublicKey | null>(null);
  const [jackpotPDA, setJackpotPDA] = useState<PublicKey | null>(null);
  
  // Initialize the program when connection and wallet are ready
  useEffect(() => {
    if (!connection) return;
    
    try {
      // Create provider
      const provider = new anchor.AnchorProvider(
        connection,
        // Create a mocked wallet if user's wallet isn't connected
        publicKey ? {
          publicKey,
          signTransaction: signTransaction!,
          signAllTransactions: async (txs) => {
            return await Promise.all(txs.map(tx => signTransaction!(tx)));
          },
        } : anchor.AnchorProvider.env().wallet,
        { commitment: 'confirmed' }
      );
      
      // Create the program
      const programInstance = new Program(
        IDL,
        PROGRAM_ID,
        provider
      ) as RaffleRocketProgram;
      
      setProgram(programInstance);
      
      // Derive PDA for treasury
      const [treasuryAddress] = PublicKey.findProgramAddressSync(
        [Buffer.from(TREASURY_SEED)],
        PROGRAM_ID
      );
      setTreasuryPDA(treasuryAddress);
      
      // Derive PDA for jackpot
      const [jackpotAddress] = PublicKey.findProgramAddressSync(
        [Buffer.from(JACKPOT_SEED)],
        PROGRAM_ID
      );
      setJackpotPDA(jackpotAddress);
      
    } catch (error) {
      console.error('Error initializing raffle program:', error);
    }
  }, [connection, publicKey, signTransaction]);
  
  /**
   * Initialize a new raffle
   */
  const initialize = useCallback(async (
    nftMint: string,
    ticketPrice: number,
    ticketCap: number,
    duration: number
  ) => {
    if (!program || !publicKey || !treasuryPDA || !jackpotPDA) {
      throw new Error('Program not initialized or wallet not connected');
    }
    
    // Convert string to PublicKey
    const nftMintKey = new PublicKey(nftMint);
    
    // Find raffle PDA
    const [rafflePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(RAFFLE_SEED), nftMintKey.toBuffer()],
      PROGRAM_ID
    );
    
    // Find vault PDA
    const [vaultPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(VAULT_SEED), rafflePDA.toBuffer()],
      PROGRAM_ID
    );
    
    // Get creator's associated token account for NFT (source)
    const userTokenAccount = await getAssociatedTokenAddress(
      nftMintKey,
      publicKey
    );

    // Derive escrow ATA for the raffle PDA (destination)
    const escrowTokenAccount = await getAssociatedTokenAddress(
      nftMintKey,
      rafflePDA,
      true
    );
    
    try {
      // Call the initialize_raffle instruction
      const tx = await program.methods
        .initializeRaffle(
          new anchor.BN(ticketPrice),
          ticketCap,
          new anchor.BN(duration)
        )
        .accounts({
          raffle: rafflePDA,
          authority: publicKey,
          nftMint: nftMintKey,
          nftTokenAccount: userTokenAccount,
          escrowTokenAccount: escrowTokenAccount,
          treasury: treasuryPDA,
          vault: vaultPDA,
          jackpot: jackpotPDA,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .transaction();
      
      // Send the transaction
      const signature = await sendTransaction(tx, connection);
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      return {
        signature,
        raffleAddress: rafflePDA.toString(),
      };
    } catch (error) {
      console.error('Error initializing raffle:', error);
      throw error;
    }
  }, [program, publicKey, treasuryPDA, jackpotPDA, connection, sendTransaction]);
  
  /**
   * Buy tickets for a raffle
   */
  const buyTicket = useCallback(async (
    rafflePublicKey: string,
    quantity: number,
    paymentAmount: number
  ) => {
    if (!program || !publicKey || !connection || !jackpotPDA) {
      console.error('Program, wallet, or connection not initialized');
      return { success: false, error: new Error('Wallet not connected or program not initialized') };
    }
    
    // Convert string to PublicKey
    const rafflePDA = new PublicKey(rafflePublicKey);
    
    // Find vault PDA
    const [vaultPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(VAULT_SEED), rafflePDA.toBuffer()],
      PROGRAM_ID
    );
    
    // Find buyer stats PDA
    const [buyerStatsPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(BUYER_STATS_SEED), publicKey.toBuffer()],
      PROGRAM_ID
    );
    
    try {
      // Call the buy_ticket instruction
      const tx = await program.methods
        .buyTicket(
          quantity,
          new anchor.BN(paymentAmount)
        )
        .accounts({
          raffle: rafflePDA,
          vault: vaultPDA,
          jackpot: jackpotPDA,
          buyer: publicKey,
          buyerStats: buyerStatsPDA,
          systemProgram: SystemProgram.programId,
        })
        .transaction();
      
      // Send the transaction
      const signature = await sendTransaction(tx, connection);
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      return {
        signature,
        quantity,
        paymentAmount,
      };
    } catch (err) {
      const error = err as Error;
      console.error('Error buying ticket:', error);
      return { 
        success: false, 
        error: error,
        errorMessage: getProgramErrorMessage(error) 
      };
    }
  }, [program, publicKey, jackpotPDA, connection, sendTransaction]);
  
  /**
   * End a raffle and select a winner
   */
  const endRaffle = useCallback(async (
    rafflePublicKey: string,
    winnerPublicKey: string
  ) => {
    if (!program || !publicKey || !treasuryPDA || !jackpotPDA) {
      throw new Error('Program not initialized or wallet not connected');
    }
    
    // Convert strings to PublicKeys
    const rafflePDA = new PublicKey(rafflePublicKey);
    const winnerPDA = new PublicKey(winnerPublicKey);
    
    // Get raffle data to find NFT mint
    const raffleData = await program.account.raffle.fetch(rafflePDA);
    
    // Find vault PDA
    const [vaultPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(VAULT_SEED), rafflePDA.toBuffer()],
      PROGRAM_ID
    );
    
    // Get winner's associated token account for the NFT
    const winnerTokenAccount = await getAssociatedTokenAddress(
      raffleData.nftMint,
      winnerPDA
    );
    
    try {
      // Call the end_raffle instruction
      const tx = await program.methods
        .endRaffle()
        .accounts({
          raffle: rafflePDA,
          vault: vaultPDA,
          treasury: treasuryPDA,
          jackpot: jackpotPDA,
          winner: winnerPDA,
          winnerTokenAccount: winnerTokenAccount,
          nftTokenAccount: raffleData.nftTokenAccount,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .transaction();
      
      // Send the transaction
      const signature = await sendTransaction(tx, connection);
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      return {
        signature,
        winner: winnerPDA.toString(),
      };
    } catch (error) {
      console.error('Error ending raffle:', error);
      throw error;
    }
  }, [program, publicKey, treasuryPDA, jackpotPDA, connection, sendTransaction]);
  
  /**
   * Enable VRF for a raffle
   */
  const enableVrf = useCallback(async (
    rafflePublicKey: string
  ) => {
    if (!program || !publicKey) {
      throw new Error('Program not initialized or wallet not connected');
    }
    
    // Convert string to PublicKey
    const rafflePDA = new PublicKey(rafflePublicKey);
    
    try {
      // Call the enable_vrf instruction
      const tx = await program.methods
        .enableVrf()
        .accounts({
          raffle: rafflePDA,
          authority: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .transaction();
      
      // Send the transaction
      const signature = await sendTransaction(tx, connection);
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      return {
        signature,
      };
    } catch (error) {
      console.error('Error enabling VRF:', error);
      throw error;
    }
  }, [program, publicKey, connection, sendTransaction]);
  
  /**
   * Fetch a specific raffle
   */
  const fetchRaffle = useCallback(async (
    rafflePublicKey: string
  ) => {
    if (!program) {
      throw new Error('Program not initialized');
    }
    
    try {
      const rafflePDA = new PublicKey(rafflePublicKey);
      const raffleData = await program.account.raffle.fetch(rafflePDA);
      return raffleData;
    } catch (error) {
      console.error('Error fetching raffle:', error);
      throw error;
    }
  }, [program]);
  
  /**
   * Fetch all raffles
   */
  const fetchAllRaffles = useCallback(async () => {
    if (!program) {
      throw new Error('Program not initialized');
    }
    
    try {
      const raffles = await program.account.raffle.all();
      return raffles;
    } catch (error) {
      console.error('Error fetching all raffles:', error);
      throw error;
    }
  }, [program]);
  
  /**
   * Get the current jackpot amount
   */
  const getJackpotAmount = useCallback(async () => {
    if (!program || !jackpotPDA) {
      return 0;
    }
    
    try {
      const jackpotData = await program.account.jackpot.fetch(jackpotPDA);
      return jackpotData.totalLamports.toNumber() / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error fetching jackpot amount:', error);
      return 0;
    }
  }, [program, jackpotPDA]);
  
  return {
    initialize,
    buyTicket,
    endRaffle,
    enableVrf,
    fetchRaffle,
    fetchAllRaffles,
    getJackpotAmount,
    treasuryPDA,
    jackpotPDA,
    program
  };
}; 
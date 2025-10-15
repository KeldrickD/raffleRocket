import { Program, AnchorProvider, web3, Idl } from '@project-serum/anchor';
import { IDL } from '../idl/rafflerocket';

export interface RaffleRocket {
  program: Program;
  provider: AnchorProvider;
}

export interface RaffleData {
  publicKey: web3.PublicKey;
  ticketPrice: number;
  ticketCap: number;
  ticketsSold: number;
  nftMint: web3.PublicKey;
  nftTokenAccount: web3.PublicKey;
  creator: web3.PublicKey;
  winner: web3.PublicKey | null;
  endTime: number;
  ended: boolean;
}

export type RaffleRocketProgram = Program<Idl>;

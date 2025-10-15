import { PublicKey } from '@solana/web3.js';

export interface Raffle {
  // On-chain identifiers
  publicKey: string;
  authority: string;
  nftMint: string;
  nftTokenAccount: string;
  vault: string;
  
  // Raffle settings
  ticketPrice: number;
  ticketCap: number;
  ticketsSold: number;
  totalEntries: number;  // Accounts for bonus entries from Rocket Fuel
  startTime: number;
  endTime: number;
  
  // NFT details
  nftName: string;
  nftImage?: string;
  nftDescription?: string;
  collectionName?: string;
  collectionId?: string;
  
  // Status
  isEnded: boolean;
  winner?: string;
  endTimestamp?: number;
  isVrfEnabled: boolean;
}

export interface RaffleEntry {
  buyer: string;
  entries: number;
  timestamp: number;
}

export interface RaffleActivityItem {
  id: string;
  raffleId: string;
  type: RaffleActivityType;
  wallet: string;
  ticketCount?: number;
  bonusEntries?: number;
  timestamp: number;
  transactionSignature: string;
}

export type RaffleActivityType = 
  | 'create_raffle'
  | 'buy_ticket'
  | 'end_raffle'
  | 'claim_prize';

export interface RaffleStats {
  totalParticipants: number;
  uniqueParticipants: number;
  totalEntries: number;
  averageTicketsPerUser: number;
  rocketFuelBoost: number; // Average percentage of Rocket Fuel added
  mostActiveWallet?: {
    address: string;
    entries: number;
  };
}

export interface RaffleTicketPurchase {
  quantity: number;
  paymentAmount: number; // In lamports
}

export interface RaffleWinner {
  wallet: string;
  entries: number;
  ticketsPurchased: number;
  prizeNftMint: string;
  prizeNftName: string;
  prizeNftImage?: string;
  jackpotAmount?: number; // In SOL
  timestamp: number;
}

export interface RaffleTreasury {
  totalFees: number;
  jackpotBalance: number;
  totalRaffles: number;
  totalTicketsSold: number;
} 
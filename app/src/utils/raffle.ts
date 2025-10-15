import { PublicKey } from '@solana/web3.js';
import { formatSOL } from './format';

export interface RaffleData {
  authority: PublicKey;
  nftMint: PublicKey;
  nftTokenAccount: PublicKey;
  ticketPrice: number;
  ticketCap: number;
  ticketsSold: number;
  startTime: number;
  endTime: number;
  winner: PublicKey | null;
}

export function formatRaffleData(data: any): RaffleData {
  return {
    authority: new PublicKey(data.authority),
    nftMint: new PublicKey(data.nftMint),
    nftTokenAccount: new PublicKey(data.nftTokenAccount),
    ticketPrice: data.ticketPrice.toNumber(),
    ticketCap: data.ticketCap.toNumber(),
    ticketsSold: data.ticketsSold.toNumber(),
    startTime: data.startTime.toNumber(),
    endTime: data.endTime.toNumber(),
    winner: data.winner ? new PublicKey(data.winner) : null,
  };
}

export function getRaffleStatus(data: RaffleData): 'active' | 'ended' | 'completed' {
  const now = Date.now() / 1000;
  if (data.winner) return 'completed';
  if (now > data.endTime) return 'ended';
  return 'active';
}

export function getRaffleProgress(data: RaffleData): number {
  return (data.ticketsSold / data.ticketCap) * 100;
}

export function getRaffleTimeLeft(data: RaffleData): string {
  const now = Date.now() / 1000;
  const timeLeft = data.endTime - now;
  if (timeLeft <= 0) return 'Ended';

  const days = Math.floor(timeLeft / 86400);
  const hours = Math.floor((timeLeft % 86400) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = Math.floor(timeLeft % 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function getRafflePrice(data: RaffleData): string {
  return formatSOL(data.ticketPrice);
}

export function getRaffleTotalPrice(data: RaffleData, quantity: number): string {
  return formatSOL(data.ticketPrice * quantity);
} 
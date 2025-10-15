import { BN } from '@project-serum/anchor';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export function formatSOL(lamports: number | BN): string {
  const amount = typeof lamports === 'number' ? lamports : lamports.toNumber();
  return (amount / LAMPORTS_PER_SOL).toFixed(4);
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const parseSOL = (amount: string): number => {
  return Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL);
}; 
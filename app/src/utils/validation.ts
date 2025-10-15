import { PublicKey } from '@solana/web3.js';
import { RaffleError } from './errors';
import {
  MIN_TICKET_PRICE,
  MAX_TICKET_PRICE,
  MIN_TICKET_CAP,
  MAX_TICKET_CAP,
  MIN_DURATION,
  MAX_DURATION,
} from './constants';

export function validateTicketPrice(price: number): void {
  if (price < MIN_TICKET_PRICE) {
    throw new RaffleError(`Ticket price must be at least ${MIN_TICKET_PRICE} SOL`);
  }
  if (price > MAX_TICKET_PRICE) {
    throw new RaffleError(`Ticket price must be at most ${MAX_TICKET_PRICE} SOL`);
  }
}

export function validateTicketCap(cap: number): void {
  if (cap < MIN_TICKET_CAP) {
    throw new RaffleError(`Ticket cap must be at least ${MIN_TICKET_CAP}`);
  }
  if (cap > MAX_TICKET_CAP) {
    throw new RaffleError(`Ticket cap must be at most ${MAX_TICKET_CAP}`);
  }
}

export function validateDuration(duration: number): void {
  if (duration < MIN_DURATION) {
    throw new RaffleError(`Duration must be at least ${MIN_DURATION} seconds`);
  }
  if (duration > MAX_DURATION) {
    throw new RaffleError(`Duration must be at most ${MAX_DURATION} seconds`);
  }
}

export function validatePublicKey(address: string): PublicKey {
  try {
    return new PublicKey(address);
  } catch (error) {
    throw new RaffleError('Invalid public key');
  }
}

export function validateQuantity(quantity: number, max: number): void {
  if (quantity < 1) {
    throw new RaffleError('Quantity must be at least 1');
  }
  if (quantity > max) {
    throw new RaffleError(`Quantity must be at most ${max}`);
  }
}

export function validateRaffleParams(params: {
  ticketPrice: number;
  ticketCap: number;
  duration: number;
  nftMint: string;
  nftTokenAccount: string;
}): void {
  validateTicketPrice(params.ticketPrice);
  validateTicketCap(params.ticketCap);
  validateDuration(params.duration);
  validatePublicKey(params.nftMint);
  validatePublicKey(params.nftTokenAccount);
} 
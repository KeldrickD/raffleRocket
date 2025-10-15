'use client';

import { PublicKey } from '@solana/web3.js';

// Known error types from the Solana wallet adapter
export enum WalletErrorType {
  ConnectionError = 'ConnectionError',
  WalletNotConnected = 'WalletNotConnected',
  WalletNotFound = 'WalletNotFound',
  WalletDisconnected = 'WalletDisconnected',
  WalletSignTransactionError = 'WalletSignTransactionError',
  WalletSignMessageError = 'WalletSignMessageError',
  UnsupportedFeature = 'UnsupportedFeature',
  InsufficientFunds = 'InsufficientFunds',
  UserRejected = 'UserRejected',
  Unknown = 'Unknown',
}

// Error codes from the RaffleRocket program
export enum RaffleErrorCode {
  RaffleAlreadyEnded = 100,
  RaffleNotEnded = 101,
  NotEnoughTicketsLeft = 102,
  InvalidTicketQuantity = 103,
  InvalidPaymentAmount = 104,
  InsufficientFunds = 105,
  InvalidWinner = 106,
  AlreadyClaimed = 107,
  NoEntries = 108,
  InvalidNFT = 109,
  InvalidPrizeToken = 110,
  VRFNotEnabled = 111,
  InvalidTicketCap = 112,
  InvalidRaffleState = 113,
}

// Dictionary of user-friendly error messages for program errors
const errorMessages: Record<number, string> = {
  [RaffleErrorCode.RaffleAlreadyEnded]: 'This raffle has already ended.',
  [RaffleErrorCode.RaffleNotEnded]: 'This raffle has not ended yet.',
  [RaffleErrorCode.NotEnoughTicketsLeft]: 'There are not enough tickets left in this raffle.',
  [RaffleErrorCode.InvalidTicketQuantity]: 'The ticket quantity is invalid. Please try a different amount.',
  [RaffleErrorCode.InvalidPaymentAmount]: 'The payment amount is incorrect. Please check the ticket price and try again.',
  [RaffleErrorCode.InsufficientFunds]: 'You do not have enough SOL in your wallet to complete this transaction.',
  [RaffleErrorCode.InvalidWinner]: 'Invalid winner. The raffle may not have a winner yet.',
  [RaffleErrorCode.AlreadyClaimed]: 'The prize for this raffle has already been claimed.',
  [RaffleErrorCode.NoEntries]: 'There are no entries in this raffle.',
  [RaffleErrorCode.InvalidNFT]: 'The NFT associated with this raffle is invalid.',
  [RaffleErrorCode.InvalidPrizeToken]: 'The prize token is invalid.',
  [RaffleErrorCode.VRFNotEnabled]: 'VRF (Verifiable Random Function) is not enabled for this raffle.',
  [RaffleErrorCode.InvalidTicketCap]: 'The ticket cap for this raffle is invalid.',
  [RaffleErrorCode.InvalidRaffleState]: 'The raffle is in an invalid state for this operation.',
};

// Dictionary of user-friendly error messages for wallet errors
const walletErrorMessages: Record<string, string> = {
  [WalletErrorType.ConnectionError]: 'Could not connect to the Solana network. Please check your internet connection and try again.',
  [WalletErrorType.WalletNotConnected]: 'Your wallet is not connected. Please connect your wallet to continue.',
  [WalletErrorType.WalletNotFound]: 'Wallet not found. Please make sure you have a Solana wallet extension installed.',
  [WalletErrorType.WalletDisconnected]: 'Your wallet has been disconnected. Please reconnect to continue.',
  [WalletErrorType.WalletSignTransactionError]: 'Error signing transaction. Please try again.',
  [WalletErrorType.WalletSignMessageError]: 'Error signing message. Please try again.',
  [WalletErrorType.UnsupportedFeature]: 'This feature is not supported by your wallet.',
  [WalletErrorType.InsufficientFunds]: 'You do not have enough SOL in your wallet to complete this transaction.',
  [WalletErrorType.UserRejected]: 'Transaction rejected. You declined to authorize the transaction.',
  [WalletErrorType.Unknown]: 'An unknown error occurred. Please try again.',
};

/**
 * Extract the error code from a Solana program error message
 */
export function getProgramErrorCode(error: Error): number | null {
  if (!error.message) return null;

  // Custom error code pattern: "custom program error: 0x64" (hex) or "custom program error: 100" (decimal)
  const hexMatch = error.message.match(/custom program error: 0x([a-fA-F0-9]+)/);
  if (hexMatch) {
    return parseInt(hexMatch[1], 16);
  }

  const decimalMatch = error.message.match(/custom program error: (\d+)/);
  if (decimalMatch) {
    return parseInt(decimalMatch[1], 10);
  }

  return null;
}

/**
 * Get a user-friendly error message from a Solana program error
 */
export function getProgramErrorMessage(error: Error): string {
  const code = getProgramErrorCode(error);
  if (code !== null && errorMessages[code]) {
    return errorMessages[code];
  }
  return error.message || 'An unknown error occurred. Please try again.';
}

/**
 * Get a user-friendly error message from a wallet error
 */
export function getWalletErrorMessage(error: Error): string {
  const errorType = (error as any).name as WalletErrorType;
  if (errorType && walletErrorMessages[errorType]) {
    return walletErrorMessages[errorType];
  }
  return error.message || 'An unknown error occurred. Please try again.';
}

/**
 * Format a public key for display (truncate in the middle)
 */
export function formatPublicKey(publicKey: PublicKey | string | null | undefined): string {
  if (!publicKey) return '';
  const pkStr = publicKey.toString();
  return `${pkStr.slice(0, 4)}...${pkStr.slice(-4)}`;
}

/**
 * Format SOL amount with proper decimal places
 */
export function formatSol(lamports: number): string {
  const sol = lamports / 1e9;
  return sol.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
} 
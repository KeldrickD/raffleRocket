import { ProgramError } from '@project-serum/anchor';
import { handleTransactionError } from './error';

export class RaffleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RaffleError';
  }
}

export function handleProgramError(error: any): void {
  console.error('Program error:', error);

  if (error instanceof ProgramError) {
    const errorMessage = getErrorMessage(error.code);
    handleTransactionError(new RaffleError(errorMessage));
  } else {
    handleTransactionError(error);
  }
}

function getErrorMessage(code: number): string {
  switch (code) {
    case 6000:
      return 'Invalid ticket price';
    case 6001:
      return 'Invalid ticket cap';
    case 6002:
      return 'Invalid duration';
    case 6003:
      return 'Raffle already exists';
    case 6004:
      return 'Raffle does not exist';
    case 6005:
      return 'Raffle has ended';
    case 6006:
      return 'Raffle is not active';
    case 6007:
      return 'Invalid ticket quantity';
    case 6008:
      return 'Insufficient funds';
    case 6009:
      return 'Not the raffle authority';
    case 6010:
      return 'Raffle has not ended';
    case 6011:
      return 'Winner already selected';
    case 6012:
      return 'No winner selected';
    default:
      return 'Unknown program error';
  }
} 
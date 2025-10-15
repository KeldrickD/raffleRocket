import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { Program } from '@project-serum/anchor';
import { RAFFLE_SEED, TICKET_SEED, VAULT_SEED } from './constants';

export async function createRaffleInstruction(
  program: Program,
  params: {
    authority: PublicKey;
    nftMint: PublicKey;
    nftTokenAccount: PublicKey;
    ticketPrice: number;
    ticketCap: number;
    duration: number;
  }
): Promise<TransactionInstruction> {
  const [raffle] = await PublicKey.findProgramAddress(
    [Buffer.from(RAFFLE_SEED), params.nftMint.toBuffer()],
    program.programId
  );

  const [vault] = await PublicKey.findProgramAddress(
    [Buffer.from(VAULT_SEED), raffle.toBuffer()],
    program.programId
  );

  return program.methods
    .createRaffle(
      params.ticketPrice,
      params.ticketCap,
      params.duration
    )
    .accounts({
      authority: params.authority,
      raffle,
      nftMint: params.nftMint,
      nftTokenAccount: params.nftTokenAccount,
      vault,
    })
    .instruction();
}

export async function buyTicketsInstruction(
  program: Program,
  params: {
    buyer: PublicKey;
    raffle: PublicKey;
    quantity: number;
  }
): Promise<TransactionInstruction> {
  const [ticket] = await PublicKey.findProgramAddress(
    [
      Buffer.from(TICKET_SEED),
      params.raffle.toBuffer(),
      Buffer.from(params.quantity.toString()),
    ],
    program.programId
  );

  return program.methods
    .buyTickets(params.quantity)
    .accounts({
      buyer: params.buyer,
      raffle: params.raffle,
      ticket,
    })
    .instruction();
}

export async function endRaffleInstruction(
  program: Program,
  params: {
    authority: PublicKey;
    raffle: PublicKey;
  }
): Promise<TransactionInstruction> {
  return program.methods
    .endRaffle()
    .accounts({
      authority: params.authority,
      raffle: params.raffle,
    })
    .instruction();
} 
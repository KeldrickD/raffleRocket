import { PublicKey } from '@solana/web3.js';
import { Program } from '@project-serum/anchor';
import { RAFFLE_SEED, TICKET_SEED, VAULT_SEED } from './constants';

export async function getRafflePDA(
  program: Program,
  nftMint: PublicKey
): Promise<PublicKey> {
  const [raffle] = await PublicKey.findProgramAddress(
    [Buffer.from(RAFFLE_SEED), nftMint.toBuffer()],
    program.programId
  );
  return raffle;
}

export async function getTicketPDA(
  program: Program,
  raffle: PublicKey,
  quantity: number
): Promise<PublicKey> {
  const [ticket] = await PublicKey.findProgramAddress(
    [
      Buffer.from(TICKET_SEED),
      raffle.toBuffer(),
      Buffer.from(quantity.toString()),
    ],
    program.programId
  );
  return ticket;
}

export async function getVaultPDA(
  program: Program,
  raffle: PublicKey
): Promise<PublicKey> {
  const [vault] = await PublicKey.findProgramAddress(
    [Buffer.from(VAULT_SEED), raffle.toBuffer()],
    program.programId
  );
  return vault;
}

export async function getRaffleAccount(
  program: Program,
  nftMint: PublicKey
): Promise<any> {
  const raffle = await getRafflePDA(program, nftMint);
  return program.account.raffle.fetch(raffle);
}

export async function getTicketAccount(
  program: Program,
  raffle: PublicKey,
  quantity: number
): Promise<any> {
  const ticket = await getTicketPDA(program, raffle, quantity);
  return program.account.ticket.fetch(ticket);
}

export async function getVaultAccount(
  program: Program,
  raffle: PublicKey
): Promise<any> {
  const vault = await getVaultPDA(program, raffle);
  return program.account.vault.fetch(vault);
} 
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};
use anchor_lang::solana_program::native_token::LAMPORTS_PER_SOL;

declare_id!("EuSdiU6QdDUA3LigqQJUs6d7aQm9zJjPTXdK1vH1pUs3");

#[program]
pub mod rafflerocket {
    use super::*;

    pub fn initialize_raffle(
        ctx: Context<InitializeRaffle>,
        ticket_price: u64,
        ticket_cap: u32,
        duration: i64,
    ) -> Result<()> {
        let treasury = &mut ctx.accounts.treasury;
        let vault = &mut ctx.accounts.vault;
        let jackpot = &mut ctx.accounts.jackpot;

        // Initialize raffle state
        ctx.accounts.raffle.authority = ctx.accounts.authority.key();
        ctx.accounts.raffle.ticket_price = ticket_price;
        ctx.accounts.raffle.ticket_cap = ticket_cap;
        ctx.accounts.raffle.tickets_sold = 0;
        ctx.accounts.raffle.total_entries = 0;
        ctx.accounts.raffle.start_time = Clock::get()?.unix_timestamp;
        ctx.accounts.raffle.end_time = ctx.accounts.raffle.start_time + duration;
        ctx.accounts.raffle.nft_mint = ctx.accounts.nft_mint.key();
        // Escrow will be the raffle PDA's ATA for the NFT
        ctx.accounts.raffle.nft_token_account = ctx.accounts.escrow_token_account.key();
        ctx.accounts.raffle.winner = None;
        ctx.accounts.raffle.bump = ctx.bumps.raffle;
        ctx.accounts.raffle.is_vrf_enabled = false; // Will be updated when VRF is fully integrated

        // Initialize jackpot if it's a new account
        if jackpot.total_lamports == 0 {
            jackpot.total_lamports = 0;
            jackpot.bump = ctx.bumps.jackpot;
        }

        // Transfer initial fee to treasury
        let initial_fee = (0.05 * LAMPORTS_PER_SOL as f64) as u64;
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.authority.to_account_info(),
                    to: treasury.to_account_info(),
                },
            ),
            initial_fee,
        )?;

        // Record PDA bump for vault for future signer usage
        vault.bump = ctx.bumps.vault;

        // Move the NFT from user's account into escrow (raffle's ATA)
        anchor_spl::token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Transfer {
                    from: ctx.accounts.nft_token_account.to_account_info(),
                    to: ctx.accounts.escrow_token_account.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
            ),
            1,
        )?;

        Ok(())
    }

    pub fn buy_ticket(ctx: Context<BuyTicket>, quantity: u32, payment_amount: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let jackpot = &mut ctx.accounts.jackpot;
        let buyer = &ctx.accounts.buyer;
        let buyer_stats = &mut ctx.accounts.buyer_stats;

        // Validate raffle state
        require!(
            ctx.accounts.raffle.tickets_sold + quantity <= ctx.accounts.raffle.ticket_cap,
            RaffleError::TicketCapReached
        );
        require!(
            Clock::get()?.unix_timestamp < ctx.accounts.raffle.end_time,     
            RaffleError::RaffleEnded
        );

        // Calculate minimum required payment
        let min_cost = ctx.accounts.raffle.ticket_price * quantity as u64;
        
        // Validate payment amount
        require!(
            payment_amount >= min_cost,
            RaffleError::InsufficientPayment
        );

        // Calculate Rocket Fuel bonus entries
        let mut bonus_entries = 0;
        if payment_amount > min_cost {
            let excess_payment = payment_amount - min_cost;
            // Every 10% extra payment gives 1 bonus entry
            bonus_entries = ((excess_payment as f64 / min_cost as f64) * 10.0) as u32;
        }
        let total_entries = quantity + bonus_entries;

        // Transfer SOL to vault
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: buyer.to_account_info(),
                    to: vault.to_account_info(),
                },
            ),
            payment_amount,
        )?;

        // Calculate jackpot contribution (0.5% of payment)
        let jackpot_amount = payment_amount * 5 / 1000; // 0.5%
        
        // Transfer jackpot contribution from vault to jackpot (vault signs as PDA)
        let vault_bump = vault.bump;
        let raffle_key = ctx.accounts.raffle.key();
        let signer_seeds: &[&[u8]] = &[b"vault", raffle_key.as_ref(), &[vault_bump]];
        anchor_lang::system_program::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: vault.to_account_info(),
                    to: jackpot.to_account_info(),
                },
                &[signer_seeds],
            ),
            jackpot_amount,
        )?;
        
        // Update jackpot amount
        jackpot.total_lamports = jackpot.total_lamports.checked_add(jackpot_amount).unwrap();

        // Update raffle state
        ctx.accounts.raffle.tickets_sold += quantity;
        ctx.accounts.raffle.total_entries += total_entries;

        // Update buyer stats
        buyer_stats.total_tickets += quantity;
        buyer_stats.total_entries += total_entries;
        buyer_stats.total_spent += payment_amount;
        
        // Add entry to raffle entries
        let entry = RaffleEntry {
            buyer: buyer.key(),
            entries: total_entries,
            timestamp: Clock::get()?.unix_timestamp,
        };
        ctx.accounts.raffle.entries.push(entry);

        // Do not auto-end raffle here; end is triggered externally

        Ok(())
    }

    pub fn end_raffle(ctx: Context<EndRaffle>) -> Result<()> {
        let winner = &ctx.accounts.winner;
        let winner_token_account = &ctx.accounts.winner_token_account;
        let vault = &mut ctx.accounts.vault;
        let treasury = &mut ctx.accounts.treasury;
        let jackpot = &mut ctx.accounts.jackpot;

        // Validate raffle state
        require!(
            Clock::get()?.unix_timestamp >= ctx.accounts.raffle.end_time || ctx.accounts.raffle.tickets_sold >= ctx.accounts.raffle.ticket_cap,    
            RaffleError::RaffleNotEnded
        );
        require!(ctx.accounts.raffle.winner.is_none(), RaffleError::RaffleAlreadyEnded);

        // Calculate treasury fee (2% of total sales)
        let total_sales = ctx.accounts.raffle.ticket_price * ctx.accounts.raffle.tickets_sold as u64;
        let treasury_fee = total_sales * 2 / 100;

        // Transfer treasury fee (vault signs as PDA)
        let vault_bump = vault.bump;
        let raffle_key = ctx.accounts.raffle.key();
        let signer_seeds: &[&[u8]] = &[b"vault", raffle_key.as_ref(), &[vault_bump]];
        anchor_lang::system_program::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: vault.to_account_info(),
                    to: treasury.to_account_info(),
                },
                &[signer_seeds],
            ),
            treasury_fee,
        )?;

        // Select winner based on entries (will be replaced with VRF later)
        let winner_pubkey = if ctx.accounts.raffle.is_vrf_enabled {
            // Placeholder for VRF integration
            select_winner_with_vrf(&ctx.accounts.raffle)?
        } else {
            // Fallback to timestamp-based selection
            select_winner_with_timestamp(&ctx.accounts.raffle)?
        };
        
        // Validate winner matches the provided account
        require!(
            winner.key() == winner_pubkey,
            RaffleError::InvalidWinner
        );

        // Transfer NFT from escrow (raffle ATA) to winner using raffle PDA as authority
        let raffle_bump = ctx.accounts.raffle.bump;
        let raffle_mint_key = ctx.accounts.raffle.nft_mint;
        let raffle_signer_seeds: &[&[u8]] = &[b"raffle", raffle_mint_key.as_ref(), &[raffle_bump]];
        anchor_spl::token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Transfer {
                    from: ctx.accounts.nft_token_account.to_account_info(),
                    to: winner_token_account.to_account_info(),
                    authority: ctx.accounts.raffle.to_account_info(),
                },
                &[raffle_signer_seeds],
            ),
            1,
        )?;

        // Award jackpot to winner (25% of current jackpot)
        let jackpot_award = jackpot.total_lamports * 25 / 100;
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: jackpot.to_account_info(),
                    to: winner.to_account_info(),
                },
            ),
            jackpot_award,
        )?;
        
        // Update jackpot amount
        ctx.accounts.jackpot.total_lamports = ctx.accounts.jackpot.total_lamports.checked_sub(jackpot_award).unwrap();

        // Update raffle state
        let raffle = &mut ctx.accounts.raffle;
        raffle.winner = Some(winner.key());
        raffle.end_timestamp = Clock::get()?.unix_timestamp;

        Ok(())
    }
    
    // New function to enable VRF for a raffle (to be implemented with Switchboard)
    pub fn enable_vrf(ctx: Context<EnableVrf>) -> Result<()> {
        let raffle = &mut ctx.accounts.raffle;
        
        // Only raffle authority can enable VRF
        require!(
            ctx.accounts.authority.key() == raffle.authority,
            RaffleError::Unauthorized
        );
        
        // Only enable VRF before raffle starts selling tickets
        require!(
            raffle.tickets_sold == 0,
            RaffleError::RaffleInProgress
        );
        
        raffle.is_vrf_enabled = true;
        
        Ok(())
    }
}

// Helper function for timestamp-based winner selection
fn select_winner_with_timestamp(raffle: &Raffle) -> Result<Pubkey> {
    if raffle.entries.is_empty() {
        return Err(RaffleError::NoParticipants.into());
    }
    
    // Use timestamp as seed for pseudo-random selection
    let clock = Clock::get()?;
    let random_seed = clock.unix_timestamp as u64 + clock.slot;
    
    // Calculate weighted selection based on entries
    let total_entries = raffle.total_entries as u64;
    let random_entry = random_seed % total_entries;
    
    let mut entry_count = 0;
    for entry in &raffle.entries {
        entry_count += entry.entries as u64;
        if entry_count > random_entry {
            return Ok(entry.buyer);
        }
    }
    
    // Fallback to the first entry (should never happen)
    Ok(raffle.entries[0].buyer)
}

// Placeholder for VRF-based winner selection
fn select_winner_with_vrf(raffle: &Raffle) -> Result<Pubkey> {
    // This will be replaced with actual VRF implementation
    // For now, fall back to timestamp method
    select_winner_with_timestamp(raffle)
}

#[derive(Accounts)]
#[instruction(ticket_price: u64, ticket_cap: u32, duration: i64)]
pub struct InitializeRaffle<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Raffle::LEN,
        seeds = [b"raffle", nft_mint.key().as_ref()],
        bump
    )]
    pub raffle: Account<'info, Raffle>,

    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: This is the NFT mint that will be raffled
    pub nft_mint: Account<'info, Mint>,

    /// CHECK: This is the token account holding the NFT
    pub nft_token_account: Account<'info, TokenAccount>,

    // Program-owned escrow ATA to hold the NFT during the raffle
    #[account(
        init,
        payer = authority,
        associated_token::mint = nft_mint,
        associated_token::authority = raffle,
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + Treasury::LEN,
        seeds = [b"treasury"],
        bump
    )]
    pub treasury: Account<'info, Treasury>,

    #[account(
        init,
        payer = authority,
        space = 8 + Vault::LEN,
        seeds = [b"vault", raffle.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,
    
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + Jackpot::LEN,
        seeds = [b"jackpot"],
        bump
    )]
    pub jackpot: Account<'info, Jackpot>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct BuyTicket<'info> {
    #[account(mut)]
    pub raffle: Account<'info, Raffle>,

    #[account(mut)]
    pub vault: Account<'info, Vault>,
    
    #[account(
        mut,
        seeds = [b"jackpot"],
        bump = jackpot.bump
    )]
    pub jackpot: Account<'info, Jackpot>,

    #[account(mut)]
    pub buyer: Signer<'info>,
    
    #[account(
        init_if_needed,
        payer = buyer,
        space = 8 + BuyerStats::LEN,
        seeds = [b"buyer_stats", buyer.key().as_ref()],
        bump
    )]
    pub buyer_stats: Account<'info, BuyerStats>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct EndRaffle<'info> {
    #[account(mut)]
    pub raffle: Account<'info, Raffle>,

    #[account(mut)]
    pub vault: Account<'info, Vault>,

    #[account(mut)]
    pub treasury: Account<'info, Treasury>,
    
    #[account(
        mut,
        seeds = [b"jackpot"],
        bump = jackpot.bump
    )]
    pub jackpot: Account<'info, Jackpot>,

    /// CHECK: This is the winner's wallet
    #[account(mut)]
    pub winner: AccountInfo<'info>,

    // Winner's token account for receiving the NFT (must exist)
    #[account(mut, constraint = winner_token_account.mint == raffle.nft_mint)]
    pub winner_token_account: Account<'info, TokenAccount>,

    /// CHECK: This is the NFT token account
    pub nft_token_account: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct EnableVrf<'info> {
    #[account(mut)]
    pub raffle: Account<'info, Raffle>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct RaffleEntry {
    pub buyer: Pubkey,
    pub entries: u32,
    pub timestamp: i64,
}

#[account]
pub struct Raffle {
    pub authority: Pubkey,
    pub ticket_price: u64,
    pub ticket_cap: u32,
    pub tickets_sold: u32,
    pub total_entries: u32,
    pub start_time: i64,
    pub end_time: i64,
    pub end_timestamp: i64,
    pub nft_mint: Pubkey,
    pub nft_token_account: Pubkey,
    pub winner: Option<Pubkey>,
    pub entries: Vec<RaffleEntry>,
    pub is_vrf_enabled: bool,
    pub bump: u8,
}

#[account]
pub struct Treasury {
    pub bump: u8,
}

#[account]
pub struct Vault {
    pub bump: u8,
}

#[account]
pub struct Jackpot {
    pub total_lamports: u64,
    pub bump: u8,
}

#[account]
pub struct BuyerStats {
    pub buyer: Pubkey,
    pub total_tickets: u32,
    pub total_entries: u32,
    pub total_spent: u64,
    pub total_won: u32,
    pub bump: u8,
}

impl Raffle {
    pub const LEN: usize = 32 + 8 + 4 + 4 + 4 + 8 + 8 + 8 + 32 + 32 + 33 + 4 + (40 * 100) + 1 + 1; // Allow for up to 100 entries
}

impl Treasury {
    pub const LEN: usize = 1;
}

impl Vault {
    pub const LEN: usize = 1;
}

impl Jackpot {
    pub const LEN: usize = 8 + 1;
}

impl BuyerStats {
    pub const LEN: usize = 32 + 4 + 4 + 8 + 4 + 1;
}

#[error_code]
pub enum RaffleError {
    #[msg("Ticket cap has been reached")]
    TicketCapReached,

    #[msg("Raffle has ended")]
    RaffleEnded,

    #[msg("Raffle has not ended yet")]
    RaffleNotEnded,
    
    #[msg("Raffle has already ended")]
    RaffleAlreadyEnded,
    
    #[msg("Insufficient payment for tickets")]
    InsufficientPayment,
    
    #[msg("No participants in raffle")]
    NoParticipants,
    
    #[msg("Invalid winner account provided")]
    InvalidWinner,
    
    #[msg("Unauthorized action")]
    Unauthorized,
    
    #[msg("Raffle already in progress")]
    RaffleInProgress,
} 
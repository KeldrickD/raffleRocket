import { apiClient } from './apiClient';
import { Connection, PublicKey } from '@solana/web3.js';
import { Raffle, RaffleEntry, RaffleActivityItem, RaffleStats, RaffleWinner } from '@/types/raffle';
import { useRaffleProgram } from '@/hooks/useRaffleProgram';

class RaffleService {
  private connection: Connection;
  
  constructor() {
    // Initialize connection to Solana network
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
    this.connection = new Connection(rpcUrl);
  }
  
  /**
   * Fetch all active raffles
   */
  public async getAllRaffles(): Promise<Raffle[]> {
    try {
      const response = await apiClient.get('/raffles');
      return response.data;
    } catch (error) {
      console.error('Error fetching raffles:', error);
      return [];
    }
  }
  
  /**
   * Fetch active raffles with optional filters
   */
  public async getRaffles(options: {
    status?: 'active' | 'ended' | 'all';
    sort?: 'ending-soon' | 'newest' | 'popularity';
    limit?: number;
    offset?: number;
    collectionId?: string;
  } = {}): Promise<Raffle[]> {
    try {
      const response = await apiClient.get('/raffles', { params: options });
      return response.data;
    } catch (error) {
      console.error('Error fetching filtered raffles:', error);
      return [];
    }
  }
  
  /**
   * Get a single raffle by its public key
   */
  public async getRaffleByPublicKey(publicKey: string): Promise<Raffle | null> {
    try {
      const response = await apiClient.get(`/raffles/${publicKey}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching raffle ${publicKey}:`, error);
      return null;
    }
  }
  
  /**
   * Get entries for a specific raffle
   */
  public async getRaffleEntries(rafflePublicKey: string): Promise<RaffleEntry[]> {
    try {
      const response = await apiClient.get(`/raffles/${rafflePublicKey}/entries`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching entries for raffle ${rafflePublicKey}:`, error);
      return [];
    }
  }
  
  /**
   * Get activity for a specific raffle
   */
  public async getRaffleActivity(
    rafflePublicKey: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<RaffleActivityItem[]> {
    try {
      const response = await apiClient.get(`/raffles/${rafflePublicKey}/activity`, {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching activity for raffle ${rafflePublicKey}:`, error);
      return [];
    }
  }
  
  /**
   * Get statistics for a specific raffle
   */
  public async getRaffleStats(rafflePublicKey: string): Promise<RaffleStats | null> {
    try {
      const response = await apiClient.get(`/raffles/${rafflePublicKey}/stats`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching stats for raffle ${rafflePublicKey}:`, error);
      return null;
    }
  }
  
  /**
   * Get winner information for a specific raffle
   */
  public async getRaffleWinner(rafflePublicKey: string): Promise<RaffleWinner | null> {
    try {
      const response = await apiClient.get(`/raffles/${rafflePublicKey}/winner`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching winner for raffle ${rafflePublicKey}:`, error);
      return null;
    }
  }
  
  /**
   * Get raffles created by a specific wallet
   */
  public async getRafflesByCreator(creatorAddress: string): Promise<Raffle[]> {
    try {
      const response = await apiClient.get(`/raffles/creator/${creatorAddress}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching raffles created by ${creatorAddress}:`, error);
      return [];
    }
  }
  
  /**
   * Get raffles a user has participated in
   */
  public async getRafflesByParticipant(participantAddress: string): Promise<Raffle[]> {
    try {
      const response = await apiClient.get(`/raffles/participant/${participantAddress}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching raffles participated by ${participantAddress}:`, error);
      return [];
    }
  }
  
  /**
   * Get current jackpot amount
   */
  public async getJackpotAmount(): Promise<number> {
    try {
      const response = await apiClient.get('/jackpot');
      return response.data.amount;
    } catch (error) {
      console.error('Error fetching jackpot amount:', error);
      return 0;
    }
  }
  
  /**
   * Get past jackpot winners
   */
  public async getJackpotWinners(limit: number = 10): Promise<{
    wallet: string;
    amount: number;
    timestamp: number;
  }[]> {
    try {
      const response = await apiClient.get('/jackpot/winners', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching jackpot winners:', error);
      return [];
    }
  }
  
  /**
   * Subscribe to real-time updates for a specific raffle
   */
  public subscribeToRaffleUpdates(
    rafflePublicKey: string, 
    callback: (data: any) => void
  ): () => void {
    // This will be implemented with WebSockets
    // For now just return an empty unsubscribe function
    return () => {};
  }
}

// Export a singleton instance
const raffleService = new RaffleService();
export default raffleService; 
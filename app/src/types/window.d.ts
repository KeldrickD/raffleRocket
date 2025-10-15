interface Window {
  solana?: {
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    isConnected: boolean;
  };
} 
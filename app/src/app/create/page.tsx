'use client';

import { Box, Container, Heading, Text } from '@chakra-ui/react';
import { CreateRaffleForm } from '@/components/raffle/CreateRaffleForm';
import { useWallet } from '@solana/wallet-adapter-react';

export default function CreateRafflePage() {
  const { connected } = useWallet();

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <Heading as="h1" size="xl" mb={2}>
          Create a Raffle
        </Heading>
        <Text fontSize="lg" color="gray.600">
          Set up a new NFT raffle in just a few steps
        </Text>
      </Box>

      {connected ? (
        <CreateRaffleForm />
      ) : (
        <Box 
          p={8} 
          bg="white" 
          borderRadius="lg" 
          boxShadow="sm" 
          textAlign="center"
        >
          <Text fontSize="xl">
            Please connect your wallet to create a raffle
          </Text>
        </Box>
      )}
    </Container>
  );
} 
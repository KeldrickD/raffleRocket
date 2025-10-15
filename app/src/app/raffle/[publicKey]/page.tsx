'use client';

import { useParams } from 'next/navigation';
import { Box, Container, Grid, GridItem } from '@chakra-ui/react';
import { useRaffleState } from '@/hooks/useRaffleState';
import { RaffleResults } from '@/components/raffle/RaffleResults';
import { RaffleSocialSharing } from '@/components/raffle/RaffleSocialSharing';
import { RaffleStatistics } from '@/components/raffle/RaffleStatistics';
import { RaffleActivityFeed } from '@/components/raffle/RaffleActivityFeed';
import { JackpotDisplay } from '@/components/raffle/JackpotDisplay';

export default function RaffleDetailPage() {
  const params = useParams();
  const rafflePublicKey = params.publicKey as string;
  const { raffle, loading, error, jackpotAmount } = useRaffleState(rafflePublicKey);

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center">Loading...</Box>
      </Container>
    );
  }

  if (error || !raffle) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center" color="red.500">
          {error || 'Raffle not found'}
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
        <GridItem>
          <Box bg="white" borderRadius="lg" boxShadow="sm" p={6}>
            <RaffleResults raffle={raffle} />
          </Box>
        </GridItem>
        <GridItem>
          <Box bg="white" borderRadius="lg" boxShadow="sm" p={6}>
            <JackpotDisplay raffle={raffle} jackpotAmount={jackpotAmount} />
          </Box>
        </GridItem>
        <GridItem>
          <Box bg="white" borderRadius="lg" boxShadow="sm" p={6}>
            <RaffleStatistics raffle={raffle} />
          </Box>
        </GridItem>
        <GridItem>
          <Box bg="white" borderRadius="lg" boxShadow="sm" p={6}>
            <RaffleSocialSharing
              rafflePublicKey={rafflePublicKey}
              raffleName="NFT Raffle"
              nftImage="/placeholder-nft.png"
            />
          </Box>
        </GridItem>
        <GridItem colSpan={{ base: 1, lg: 2 }}>
          <Box bg="white" borderRadius="lg" boxShadow="sm" p={6}>
            <RaffleActivityFeed raffle={raffle} />
          </Box>
        </GridItem>
      </Grid>
    </Container>
  );
} 
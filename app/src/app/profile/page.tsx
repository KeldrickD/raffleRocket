'use client';

import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { Box, Container, Heading, Tabs, TabsList, TabsPanels, TabsTab, TabsPanel, useColorModeValue, Text, VStack, HStack, Badge, SimpleGrid, Stat, StatLabel, StatNumber } from '@chakra-ui/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRaffleProgram } from '@/hooks/useRaffleProgram';
import { RaffleAccount } from '@/idl/types';

export default function ProfilePage() {
  const { publicKey } = useWallet();
  const { program } = useRaffleProgram();
  const bgColor = useColorModeValue('white', 'gray.800');

  if (!publicKey) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center">
          <Heading size="lg">Please connect your wallet to view your profile</Heading>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Box bg={bgColor} borderRadius="lg" boxShadow="sm" p={6}>
        <Heading size="lg" mb={6}>
          Profile
        </Heading>
        <Tabs>
          <TabsList>
            <TabsTab>Created Raffles</TabsTab>
            <TabsTab>Participated Raffles</TabsTab>
            <TabsTab>Statistics</TabsTab>
          </TabsList>
          <TabsPanels>
            <TabsPanel>
              <CreatedRafflesList walletAddress={publicKey} />
            </TabsPanel>
            <TabsPanel>
              <ParticipatedRafflesList walletAddress={publicKey} />
            </TabsPanel>
            <TabsPanel>
              <UserStatistics walletAddress={publicKey} />
            </TabsPanel>
          </TabsPanels>
        </Tabs>
      </Box>
    </Container>
  );
}

interface CreatedRafflesListProps {
  walletAddress: PublicKey;
}

const CreatedRafflesList = ({ walletAddress }: CreatedRafflesListProps) => {
  const { program } = useRaffleProgram();
  const [raffles, setRaffles] = useState<RaffleAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRaffles = async () => {
      if (!program) return;

      try {
        const raffles = await program.account.raffle.all([
          {
            memcmp: {
              offset: 8, // Skip discriminator
              bytes: walletAddress.toBase58(),
            },
          },
        ]);
        setRaffles(raffles.map((r) => r.account));
      } catch (error) {
        console.error('Error fetching created raffles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRaffles();
  }, [program, walletAddress]);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (raffles.length === 0) {
    return <Text>You haven't created any raffles yet.</Text>;
  }

  return (
    <VStack spacing={4} align="stretch">
      {raffles.map((raffle) => (
        <RaffleCard key={raffle.publicKey.toString()} raffle={raffle} />
      ))}
    </VStack>
  );
};

interface ParticipatedRafflesListProps {
  walletAddress: PublicKey;
}

const ParticipatedRafflesList = ({ walletAddress }: ParticipatedRafflesListProps) => {
  const { program } = useRaffleProgram();
  const [raffles, setRaffles] = useState<RaffleAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRaffles = async () => {
      if (!program) return;

      try {
        const raffles = await program.account.raffle.all();
        const participatedRaffles = raffles
          .map((r) => r.account)
          .filter((raffle) =>
            raffle.entries.some((entry) => entry.buyer.equals(walletAddress))
          );
        setRaffles(participatedRaffles);
      } catch (error) {
        console.error('Error fetching participated raffles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRaffles();
  }, [program, walletAddress]);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (raffles.length === 0) {
    return <Text>You haven't participated in any raffles yet.</Text>;
  }

  return (
    <VStack spacing={4} align="stretch">
      {raffles.map((raffle) => (
        <RaffleCard key={raffle.publicKey.toString()} raffle={raffle} />
      ))}
    </VStack>
  );
};

interface UserStatisticsProps {
  walletAddress: PublicKey;
}

const UserStatistics = ({ walletAddress }: UserStatisticsProps) => {
  const { program } = useRaffleProgram();
  const [stats, setStats] = useState({
    totalTickets: 0,
    totalSpent: 0,
    rafflesWon: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!program) return;

      try {
        const raffles = await program.account.raffle.all();
        let totalTickets = 0;
        let totalSpent = 0;
        let rafflesWon = 0;

        raffles.forEach(({ account: raffle }) => {
          const userEntries = raffle.entries.filter((entry) =>
            entry.buyer.equals(walletAddress)
          );
          const tickets = userEntries.reduce((sum, entry) => sum + entry.entries, 0);
          totalTickets += tickets;
          totalSpent += tickets * raffle.ticketPrice.toNumber();

          if (raffle.winner?.equals(walletAddress)) {
            rafflesWon++;
          }
        });

        setStats({
          totalTickets,
          totalSpent: totalSpent / 1e9, // Convert lamports to SOL
          rafflesWon,
        });
      } catch (error) {
        console.error('Error fetching user statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [program, walletAddress]);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
      <Stat>
        <StatLabel>Total Tickets</StatLabel>
        <StatNumber>{stats.totalTickets}</StatNumber>
      </Stat>
      <Stat>
        <StatLabel>Total Spent</StatLabel>
        <StatNumber>{stats.totalSpent.toFixed(2)} SOL</StatNumber>
      </Stat>
      <Stat>
        <StatLabel>Raffles Won</StatLabel>
        <StatNumber>{stats.rafflesWon}</StatNumber>
      </Stat>
    </SimpleGrid>
  );
};

interface RaffleCardProps {
  raffle: RaffleAccount;
}

const RaffleCard = ({ raffle }: RaffleCardProps) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      p={4}
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="md"
    >
      <VStack align="stretch" spacing={2}>
        <HStack justify="space-between">
          <Text fontWeight="medium">Raffle #{raffle.publicKey.toString().slice(0, 4)}</Text>
          <Badge colorScheme={raffle.winner ? 'green' : 'yellow'}>
            {raffle.winner ? 'Completed' : 'In Progress'}
          </Badge>
        </HStack>
        <Text fontSize="sm">
          {raffle.ticketsSold} / {raffle.ticketCap} tickets sold
        </Text>
        <Text fontSize="sm">
          Ticket Price: {(raffle.ticketPrice.toNumber() / 1e9).toFixed(2)} SOL
        </Text>
      </VStack>
    </Box>
  );
}; 
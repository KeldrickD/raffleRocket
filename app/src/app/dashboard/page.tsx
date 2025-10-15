'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  Button,
  Flex,
  Grid,
  Badge,
  Stack,
  Divider
} from '@chakra-ui/react';
import { useWallet } from '@solana/wallet-adapter-react';
import NextLink from 'next/link';
import { RaffleCard } from '@/components/raffle/RaffleCard';
import { useUserRaffles } from '@/hooks/useUserRaffles';

export default function DashboardPage() {
  const { connected } = useWallet();
  const { createdRaffles, participatedRaffles, winningRaffles, loading, error } = useUserRaffles();
  const [tabIndex, setTabIndex] = useState(0);

  if (!connected) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box bg="white" p={8} borderRadius="lg" boxShadow="sm" textAlign="center">
          <Heading as="h2" size="lg" mb={4}>
            Connect Your Wallet
          </Heading>
          <Text mb={6}>
            Please connect your wallet to view your dashboard and manage your raffles.
          </Text>
          <Button colorScheme="blue" size="lg">
            Connect Wallet
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <Heading as="h1" size="xl" mb={2}>
          Your Dashboard
        </Heading>
        <Text fontSize="lg" color="gray.600">
          Manage your raffles and track your winnings
        </Text>
      </Box>

      {error && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          {error.message || 'An error occurred while loading your data.'}
        </Alert>
      )}

      <Tabs 
        variant="soft-rounded" 
        colorScheme="blue" 
        index={tabIndex} 
        onChange={setTabIndex}
        isLazy
      >
        <TabList mb={6}>
          <Tab>Raffles You Created ({createdRaffles.length})</Tab>
          <Tab>Tickets Purchased ({participatedRaffles.length})</Tab>
          <Tab>Winnings ({winningRaffles.length})</Tab>
        </TabList>

        <TabPanels>
          {/* Created Raffles Tab */}
          <TabPanel p={0}>
            {loading ? (
              <Box textAlign="center" py={10}>Loading your created raffles...</Box>
            ) : createdRaffles.length === 0 ? (
              <Box bg="white" p={8} borderRadius="lg" boxShadow="sm" textAlign="center">
                <Heading as="h3" size="md" mb={4}>
                  You haven't created any raffles yet
                </Heading>
                <Text mb={6}>
                  Create your first raffle to start earning from your NFTs
                </Text>
                <NextLink href="/create" passHref>
                  <Button as="a" colorScheme="blue" size="lg">
                    Create a Raffle
                  </Button>
                </NextLink>
              </Box>
            ) : (
              <Grid 
                templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} 
                gap={6}
              >
                {createdRaffles.map(raffle => (
                  <RaffleCard 
                    key={raffle.publicKey.toString()} 
                    raffle={raffle} 
                    showActions 
                  />
                ))}
              </Grid>
            )}
          </TabPanel>

          {/* Tickets Purchased Tab */}
          <TabPanel p={0}>
            {loading ? (
              <Box textAlign="center" py={10}>Loading your tickets...</Box>
            ) : participatedRaffles.length === 0 ? (
              <Box bg="white" p={8} borderRadius="lg" boxShadow="sm" textAlign="center">
                <Heading as="h3" size="md" mb={4}>
                  You haven't purchased any tickets yet
                </Heading>
                <Text mb={6}>
                  Browse available raffles and buy tickets for a chance to win
                </Text>
                <NextLink href="/raffles" passHref>
                  <Button as="a" colorScheme="blue" size="lg">
                    Browse Raffles
                  </Button>
                </NextLink>
              </Box>
            ) : (
              <Stack spacing={6}>
                {participatedRaffles.map(entry => (
                  <Box 
                    key={`${entry.raffle.publicKey.toString()}-${entry.entry.timestamp}`}
                    bg="white" 
                    p={6} 
                    borderRadius="lg" 
                    boxShadow="sm"
                  >
                    <Flex direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }} justify="space-between">
                      <Box mb={{ base: 4, md: 0 }}>
                        <Flex align="center" mb={2}>
                          <Heading as="h3" size="md" mr={2}>
                            {entry.raffle.name}
                          </Heading>
                          <Badge colorScheme={entry.raffle.isActive ? 'green' : 'red'}>
                            {entry.raffle.isActive ? 'Active' : 'Ended'}
                          </Badge>
                        </Flex>
                        <Text color="gray.600" mb={2}>
                          Tickets Purchased: {entry.entry.tickets}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          Purchase Date: {new Date(entry.entry.timestamp * 1000).toLocaleDateString()}
                        </Text>
                      </Box>
                      <NextLink href={`/raffle/${entry.raffle.publicKey.toString()}`} passHref>
                        <Button as="a" variant="outline" colorScheme="blue">
                          View Raffle
                        </Button>
                      </NextLink>
                    </Flex>
                  </Box>
                ))}
              </Stack>
            )}
          </TabPanel>

          {/* Winnings Tab */}
          <TabPanel p={0}>
            {loading ? (
              <Box textAlign="center" py={10}>Loading your winnings...</Box>
            ) : winningRaffles.length === 0 ? (
              <Box bg="white" p={8} borderRadius="lg" boxShadow="sm" textAlign="center">
                <Heading as="h3" size="md" mb={4}>
                  You haven't won any raffles yet
                </Heading>
                <Text mb={6}>
                  Keep participating for a chance to win amazing NFTs
                </Text>
                <NextLink href="/raffles" passHref>
                  <Button as="a" colorScheme="blue" size="lg">
                    Browse Raffles
                  </Button>
                </NextLink>
              </Box>
            ) : (
              <Stack spacing={6}>
                {winningRaffles.map(raffle => (
                  <Box 
                    key={raffle.publicKey.toString()}
                    bg="white" 
                    p={6} 
                    borderRadius="lg" 
                    boxShadow="sm"
                  >
                    <Flex direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }} justify="space-between">
                      <Box mb={{ base: 4, md: 0 }}>
                        <Heading as="h3" size="md" mb={2}>
                          {raffle.name}
                        </Heading>
                        <Text color="gray.600" mb={2}>
                          NFT Prize: {raffle.nftName}
                        </Text>
                        <Badge colorScheme="green" mb={2}>
                          Winner!
                        </Badge>
                        <Text fontSize="sm" color="gray.500">
                          Draw Date: {new Date(raffle.endTime * 1000).toLocaleDateString()}
                        </Text>
                      </Box>
                      <Stack spacing={3}>
                        <NextLink href={`/raffle/${raffle.publicKey.toString()}`} passHref>
                          <Button as="a" variant="outline" colorScheme="blue">
                            View Raffle
                          </Button>
                        </NextLink>
                        {!raffle.claimed && (
                          <Button colorScheme="green">
                            Claim Prize
                          </Button>
                        )}
                      </Stack>
                    </Flex>
                  </Box>
                ))}
              </Stack>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
} 
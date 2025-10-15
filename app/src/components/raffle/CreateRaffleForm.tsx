import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { useRaffleProgram } from '@/hooks/useRaffleProgram';
import { 
  Box, 
  Button, 
  FormControl, 
  FormLabel, 
  Input, 
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Heading,
  Text,
  VStack,
  HStack,
  Image,
  Divider,
  useToast,
  Spinner,
  InputGroup,
  InputRightAddon
} from '@chakra-ui/react';
import { useUserNFTs } from '@/hooks/useUserNFTs';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export const CreateRaffleForm: React.FC = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const toast = useToast();
  const { initialize } = useRaffleProgram();
  const { nfts, loading: loadingNFTs, refresh: refreshNFTs } = useUserNFTs();
  
  const [selectedNFT, setSelectedNFT] = useState<string | null>(null);
  const [ticketPrice, setTicketPrice] = useState<number>(0.1);
  const [ticketCap, setTicketCap] = useState<number>(100);
  const [duration, setDuration] = useState<number>(24); // hours
  const [loading, setLoading] = useState<boolean>(false);
  const [estimatedFee, setEstimatedFee] = useState<number>(0.05);

  useEffect(() => {
    if (wallet.connected) {
      refreshNFTs();
    }
  }, [wallet.connected, refreshNFTs]);

  // Calculate potential earnings
  const totalSales = ticketPrice * ticketCap;
  const treasuryFee = totalSales * 0.02; // 2%
  const jackpotContribution = totalSales * 0.005; // 0.5%
  const netEarnings = totalSales - treasuryFee - jackpotContribution;

  const handleCreateRaffle = async () => {
    if (!wallet.connected || !selectedNFT) {
      toast({
        title: "Error",
        description: "Please connect your wallet and select an NFT to raffle.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      
      const ticketPriceInLamports = ticketPrice * LAMPORTS_PER_SOL;
      const durationInSeconds = duration * 60 * 60; // Convert hours to seconds
      
      const { signature } = await initialize(
        selectedNFT, 
        ticketPriceInLamports, 
        ticketCap, 
        durationInSeconds
      );

      toast({
        title: "Raffle Created!",
        description: `Transaction signature: ${signature.substring(0, 8)}...`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      // Reset form after successful submission
      setSelectedNFT(null);
      setTicketPrice(0.1);
      setTicketCap(100);
      setDuration(24);
      
    } catch (error) {
      console.error("Failed to create raffle:", error);
      toast({
        title: "Error Creating Raffle",
        description: (error as Error).message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getSelectedNFTDetails = () => {
    if (!selectedNFT) return null;
    return nfts.find(nft => nft.mint === selectedNFT);
  };
  
  const selectedNFTDetails = getSelectedNFTDetails();

  return (
    <VStack spacing={6} align="stretch" width="full" maxW="600px" mx="auto" p={4}>
      <Heading size="lg">Create New Raffle</Heading>
      <Text color="gray.600">
        Raffle an NFT from your wallet for a chance to earn SOL. 
        A 0.05 SOL fee will be charged to create the raffle.
      </Text>
      
      <Divider />
      
      <FormControl isRequired>
        <FormLabel>Select NFT to Raffle</FormLabel>
        {loadingNFTs ? (
          <HStack spacing={2}>
            <Spinner size="sm" />
            <Text>Loading your NFTs...</Text>
          </HStack>
        ) : nfts.length === 0 ? (
          <Text color="red.500">No NFTs found in your wallet</Text>
        ) : (
          <Select 
            placeholder="Select an NFT" 
            value={selectedNFT || ''}
            onChange={(e) => setSelectedNFT(e.target.value)}
          >
            {nfts.map((nft) => (
              <option key={nft.mint} value={nft.mint}>
                {nft.name} {nft.collectionName ? `(${nft.collectionName})` : ''}
              </option>
            ))}
          </Select>
        )}
      </FormControl>
      
      {selectedNFTDetails && (
        <Box 
          p={4} 
          borderWidth="1px" 
          borderRadius="md" 
          borderColor="gray.200"
          bg="gray.50"
        >
          <HStack spacing={4} align="start">
            <Image 
              src={selectedNFTDetails.image || '/placeholder-nft.png'} 
              alt={selectedNFTDetails.name}
              borderRadius="md"
              boxSize="120px"
              objectFit="cover"
            />
            <VStack align="start" spacing={1} flex={1}>
              <Heading size="md">{selectedNFTDetails.name}</Heading>
              {selectedNFTDetails.collectionName && (
                <Text color="gray.600">{selectedNFTDetails.collectionName}</Text>
              )}
              {selectedNFTDetails.description && (
                <Text fontSize="sm" noOfLines={3}>
                  {selectedNFTDetails.description}
                </Text>
              )}
            </VStack>
          </HStack>
        </Box>
      )}
      
      <FormControl isRequired>
        <FormLabel>Ticket Price (SOL)</FormLabel>
        <NumberInput 
          value={ticketPrice} 
          min={0.01} 
          step={0.01} 
          precision={2}
          onChange={(_, value) => setTicketPrice(value)}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>
      
      <FormControl isRequired>
        <FormLabel>Maximum Number of Tickets</FormLabel>
        <NumberInput 
          value={ticketCap} 
          min={1} 
          max={1000}
          onChange={(_, value) => setTicketCap(value)}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>
      
      <FormControl isRequired>
        <FormLabel>Raffle Duration</FormLabel>
        <InputGroup>
          <NumberInput 
            value={duration} 
            min={1} 
            max={168} // 7 days
            width="full"
            onChange={(_, value) => setDuration(value)}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <InputRightAddon children="hours" />
        </InputGroup>
      </FormControl>
      
      <Box
        p={4}
        borderWidth="1px"
        borderRadius="md"
        borderColor="blue.200"
        bg="blue.50"
      >
        <Heading size="sm" mb={2}>Raffle Summary</Heading>
        <VStack spacing={1} align="stretch">
          <HStack justify="space-between">
            <Text>Ticket Price:</Text>
            <Text fontWeight="bold">{ticketPrice} SOL</Text>
          </HStack>
          <HStack justify="space-between">
            <Text>Maximum Tickets:</Text>
            <Text fontWeight="bold">{ticketCap}</Text>
          </HStack>
          <HStack justify="space-between">
            <Text>Duration:</Text>
            <Text fontWeight="bold">{duration} hours</Text>
          </HStack>
          <Divider my={2} />
          <HStack justify="space-between">
            <Text>Potential Total Sales:</Text>
            <Text fontWeight="bold">{totalSales.toFixed(2)} SOL</Text>
          </HStack>
          <HStack justify="space-between">
            <Text>Platform Fee (2%):</Text>
            <Text>{treasuryFee.toFixed(2)} SOL</Text>
          </HStack>
          <HStack justify="space-between">
            <Text>Jackpot Contribution (0.5%):</Text>
            <Text>{jackpotContribution.toFixed(2)} SOL</Text>
          </HStack>
          <HStack justify="space-between">
            <Text>Your Earnings:</Text>
            <Text fontWeight="bold" color="green.500">{netEarnings.toFixed(2)} SOL</Text>
          </HStack>
          <HStack justify="space-between" mt={2}>
            <Text>Upfront Fee:</Text>
            <Text fontWeight="bold" color="red.500">{estimatedFee} SOL</Text>
          </HStack>
        </VStack>
      </Box>
      
      <Button
        colorScheme="blue"
        size="lg"
        onClick={handleCreateRaffle}
        isLoading={loading}
        loadingText="Creating Raffle..."
        isDisabled={!wallet.connected || !selectedNFT || ticketPrice <= 0 || ticketCap <= 0 || duration <= 0}
      >
        Create Raffle
      </Button>
    </VStack>
  );
}; 
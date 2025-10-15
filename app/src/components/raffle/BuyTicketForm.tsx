import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Text,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  VStack,
  HStack,
  Stack,
  Badge,
  Divider,
  Icon,
  Tooltip,
  useToast,
  Input,
  InputGroup,
  InputRightAddon,
} from '@chakra-ui/react';
import { FaRocket, FaInfoCircle, FaTrophy, FaTicketAlt } from 'react-icons/fa';
import { useRaffleProgram } from '@/hooks/useRaffleProgram';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { Raffle } from '@/types/raffle';
import { TicketPurchaseAnimation } from '@/components/animations/TicketPurchaseAnimation';

interface BuyTicketFormProps {
  raffle: Raffle;
  onPurchaseComplete?: () => void;
}

export const BuyTicketForm: React.FC<BuyTicketFormProps> = ({ raffle, onPurchaseComplete }) => {
  const wallet = useWallet();
  const { balance } = useWalletBalance();
  const { buyTicket } = useRaffleProgram();
  const toast = useToast();
  
  const [quantity, setQuantity] = useState<number>(1);
  const [rocketFuelPercent, setRocketFuelPercent] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showAnimation, setShowAnimation] = useState<boolean>(false);
  const [purchasedQuantity, setPurchasedQuantity] = useState<number>(0);
  
  // Calculate costs
  const baseTicketCost = raffle.ticketPrice * quantity;
  const rocketFuelAmount = baseTicketCost * (rocketFuelPercent / 100);
  const totalCost = baseTicketCost + rocketFuelAmount;
  
  // Calculate bonus entries
  const bonusEntries = Math.floor((rocketFuelPercent / 10)); // 1 bonus entry per 10% extra
  const totalEntries = quantity + bonusEntries;
  
  // Calculate entry odds
  const totalRaffleEntries = raffle.totalEntries || raffle.ticketsSold; // Fallback if totalEntries is not available
  const currentOdds = totalRaffleEntries > 0 
    ? (1 / (totalRaffleEntries + 1) * 100).toFixed(2) 
    : 100;
  const newOdds = (totalEntries / (totalRaffleEntries + totalEntries) * 100).toFixed(2);
  
  const handlePurchase = async () => {
    if (!wallet.connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to buy tickets",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (totalCost > (balance / LAMPORTS_PER_SOL)) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough SOL to complete this purchase",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const costInLamports = totalCost * LAMPORTS_PER_SOL;
      
      const { signature } = await buyTicket(
        raffle.publicKey,
        quantity,
        costInLamports
      );
      
      // Set animation states
      setPurchasedQuantity(quantity);
      setShowAnimation(true);
      
      toast({
        title: "Tickets Purchased!",
        description: `You've successfully purchased ${quantity} tickets with ${bonusEntries} bonus entries!`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      if (onPurchaseComplete) {
        onPurchaseComplete();
      }
      
    } catch (error) {
      console.error("Failed to purchase tickets:", error);
      toast({
        title: "Purchase Failed",
        description: (error as Error).message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleMaxTickets = () => {
    // Cap to either max affordable or remaining tickets
    const maxAffordable = Math.floor((balance / LAMPORTS_PER_SOL) / raffle.ticketPrice);
    const ticketsRemaining = raffle.ticketCap - raffle.ticketsSold;
    const max = Math.min(maxAffordable, ticketsRemaining);
    setQuantity(max > 0 ? max : 1);
  };
  
  // Reset form when raffle changes
  useEffect(() => {
    setQuantity(1);
    setRocketFuelPercent(0);
  }, [raffle.publicKey]);
  
  return (
    <Box data-cy="buy-ticket-section">
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="md" mb={2}>Buy Tickets</Heading>
          
          <FormControl>
            <FormLabel fontWeight="medium">Tickets Quantity</FormLabel>
            <HStack spacing={4}>
              <NumberInput 
                value={quantity} 
                min={1} 
                max={Math.min(raffle.ticketCap - raffle.ticketsSold, Math.floor(balance / raffle.ticketPrice))}
                onChange={(_, value) => setQuantity(isNaN(value) ? 1 : value)}
                maxW="120px"
                data-cy="ticket-quantity"
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              
              <Text color="gray.600" fontSize="sm">
                Maximum: {Math.min(
                  raffle.ticketCap - raffle.ticketsSold,
                  Math.floor(balance / raffle.ticketPrice)
                )} tickets
              </Text>
            </HStack>
          </FormControl>
        </Box>
        
        <Box 
          p={4} 
          borderWidth="1px" 
          borderRadius="md" 
          borderColor="blue.200"
          bg="blue.50"
        >
          <HStack mb={3}>
            <Icon as={FaRocket} color="blue.500" />
            <Heading size="sm">Rocket Fuel Bonus</Heading>
            <Tooltip 
              label="Increase your chances by adding extra SOL. Every 10% extra gives you 1 bonus entry!" 
              hasArrow
            >
              <Icon as={FaInfoCircle} color="gray.500" />
            </Tooltip>
          </HStack>
          
          <FormControl>
            <FormLabel>Boost your purchase by:</FormLabel>
            <Slider
              value={rocketFuelPercent}
              onChange={setRocketFuelPercent}
              min={0}
              max={100}
              step={5}
              colorScheme="blue"
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb boxSize={6}>
                <Box color="blue.500" as={FaRocket} />
              </SliderThumb>
            </Slider>
            
            <HStack justify="space-between" mt={1}>
              <Text fontSize="sm">+0%</Text>
              <Text fontSize="sm" fontWeight="bold">+{rocketFuelPercent}%</Text>
              <Text fontSize="sm">+100%</Text>
            </HStack>
          </FormControl>
          
          <Box mt={4}>
            <HStack justify="space-between">
              <Text>Bonus Entries:</Text>
              <Badge colorScheme="green" px={2} py={1}>+{bonusEntries}</Badge>
            </HStack>
            <HStack justify="space-between">
              <Text>Total Entries:</Text>
              <Text fontWeight="bold">{totalEntries}</Text>
            </HStack>
          </Box>
        </Box>
        
        <Box>
          <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" align="center" mb={4}>
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold" fontSize="lg">Total Cost:</Text>
              <Text color="gray.600" fontSize="sm">Base Price: {baseTicketCost.toFixed(2)} SOL</Text>
              {rocketFuelAmount > 0 && (
                <Text color="purple.500" fontSize="sm">Rocket Fuel: +{rocketFuelAmount.toFixed(2)} SOL</Text>
              )}
            </VStack>
            <Text fontWeight="bold" fontSize="xl" data-cy="total-cost">
              {totalCost.toFixed(2)} SOL
            </Text>
          </Stack>
          
          <Button
            colorScheme="purple"
            size="lg"
            width="full"
            leftIcon={<Icon as={FaTicketAlt} />}
            isLoading={isSubmitting}
            isDisabled={!wallet.connected || isSubmitting || quantity <= 0 || totalCost > balance}
            onClick={handlePurchase}
            data-cy="confirm-purchase"
          >
            Buy {quantity} Ticket{quantity !== 1 ? 's' : ''}
          </Button>
          
          {!wallet.connected && (
            <Text mt={2} fontSize="sm" color="red.500" textAlign="center">
              Connect your wallet to buy tickets
            </Text>
          )}
          
          {wallet.connected && totalCost > balance && (
            <Text mt={2} fontSize="sm" color="red.500" textAlign="center">
              Insufficient balance
            </Text>
          )}
        </Box>
      </VStack>
      
      {showAnimation && (
        <TicketPurchaseAnimation 
          quantity={purchasedQuantity} 
          onComplete={() => setShowAnimation(false)} 
        />
      )}
    </Box>
  );
}; 
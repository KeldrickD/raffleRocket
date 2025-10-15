import { FC, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRaffleProgram } from '@/hooks/useRaffleProgram';
import { confirmTransaction, handleTransactionError } from '@/utils/transaction';
import { formatSOL } from '@/utils/format';
import { useRaffleRefresh } from '@/hooks/useRaffleRefresh';
import { RaffleData } from '@/types/rafflerocket';
import { TicketPurchaseAnimation } from '@/components/animations/TicketPurchaseAnimation';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { 
  Box, 
  Button, 
  Flex, 
  Text, 
  IconButton, 
  useColorModeValue 
} from '@chakra-ui/react';
import { FaPlus, FaMinus } from 'react-icons/fa';

interface Props {
  raffle: RaffleData;
}

export const BuyTicketButton: FC<Props> = ({ raffle }) => {
  const { connected } = useWallet();
  const { buyTicket, program } = useRaffleProgram();
  const refreshRaffles = useRaffleRefresh();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  
  // Dynamic color values
  const boxBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const buttonBg = useColorModeValue('purple.600', 'purple.500');
  const buttonHoverBg = useColorModeValue('purple.700', 'purple.400');
  const quantityBoxBg = useColorModeValue('gray.100', 'gray.700');
  const quantityBoxHoverBg = useColorModeValue('gray.200', 'gray.600');

  const handleBuyTickets = async () => {
    if (!connected || !program) {
      handleTransactionError(new Error('Please connect your wallet'));
      return;
    }

    try {
      setLoading(true);
      
      // Calculate total price in lamports
      const totalPrice = raffle.ticketPrice * quantity * LAMPORTS_PER_SOL;
      
      // Call the buyTicket method from the hook
      const result = await buyTicket(
        raffle.publicKey.toString(), 
        quantity, 
        totalPrice
      );
      
      if (result && result.signature) {
        // Show the animation after successful purchase
        setShowAnimation(true);
        await refreshRaffles();
      } else if (result && result.error) {
        handleTransactionError(result.error);
      }
    } catch (error) {
      handleTransactionError(error);
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = raffle.ticketPrice * quantity;

  if (!connected) {
    return (
      <Button
        w="full"
        px={4}
        py={2}
        bg={buttonBg}
        color="white"
        borderRadius="md"
        _hover={{ bg: buttonHoverBg }}
        onClick={() => window.solana?.connect()}
      >
        Connect Wallet to Buy Tickets
      </Button>
    );
  }

  return (
    <Box p={4} borderRadius="md" boxShadow="sm" bg={boxBg}>
      <Flex direction="column" gap={4}>
        <Flex justify="space-between" align="center">
          <Text fontWeight="medium" color={textColor}>Quantity:</Text>
          <Flex align="center" gap={2}>
            <IconButton
              aria-label="Decrease quantity"
              icon={<FaMinus />}
              size="sm"
              isRound
              bg={quantityBoxBg}
              _hover={{ bg: quantityBoxHoverBg }}
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              isDisabled={quantity <= 1}
            />
            <Box
              w="10"
              textAlign="center"
              py={1}
              px={2}
              borderRadius="md"
              fontWeight="medium"
            >
              {quantity}
            </Box>
            <IconButton
              aria-label="Increase quantity"
              icon={<FaPlus />}
              size="sm"
              isRound
              bg={quantityBoxBg}
              _hover={{ bg: quantityBoxHoverBg }}
              onClick={() => setQuantity(Math.min(raffle.ticketCap - raffle.ticketsSold, quantity + 1))}
              isDisabled={quantity >= raffle.ticketCap - raffle.ticketsSold}
            />
          </Flex>
        </Flex>

        <Text fontWeight="medium" color={textColor}>
          Total Price: {formatSOL(totalPrice)}
        </Text>

        <Button
          bg={buttonBg}
          color="white"
          _hover={{ bg: buttonHoverBg }}
          onClick={handleBuyTickets}
          isLoading={loading}
          loadingText="Processing..."
          isDisabled={loading || quantity <= 0 || quantity > raffle.ticketCap - raffle.ticketsSold}
        >
          {loading ? 'Processing...' : 'Buy Tickets'}
        </Button>
      </Flex>
      
      {/* Animation component */}
      <TicketPurchaseAnimation 
        quantity={quantity} 
        isVisible={showAnimation} 
        onComplete={() => setShowAnimation(false)}
      />
    </Box>
  );
}; 
'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Flex, Text, Image, useColorModeValue } from '@chakra-ui/react';

interface TicketPurchaseAnimationProps {
  quantity: number;
  isVisible: boolean;
  onComplete?: () => void;
}

export const TicketPurchaseAnimation: React.FC<TicketPurchaseAnimationProps> = ({
  quantity,
  isVisible,
  onComplete
}) => {
  // Handle animation completion
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 3000); // Animation lasts 3 seconds
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  // Dynamic color values based on theme
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('purple.800', 'purple.200');

  return (
    <AnimatePresence>
      {isVisible && (
        <Flex
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={1000}
          justify="center"
          align="center"
          bg="rgba(0, 0, 0, 0.4)"
          backdropFilter="blur(8px)"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ width: '100%', height: '100%', position: 'absolute' }}
          />
          
          <Flex
            direction="column"
            align="center"
            justify="center"
            bg={bgColor}
            p={8}
            borderRadius="xl"
            boxShadow="xl"
            maxW="md"
            w="90%"
            position="relative"
            zIndex={1001}
          >
            <motion.div
              initial={{ rotate: -10, y: -20 }}
              animate={{ 
                rotate: [0, -5, 5, -5, 0],
                y: [-20, 0, -10, 0]
              }}
              transition={{ 
                duration: 1.5,
                repeat: 1,
                repeatType: "reverse"
              }}
              style={{ marginBottom: '1rem' }}
            >
              <Image 
                src="/images/ticket.svg" 
                alt="Ticket" 
                boxSize="150px"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Text
                fontWeight="bold"
                fontSize="2xl"
                color={textColor}
                textAlign="center"
                mb={2}
              >
                Woohoo! 🎉
              </Text>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Text
                fontSize="xl"
                color={textColor}
                textAlign="center"
              >
                You purchased {quantity} {quantity === 1 ? 'ticket' : 'tickets'}!
              </Text>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              style={{ marginTop: '1.5rem', maxWidth: '300px' }}
            >
              <Text fontSize="md" textAlign="center">
                Good luck in the raffle draw!
              </Text>
            </motion.div>
          </Flex>
        </Flex>
      )}
    </AnimatePresence>
  );
}; 
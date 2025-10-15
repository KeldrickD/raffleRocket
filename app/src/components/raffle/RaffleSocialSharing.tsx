'use client';

import { Box, Button, Stack, Text } from '@chakra-ui/react';
import { FaTwitter, FaDiscord, FaTelegram } from 'react-icons/fa';

interface RaffleSocialSharingProps {
  rafflePublicKey: string;
  raffleName: string;
  nftImage: string;
}

export function RaffleSocialSharing({ rafflePublicKey, raffleName, nftImage }: RaffleSocialSharingProps) {
  const shareUrl = `${window.location.origin}/raffle/${rafflePublicKey}`;
  const shareText = `Check out this amazing NFT raffle: ${raffleName}! 🎉\n\nJoin now for a chance to win! 🚀\n\n${shareUrl}`;

  const shareLinks = [
    {
      name: 'Twitter',
      icon: FaTwitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      colorScheme: 'twitter',
    },
    {
      name: 'Discord',
      icon: FaDiscord,
      url: `https://discord.com/api/oauth2/authorize?client_id=YOUR_DISCORD_CLIENT_ID&response_type=code&redirect_uri=${encodeURIComponent(shareUrl)}&scope=identify`,
      colorScheme: 'purple',
    },
    {
      name: 'Telegram',
      icon: FaTelegram,
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      colorScheme: 'blue',
    },
  ];

  return (
    <Box>
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        Share Raffle
      </Text>
      <Stack gap={3}>
        {shareLinks.map((link) => (
          <Button
            key={link.name}
            colorScheme={link.colorScheme}
            onClick={() => window.open(link.url, '_blank')}
            width="full"
          >
            <link.icon style={{ marginRight: '8px' }} />
            Share on {link.name}
          </Button>
        ))}
      </Stack>
    </Box>
  );
} 
import React from 'react';
import { Button, HStack, IconButton, useClipboard, Tooltip, Icon, Text, Box, useToast } from '@chakra-ui/react';
import { NFTActivity } from '@/types/activity';

// Import icons
const TwitterIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"
    />
  </Icon>
);

const DiscordIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"
    />
  </Icon>
);

const TelegramIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42l10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001l-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15l4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"
    />
  </Icon>
);

const LinkIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"
    />
  </Icon>
);

export interface SocialSharingButtonsProps {
  activity?: NFTActivity;
  url?: string;
  title?: string;
  compact?: boolean;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  direction?: 'row' | 'column';
}

const SocialSharingButtons: React.FC<SocialSharingButtonsProps> = ({
  activity,
  url,
  title,
  compact = false,
  showText = true,
  size = 'md',
  direction = 'row'
}) => {
  const toast = useToast();
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const { onCopy } = useClipboard(shareUrl);
  
  // Generate default title if not provided
  const shareTitle = title || (activity 
    ? `Check out this ${activity.type} activity for ${activity.nftName || activity.mintId}!` 
    : 'Check out this NFT activity!');
  
  const shareToTwitter = () => {
    const text = encodeURIComponent(`${shareTitle} ${shareUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };
  
  const shareToDiscord = () => {
    onCopy();
    toast({
      title: 'Copied to clipboard',
      description: 'Now you can paste the link in Discord',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  const shareToTelegram = () => {
    const text = encodeURIComponent(shareTitle);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  const copyLink = () => {
    onCopy();
    toast({
      title: 'Link copied to clipboard',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  if (compact) {
    return (
      <HStack spacing={2}>
        <Tooltip label="Share on Twitter">
          <IconButton
            aria-label="Share on Twitter"
            icon={<TwitterIcon />}
            size={size}
            colorScheme="twitter"
            onClick={shareToTwitter}
            borderRadius="full"
          />
        </Tooltip>
        <Tooltip label="Copy for Discord">
          <IconButton
            aria-label="Copy for Discord"
            icon={<DiscordIcon />}
            size={size}
            colorScheme="purple"
            onClick={shareToDiscord}
            borderRadius="full"
          />
        </Tooltip>
        <Tooltip label="Share on Telegram">
          <IconButton
            aria-label="Share on Telegram"
            icon={<TelegramIcon />}
            size={size}
            colorScheme="telegram"
            onClick={shareToTelegram}
            borderRadius="full"
          />
        </Tooltip>
        <Tooltip label="Copy Link">
          <IconButton
            aria-label="Copy Link"
            icon={<LinkIcon />}
            size={size}
            onClick={copyLink}
            borderRadius="full"
          />
        </Tooltip>
      </HStack>
    );
  }

  return (
    <Box>
      <HStack spacing={3} flexDirection={direction === 'column' ? 'column' : 'row'} alignItems={direction === 'column' ? 'stretch' : 'center'}>
        <Button
          leftIcon={<TwitterIcon />}
          colorScheme="twitter"
          onClick={shareToTwitter}
          size={size}
          width={direction === 'column' ? 'full' : 'auto'}
        >
          {showText && "Twitter"}
        </Button>
        <Button
          leftIcon={<DiscordIcon />}
          colorScheme="purple"
          onClick={shareToDiscord}
          size={size}
          width={direction === 'column' ? 'full' : 'auto'}
        >
          {showText && "Discord"}
        </Button>
        <Button
          leftIcon={<TelegramIcon />}
          colorScheme="telegram"
          onClick={shareToTelegram}
          size={size}
          width={direction === 'column' ? 'full' : 'auto'}
        >
          {showText && "Telegram"}
        </Button>
        <Button
          leftIcon={<LinkIcon />}
          onClick={copyLink}
          size={size}
          width={direction === 'column' ? 'full' : 'auto'}
        >
          {showText && "Copy Link"}
        </Button>
      </HStack>
    </Box>
  );
};

export default SocialSharingButtons; 
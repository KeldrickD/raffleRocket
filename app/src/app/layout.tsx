'use client';

import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers';
import { MainLayout } from '@/components/Layout/MainLayout';

export const metadata: Metadata = {
  title: 'RaffleRocket | NFT Gallery & Raffle Platform',
  description: 'A platform for NFT management, batch operations, and creating raffles on Solana',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <MainLayout>{children}</MainLayout>
        </Providers>
      </body>
    </html>
  )
} 
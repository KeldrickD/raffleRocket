'use client';

import React from 'react';
import Link from 'next/link';
import { ActivitySubscription } from '@/components/ActivitySubscription';

export default function NotificationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <Link href="/profile" className="text-blue-500 hover:text-blue-700 mr-2">
            <span className="inline-block">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </Link>
          <h1 className="text-3xl font-bold">Notifications</h1>
        </div>
        
        <p className="text-gray-600">
          Manage your notification preferences for NFT activities
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        <ActivitySubscription />
      </div>
    </div>
  );
} 
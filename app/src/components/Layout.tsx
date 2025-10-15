import React from 'react';
import Link from 'next/link';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                RaffleRocket
              </Link>
            </div>
            <nav className="flex space-x-6">
              <Link href="/" className="text-gray-700 hover:text-blue-600">
                NFT Gallery
              </Link>
              <Link href="/collections" className="text-gray-700 hover:text-blue-600">
                Collections
              </Link>
              <Link href="/create-nft" className="text-gray-700 hover:text-blue-600">
                Create NFT
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="flex-grow bg-gray-100">
        {children}
      </main>
      
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p>&copy; {new Date().getFullYear()} RaffleRocket. All rights reserved.</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">Terms</a>
              <a href="#" className="text-gray-300 hover:text-white">Privacy</a>
              <a href="#" className="text-gray-300 hover:text-white">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}; 
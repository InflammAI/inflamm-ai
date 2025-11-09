'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { motion } from 'framer-motion';

export const WalletButton: React.FC = () => {
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [mounted, setMounted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const handleClick = () => {
    if (connected) {
      setShowMenu(!showMenu);
    } else {
      setVisible(true);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowMenu(false);
  };

  // Avoid hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="w-32 h-10 rounded-lg bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-yellow)] animate-pulse" />
    );
  }

  if (!connected) {
    return (
      <button
        onClick={handleClick}
        className="px-4 py-2 rounded-lg text-white font-semibold text-sm transition-all hover:scale-105"
        style={{
          background: 'linear-gradient(to right, var(--accent-orange), var(--accent-yellow))',
        }}
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="relative">
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold hover:scale-105 transition-transform"
        style={{
          background: 'linear-gradient(to bottom right, var(--accent-orange), var(--accent-yellow))',
        }}
      >
        {/* User Icon Only - No Wallet Icon */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="7"
            r="4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-sm hidden md:inline">
          {publicKey ? formatAddress(publicKey.toString()) : ''}
        </span>
      </motion.button>

      {/* Dropdown Menu */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-48 bg-[var(--surface)] border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden"
          >
            <button
              onClick={handleDisconnect}
              className="w-full px-4 py-3 text-left text-sm text-white hover:bg-gray-800 transition-colors"
            >
              Disconnect
            </button>
          </motion.div>
        </>
      )}
    </div>
  );
};

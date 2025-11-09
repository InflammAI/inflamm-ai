'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';

interface VitalPointsBadgeProps {
  className?: string;
}

export const VitalPointsBadge: React.FC<VitalPointsBadgeProps> = ({ className = '' }) => {
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [recentIncrease, setRecentIncrease] = useState<number | null>(null);

  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();
    } else {
      // Reset to 0 when wallet disconnected
      setBalance(0);
      setIsLoading(false);
    }
  }, [connected, publicKey]);

  const fetchBalance = async () => {
    if (!publicKey) return;
    
    setIsLoading(true);
    try {
      const walletAddress = publicKey.toString();
      const response = await fetch(`/api/vytap/leaderboard?walletAddress=${walletAddress}`);
      const data = await response.json();
      
      if (data.success) {
        // Get user's points from the leaderboard response
        const userPoints = data.data.userPoints || 0;
        setBalance(userPoints);
      } else {
        setBalance(0);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch vital points balance:', error);
      setBalance(0);
      setIsLoading(false);
    }
  };

  const updateBalance = (newBalance: number) => {
    const increase = newBalance - balance;
    if (increase > 0) {
      setRecentIncrease(increase);
      setTimeout(() => setRecentIncrease(null), 2000);
    }
    setBalance(newBalance);
  };

  // Expose updateBalance for external use
  useEffect(() => {
    (window as any).__updateVitalPoints = updateBalance;
    return () => {
      delete (window as any).__updateVitalPoints;
    };
  }, [balance]);

  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-yellow)] text-white font-semibold shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            fill="currentColor"
          />
        </svg>
        
        {isLoading ? (
          <span className="text-sm">...</span>
        ) : (
          <span className="text-sm tabular-nums">
            {balance.toLocaleString()}
          </span>
        )}
      </motion.div>

      <AnimatePresence>
        {recentIncrease && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: -30 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 text-[var(--accent-yellow)] font-bold text-sm whitespace-nowrap pointer-events-none"
          >
            +{recentIncrease}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

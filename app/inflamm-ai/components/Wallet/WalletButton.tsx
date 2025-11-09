'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { createQR, encodeURL, TransactionRequestURLFields } from '@solana/pay';
import { PublicKey } from '@solana/web3.js';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { vytapApi } from '../../config/api';

export function WalletButton() {
  const { publicKey, connect, disconnect, connected } = useWallet();
  const [isTapping, setIsTapping] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const { toast } = useToast();

  const handleTap = async () => {
    if (!publicKey) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsTapping(true);
      const result = await vytapApi.tap(publicKey.toString(), 1);
      
      toast({
        title: 'Tap successful!',
        description: `You've earned ${result.points} points!`,
      });
      
      // Refresh any necessary data
      // await fetchUserData();
    } catch (error) {
      console.error('Tap failed:', error);
      toast({
        title: 'Tap failed',
        description: error.message || 'Failed to process tap',
        variant: 'destructive',
      });
    } finally {
      setIsTapping(false);
    }
  };

  const handleClaim = async () => {
    if (!publicKey) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsClaiming(true);
      // Your existing claim logic here
      // ...
      
    } catch (error) {
      console.error('Claim failed:', error);
      toast({
        title: 'Claim failed',
        description: error.message || 'Failed to process claim',
        variant: 'destructive',
      });
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <Button
        onClick={connected ? disconnect : () => connect().catch(console.error)}
        className="w-full"
        variant={connected ? 'destructive' : 'default'}
      >
        {connected ? 'Disconnect Wallet' : 'Connect Wallet'}
      </Button>

      {connected && (
        <div className="space-y-2">
          <Button
            onClick={handleTap}
            disabled={isTapping}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isTapping ? 'Tapping...' : 'Tap to Earn'}
          </Button>

          <Button
            onClick={handleClaim}
            disabled={isClaiming}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isClaiming ? 'Claiming...' : 'Claim Rewards'}
          </Button>
        </div>
      )}
    </div>
  );
}

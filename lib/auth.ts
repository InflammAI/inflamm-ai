import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { PublicKey } from '@solana/web3.js';
import { NextRequest } from 'next/server';

export interface VerifyResult {
  success: boolean;
  walletAddress?: string;
  error?: string;
}

export async function verifyWalletSignature(
  walletAddress: string,
  signature: string,
  message: string,
  isSessionSignature: boolean = false
): Promise<VerifyResult> {
  try {
    // Validate wallet address format
    try {
      new PublicKey(walletAddress);
    } catch (error) {
      return { success: false, error: 'Invalid wallet address format' };
    }

    // Verify signature
    try {
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = bs58.decode(signature);
      const publicKeyBytes = new PublicKey(walletAddress).toBytes();

      const verified = nacl.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKeyBytes
      );

      if (!verified) {
        return { success: false, error: 'Invalid signature' };
      }
    } catch (error) {
      return { success: false, error: 'Signature verification failed' };
    }

    // Check message timestamp only for non-session signatures
    if (!isSessionSignature) {
      try {
        const messageData = JSON.parse(message);
        const timestamp = messageData.timestamp;
        const now = Date.now();
        
        if (!timestamp || Math.abs(now - timestamp) > 60000) { // 1 minute window
          return { success: false, error: 'Message expired or invalid timestamp' };
        }
      } catch (error) {
        return { success: false, error: 'Invalid message format' };
      }
    }
    
    // For session signatures, verify the message contains sessionId
    if (isSessionSignature) {
      try {
        const messageData = JSON.parse(message);
        if (!messageData.sessionId || messageData.walletAddress !== walletAddress) {
          return { success: false, error: 'Invalid session signature' };
        }
      } catch (error) {
        return { success: false, error: 'Invalid session message format' };
      }
    }

    return { success: true, walletAddress };
  } catch (error) {
    console.error('Wallet verification error:', error);
    return { success: false, error: 'Authentication failed' };
  }
}

export async function verifyRequest(req: NextRequest): Promise<VerifyResult> {
  try {
    const body = await req.json();
    const { walletAddress, sessionSignature, sessionMessage, signature, message } = body;
    
    const sig = sessionSignature || signature;
    const msg = sessionMessage || message;

    if (!walletAddress || !sig || !msg) {
      return { success: false, error: 'Missing authentication credentials' };
    }

    return await verifyWalletSignature(walletAddress, sig, msg, !!sessionSignature);
  } catch (error) {
    return { success: false, error: 'Failed to parse request' };
  }
}

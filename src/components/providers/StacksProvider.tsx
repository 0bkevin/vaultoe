'use client';

import React, { ReactNode } from 'react';
import { AppConfig, UserSession } from '@stacks/connect';
import { STACKS_TESTNET } from '@stacks/network';

const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

export const network = STACKS_TESTNET;

interface UserProfile {
  principal: string;
  name: string | null;
  description: string | null;
  role: string;
  githubUrl: string | null;
  websiteUrl: string | null;
}

interface StacksContextType {
  userSession: UserSession;
  network: any;
  connect: () => void;
  disconnect: () => void;
  userData: any | null;
  profile: UserProfile | null;
  refreshProfile: () => Promise<void>;
}

const StacksContext = React.createContext<StacksContextType | undefined>(undefined);

export function StacksProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = React.useState<any | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);

  const transformUserData = (data: any) => {
    const addresses = data.addresses || [];
    const stxAddress = addresses.find((a: any) => a.symbol === 'STX');
    const btcAddress = addresses.find((a: any) => a.symbol === 'BTC');
    
    return {
      profile: {
        stxAddress: {
          testnet: stxAddress?.address || '',
          mainnet: stxAddress?.address || '',
        },
        btcAddress: {
          testnet: btcAddress?.address || '',
          mainnet: btcAddress?.address || '',
        },
      },
    };
  };

  const fetchProfile = async (principal: string) => {
    try {
      const res = await fetch(`/api/users?principal=${principal}`);
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setProfile(data.user);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const createDefaultProfile = async (principal: string) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ principal, role: 'BUILDER' }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const refreshProfile = async () => {
    if (userData?.profile?.stxAddress?.testnet) {
      await fetchProfile(userData.profile.stxAddress.testnet);
    }
  };

  React.useEffect(() => {
    const checkAuth = async () => {
      const { isConnected, getUserData } = await import('@stacks/connect');
      if (isConnected()) {
        const data = await getUserData();
        if (data) {
          const transformed = transformUserData(data);
          setUserData(transformed);
          const principal = transformed.profile.stxAddress.testnet;
          await fetchProfile(principal);
        }
      }
    };
    checkAuth();
  }, []);

  const connectWallet = async () => {
    const { connect } = await import('@stacks/connect');
    try {
      const result = await connect();
      const transformed = transformUserData(result);
      setUserData(transformed);
      
      const principal = transformed.profile.stxAddress.testnet;
      const res = await fetch(`/api/users?principal=${principal}`);
      const data = await res.json();
      
      if (!data.user) {
        await createDefaultProfile(principal);
      } else {
        setProfile(data.user);
      }
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const disconnect = async () => {
    const { disconnect } = await import('@stacks/connect');
    disconnect();
    setUserData(null);
    setProfile(null);
  };

  return (
    <StacksContext.Provider value={{ userSession, network, connect: connectWallet, disconnect, userData, profile, refreshProfile }}>
      {children}
    </StacksContext.Provider>
  );
}

export function useStacks() {
  const context = React.useContext(StacksContext);
  if (context === undefined) {
    throw new Error('useStacks must be used within a StacksProvider');
  }
  return context;
}

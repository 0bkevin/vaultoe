'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStacks } from '@/components/providers/StacksProvider';

export function LaunchAppButton({ className, children }: { className?: string, children?: React.ReactNode }) {
  const { userData, connect } = useStacks();
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (isConnecting && userData) {
      router.push('/dashboard');
    }
  }, [userData, isConnecting, router]);

  const handleLaunch = (e: React.MouseEvent) => {
    e.preventDefault();
    if (userData) {
      router.push('/dashboard');
    } else {
      setIsConnecting(true);
      connect();
    }
  };

  return (
    <button 
      onClick={handleLaunch}
      className={className}
    >
      {children || "Launch App"}
    </button>
  );
}

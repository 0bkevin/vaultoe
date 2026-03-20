'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useStacks } from '@/components/providers/StacksProvider';
import { Hexagon, Users, Building2, HardHat, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function Navbar() {
  const { connect, disconnect, userData, profile, refreshProfile } = useStacks();
  const [isSwitching, setIsSwitching] = useState(false);

  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 5)}...${address.slice(-4)}`;
  };

  const handleSwitchRole = async () => {
    if (!userData || !profile) return;
    setIsSwitching(true);
    
    // Toggle between BUILDER and DAO
    const newRole = profile.role === 'BUILDER' ? 'DAO' : 'BUILDER';
    
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          principal: userData.profile.stxAddress.testnet,
          role: newRole,
        }),
      });

      if (!res.ok) throw new Error('Failed to switch role');
      
      await refreshProfile();
      toast.success(`Role switched to ${newRole}`);
      window.location.reload(); // Quick refresh to update dashboard if on it
    } catch (error) {
      console.error(error);
      toast.error('Failed to switch role');
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <nav className="px-6 py-4 flex justify-between items-center z-50 relative border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center space-x-4">
          <div className="relative flex items-center justify-center w-10 h-10 border border-white/10 bg-white/5">
            <Hexagon className="absolute w-6 h-6 text-[#ff4500]" strokeWidth={1.5} />
            <div className="w-1.5 h-1.5 bg-[#ff4500] rounded-none" />
          </div>
          <span className="text-xl font-heading font-bold tracking-tighter text-white uppercase hidden sm:block">
            InvoiceVault
          </span>
        </Link>
        
        <div className="hidden md:flex gap-6">
          <Link href="/pitch" className="text-sm font-heading font-bold uppercase tracking-widest text-[#ff4500] hover:text-white transition-colors flex items-center gap-1">
            Pitch Deck
          </Link>
          <button 
            onClick={() => window.dispatchEvent(new Event('restart-tutorial'))}
            className="text-sm font-heading font-bold uppercase tracking-widest text-[#ff4500] hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
          >
            Tutorial
          </button>
          <Link href="/dashboard" className="text-sm font-heading font-bold uppercase tracking-widest text-white/60 hover:text-[#ff4500] transition-colors">
            Dashboard
          </Link>
          <Link href="/marketplace" id="tour-marketplace" className="text-sm font-heading font-bold uppercase tracking-widest text-white/60 hover:text-[#ff4500] transition-colors">
            Marketplace
          </Link>
          <Link href="/portfolio" id="tour-portfolio" className="text-sm font-heading font-bold uppercase tracking-widest text-white/60 hover:text-[#ff4500] transition-colors">
            Portfolio
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-6 text-xs font-mono text-white/40 mr-4">
          <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> SYSTEM: ONLINE</span>
        </div>

        {userData ? (
          <div className="flex items-center gap-6">
            <Link href="/profile" className="hidden sm:block text-sm font-heading font-bold uppercase tracking-widest text-white/60 hover:text-[#ff4500] transition-colors">
              Profile
            </Link>
            <div className="hidden sm:flex flex-col items-end border-r border-white/10 pr-6">
              <span className="text-[10px] font-mono text-[#ff4500] tracking-widest uppercase">Connected</span>
              <span className="text-xs text-white/70 font-mono">
                {truncateAddress(userData.profile.stxAddress.testnet)}
              </span>
            </div>
            {profile && (
              <Button 
                variant="outline" 
                id="tour-role-switcher"
                onClick={handleSwitchRole}
                disabled={isSwitching}
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white transition-all rounded-none h-10 px-4 flex items-center gap-2 group"
                title={`Switch to ${profile.role === 'BUILDER' ? 'DAO' : 'BUILDER'} view`}
              >
                {profile.role === 'BUILDER' ? (
                  <><HardHat className="w-4 h-4 text-[#ff4500]" /> <span className="hidden lg:inline text-xs font-mono">Builder</span></>
                ) : (
                  <><Building2 className="w-4 h-4 text-[#ff4500]" /> <span className="hidden lg:inline text-xs font-mono">DAO</span></>
                )}
                <RefreshCw className={`w-3 h-3 text-white/40 ml-1 group-hover:text-white transition-colors ${isSwitching ? 'animate-spin' : ''}`} />
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={disconnect}
              className="bg-transparent text-white font-heading font-bold uppercase tracking-widest border border-white/20 hover:border-[#ff4500] hover:text-[#ff4500] transition-all rounded-none h-10 px-6"
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <Button 
            onClick={connect} 
            className="bg-[#ff4500] text-black hover:bg-white hover:text-black transition-all duration-300 rounded-none px-6 h-10 font-heading font-bold uppercase tracking-widest border-none shadow-[0_0_15px_rgba(255,69,0,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)]"
          >
            Connect Wallet
          </Button>
        )}
      </div>
    </nav>
  );
}

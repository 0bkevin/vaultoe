'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useStacks } from '@/components/providers/StacksProvider';
import { Hexagon } from 'lucide-react';

export function Navbar() {
  const { connect, disconnect, userData } = useStacks();

  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 5)}...${address.slice(-4)}`;
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
          <Link href="/dashboard" className="text-sm font-heading font-bold uppercase tracking-widest text-white/60 hover:text-[#ff4500] transition-colors">
            Dashboard
          </Link>
          <Link href="/marketplace" className="text-sm font-heading font-bold uppercase tracking-widest text-white/60 hover:text-[#ff4500] transition-colors">
            Marketplace
          </Link>
          <Link href="/portfolio" className="text-sm font-heading font-bold uppercase tracking-widest text-white/60 hover:text-[#ff4500] transition-colors">
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

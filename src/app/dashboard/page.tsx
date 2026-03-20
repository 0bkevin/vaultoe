'use client';

import { useState, useEffect } from 'react';
import { useStacks } from '@/components/providers/StacksProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from "@/components/ui/button";
import { Lock, Terminal } from 'lucide-react';
import { BuilderView } from './components/BuilderView';
import { DaoView } from './components/DaoView';
import { DashboardTutorial } from '@/components/tutorial/DashboardTutorial';
import Link from 'next/link';

interface Invoice {
  id: string;
  onchainId: number | null;
  title: string;
  daoPrincipal: string | null;
  builderPrincipal: string;
  amountUsdcx: number;
  status: string;
  discountBps: number | null;
  githubPrUrl: string | null;
}

export default function Dashboard() {
  const { userData, network, connect, profile } = useStacks();
  const [isLoading, setIsLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      // Sync onchainId from Stacks API first
      await fetch('/api/invoices/sync', { method: 'POST' });

      const res = await fetch('/api/invoices');
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col relative overflow-hidden selection:bg-[#ff4500]/30 selection:text-[#ff4500]">
        <Navbar />
        
        {/* Global Background Elements */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]" />
          <div className="absolute top-[20%] left-[10%] text-[#ffffff20] text-xs font-mono">+</div>
          <div className="absolute top-[60%] right-[15%] text-[#ffffff20] text-xs font-mono">+</div>
          <div className="absolute bottom-[20%] left-[20%] text-[#ffffff20] text-xs font-mono">+</div>
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-[#ff4500]/10 blur-[120px] mix-blend-screen" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
        </div>

        <div className="flex-1 flex items-center justify-center z-10 relative px-6">
          <div className="w-full max-w-2xl border border-white/10 bg-[#020202] p-12 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ff4500]/0 via-[#ff4500] to-[#ff4500]/0 opacity-50" />
            
            <div className="text-center space-y-8">
              <div className="flex justify-center">
                <div className="w-24 h-24 border border-white/10 bg-[#050505] flex items-center justify-center relative">
                  <Lock className="w-8 h-8 text-[#ff4500]" strokeWidth={1.5} />
                  <div className="absolute -top-3 -right-3 bg-[#ff4500] text-black text-xs font-mono font-bold px-2 py-1">
                    AUTH
                  </div>
                </div>
              </div>
              
              <div>
                <div className="text-[#ff4500] font-mono text-sm mb-4 tracking-widest uppercase">[ SYSTEM_LOCKED ]</div>
                <h2 className="text-4xl md:text-5xl font-heading font-black text-white uppercase tracking-tighter">
                  Connect Wallet <br/>
                  <span className="text-white/40">To Access Vault</span>
                </h2>
              </div>
              
              <p className="text-white/50 font-sans leading-relaxed max-w-md mx-auto">
                Authentication required to view your grants, invoices, and liquidity positions.
              </p>

              <Button 
                onClick={connect}
                className="w-full h-16 bg-[#ff4500] text-black hover:bg-white hover:text-black transition-all duration-300 rounded-none font-heading font-bold text-xl uppercase tracking-widest border-none shadow-[0_0_20px_rgba(255,69,0,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
              >
                Connect Wallet
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeRole = profile?.role || 'BUILDER';
  const isDao = activeRole.toUpperCase() === 'DAO';

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col relative overflow-hidden selection:bg-[#ff4500]/30 selection:text-[#ff4500]">
      <Navbar />
      
      {/* Global Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <main className="flex-1 container mx-auto px-4 py-12 z-10 relative max-w-[1600px]">
        <DashboardTutorial />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8 border-b border-white/10 pb-8">
          <div>
            <div className="text-[#ff4500] font-mono text-sm mb-4 tracking-widest uppercase flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              [ ACTIVE_ROLE: {activeRole} ]
            </div>
            <h1 className="text-5xl md:text-6xl font-heading font-black text-white uppercase tracking-tighter leading-none mb-4">
              {isDao ? 'DAO Control' : 'Builder' } <br/>
              <span className="text-white/20">{isDao ? 'Panel' : 'Dashboard'}</span>
            </h1>
          </div>
          <div className="text-left md:text-right font-mono text-xs text-white/40 max-w-xs">
            {isDao ? (
              <>
                <p>MANAGE GRANTS</p>
                <p>LOCK FUNDS</p>
                <p>VIEW BUILDER PROGRESS</p>
              </>
            ) : (
              <>
                <p>VIEW PENDING GRANTS</p>
                <p>TOKENIZE INVOICES</p>
                <p>ACCESS UPFRONT LIQUIDITY</p>
              </>
            )}
          </div>
        </div>

        <div className="w-full" id="tour-dashboard-content">
          {isDao ? (
            <DaoView 
              invoices={invoices} 
              isLoading={isLoading} 
              fetchInvoices={fetchInvoices} 
              userData={userData} 
              network={network} 
            />
          ) : (
            <BuilderView 
              invoices={invoices} 
              isLoading={isLoading} 
              fetchInvoices={fetchInvoices} 
              userData={userData} 
              network={network} 
            />
          )}
        </div>
      </main>
    </div>
  );
}

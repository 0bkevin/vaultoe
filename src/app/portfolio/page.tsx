'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStacks } from '@/components/providers/StacksProvider';
import { Navbar } from '@/components/layout/Navbar';
import { toast } from 'sonner';
import { AlertTriangle, Activity, DollarSign, CheckCircle2 } from 'lucide-react';

interface Investment {
  id: string;
  invoiceId: string;
  investorPrincipal: string;
  amountSbtc: number;
  sharePercentage: number;
}

interface Invoice {
  id: string;
  title: string;
  amountUsdcx: number;
  status: string;
  onchainId: number | null;
}

interface InvestmentWithInvoice extends Investment {
  invoice: Invoice;
  estimatedPayout: number;
}

export default function Portfolio() {
  const { userData, network } = useStacks();
  const [investments, setInvestments] = useState<InvestmentWithInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await fetch(`/api/investments?investor=${userData.profile.stxAddress.testnet}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();

        const investmentsWithInvoices = await Promise.all(
          data.investments.map(async (inv: Investment) => {
            const invoiceRes = await fetch(`/api/invoices/${inv.invoiceId}`);
            if (invoiceRes.ok) {
              const invoiceData = await invoiceRes.json();
              return {
                ...inv,
                invoice: invoiceData.invoice,
                estimatedPayout: (invoiceData.invoice.amountUsdcx * inv.sharePercentage) / 100,
              };
            }
            return null;
          })
        );

        setInvestments(investmentsWithInvoices.filter(Boolean) as InvestmentWithInvoice[]);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load portfolio');
      } finally {
        setIsLoading(false);
      }
    };

    if (userData) {
      fetchPortfolio();
    } else {
      setIsLoading(false);
    }
  }, [userData]);

  const handleClaimYield = async (escrowId: number, investmentId: string) => {
    if (!userData) return;

    setClaimingId(investmentId);
    try {
      const { openContractCall } = await import('@stacks/connect');
      const { uintCV } = await import('@stacks/transactions');

      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || userData.profile.stxAddress.testnet;
      const contractName = process.env.NEXT_PUBLIC_CONTRACT_NAME || 'invoice-vault';

      await openContractCall({
        network,
        contractAddress,
        contractName,
        functionName: 'claim-yield',
        functionArgs: [uintCV(escrowId)],
        onFinish: (data: { txId: string }) => {
          console.log('Claim transaction submitted:', data.txId);
          toast.success('Yield claimed successfully!');
          setInvestments(prev => prev.filter(inv => inv.id !== investmentId));
        },
        onCancel: () => {
          toast.error('Claim cancelled');
        },
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to claim yield');
    } finally {
      setClaimingId(null);
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#ff4500] selection:text-white">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center space-y-6 border border-[#ff4500]/30 p-12 bg-black/50 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff4500] to-transparent opacity-50"></div>
            <AlertTriangle className="w-16 h-16 text-[#ff4500] mx-auto mb-4 opacity-80" />
            <h2 className="text-3xl font-heading font-bold tracking-tighter text-white">ACCESS DENIED</h2>
            <p className="text-white/60 font-mono text-sm max-w-md mx-auto">
              SYSTEM REQUIRES AUTHENTICATION TO VIEW PORTFOLIO DATA. CONNECT WALLET TO PROCEED.
            </p>
            <div className="pt-4">
              <div className="inline-block border border-[#ff4500]/50 px-6 py-3 text-[#ff4500] font-mono text-sm uppercase tracking-widest bg-[#ff4500]/5">
                AWAITING CONNECTION...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeInvestments = investments.filter(inv => inv.invoice.status !== 'SETTLED');
  const settledInvestments = investments.filter(inv => inv.invoice.status === 'SETTLED');
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amountSbtc, 0);
  const totalEstimatedPayout = investments.reduce((sum, inv) => sum + inv.estimatedPayout, 0);
  const claimableYield = settledInvestments.reduce((sum, inv) => sum + inv.estimatedPayout, 0);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#ff4500] selection:text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="mb-12 border-b border-white/10 pb-8 flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-heading font-bold tracking-tighter mb-4 uppercase">Portfolio</h1>
            <p className="text-lg text-white/60 max-w-2xl font-mono text-sm">
              &gt; TRACK YOUR INVESTMENTS AND CLAIM YIELDS.<br/>
              &gt; TERMINAL STATUS: <span className="text-green-500">ONLINE</span>
            </p>
          </div>
          <div className="hidden md:block text-right font-mono text-xs text-white/40">
            <div>USER: {userData.profile.stxAddress.testnet.slice(0, 8)}...</div>
            <div>NETWORK: TESTNET</div>
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-20 border border-white/10 bg-black/50">
            <span className="animate-pulse font-mono text-[#ff4500]">&gt; SYNCING PORTFOLIO DATA...</span>
          </div>
        )}

        {!isLoading && investments.length === 0 && (
          <div className="text-center py-20 border border-white/10 bg-black/50">
            <p className="text-white/50 font-mono mb-6">&gt; NO ACTIVE POSITIONS FOUND.</p>
            <Link href="/marketplace" className="inline-block border border-[#ff4500] bg-[#ff4500]/10 text-[#ff4500] hover:bg-[#ff4500] hover:text-black px-8 py-4 text-sm font-bold uppercase tracking-wider transition-colors">
              BROWSE MARKETPLACE
            </Link>
          </div>
        )}

        {!isLoading && investments.length > 0 && (
          <div className="grid gap-6 md:grid-cols-3 mb-12">
            <div className="border border-white/10 bg-white/5 p-6 relative">
              <div className="flex items-center gap-2 text-white/50 font-mono text-xs uppercase tracking-wider mb-4">
                <Activity className="w-4 h-4" />
                Total Invested
              </div>
              <div className="text-4xl font-heading font-bold">
                {totalInvested.toLocaleString()} <span className="text-lg text-white/40 font-mono">sBTC</span>
              </div>
            </div>
            <div className="border border-white/10 bg-white/5 p-6 relative">
              <div className="flex items-center gap-2 text-white/50 font-mono text-xs uppercase tracking-wider mb-4">
                <DollarSign className="w-4 h-4" />
                Estimated Payout
              </div>
              <div className="text-4xl font-heading font-bold">
                {totalEstimatedPayout.toLocaleString()} <span className="text-lg text-white/40 font-mono">USDCx</span>
              </div>
            </div>
            <div className={`border p-6 relative ${claimableYield > 0 ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 bg-white/5'}`}>
              {claimableYield > 0 && <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>}
              <div className={`flex items-center gap-2 font-mono text-xs uppercase tracking-wider mb-4 ${claimableYield > 0 ? 'text-green-500' : 'text-white/50'}`}>
                <CheckCircle2 className="w-4 h-4" />
                Claimable Yield
              </div>
              <div className={`text-4xl font-heading font-bold ${claimableYield > 0 ? 'text-green-500' : 'text-white'}`}>
                {claimableYield.toLocaleString()} <span className={`text-lg font-mono ${claimableYield > 0 ? 'text-green-500/60' : 'text-white/40'}`}>USDCx</span>
              </div>
            </div>
          </div>
        )}

        {activeInvestments.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-heading font-bold uppercase tracking-tight">Active Positions</h2>
              <div className="h-px bg-white/10 flex-1"></div>
              <div className="font-mono text-xs text-white/40">{activeInvestments.length} OPEN</div>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeInvestments.map((inv) => (
                <div key={inv.id} className="border border-white/10 bg-black/50 p-6 relative group hover:border-[#ff4500]/50 transition-colors">
                  <div className="absolute top-0 left-0 w-1 h-full bg-white/20 group-hover:bg-[#ff4500] transition-colors"></div>
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-heading font-bold truncate pr-4">{inv.invoice.title}</h3>
                    <span className={`px-2 py-1 text-[10px] uppercase tracking-wider border ${
                      inv.invoice.status === 'TOKENIZED' ? 'border-[#ff4500] text-[#ff4500] bg-[#ff4500]/10' :
                      'border-blue-500 text-blue-500 bg-blue-500/10'
                    }`}>
                      {inv.invoice.status}
                    </span>
                  </div>
                  
                  <div className="space-y-4 font-mono text-sm">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-white/50">INVESTED:</span>
                      <span>{inv.amountSbtc.toLocaleString()} sBTC</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-white/50">SHARE:</span>
                      <span>{inv.sharePercentage.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-white/50">EST. PAYOUT:</span>
                      <span className="text-green-500 font-bold">{inv.estimatedPayout.toLocaleString()} USDCx</span>
                    </div>
                    
                    <Link href={`/invoice/${inv.invoice.id}`} className="block mt-4">
                      <button className="w-full border border-white/20 hover:border-white hover:bg-white hover:text-black text-white font-bold py-3 text-xs uppercase tracking-wider transition-colors">
                        VIEW DETAILS
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {settledInvestments.length > 0 && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-heading font-bold uppercase tracking-tight text-green-500">Settled Escrows</h2>
              <div className="h-px bg-green-500/20 flex-1"></div>
              <div className="font-mono text-xs text-green-500/60">ACTION REQUIRED</div>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {settledInvestments.map((inv) => (
                <div key={inv.id} className="border border-green-500/50 bg-green-500/5 p-6 relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-heading font-bold truncate pr-4">{inv.invoice.title}</h3>
                    <span className="px-2 py-1 text-[10px] uppercase tracking-wider border border-green-500 text-green-500 bg-green-500/10">
                      SETTLED
                    </span>
                  </div>
                  
                  <div className="space-y-4 font-mono text-sm">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-white/50">INVESTED:</span>
                      <span>{inv.amountSbtc.toLocaleString()} sBTC</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-white/50">YOUR PAYOUT:</span>
                      <span className="text-green-500 font-bold">{inv.estimatedPayout.toLocaleString()} USDCx</span>
                    </div>
                    
                    <button 
                      className="w-full mt-4 bg-green-500 hover:bg-green-400 text-black font-bold py-3 text-xs uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleClaimYield(inv.invoice.onchainId!, inv.id)}
                      disabled={claimingId === inv.id}
                    >
                      {claimingId === inv.id ? 'CLAIMING...' : 'CLAIM YIELD'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

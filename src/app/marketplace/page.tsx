'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useStacks } from '@/components/providers/StacksProvider';
import { toast } from 'sonner';
import { TrendingUp, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface Invoice {
  id: string;
  onchainId: number;
  title: string;
  builderPrincipal: string;
  amountUsdcx: number;
  discountBps: number;
  status: string;
  totalFunded?: number;
  investorCount?: number;
}

interface Investment {
  id: string;
  invoiceId: string;
  investorPrincipal: string;
  amountSbtc: number;
  sharePercentage: number;
}

export default function Marketplace() {
  const { userData, network } = useStacks();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fundAmount, setFundAmount] = useState('');
  const [isFunding, setIsFunding] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invoicesRes, investmentsRes] = await Promise.all([
          fetch('/api/invoices'),
          userData ? fetch(`/api/investments?investor=${userData.profile.stxAddress.testnet}`) : Promise.resolve(null)
        ]);
        
        if (!invoicesRes.ok) throw new Error('Failed to fetch invoices');
        const invoicesData = await invoicesRes.json();
        
        const invoicesWithFunding = await Promise.all(
          invoicesData.invoices.map(async (inv: Invoice) => {
            const invRes = await fetch(`/api/investments?invoiceId=${inv.id}`);
            if (invRes.ok) {
              const invData = await invRes.json();
              const totalFunded = invData.investments.reduce((sum: number, i: Investment) => sum + i.amountSbtc, 0);
              return { ...inv, totalFunded, investorCount: invData.investments.length };
            }
            return { ...inv, totalFunded: 0, investorCount: 0 };
          })
        );
        
        setInvoices(invoicesWithFunding);

        if (investmentsRes && investmentsRes.ok) {
          const investmentsData = await investmentsRes.json();
          setInvestments(investmentsData.investments);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load marketplace data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userData]);

  const handleFund = async (escrowId: number, invoiceId: string, invoiceAmount: number) => {
    if (!userData) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    if (!fundAmount || isNaN(Number(fundAmount)) || Number(fundAmount) <= 0) {
      toast.error("Please enter a valid funding amount");
      return;
    }

    setIsFunding(true);
    try {
      const { openContractCall } = await import('@stacks/connect');
      const { uintCV } = await import('@stacks/transactions');

      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || userData.profile.stxAddress.testnet;
      const contractName = process.env.NEXT_PUBLIC_CONTRACT_NAME || 'invoice-vault';
      const functionName = 'fund-invoice';
      
      const microAmount = parseInt(fundAmount) * 1000000;
      const sharePercentage = (Number(fundAmount) / invoiceAmount) * 100;

      await openContractCall({
        network,
        contractAddress,
        contractName,
        functionName,
        functionArgs: [
          uintCV(escrowId),
          uintCV(microAmount)
        ],
        onFinish: async (data: { txId: string }) => {
          console.log("Transaction submitted:", data.txId);
          
          try {
            await fetch('/api/investments', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                invoiceId,
                investorPrincipal: userData.profile.stxAddress.testnet,
                amountSbtc: fundAmount,
                sharePercentage
              })
            });
          } catch (dbError) {
            console.error("DB sync error:", dbError);
          }

          toast.success("Successfully funded! Transaction is pending.");
          setFundAmount('');
        },
        onCancel: () => {
          toast.error("Funding cancelled");
        },
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to execute funding transaction");
    } finally {
      setIsFunding(false);
    }
  };

  const handleClaimYield = async (escrowId: number, investmentId: string) => {
    if (!userData) {
      toast.error("Please connect your wallet first");
      return;
    }

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
          console.log("Claim transaction submitted:", data.txId);
          toast.success("Yield claimed successfully!");
          setInvestments(prev => prev.filter(inv => inv.id !== investmentId));
        },
        onCancel: () => {
          toast.error("Claim cancelled");
        },
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to claim yield");
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
              SYSTEM REQUIRES AUTHENTICATION TO ACCESS MARKETPLACE DATA. CONNECT WALLET TO PROCEED.
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

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#ff4500] selection:text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="mb-12 border-b border-white/10 pb-8">
          <h1 className="text-5xl font-heading font-bold tracking-tighter mb-4 uppercase">Yield Marketplace</h1>
          <p className="text-lg text-white/60 max-w-2xl font-mono text-sm">
            &gt; PROVIDE INSTANT LIQUIDITY TO BUILDERS USING SBTC.<br/>
            &gt; EARN REAL-WORLD USDCX YIELD SECURED BY CLARITY ESCROW.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-12">
          <div className="border border-[#ff4500]/30 bg-[#ff4500]/5 p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#ff4500]"></div>
            <div className="flex items-center gap-2 text-[#ff4500] font-mono text-xs uppercase tracking-wider mb-4">
              <TrendingUp className="w-4 h-4" />
              Average APY
            </div>
            <div className="text-4xl font-heading font-bold text-[#ff4500]">8.42%</div>
          </div>
          <div className="border border-white/10 bg-white/5 p-6 relative">
            <div className="text-white/50 font-mono text-xs uppercase tracking-wider mb-4">Total Value Locked</div>
            <div className="text-4xl font-heading font-bold">$1.24M</div>
          </div>
          <div className="border border-white/10 bg-white/5 p-6 relative">
            <div className="flex items-center gap-2 text-white/50 font-mono text-xs uppercase tracking-wider mb-4">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              Default Rate
            </div>
            <div className="text-4xl font-heading font-bold">0.00%</div>
          </div>
        </div>

        <div className="mb-6 flex justify-between items-end">
          <h2 className="text-2xl font-heading font-bold uppercase tracking-tight">Active Opportunities</h2>
          <div className="font-mono text-xs text-white/40">LIVE DATA FEED</div>
        </div>

        <div className="border border-white/10 bg-black/50 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 font-mono text-xs uppercase tracking-wider text-white/60">
                <th className="p-4 font-normal">Project / Invoice</th>
                <th className="p-4 font-normal">Builder</th>
                <th className="p-4 font-normal text-right">Payout (USDCx)</th>
                <th className="p-4 font-normal text-right">Funding Goal (sBTC)</th>
                <th className="p-4 font-normal text-center">Fixed Yield</th>
                <th className="p-4 font-normal text-center">Status</th>
                <th className="p-4 font-normal text-right">Action</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-white/40">
                    <span className="animate-pulse">&gt; LOADING LIVE MARKETPLACE DATA...</span>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-white/40">
                    &gt; NO TOKENIZED INVOICES AVAILABLE AT THE MOMENT.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const targetSbtc = inv.amountUsdcx - (inv.amountUsdcx * ((inv.discountBps || 0) / 10000));
                  const estimatedYield = inv.discountBps ? `${(inv.discountBps / 100).toFixed(2)}%` : "0.00%";
                  const truncateAddress = (addr: string) => addr ? `${addr.slice(0, 5)}...${addr.slice(-4)}` : 'Unknown';
                  const funded = inv.totalFunded || 0;
                  const progress = targetSbtc > 0 ? (funded / targetSbtc) * 100 : 0;
                  
                  return (
                    <tr key={inv.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <Link href={`/invoice/${inv.id}`} className="font-bold text-white hover:text-[#ff4500] transition-colors">
                          {inv.title}
                        </Link>
                      </td>
                      <td className="p-4 text-white/50">{truncateAddress(inv.builderPrincipal)}</td>
                      <td className="p-4 text-right font-bold">{inv.amountUsdcx.toLocaleString()}</td>
                      <td className="p-4 text-right">
                        <div className="mb-2">{targetSbtc.toLocaleString()}</div>
                        <div className="w-full bg-white/10 h-1 relative overflow-hidden">
                          <div 
                            className="absolute top-0 left-0 h-full bg-[#ff4500]" 
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-white/40 mt-1">
                          {funded.toLocaleString()} / {targetSbtc.toLocaleString()} ({progress.toFixed(0)}%)
                        </div>
                      </td>
                      <td className="p-4 text-center text-[#ff4500] font-bold">{estimatedYield}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 text-[10px] uppercase tracking-wider border ${
                          inv.status === 'TOKENIZED' ? 'border-[#ff4500] text-[#ff4500] bg-[#ff4500]/10' : 
                          inv.status === 'SETTLED' ? 'border-green-500 text-green-500 bg-green-500/10' :
                          'border-white/20 text-white/60 bg-white/5'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {inv.status === 'TOKENIZED' && inv.onchainId !== null ? (
                          <Dialog>
                            <DialogTrigger 
                              className="inline-block border border-[#ff4500] bg-[#ff4500]/10 text-[#ff4500] hover:bg-[#ff4500] hover:text-black px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors"
                              onClick={() => {
                                setFundAmount('');
                              }}
                            >
                              Provide Liquidity
                            </DialogTrigger>
                            <DialogContent className="bg-[#050505] border border-[#ff4500]/50 text-white rounded-none font-sans">
                              <DialogHeader>
                                <DialogTitle className="font-heading text-2xl uppercase tracking-tight text-[#ff4500]">Fund: {inv.title}</DialogTitle>
                                <DialogDescription className="font-mono text-xs text-white/60 uppercase">
                                  &gt; SENDING SBTC DIRECTLY TO BUILDER.<br/>
                                  &gt; UPON MILESTONE COMPLETION, RECEIVE PROPORTIONAL SHARE OF {inv.amountUsdcx} USDCX LOCKED IN ESCROW.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-6 font-mono text-sm">
                                <div className="flex justify-between border-b border-white/10 pb-2">
                                  <span className="text-white/50">TARGET FUNDING:</span>
                                  <span className="font-bold">{targetSbtc.toLocaleString()} sBTC</span>
                                </div>
                                <div className="flex justify-between border-b border-white/10 pb-2">
                                  <span className="text-white/50">ALREADY FUNDED:</span>
                                  <span className="font-bold">{funded.toLocaleString()} sBTC</span>
                                </div>
                                <div className="flex justify-between border-b border-white/10 pb-2">
                                  <span className="text-white/50">REMAINING:</span>
                                  <span className="font-bold text-[#ff4500]">{(targetSbtc - funded).toLocaleString()} sBTC</span>
                                </div>
                                <div className="space-y-3 mt-4">
                                  <Label className="text-xs text-white/50 uppercase tracking-wider">Investment Amount (sBTC)</Label>
                                  <Input 
                                    type="number" 
                                    placeholder="1000" 
                                    value={fundAmount}
                                    onChange={(e) => setFundAmount(e.target.value)}
                                    max={targetSbtc - funded}
                                    className="bg-black border-white/20 text-white font-mono rounded-none focus-visible:ring-0 focus-visible:border-[#ff4500]"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button 
                                  onClick={() => handleFund(inv.onchainId!, inv.id, inv.amountUsdcx)} 
                                  disabled={isFunding || !userData}
                                  className="w-full bg-[#ff4500] hover:bg-[#ff4500]/80 text-black font-bold uppercase tracking-wider rounded-none"
                                >
                                  {isFunding ? "SIGNING TX..." : "FUND & EARN YIELD"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <span className="inline-block border border-white/10 bg-white/5 text-white/40 px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-not-allowed">
                            {inv.status === 'LOCKED' ? 'NOT TOKENIZED' : 'UNAVAILABLE'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {userData && investments.length > 0 && (
          <div className="mt-20">
            <div className="mb-8 border-b border-white/10 pb-4">
              <h2 className="text-3xl font-heading font-bold tracking-tighter uppercase">Your Investments</h2>
              <p className="text-white/50 font-mono text-sm mt-2">
                &gt; TRACK ACTIVE INVESTMENTS AND CLAIM YIELD FROM SETTLED ESCROWS.
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {investments.map((inv) => {
                const invoice = invoices.find(i => i.id === inv.invoiceId);
                if (!invoice) return null;
                
                const isSettled = invoice.status === 'SETTLED';
                const estimatedPayout = (invoice.amountUsdcx * inv.sharePercentage / 100).toFixed(2);
                
                return (
                  <div key={inv.id} className={`border p-6 relative ${isSettled ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 bg-black/50'}`}>
                    {isSettled && <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>}
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-xl font-heading font-bold truncate pr-4">{invoice.title}</h3>
                      <span className={`px-2 py-1 text-[10px] uppercase tracking-wider border ${
                        isSettled ? 'border-green-500 text-green-500 bg-green-500/10' : 'border-white/20 text-white/60 bg-white/5'
                      }`}>
                        {invoice.status}
                      </span>
                    </div>
                    
                    <div className="space-y-4 font-mono text-sm">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-white/50">SHARE:</span>
                        <span>{inv.sharePercentage.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-white/50">INVESTED:</span>
                        <span>{inv.amountSbtc.toLocaleString()} sBTC</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-white/50">EST. PAYOUT:</span>
                        <span className="text-green-500 font-bold">{estimatedPayout} USDCx</span>
                      </div>
                      
                      {isSettled && (
                        <button 
                          className="w-full mt-4 bg-green-500 hover:bg-green-400 text-black font-bold py-3 text-xs uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleClaimYield(invoice.onchainId, inv.id)}
                          disabled={claimingId === inv.id}
                        >
                          {claimingId === inv.id ? 'CLAIMING...' : 'CLAIM YIELD'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

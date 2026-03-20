'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useStacks } from '@/components/providers/StacksProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from 'sonner';
import { ArrowUpRight } from 'lucide-react';

interface Invoice {
  id: string;
  onchainId: number | null;
  title: string;
  description: string | null;
  daoPrincipal: string | null;
  builderPrincipal: string;
  amountUsdcx: number;
  discountBps: number | null;
  status: string;
  githubPrUrl: string | null;
  createdAt: number;
}

interface UserProfile {
  principal: string;
  name: string | null;
  description: string | null;
  role: string;
  githubUrl: string | null;
  websiteUrl: string | null;
}

interface Investment {
  id: string;
  invoiceId: string;
  investorPrincipal: string;
  amountSbtc: number;
  sharePercentage: number;
  createdAt: number;
}

interface InvoiceData {
  invoice: Invoice;
  investments: Investment[];
  totalFunded: number;
  dao: UserProfile | null;
  builder: UserProfile | null;
}

export default function InvoiceDetail() {
  const params = useParams();
  const { userData, network } = useStacks();
  const [data, setData] = useState<InvoiceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fundAmount, setFundAmount] = useState('');
  const [isFunding, setIsFunding] = useState(false);

  const invoiceId = params.id as string;

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const invoiceData = await res.json();
      setData(invoiceData);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFund = async () => {
    if (!userData || !data) return;
    if (!fundAmount || isNaN(Number(fundAmount)) || Number(fundAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsFunding(true);
    try {
      const { openContractCall } = await import('@stacks/connect');
      const { uintCV } = await import('@stacks/transactions');

      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || userData.profile.stxAddress.testnet;
      const contractName = process.env.NEXT_PUBLIC_CONTRACT_NAME || 'invoice-vault';
      const microAmount = parseInt(fundAmount) * 1000000;
      const sharePercentage = (Number(fundAmount) / data.invoice.amountUsdcx) * 100;

      await openContractCall({
        network,
        contractAddress,
        contractName,
        functionName: 'fund-invoice',
        functionArgs: [uintCV(data.invoice.onchainId!), uintCV(microAmount)],
        onFinish: async (txData: { txId: string }) => {
          console.log('Transaction submitted:', txData.txId);
          try {
            await fetch('/api/investments', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                invoiceId: data.invoice.id,
                investorPrincipal: userData.profile.stxAddress.testnet,
                amountSbtc: fundAmount,
                sharePercentage,
              }),
            });
          } catch (dbError) {
            console.error('DB sync error:', dbError);
          }
          toast.success('Successfully funded!');
          setFundAmount('');
          await fetchInvoice();
        },
        onCancel: () => {
          toast.error('Funding cancelled');
        },
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to fund');
    } finally {
      setIsFunding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col relative overflow-hidden selection:bg-[#ff4500]/30 selection:text-[#ff4500]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          <div className="text-[#ff4500] font-mono text-sm tracking-widest uppercase animate-pulse">
            [ LOADING_VAULT_DATA... ]
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col relative overflow-hidden selection:bg-[#ff4500]/30 selection:text-[#ff4500]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          <div className="border border-[#ff4500] bg-[#ff4500]/5 p-12 max-w-2xl w-full text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#ff4500]" />
            <div className="absolute bottom-0 right-0 w-full h-1 bg-[#ff4500]" />
            <div className="absolute top-0 left-0 w-1 h-full bg-[#ff4500]" />
            <div className="absolute bottom-0 right-0 w-1 h-full bg-[#ff4500]" />
            
            <div className="text-[#ff4500] font-mono text-sm mb-6 tracking-widest uppercase">[ ACCESS_DENIED ]</div>
            <h2 className="text-4xl md:text-5xl font-heading font-black text-white uppercase tracking-tighter mb-8">
              Connect Wallet <br/>
              <span className="text-white/40">To View Vault</span>
            </h2>
            <p className="text-white/50 font-mono text-sm mb-8">
              AUTHENTICATION REQUIRED TO ACCESS ESCROW DETAILS AND FUNDING MECHANICS.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col relative overflow-hidden selection:bg-[#ff4500]/30 selection:text-[#ff4500]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          <div className="border border-white/10 bg-white/[0.02] p-12 max-w-2xl w-full text-center">
            <div className="text-white/40 font-mono text-sm mb-6 tracking-widest uppercase">[ 404_NOT_FOUND ]</div>
            <h2 className="text-4xl md:text-5xl font-heading font-black text-white uppercase tracking-tighter mb-8">
              Vault Not <br/>
              <span className="text-white/40">Found</span>
            </h2>
            <Link href="/marketplace" className="inline-flex items-center justify-center px-8 h-12 bg-transparent text-white font-heading font-bold uppercase tracking-wider border border-white/20 hover:border-[#ff4500] hover:text-[#ff4500] transition-all rounded-none">
              Return to Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { invoice, investments, totalFunded, dao, builder } = data;
  const discountMultiplier = 1 - (invoice.discountBps || 0) / 10000;
  const fundingTarget = invoice.amountUsdcx * discountMultiplier;
  const fundingProgress = fundingTarget > 0 ? (totalFunded / fundingTarget) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col relative overflow-hidden selection:bg-[#ff4500]/30 selection:text-[#ff4500]">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]" />
      </div>

      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl relative z-10">
        <div className="mb-12">
          <Link href="/marketplace" className="text-xs font-mono text-white/40 hover:text-[#ff4500] mb-8 inline-flex items-center gap-2 uppercase tracking-widest transition-colors">
            ← [ RETURN_TO_MARKETPLACE ]
          </Link>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8">
            <div>
              <div className="text-[#ff4500] font-mono text-sm mb-4 tracking-widest uppercase">[ VAULT_DETAILS ]</div>
              <h1 className="text-4xl md:text-6xl font-heading font-black text-white uppercase tracking-tighter leading-none">
                {invoice.title}
              </h1>
              <p className="text-white/50 font-sans mt-4 max-w-2xl text-lg">
                {invoice.description || 'NO DESCRIPTION PROVIDED'}
              </p>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <div className="font-mono text-xs text-white/40 uppercase tracking-widest">STATUS</div>
              <div className={`px-4 py-2 font-mono text-sm font-bold uppercase tracking-widest border ${
                invoice.status === 'LOCKED' ? 'border-blue-500/50 text-blue-400 bg-blue-500/10' :
                invoice.status === 'TOKENIZED' ? 'border-[#ff4500]/50 text-[#ff4500] bg-[#ff4500]/10' :
                invoice.status === 'SETTLED' ? 'border-green-500/50 text-green-400 bg-green-500/10' :
                'border-white/20 text-white/60 bg-white/5'
              }`}>
                {invoice.status}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-7 space-y-8">
            <div className="border border-white/10 bg-white/[0.02] p-8 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ff4500]/0 via-[#ff4500] to-[#ff4500]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <h3 className="text-xl font-heading font-bold text-white uppercase tracking-tight mb-6 flex items-center gap-3">
                <span className="w-2 h-2 bg-[#ff4500] rounded-none" />
                Contract Parameters
              </h3>
              
              <div className="space-y-4 font-mono text-sm">
                <div className="flex justify-between border-b border-white/5 pb-3">
                  <span className="text-white/40">ESCROW_ID</span>
                  <span className="text-white">#{invoice.onchainId || 'PENDING'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-3">
                  <span className="text-white/40">AMOUNT_LOCKED</span>
                  <span className="text-white font-bold">{invoice.amountUsdcx.toLocaleString()} USDCx</span>
                </div>
                {invoice.discountBps && invoice.discountBps > 0 && (
                  <div className="flex justify-between border-b border-white/5 pb-3">
                    <span className="text-white/40">DISCOUNT_RATE</span>
                    <span className="text-[#ff4500]">{invoice.discountBps / 100}%</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-white/5 pb-3">
                  <span className="text-white/40">FUNDING_TARGET</span>
                  <span className="text-white">{fundingTarget.toLocaleString()} sBTC</span>
                </div>
                {invoice.githubPrUrl && (
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-white/40">ORACLE_TRIGGER</span>
                    <a href={invoice.githubPrUrl} target="_blank" rel="noopener noreferrer" className="text-[#ff4500] hover:text-white transition-colors flex items-center gap-2">
                      [ VIEW_PR ] <ArrowUpRight className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="border border-white/10 bg-white/[0.02] p-6 relative">
                <div className="text-white/40 font-mono text-xs mb-4 tracking-widest uppercase">BUILDER_ENTITY</div>
                {builder ? (
                  <div className="space-y-3">
                    <p className="font-heading font-bold text-lg text-white uppercase">{builder.name || 'ANONYMOUS'}</p>
                    <p className="text-xs text-[#ff4500] font-mono break-all">
                      {builder.principal}
                    </p>
                    {builder.description && (
                      <p className="text-sm text-white/60 font-sans">{builder.description}</p>
                    )}
                    <div className="flex gap-4 pt-2 font-mono text-xs">
                      {builder.githubUrl && (
                        <a href={builder.githubUrl} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-[#ff4500] transition-colors">
                          [ GITHUB ]
                        </a>
                      )}
                      {builder.websiteUrl && (
                        <a href={builder.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-[#ff4500] transition-colors">
                          [ WEBSITE ]
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="font-heading font-bold text-lg text-white uppercase">ANONYMOUS</p>
                    <p className="text-xs text-[#ff4500] font-mono break-all">
                      {invoice.builderPrincipal}
                    </p>
                  </div>
                )}
              </div>

              <div className="border border-white/10 bg-white/[0.02] p-6 relative">
                <div className="text-white/40 font-mono text-xs mb-4 tracking-widest uppercase">DAO_PAYER</div>
                {dao ? (
                  <div className="space-y-3">
                    <p className="font-heading font-bold text-lg text-white uppercase">{dao.name || 'ANONYMOUS'}</p>
                    <p className="text-xs text-[#ff4500] font-mono break-all">
                      {dao.principal}
                    </p>
                    {dao.description && (
                      <p className="text-sm text-white/60 font-sans">{dao.description}</p>
                    )}
                  </div>
                ) : invoice.daoPrincipal ? (
                  <div className="space-y-3">
                    <p className="font-heading font-bold text-lg text-white uppercase">ANONYMOUS</p>
                    <p className="text-xs text-[#ff4500] font-mono break-all">
                      {invoice.daoPrincipal}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-white/40 font-mono">NO_DAO_ASSIGNED</p>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-5 space-y-8">
            <div className="border border-[#ff4500]/30 bg-[#ff4500]/5 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#ff4500]/10 blur-2xl" />
              
              <h3 className="text-xl font-heading font-bold text-white uppercase tracking-tight mb-6 flex items-center gap-3">
                <span className="w-2 h-2 bg-[#ff4500] rounded-none animate-pulse" />
                Liquidity Pool
              </h3>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-mono">
                    <span className="text-white">{totalFunded.toLocaleString()} sBTC</span>
                    <span className="text-white/40">{fundingTarget.toLocaleString()} sBTC</span>
                  </div>
                  <div className="w-full bg-black border border-white/10 h-4 relative overflow-hidden">
                    <div 
                      className="bg-[#ff4500] h-full relative" 
                      style={{ width: `${Math.min(fundingProgress, 100)}%` }}
                    >
                      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <p className="text-xs text-[#ff4500] font-mono">
                      {fundingProgress.toFixed(1)}% FILLED
                    </p>
                    <p className="text-xs text-white/40 font-mono">
                      {fundingTarget > totalFunded ? `${(fundingTarget - totalFunded).toLocaleString()} sBTC REMAINING` : 'FULLY FUNDED'}
                    </p>
                  </div>
                </div>

                {invoice.status === 'TOKENIZED' && userData && (
                  <Dialog>
                    <DialogTrigger render={
                      <button className="w-full h-14 bg-[#ff4500] text-black font-heading font-bold uppercase tracking-widest hover:bg-white transition-colors duration-300 flex items-center justify-center gap-2 group">
                        Provide Liquidity <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                      </button>
                    } />
                    <DialogContent className="bg-[#050505] border border-white/10 rounded-none text-white sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="font-heading font-bold uppercase tracking-tight text-2xl">Fund Vault</DialogTitle>
                        <DialogDescription className="font-mono text-xs text-white/50 uppercase">
                          EXPECTED RETURN: {invoice.amountUsdcx.toLocaleString()} USDCx PROPORTIONAL TO SHARE
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-6 py-6">
                        <div className="space-y-3">
                          <Label className="font-mono text-xs text-white/70 uppercase tracking-widest">Investment Amount (sBTC)</Label>
                          <Input 
                            type="number" 
                            placeholder="1000" 
                            value={fundAmount}
                            onChange={(e) => setFundAmount(e.target.value)}
                            className="bg-black border-white/20 rounded-none font-mono text-white focus-visible:ring-0 focus-visible:border-[#ff4500] h-12"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          onClick={handleFund}
                          disabled={isFunding}
                          className="w-full h-12 bg-[#ff4500] text-black hover:bg-white rounded-none font-heading font-bold uppercase tracking-widest transition-colors"
                        >
                          {isFunding ? '[ SIGNING_TX... ]' : 'EXECUTE_FUNDING'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>

            {investments.length > 0 && (
              <div className="border border-white/10 bg-white/[0.02] p-6 relative">
                <h3 className="text-sm font-mono text-white/40 uppercase tracking-widest mb-6">
                  [ LIQUIDITY_PROVIDERS: {investments.length} ]
                </h3>
                <div className="space-y-4">
                  {investments.map((inv) => (
                    <div key={inv.id} className="flex justify-between items-center pb-4 border-b border-white/5 last:border-0 last:pb-0">
                      <div className="font-mono text-xs text-white/70">
                        {inv.investorPrincipal.slice(0, 8)}...{inv.investorPrincipal.slice(-4)}
                      </div>
                      <div className="text-right font-mono">
                        <p className="text-sm text-white">{inv.amountSbtc.toLocaleString()} sBTC</p>
                        <p className="text-xs text-[#ff4500]">{inv.sharePercentage.toFixed(2)}% SHARE</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

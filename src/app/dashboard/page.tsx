'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStacks } from '@/components/providers/StacksProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from 'sonner';
import { Hexagon, Terminal, Activity, Lock, Zap, Shield, ArrowUpRight, Database, Cpu } from 'lucide-react';

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
  const [isDeploying, setIsDeploying] = useState(false);
  const [isTokenizing, setIsTokenizing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [discountPercent, setDiscountPercent] = useState('6');
  const [selectedEscrowId, setSelectedEscrowId] = useState<number | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [builderAddress, setBuilderAddress] = useState('');
  const [amountUsdcx, setAmountUsdcx] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
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

  const handleCreateEscrow = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeploying(true);

    try {
      if (!builderAddress || !amountUsdcx) {
        toast.error("Please fill in all required fields");
        setIsDeploying(false);
        return;
      }

      const { openContractCall } = await import('@stacks/connect');
      const { standardPrincipalCV, uintCV } = await import('@stacks/transactions');

      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || userData.profile.stxAddress.testnet; 
      const contractName = 'invoice-vault';
      const functionName = 'create-escrow';

      const microAmount = parseInt(amountUsdcx) * 1000000;

      await openContractCall({
        network,
        contractAddress,
        contractName,
        functionName,
        functionArgs: [
          standardPrincipalCV(builderAddress),
          uintCV(microAmount)
        ],
        onFinish: async (data: { txId: string }) => {
          console.log("Transaction submitted:", data.txId);
          toast.success("Escrow locked successfully! Transaction pending.");
          
          try {
            const res = await fetch('/api/invoices', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                daoPrincipal: userData.profile.stxAddress.testnet,
                builderPrincipal: builderAddress,
                title: 'New Grant Escrow', 
                description,
                amountUsdcx,
                githubPrUrl: githubUrl
              })
            });
            
            if (!res.ok) throw new Error('Failed to save metadata');
            console.log("Metadata saved to database");
          } catch (dbError) {
            console.error("Database save error:", dbError);
            toast.error("Smart contract called, but metadata failed to save.");
          }

          setBuilderAddress('');
          setAmountUsdcx('');
          setGithubUrl('');
          setDescription('');
          
          await fetchInvoices();
        },
        onCancel: () => {
          toast.error("Transaction cancelled");
        },
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to create escrow");
    } finally {
      setIsDeploying(false);
    }
  };

  const handleTokenize = async (escrowId: number) => {
    if (!userData) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsTokenizing(true);
    try {
      const { openContractCall } = await import('@stacks/connect');
      const { uintCV } = await import('@stacks/transactions');

      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || userData.profile.stxAddress.testnet;
      const contractName = process.env.NEXT_PUBLIC_CONTRACT_NAME || 'invoice-vault';
      const functionName = 'tokenize-invoice';
      
      const discountBps = Math.round(parseFloat(discountPercent) * 100);

      await openContractCall({
        network,
        contractAddress,
        contractName,
        functionName,
        functionArgs: [
          uintCV(escrowId),
          uintCV(discountBps)
        ],
        onFinish: async (data: { txId: string }) => {
          console.log("Tokenize transaction submitted:", data.txId);
          
          if (selectedInvoiceId) {
            try {
              await fetch('/api/invoices', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: selectedInvoiceId,
                  status: 'TOKENIZED',
                  discountBps
                })
              });
            } catch (dbError) {
              console.error("DB sync error:", dbError);
            }
          }

          toast.success("Invoice tokenized! It's now available on the marketplace.");
          setDiscountPercent('6');
          setSelectedEscrowId(null);
          setSelectedInvoiceId(null);
          
          await fetchInvoices();
        },
        onCancel: () => {
          toast.error("Tokenization cancelled");
        },
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to tokenize invoice");
    } finally {
      setIsTokenizing(false);
    }
  };

  const handleSimulateOracle = async (invoiceId: string) => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/oracle/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to simulate oracle');
      }

      toast.success(`Escrow settled! TxID: ${data.txId?.slice(0, 10)}...`);
      
      await fetchInvoices();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to simulate oracle");
    } finally {
      setIsSimulating(false);
    }
  };

  const activeRole = profile?.role || 'BUILDER';
  const defaultTab = activeRole.toLowerCase() === 'dao' ? 'dao' : 'builder';

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col relative overflow-hidden selection:bg-[#ff4500]/30 selection:text-[#ff4500]">
      <Navbar />
      
      {/* Global Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <main className="flex-1 container mx-auto px-4 py-12 z-10 relative max-w-[1600px]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8 border-b border-white/10 pb-8">
          <div>
            <div className="text-[#ff4500] font-mono text-sm mb-4 tracking-widest uppercase flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              [ ACTIVE_ROLE: {activeRole} ]
            </div>
            <h1 className="text-5xl md:text-6xl font-heading font-black text-white uppercase tracking-tighter leading-none">
              Control <br/>
              <span className="text-white/20">Panel</span>
            </h1>
          </div>
          <div className="text-left md:text-right font-mono text-xs text-white/40 max-w-xs">
            <p>MANAGE GRANTS</p>
            <p>TOKENIZE INVOICES</p>
            <p>ACCESS LIQUIDITY</p>
          </div>
        </div>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-12 bg-[#020202] border border-white/10 rounded-none h-14 p-1">
            <TabsTrigger 
              value="builder" 
              className="rounded-none font-heading font-bold uppercase tracking-widest data-[state=active]:bg-[#ff4500] data-[state=active]:text-black text-white/60"
            >
              Builder View
            </TabsTrigger>
            <TabsTrigger 
              value="dao" 
              className="rounded-none font-heading font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-black text-white/60"
            >
              DAO View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="mt-0">
            {isLoading && (
              <div className="text-center font-mono text-white/40 py-24 border border-white/10 bg-[#020202]">
                <span className="animate-pulse">LOADING_INVOICES...</span>
              </div>
            )}

            {!isLoading && invoices.length === 0 && (
              <div className="text-center py-24 border border-white/10 bg-[#020202] relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-50" />
                <Database className="w-12 h-12 text-white/20 mx-auto mb-6" strokeWidth={1} />
                <p className="font-heading font-bold text-2xl uppercase tracking-widest text-white/60 mb-2">No Invoices Found</p>
                <p className="font-mono text-sm text-white/40">Ask a DAO to lock an escrow for you.</p>
              </div>
            )}

            {!isLoading && invoices.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {invoices
                  .filter(inv => inv.builderPrincipal === userData.profile.stxAddress.testnet)
                  .map((inv) => (
                    <div key={inv.id} className={`border ${inv.status === 'LOCKED' ? 'border-[#ff4500]/50 bg-[#ff4500]/5' : 'border-white/10 bg-[#020202]'} p-8 relative overflow-hidden group`}>
                      {inv.status === 'LOCKED' && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ff4500]/0 via-[#ff4500] to-[#ff4500]/0 opacity-50" />
                      )}
                      
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="text-xl font-heading font-bold uppercase tracking-tight text-white">{inv.title}</h3>
                        <div className={`px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest border ${
                          inv.status === 'LOCKED' ? 'border-[#ff4500] text-[#ff4500] bg-[#ff4500]/10' :
                          inv.status === 'TOKENIZED' ? 'border-orange-500 text-orange-500 bg-orange-500/10' :
                          inv.status === 'SETTLED' ? 'border-green-500 text-green-500 bg-green-500/10' :
                          'border-white/20 text-white/40 bg-white/5'
                        }`}>
                          {inv.status}
                        </div>
                      </div>
                      
                      <div className="font-mono text-xs text-white/40 mb-6 pb-6 border-b border-white/10">
                        <div className="flex justify-between mb-2">
                          <span>FROM_DAO</span>
                          <span className="text-white/70">{inv.daoPrincipal?.slice(0, 6)}...{inv.daoPrincipal?.slice(-4)}</span>
                        </div>
                        {inv.githubPrUrl && (
                          <div className="flex justify-between">
                            <span>MILESTONE</span>
                            <span className="text-white/70 truncate max-w-[150px]">{inv.githubPrUrl.split('/').pop()}</span>
                          </div>
                        )}
                      </div>

                      <div className="mb-8">
                        <div className="text-4xl font-heading font-black text-white mb-1">
                          {inv.amountUsdcx.toLocaleString()}
                        </div>
                        <div className="font-mono text-xs text-[#ff4500] tracking-widest">USDCx LOCKED</div>
                      </div>

                      <div className="space-y-4">
                        {inv.status === 'LOCKED' && (
                          <Dialog>
                            <DialogTrigger render={
                              <Button 
                                className="w-full h-12 bg-[#ff4500] text-black hover:bg-white hover:text-black transition-all duration-300 rounded-none font-heading font-bold uppercase tracking-widest border-none"
                                onClick={() => {
                                  setSelectedInvoiceId(inv.id);
                                  setSelectedEscrowId(inv.onchainId);
                                }}
                              >
                                Get Upfront Liquidity
                              </Button>
                            } />
                            <DialogContent className="bg-[#050505] border border-white/10 rounded-none text-white sm:max-w-[500px]">
                              <DialogHeader>
                                <DialogTitle className="font-heading font-black text-2xl uppercase tracking-tighter text-white">Tokenize Invoice</DialogTitle>
                                <DialogDescription className="font-sans text-white/50">
                                  Offer your locked payout at a discount to receive instant sBTC liquidity from DeFi investors.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-6 py-6">
                                <div className="space-y-4">
                                  <Label className="font-mono text-xs text-[#ff4500] tracking-widest uppercase">Discount Rate (%)</Label>
                                  <Input 
                                    type="number" 
                                    placeholder="6" 
                                    value={discountPercent}
                                    onChange={(e) => setDiscountPercent(e.target.value)}
                                    min="0.1"
                                    max="49.9"
                                    step="0.1"
                                    className="bg-[#020202] border-white/10 rounded-none font-mono text-white h-12 focus-visible:ring-[#ff4500] focus-visible:border-[#ff4500]"
                                  />
                                  <p className="font-mono text-xs text-white/40">
                                    You'll receive {discountPercent}% less, but get instant liquidity now.
                                  </p>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button 
                                  onClick={() => selectedEscrowId !== null && handleTokenize(selectedEscrowId)}
                                  disabled={isTokenizing || !userData}
                                  className="w-full h-12 bg-[#ff4500] text-black hover:bg-white hover:text-black transition-all duration-300 rounded-none font-heading font-bold uppercase tracking-widest border-none"
                                >
                                  {isTokenizing ? "SIGNING_TX..." : "TOKENIZE_INVOICE"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                        {inv.status === 'TOKENIZED' && inv.onchainId !== null && (
                          <Button 
                            className="w-full h-12 bg-transparent border border-green-500 text-green-500 hover:bg-green-500 hover:text-black transition-all duration-300 rounded-none font-heading font-bold uppercase tracking-widest"
                            onClick={() => handleSimulateOracle(inv.id)}
                            disabled={isSimulating}
                          >
                            {isSimulating ? 'SETTLING...' : 'SIMULATE_ORACLE_TRIGGER'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="dao" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-5">
                <div className="border border-white/10 bg-[#020202] p-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-50" />
                  
                  <div className="mb-8">
                    <h2 className="text-3xl font-heading font-black text-white uppercase tracking-tighter mb-2">Lock New Grant</h2>
                    <p className="text-white/50 font-sans text-sm leading-relaxed">
                      Deposit USDCx into the smart contract. It will automatically unlock when the developer completes the verified GitHub milestone.
                    </p>
                  </div>

                  <form onSubmit={handleCreateEscrow} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="builder" className="font-mono text-xs text-white/60 tracking-widest uppercase">Builder Stacks Address</Label>
                      <Input 
                        id="builder" 
                        placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM" 
                        value={builderAddress}
                        onChange={(e) => setBuilderAddress(e.target.value)}
                        required
                        className="bg-[#050505] border-white/10 rounded-none font-mono text-sm text-white h-12 focus-visible:ring-white/20 focus-visible:border-white/30"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="amount" className="font-mono text-xs text-white/60 tracking-widest uppercase">Amount (USDCx)</Label>
                      <Input 
                        id="amount" 
                        type="number" 
                        placeholder="50000" 
                        value={amountUsdcx}
                        onChange={(e) => setAmountUsdcx(e.target.value)}
                        required
                        className="bg-[#050505] border-white/10 rounded-none font-mono text-sm text-white h-12 focus-visible:ring-white/20 focus-visible:border-white/30"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="github" className="font-mono text-xs text-white/60 tracking-widest uppercase">Verification Milestone (GitHub PR URL)</Label>
                      <Input 
                        id="github" 
                        placeholder="https://github.com/org/repo/pull/123" 
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        className="bg-[#050505] border-white/10 rounded-none font-mono text-sm text-white h-12 focus-visible:ring-white/20 focus-visible:border-white/30"
                      />
                      <p className="font-mono text-[10px] text-[#ff4500] uppercase tracking-wider">The x402 oracle will monitor this PR and auto-release funds upon merge.</p>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="desc" className="font-mono text-xs text-white/60 tracking-widest uppercase">Project Description (Off-chain)</Label>
                      <Input 
                        id="desc" 
                        placeholder="Frontend redesign for main protocol..." 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="bg-[#050505] border-white/10 rounded-none font-mono text-sm text-white h-12 focus-visible:ring-white/20 focus-visible:border-white/30"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-14 bg-white text-black hover:bg-[#ff4500] hover:text-black transition-all duration-300 rounded-none font-heading font-bold uppercase tracking-widest border-none mt-8" 
                      disabled={isDeploying}
                    >
                      {isDeploying ? "AWAITING_SIGNATURE..." : "LOCK_USDCX_IN_ESCROW"}
                    </Button>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-8 h-px bg-white/20" />
                  <h3 className="text-xl font-heading font-bold uppercase tracking-widest text-white">My Grants</h3>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {isLoading && (
                  <div className="text-center font-mono text-white/40 py-12 border border-white/10 bg-[#020202]">
                    <span className="animate-pulse">LOADING_GRANTS...</span>
                  </div>
                )}
                
                {!isLoading && invoices.filter(inv => inv.daoPrincipal === userData.profile.stxAddress.testnet).length === 0 && (
                  <div className="text-center py-12 border border-white/10 bg-[#020202]">
                    <p className="font-mono text-sm text-white/40">No grants created yet. Create your first escrow.</p>
                  </div>
                )}
                
                {!isLoading && invoices.filter(inv => inv.daoPrincipal === userData.profile.stxAddress.testnet).length > 0 && (
                  <div className="grid gap-6 md:grid-cols-2">
                    {invoices
                      .filter(inv => inv.daoPrincipal === userData.profile.stxAddress.testnet)
                      .map((inv) => (
                        <div key={inv.id} className="border border-white/10 bg-[#020202] p-6 relative group hover:border-white/30 transition-colors">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-lg font-heading font-bold uppercase tracking-tight text-white truncate pr-4">{inv.title}</h4>
                            <div className={`px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest border ${
                              inv.status === 'LOCKED' ? 'border-[#ff4500] text-[#ff4500] bg-[#ff4500]/10' :
                              inv.status === 'TOKENIZED' ? 'border-orange-500 text-orange-500 bg-orange-500/10' :
                              inv.status === 'SETTLED' ? 'border-green-500 text-green-500 bg-green-500/10' :
                              'border-white/20 text-white/40 bg-white/5'
                            }`}>
                              {inv.status}
                            </div>
                          </div>
                          
                          <div className="font-mono text-xs text-white/40 mb-4 pb-4 border-b border-white/10">
                            <div className="flex justify-between">
                              <span>TO_BUILDER</span>
                              <span className="text-white/70">{inv.builderPrincipal?.slice(0, 6)}...{inv.builderPrincipal?.slice(-4)}</span>
                            </div>
                          </div>

                          <div className="mb-6">
                            <div className="text-2xl font-heading font-black text-white mb-1">
                              {inv.amountUsdcx.toLocaleString()}
                            </div>
                            <div className="font-mono text-[10px] text-white/40 tracking-widest">USDCx LOCKED</div>
                          </div>

                          <Link href={`/invoice/${inv.id}`}>
                            <Button variant="outline" className="w-full h-10 bg-transparent border-white/20 text-white hover:bg-white hover:text-black transition-all duration-300 rounded-none font-heading font-bold text-xs uppercase tracking-widest">
                              VIEW_DETAILS
                            </Button>
                          </Link>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
}

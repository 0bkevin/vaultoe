import { useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

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

export function DaoView({ 
  invoices, 
  isLoading, 
  fetchInvoices,
  userData,
  network
}: { 
  invoices: Invoice[];
  isLoading: boolean;
  fetchInvoices: () => Promise<void>;
  userData: any;
  network: any;
}) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [builderAddress, setBuilderAddress] = useState('');
  const [amountUsdcx, setAmountUsdcx] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [description, setDescription] = useState('');

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
                githubPrUrl: githubUrl,
                txId: data.txId
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div className="lg:col-span-5">
        <div className="border border-white/10 bg-[#020202] p-8 relative overflow-hidden" id="tour-dao-form">
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
              <Label htmlFor="amount" className="font-mono text-xs text-white/60 tracking-widest uppercase">Amount (Testnet STX)</Label>
              <Input 
                id="amount" 
                type="number" 
                placeholder="10" 
                value={amountUsdcx}
                onChange={(e) => setAmountUsdcx(e.target.value)}
                required
                className="bg-[#050505] border-white/10 rounded-none font-mono text-sm text-white h-12 focus-visible:ring-white/20 focus-visible:border-white/30"
              />
              <p className="font-mono text-[10px] text-white/40 uppercase tracking-wider">Note: Uses STX on testnet to simulate stablecoin</p>
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

      <div className="lg:col-span-7" id="tour-dao-list">
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
  );
}

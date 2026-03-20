import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Database } from 'lucide-react';
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

export function BuilderView({ 
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
  const [isTokenizing, setIsTokenizing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [discountPercent, setDiscountPercent] = useState('6');
  const [selectedEscrowId, setSelectedEscrowId] = useState<number | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

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

  const builderInvoices = invoices.filter(inv => inv.builderPrincipal === userData?.profile?.stxAddress?.testnet);

  return (
    <div className="mt-0">
      {isLoading && (
        <div className="text-center font-mono text-white/40 py-24 border border-white/10 bg-[#020202]">
          <span className="animate-pulse">LOADING_INVOICES...</span>
        </div>
      )}

      {!isLoading && builderInvoices.length === 0 && (
        <div className="text-center py-24 border border-white/10 bg-[#020202] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-50" />
          <Database className="w-12 h-12 text-white/20 mx-auto mb-6" strokeWidth={1} />
          <p className="font-heading font-bold text-2xl uppercase tracking-widest text-white/60 mb-2">No Invoices Found</p>
          <p className="font-mono text-sm text-white/40">Ask a DAO to lock an escrow for you.</p>
        </div>
      )}

      {!isLoading && builderInvoices.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {builderInvoices.map((inv) => (
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
                          <Label className="font-mono text-xs text-[#ff4500] tracking-widest uppercase">Escrow ID (On-chain)</Label>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            value={selectedEscrowId ?? ''}
                            onChange={(e) => setSelectedEscrowId(e.target.value ? parseInt(e.target.value) : null)}
                            min="0"
                            className="bg-[#020202] border-white/10 rounded-none font-mono text-white h-12 focus-visible:ring-[#ff4500] focus-visible:border-[#ff4500]"
                          />
                          <p className="font-mono text-xs text-white/40">
                            The on-chain escrow ID assigned by the smart contract.
                          </p>
                        </div>
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
                          onClick={() => {
                            if (selectedEscrowId !== null) {
                              handleTokenize(selectedEscrowId);
                            }
                          }}
                          disabled={isTokenizing || !userData || selectedEscrowId === null}
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
    </div>
  );
}

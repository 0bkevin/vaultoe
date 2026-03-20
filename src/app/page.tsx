import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LaunchAppButton } from "@/components/ui/LaunchAppButton";
import { ArrowUpRight, Hexagon, Activity, Database, Shield, Cpu, Layers, Zap, Lock, Bitcoin, ArrowRight, Terminal } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col relative overflow-hidden selection:bg-[#ff4500]/30 selection:text-[#ff4500]">
      {/* Global Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Coordinate Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]" />
        
        {/* Crosshairs */}
        <div className="absolute top-[20%] left-[10%] text-[#ffffff20] text-xs font-mono">+</div>
        <div className="absolute top-[60%] right-[15%] text-[#ffffff20] text-xs font-mono">+</div>
        <div className="absolute bottom-[20%] left-[20%] text-[#ffffff20] text-xs font-mono">+</div>
        
        {/* Neon Accents */}
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-[#ff4500]/10 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#ff4500]/5 blur-[150px] mix-blend-screen" />
        
        {/* Noise */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* Header */}
      <header className="px-6 py-6 flex justify-between items-center z-50 relative border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
        <div className="flex items-center space-x-4">
          <div className="relative flex items-center justify-center w-10 h-10 border border-white/10 bg-white/5">
            <Hexagon className="absolute w-6 h-6 text-[#ff4500]" strokeWidth={1.5} />
            <div className="w-1.5 h-1.5 bg-[#ff4500] rounded-none" />
          </div>
          <span className="text-xl font-heading font-bold tracking-tighter text-white uppercase">
            InvoiceVault
          </span>
        </div>
        <div className="flex gap-8 items-center">
          <div className="hidden md:flex items-center gap-6 text-xs font-mono text-white/40">
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> SYSTEM: ONLINE</span>
            <span>BLOCK: 842,109</span>
          </div>
          <Link href="/marketplace" className="text-sm font-heading font-bold uppercase tracking-widest text-white/60 hover:text-[#ff4500] transition-colors">
            Marketplace
          </Link>
          <LaunchAppButton className="bg-[#ff4500] text-black hover:bg-white hover:text-black transition-all duration-300 rounded-none px-8 h-12 font-heading font-bold uppercase tracking-widest border-none shadow-[0_0_20px_rgba(255,69,0,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            Launch App
          </LaunchAppButton>
        </div>
      </header>

      <main className="flex-1 flex flex-col z-10 relative">
        {/* 1. Hero Section */}
        <section className="relative pt-24 pb-32 px-6 md:px-12 lg:px-24 w-full flex flex-col items-start justify-center min-h-[85vh] border-b border-white/5">
          <div className="absolute top-0 left-12 w-px h-full bg-white/5" />
          <div className="absolute top-0 right-12 w-px h-full bg-white/5" />
          
          <div className="w-full max-w-[1600px] mx-auto relative">
            {/* Data Overlay */}
            <div className="absolute -top-12 left-0 text-[10px] font-mono text-[#ff4500]/60 tracking-widest uppercase flex gap-8">
              <span>[ PROTOCOL_V1.0 ]</span>
              <span>[ 0x7A2...9F1B ]</span>
              <span className="hidden sm:inline">[ YIELD_BEARING_ESCROW ]</span>
            </div>

            <h1 className="text-[12vw] sm:text-[10vw] lg:text-[8vw] font-heading font-black tracking-tighter leading-[0.85] text-white mb-12 uppercase mix-blend-difference">
              <span className="block overflow-hidden">
                <span className="block translate-y-0">Trustless</span>
              </span>
              <span className="block overflow-hidden text-[#ff4500]">
                <span className="block translate-y-0">Liquidity.</span>
              </span>
            </h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-end">
              <div className="lg:col-span-5">
                <p className="text-lg md:text-xl text-white/60 font-sans font-light leading-relaxed border-l border-[#ff4500] pl-6 py-2">
                  Pending invoices are trapped capital. InvoiceVault is a fractional, yield-bearing escrow protocol on Stacks that sets it free.
                </p>
              </div>
              
              <div className="lg:col-span-7 flex flex-col sm:flex-row gap-4 w-full">
                <Link href="/dashboard" className="group relative flex-1 flex items-center justify-between px-8 h-20 bg-[#ff4500] text-black font-heading font-bold text-xl uppercase tracking-wider overflow-hidden transition-all hover:bg-white">
                  <span className="relative z-10">Unlock Capital</span>
                  <ArrowUpRight className="w-8 h-8 relative z-10 group-hover:rotate-45 transition-transform duration-300" />
                </Link>
                <Link href="/marketplace" className="group relative flex-1 flex items-center justify-between px-8 h-20 bg-transparent text-white font-heading font-bold text-xl uppercase tracking-wider border border-white/20 hover:border-[#ff4500] hover:text-[#ff4500] transition-all">
                  <span className="relative z-10">Earn Yield</span>
                  <Activity className="w-8 h-8 relative z-10 opacity-50 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Architecture / Features */}
        <section className="py-32 px-6 md:px-12 lg:px-24 w-full relative bg-[#020202] border-b border-white/5">
          <div className="w-full max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8 border-b border-white/10 pb-12">
              <div>
                <div className="text-[#ff4500] font-mono text-sm mb-4 tracking-widest uppercase">[ SYSTEM_ARCHITECTURE ]</div>
                <h2 className="text-5xl md:text-7xl font-heading font-black text-white uppercase tracking-tighter leading-none">
                  Protocol <br/>
                  <span className="text-white/20">Mechanics</span>
                </h2>
              </div>
              <div className="text-right font-mono text-xs text-white/40 max-w-xs">
                <p>FULLY AUTOMATED SETTLEMENT</p>
                <p>CRYPTOGRAPHIC GUARANTEES</p>
                <p>ZERO COUNTERPARTY RISK</p>
              </div>
            </div>

            {/* Technical Diagram Flow */}
            <div className="relative">
              {/* Connecting Line */}
              <div className="absolute top-0 bottom-0 left-[27px] md:left-1/2 w-px bg-gradient-to-b from-[#ff4500] via-white/10 to-transparent -translate-x-1/2" />

              <div className="space-y-24">
                {/* Step 1 */}
                <div className="relative flex flex-col md:flex-row items-start md:items-center gap-12 md:gap-24 group">
                  <div className="absolute left-[27px] md:left-1/2 w-3 h-3 bg-[#050505] border-2 border-[#ff4500] rounded-none -translate-x-1/2 z-10 group-hover:bg-[#ff4500] transition-colors duration-500" />
                  
                  <div className="md:w-1/2 md:text-right pl-16 md:pl-0 md:pr-24">
                    <div className="text-6xl font-heading font-black text-white/5 mb-4 group-hover:text-white/10 transition-colors">01</div>
                    <h3 className="text-3xl font-heading font-bold text-white uppercase tracking-tight mb-4">Clarity Escrow</h3>
                    <p className="text-white/50 font-sans leading-relaxed">
                      DAOs lock USDCx securely on the Stacks blockchain. Funds are cryptographically guaranteed to pay out upon milestone completion.
                    </p>
                  </div>
                  
                  <div className="md:w-1/2 pl-16 md:pl-24 w-full">
                    <div className="border border-white/10 bg-white/[0.02] p-8 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ff4500]/0 via-[#ff4500] to-[#ff4500]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      <Database className="w-12 h-12 text-[#ff4500] mb-6" strokeWidth={1} />
                      <div className="font-mono text-xs text-white/30 space-y-2">
                        <div className="flex justify-between border-b border-white/5 pb-2"><span>CONTRACT</span><span className="text-white/70">SP3...ESCROW</span></div>
                        <div className="flex justify-between border-b border-white/5 pb-2"><span>ASSET</span><span className="text-white/70">USDCx</span></div>
                        <div className="flex justify-between pt-2"><span>STATUS</span><span className="text-green-400">LOCKED</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative flex flex-col md:flex-row-reverse items-start md:items-center gap-12 md:gap-24 group">
                  <div className="absolute left-[27px] md:left-1/2 w-3 h-3 bg-[#050505] border-2 border-[#ff4500] rounded-none -translate-x-1/2 z-10 group-hover:bg-[#ff4500] transition-colors duration-500" />
                  
                  <div className="md:w-1/2 pl-16 md:pl-24">
                    <div className="text-6xl font-heading font-black text-white/5 mb-4 group-hover:text-white/10 transition-colors">02</div>
                    <h3 className="text-3xl font-heading font-bold text-white uppercase tracking-tight mb-4">Instant Liquidity</h3>
                    <p className="text-white/50 font-sans leading-relaxed">
                      Builders tokenize their locked escrow and sell fractions to the market at a discount, receiving instant sBTC to fund operations today.
                    </p>
                  </div>
                  
                  <div className="md:w-1/2 pl-16 md:pl-0 md:pr-24 w-full">
                    <div className="border border-white/10 bg-white/[0.02] p-8 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-[#ff4500]/0 via-[#ff4500] to-[#ff4500]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      <Cpu className="w-12 h-12 text-[#ff4500] mb-6" strokeWidth={1} />
                      <div className="font-mono text-xs text-white/30 space-y-2">
                        <div className="flex justify-between border-b border-white/5 pb-2"><span>TOKEN</span><span className="text-white/70">ivUSDCx</span></div>
                        <div className="flex justify-between border-b border-white/5 pb-2"><span>DISCOUNT</span><span className="text-[#ff4500]">14.2% APY</span></div>
                        <div className="flex justify-between pt-2"><span>PAYOUT</span><span className="text-white/70">sBTC</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative flex flex-col md:flex-row items-start md:items-center gap-12 md:gap-24 group">
                  <div className="absolute left-[27px] md:left-1/2 w-3 h-3 bg-[#050505] border-2 border-[#ff4500] rounded-none -translate-x-1/2 z-10 group-hover:bg-[#ff4500] transition-colors duration-500" />
                  
                  <div className="md:w-1/2 md:text-right pl-16 md:pl-0 md:pr-24">
                    <div className="text-6xl font-heading font-black text-white/5 mb-4 group-hover:text-white/10 transition-colors">03</div>
                    <h3 className="text-3xl font-heading font-bold text-white uppercase tracking-tight mb-4">x402 Verification</h3>
                    <p className="text-white/50 font-sans leading-relaxed">
                      Settlement is fully automated. An x402-gated oracle verifies GitHub PR merges and instantly triggers the Clarity payout to investors.
                    </p>
                  </div>
                  
                  <div className="md:w-1/2 pl-16 md:pl-24 w-full">
                    <div className="border border-white/10 bg-white/[0.02] p-8 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ff4500]/0 via-[#ff4500] to-[#ff4500]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      <Shield className="w-12 h-12 text-[#ff4500] mb-6" strokeWidth={1} />
                      <div className="font-mono text-xs text-white/30 space-y-2">
                        <div className="flex justify-between border-b border-white/5 pb-2"><span>ORACLE</span><span className="text-white/70">x402_NODE</span></div>
                        <div className="flex justify-between border-b border-white/5 pb-2"><span>TRIGGER</span><span className="text-white/70">PR_MERGED</span></div>
                        <div className="flex justify-between pt-2"><span>SETTLEMENT</span><span className="text-green-400">AUTOMATIC</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. How It Works (Step-by-Step) */}
        <section className="py-32 px-6 md:px-12 lg:px-24 w-full relative bg-[#050505] border-b border-white/5">
          <div className="w-full max-w-[1600px] mx-auto">
            <div className="text-center mb-24">
              <div className="text-[#ff4500] font-mono text-sm mb-4 tracking-widest uppercase">[ EXECUTION_FLOW ]</div>
              <h2 className="text-5xl md:text-7xl font-heading font-black text-white uppercase tracking-tighter">
                Lifecycle of a <br/>
                <span className="text-white/20">Vault</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {/* Connecting horizontal line for desktop */}
              <div className="hidden md:block absolute top-12 left-0 w-full h-px bg-white/10" />
              
              {[
                { step: "01", title: "Lock", desc: "DAO locks USDCx in a Clarity smart contract tied to a specific GitHub milestone.", icon: Lock },
                { step: "02", title: "Tokenize", desc: "Builder mints fractional ivUSDCx tokens representing the future payout.", icon: Layers },
                { step: "03", title: "Fund", desc: "Investors buy ivUSDCx at a discount using sBTC, providing instant liquidity.", icon: Zap },
                { step: "04", title: "Settle", desc: "Oracle verifies PR merge. Contract automatically distributes USDCx to token holders.", icon: Activity }
              ].map((item, i) => (
                <div key={i} className="relative pt-8 md:pt-0">
                  <div className="w-24 h-24 bg-[#050505] border border-white/10 flex items-center justify-center mb-8 relative z-10 mx-auto md:mx-0 group hover:border-[#ff4500] transition-colors">
                    <item.icon className="w-8 h-8 text-white/50 group-hover:text-[#ff4500] transition-colors" strokeWidth={1.5} />
                    <div className="absolute -top-3 -right-3 bg-[#ff4500] text-black text-xs font-mono font-bold px-2 py-1">
                      {item.step}
                    </div>
                  </div>
                  <h4 className="text-2xl font-heading font-bold text-white uppercase tracking-tight mb-4 text-center md:text-left">{item.title}</h4>
                  <p className="text-white/50 font-sans leading-relaxed text-center md:text-left text-sm">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. The Two-Sided Vault */}
        <section className="py-32 px-6 md:px-12 lg:px-24 w-full relative bg-[#020202] border-b border-white/5">
          <div className="w-full max-w-[1600px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-white/10">
              {/* Builders Side */}
              <div className="p-12 md:p-24 border-b lg:border-b-0 lg:border-r border-white/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#ff4500]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="text-[#ff4500] font-mono text-sm mb-8 tracking-widest uppercase">[ FOR_BUILDERS ]</div>
                  <h2 className="text-5xl font-heading font-black text-white uppercase tracking-tighter mb-8">
                    Stop Waiting <br/>
                    <span className="text-white/40">For Payouts</span>
                  </h2>
                  <ul className="space-y-6 font-mono text-sm text-white/60">
                    <li className="flex items-start gap-4">
                      <ArrowRight className="w-5 h-5 text-[#ff4500] shrink-0" />
                      <span>Convert pending milestones into instant sBTC liquidity.</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <ArrowRight className="w-5 h-5 text-[#ff4500] shrink-0" />
                      <span>Pay your team today, not in 3 months.</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <ArrowRight className="w-5 h-5 text-[#ff4500] shrink-0" />
                      <span>No credit checks. Your code is your collateral.</span>
                    </li>
                  </ul>
                  <Link href="/dashboard" className="inline-flex items-center gap-2 mt-12 text-[#ff4500] font-heading font-bold uppercase tracking-widest hover:text-white transition-colors">
                    Create a Vault <ArrowUpRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>

              {/* Investors Side */}
              <div className="p-12 md:p-24 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-bl from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="text-white/40 font-mono text-sm mb-8 tracking-widest uppercase">[ FOR_INVESTORS ]</div>
                  <h2 className="text-5xl font-heading font-black text-white uppercase tracking-tighter mb-8">
                    Fixed Yield <br/>
                    <span className="text-white/40">Zero Impermanence</span>
                  </h2>
                  <ul className="space-y-6 font-mono text-sm text-white/60">
                    <li className="flex items-start gap-4">
                      <ArrowRight className="w-5 h-5 text-white/40 shrink-0" />
                      <span>Earn 10-20% APY on short-term (1-3 month) durations.</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <ArrowRight className="w-5 h-5 text-white/40 shrink-0" />
                      <span>Fully collateralized by DAO treasuries.</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <ArrowRight className="w-5 h-5 text-white/40 shrink-0" />
                      <span>Automated settlement via x402 oracle. No manual claims.</span>
                    </li>
                  </ul>
                  <Link href="/marketplace" className="inline-flex items-center gap-2 mt-12 text-white font-heading font-bold uppercase tracking-widest hover:text-[#ff4500] transition-colors">
                    Explore Marketplace <ArrowUpRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Built on Stacks & sBTC Ecosystem */}
        <section className="py-32 px-6 md:px-12 lg:px-24 w-full relative bg-[#050505] border-b border-white/5 overflow-hidden">
          {/* Background Bitcoin Logo Abstract */}
          <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 opacity-[0.02] pointer-events-none">
            <Bitcoin className="w-[800px] h-[800px]" />
          </div>

          <div className="w-full max-w-[1600px] mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-5">
                <div className="text-[#ff4500] font-mono text-sm mb-4 tracking-widest uppercase">[ INFRASTRUCTURE ]</div>
                <h2 className="text-5xl md:text-7xl font-heading font-black text-white uppercase tracking-tighter mb-8 leading-none">
                  Bitcoin <br/>
                  <span className="text-white/20">Finality</span>
                </h2>
                <p className="text-lg text-white/50 font-sans leading-relaxed mb-8">
                  InvoiceVault leverages the Stacks L2 to bring fully expressive smart contracts to Bitcoin. By utilizing sBTC, we enable trustless, decentralized liquidity backed by the most secure network on earth.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="border border-white/10 bg-white/5 px-4 py-2 font-mono text-xs text-white/70 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#ff4500]" /> Clarity Smart Contracts
                  </div>
                  <div className="border border-white/10 bg-white/5 px-4 py-2 font-mono text-xs text-white/70 flex items-center gap-2">
                    <Bitcoin className="w-4 h-4 text-[#ff4500]" /> sBTC Integration
                  </div>
                  <div className="border border-white/10 bg-white/5 px-4 py-2 font-mono text-xs text-white/70 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#ff4500]" /> 100% Bitcoin Finality
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-7 relative">
                <div className="aspect-video border border-white/10 bg-[#020202] p-8 relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:2rem_2rem]" />
                  
                  <div className="relative z-10 flex justify-between items-start">
                    <div className="font-mono text-xs text-white/40">NETWORK_STATUS</div>
                    <div className="flex items-center gap-2 font-mono text-xs text-green-400">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> SECURE
                    </div>
                  </div>

                  <div className="relative z-10 space-y-4 font-mono text-sm">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-white/40">L1_ANCHOR</span>
                      <span className="text-white">BITCOIN</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-white/40">L2_EXECUTION</span>
                      <span className="text-white">STACKS</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-white/40">LIQUIDITY_ASSET</span>
                      <span className="text-[#ff4500]">sBTC</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-white/40">SMART_CONTRACT</span>
                      <span className="text-white">CLARITY</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Final Immersive CTA */}
        <section className="py-40 px-6 md:px-12 lg:px-24 w-full relative bg-[#ff4500] text-black overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
          <div className="absolute top-0 left-0 w-full h-px bg-black/10" />
          
          <div className="w-full max-w-[1600px] mx-auto relative z-10 text-center flex flex-col items-center">
            <h2 className="text-[10vw] md:text-[8vw] font-heading font-black uppercase tracking-tighter leading-[0.85] mb-12">
              Unlock Your <br/>
              <span className="text-white mix-blend-difference">Capital.</span>
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl">
              <Link href="/dashboard" className="flex-1 flex items-center justify-center px-8 h-24 bg-black text-white font-heading font-bold text-2xl uppercase tracking-wider hover:bg-white hover:text-black transition-colors duration-300">
                Launch App
              </Link>
              <Link href="/marketplace" className="flex-1 flex items-center justify-center px-8 h-24 bg-transparent text-black font-heading font-bold text-2xl uppercase tracking-wider border-2 border-black hover:bg-black hover:text-white transition-colors duration-300">
                Marketplace
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Marquee */}
        <section className="py-8 border-t border-white/5 bg-[#020202] text-white overflow-hidden relative">
          <div className="flex whitespace-nowrap animate-marquee items-center gap-12 font-mono text-sm uppercase tracking-widest text-white/30">
            <span>TRUSTLESS LIQUIDITY</span>
            <span className="text-[#ff4500]">+</span>
            <span>YIELD BEARING ESCROW</span>
            <span className="text-[#ff4500]">+</span>
            <span>BITCOIN FINALITY</span>
            <span className="text-[#ff4500]">+</span>
            <span>STACKS L2</span>
            <span className="text-[#ff4500]">+</span>
            <span>TRUSTLESS LIQUIDITY</span>
            <span className="text-[#ff4500]">+</span>
            <span>YIELD BEARING ESCROW</span>
            <span className="text-[#ff4500]">+</span>
            <span>BITCOIN FINALITY</span>
            <span className="text-[#ff4500]">+</span>
            <span>STACKS L2</span>
            <span className="text-[#ff4500]">+</span>
          </div>
        </section>
      </main>
      
      <footer className="border-t border-white/10 py-12 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center z-10 relative bg-[#050505]">
        <div className="flex items-center gap-4 mb-6 md:mb-0">
          <Hexagon className="w-6 h-6 text-[#ff4500]" strokeWidth={2} />
          <span className="font-heading font-bold text-xl uppercase tracking-widest text-white">InvoiceVault</span>
        </div>
        <div className="flex gap-12 font-mono text-xs text-white/40">
          <div className="flex flex-col gap-2">
            <span className="text-white/20">PROTOCOL</span>
            <Link href="/dashboard" className="hover:text-[#ff4500] transition-colors">Dashboard</Link>
            <Link href="/marketplace" className="hover:text-[#ff4500] transition-colors">Marketplace</Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-white/20">SYSTEM</span>
            <span>&copy; {new Date().getFullYear()}</span>
            <span className="text-[#ff4500]">BUILT ON STACKS</span>
            <span>V1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

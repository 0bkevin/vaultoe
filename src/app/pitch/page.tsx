'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, ArrowUpRight, Hexagon, Database, Lock, TrendingUp, Activity, Terminal, Shield, Zap } from 'lucide-react';

const SLIDES = [
  {
    id: 'problem',
    eyebrow: 'THE PROBLEM',
    title: 'Trapped Capital in the Gig Economy',
    content: (
      <div className="space-y-6 lg:col-span-6">
        <p className="text-xl md:text-2xl text-white/70 font-sans leading-relaxed border-l-2 border-[#ff4500] pl-6">
          DAOs and crypto-native clients pay on completion. Builders need cash to live <span className="text-[#ff4500] font-bold">today</span>.
        </p>
        <div className="grid gap-4 mt-8">
          <div className="border border-white/10 bg-[#020202] p-5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#ff4500]/50" />
            <h3 className="font-heading font-bold text-lg uppercase tracking-widest text-white mb-1">The Builder's Dilemma</h3>
            <p className="font-mono text-xs text-white/50 leading-relaxed">
              Freelance developers accept bounties but face 30 to 90-day wait times before the PR is merged and funds are released. This causes extreme cash flow friction.
            </p>
          </div>
          <div className="border border-white/10 bg-[#020202] p-5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#ff4500]/50" />
            <h3 className="font-heading font-bold text-lg uppercase tracking-widest text-white mb-1">The DAO's Dilemma</h3>
            <p className="font-mono text-xs text-white/50 leading-relaxed">
              DAOs cannot risk paying upfront for incomplete code. They must lock funds in escrow to guarantee delivery, inadvertently starving their best contributors.
            </p>
          </div>
        </div>
      </div>
    ),
    visual: (
      <div className="lg:col-span-6 h-full flex flex-col justify-center relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none" />
        <div className="relative z-10 border border-[#ff4500]/30 bg-[#ff4500]/5 p-8 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/10">
            <div className="font-mono text-xs text-[#ff4500] uppercase tracking-widest flex items-center gap-2">
              <Lock className="w-4 h-4" /> Locked Grant
            </div>
            <div className="font-heading font-bold text-2xl text-white">50,000 USDCx</div>
          </div>
          <div className="space-y-4 font-mono text-sm text-white/50">
            <div className="flex justify-between"><span>Status:</span> <span className="text-white">AWAITING_PR_MERGE</span></div>
            <div className="flex justify-between"><span>Est. Unlocks:</span> <span className="text-red-400">45 DAYS</span></div>
            <div className="flex justify-between"><span>Liquidity:</span> <span className="text-red-400">TRAPPED</span></div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'solution',
    eyebrow: 'THE SOLUTION',
    title: 'InvoiceVault',
    content: (
      <div className="space-y-6 lg:col-span-6">
        <p className="text-xl md:text-2xl text-white/70 font-sans leading-relaxed border-l-2 border-green-500 pl-6">
          A decentralized, fractional marketplace for tokenized escrows on the <span className="text-green-500 font-bold">Stacks L2</span>.
        </p>
        <p className="text-base text-white/50 font-sans leading-relaxed">
          InvoiceVault allows builders to tokenize their pending grants and sell fractional shares to DeFi investors at a slight discount. Builders get immediate liquidity. Investors get low-risk, Bitcoin-backed yield.
        </p>
        <div className="flex flex-col gap-4 mt-8 font-mono text-sm">
          <div className="flex items-center gap-4 bg-[#020202] border border-white/10 p-4">
            <div className="w-10 h-10 bg-green-500/10 flex items-center justify-center"><Zap className="w-5 h-5 text-green-500" /></div>
            <div>
              <div className="text-white font-bold uppercase tracking-widest">Instant Liquidity</div>
              <div className="text-white/40 text-xs">Builders trade time for immediate cash.</div>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-[#020202] border border-white/10 p-4">
            <div className="w-10 h-10 bg-blue-500/10 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-blue-500" /></div>
            <div>
              <div className="text-white font-bold uppercase tracking-widest">Real Yield</div>
              <div className="text-white/40 text-xs">Investors earn APY backed by over-collateralized DAO treasuries.</div>
            </div>
          </div>
        </div>
      </div>
    ),
    visual: (
      <div className="lg:col-span-6 h-full flex flex-col justify-center gap-6 relative">
        <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-green-500/10 blur-[100px] pointer-events-none" />
        
        {/* Mock UI Element */}
        <div className="relative z-10 border border-green-500/30 bg-[#020202] p-6 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="font-mono text-[10px] text-green-500 uppercase tracking-widest mb-1">FRACTIONAL_ESCROW_MARKET</div>
              <div className="font-heading font-bold text-xl text-white uppercase">Frontend Redesign Grant</div>
            </div>
            <div className="border border-green-500 text-green-500 px-2 py-1 font-mono text-[10px] uppercase">TOKENIZED</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 p-4 border border-white/5">
              <div className="font-mono text-[10px] text-white/40 mb-1">LOCKED VALUE</div>
              <div className="font-heading font-black text-2xl text-white">50k <span className="text-sm font-sans font-normal text-white/50">USDCx</span></div>
            </div>
            <div className="bg-green-500/5 p-4 border border-green-500/20">
              <div className="font-mono text-[10px] text-green-500 mb-1">BUILDER DISCOUNT</div>
              <div className="font-heading font-black text-2xl text-green-500">6.0% <span className="text-sm font-sans font-normal opacity-50">APY</span></div>
            </div>
          </div>
          
          <Button className="w-full bg-white text-black hover:bg-green-500 rounded-none h-12 font-heading font-bold uppercase tracking-widest transition-colors">
            Provide sBTC Liquidity
          </Button>
        </div>
      </div>
    )
  },
  {
    id: 'market',
    eyebrow: 'MARKET OPPORTUNITY',
    title: 'A Massive Inefficiency',
    content: (
      <div className="space-y-6 lg:col-span-6">
        <p className="text-xl md:text-2xl text-white/70 font-sans leading-relaxed border-l-2 border-blue-500 pl-6">
          Traditional invoice factoring is a <span className="text-blue-500 font-bold">$3 Trillion</span> global market, entirely missing from Web3.
        </p>
        <div className="space-y-4 font-mono text-sm text-white/50 leading-relaxed">
          <p>Web3 bounties and grants total over $1B annually across all major ecosystems. Yet, developers have no way to collateralize their pending payouts.</p>
          <p>By bringing invoice factoring on-chain via Stacks and sBTC, we create a net-new DeFi primitive: <strong className="text-white">Risk-isolated, time-bound, real-world-asset (RWA) yield.</strong></p>
        </div>
      </div>
    ),
    visual: (
      <div className="lg:col-span-6 grid grid-cols-2 gap-6 relative">
        <div className="col-span-2 border border-white/10 bg-[#020202] p-8 flex flex-col items-center text-center justify-center">
          <div className="text-5xl font-heading font-black text-white mb-2">$3T</div>
          <div className="font-mono text-xs text-white/40 uppercase tracking-widest">Global Factoring Market</div>
        </div>
        <div className="border border-white/10 bg-blue-500/5 p-8 flex flex-col items-center text-center justify-center border-b-4 border-b-blue-500">
          <div className="text-3xl font-heading font-black text-white mb-2">0%</div>
          <div className="font-mono text-xs text-white/40 uppercase tracking-widest leading-tight">Web3 Penetration<br/>(Until Now)</div>
        </div>
        <div className="border border-white/10 bg-blue-500/5 p-8 flex flex-col items-center text-center justify-center border-b-4 border-b-blue-500">
          <div className="text-3xl font-heading font-black text-white mb-2">6-12%</div>
          <div className="font-mono text-xs text-white/40 uppercase tracking-widest leading-tight">Target Yield<br/>for sBTC LPs</div>
        </div>
      </div>
    )
  },
  {
    id: 'architecture',
    eyebrow: 'UNDER THE HOOD',
    title: 'Powered by Stacks & sBTC',
    content: (
      <div className="space-y-6 lg:col-span-6">
        <p className="text-xl md:text-2xl text-white/70 font-sans leading-relaxed border-l-2 border-purple-500 pl-6">
          Smart contracts on Bitcoin, utilizing <span className="text-purple-500 font-bold">trustless automated oracles</span>.
        </p>
        <ul className="space-y-6 mt-8 font-mono text-sm">
          <li className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full border border-purple-500/50 flex items-center justify-center shrink-0 bg-purple-500/10 text-purple-500">1</div>
            <div>
              <strong className="text-white block mb-1">Clarity Smart Contracts</strong>
              <span className="text-white/50">Fractionalizes the escrow vault, mathematically ensuring LPs get paid pro-rata.</span>
            </div>
          </li>
          <li className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full border border-purple-500/50 flex items-center justify-center shrink-0 bg-purple-500/10 text-purple-500">2</div>
            <div>
              <strong className="text-white block mb-1">sBTC & USDCx Liquidity</strong>
              <span className="text-white/50">DAOs lock stablecoins (USDCx). Investors fund the builder upfront using decentralized Bitcoin (sBTC).</span>
            </div>
          </li>
          <li className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full border border-purple-500/50 flex items-center justify-center shrink-0 bg-purple-500/10 text-purple-500">3</div>
            <div>
              <strong className="text-white block mb-1">x402 Webhook Oracles</strong>
              <span className="text-white/50">When the GitHub PR is merged, an automated, spam-resistant oracle triggers contract settlement instantly.</span>
            </div>
          </li>
        </ul>
      </div>
    ),
    visual: (
      <div className="lg:col-span-6 h-full flex items-center justify-center relative p-8">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none" />
        <div className="w-full border border-white/10 bg-[#020202] p-8 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/0 via-purple-500 to-purple-500/0 opacity-50" />
          
          {/* Architecture Diagram Mock */}
          <div className="flex flex-col items-center gap-6">
            <div className="w-full flex justify-between items-center">
              <div className="border border-white/20 p-4 text-center font-mono text-xs text-white/70 bg-white/5 w-1/3">
                GitHub PR Merge
              </div>
              <div className="text-purple-500">→</div>
              <div className="border border-purple-500 p-4 text-center font-mono text-xs text-purple-500 bg-purple-500/10 w-1/3 font-bold shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                Next.js Oracle (x402)
              </div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="w-full border border-white/20 p-6 text-center bg-[#050505]">
              <div className="font-heading font-bold text-lg text-white mb-2 uppercase tracking-widest">Clarity Escrow Contract</div>
              <div className="flex justify-center gap-4 font-mono text-[10px] text-white/40">
                <span className="bg-white/5 px-2 py-1">resolve-escrow()</span>
                <span className="bg-white/5 px-2 py-1">claim-yield()</span>
              </div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="w-full flex justify-between items-center">
              <div className="border border-green-500 p-4 text-center font-mono text-xs text-green-500 bg-green-500/10 w-1/3 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                sBTC to Builder
              </div>
              <div className="border border-blue-500 p-4 text-center font-mono text-xs text-blue-500 bg-blue-500/10 w-1/3 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                USDCx to LPs
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'demo',
    eyebrow: 'READY TO BUILD',
    title: 'Experience the Protocol',
    content: (
      <div className="space-y-8 lg:col-span-6">
        <p className="text-xl md:text-2xl text-white/70 font-sans leading-relaxed">
          The smart contracts are deployed to the Stacks Testnet. The frontend is fully functional. The database is live.
        </p>
        <div className="bg-[#ff4500]/10 border border-[#ff4500]/30 p-6 font-mono text-sm text-[#ff4500]">
          <p className="mb-2 uppercase tracking-widest font-bold">Hackathon Deliverables:</p>
          <ul className="space-y-2 list-disc pl-4 text-white/70 font-sans">
            <li>Fully responsive Next.js application</li>
            <li>Clarity `invoice-vault.clar` contract on Testnet</li>
            <li>Turso edge database integration</li>
            <li>Automated Oracle / Indexer synchronization</li>
          </ul>
        </div>
      </div>
    ),
    visual: (
      <div className="lg:col-span-6 h-full flex flex-col items-center justify-center relative p-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,69,0,0.15)_0%,transparent_70%)] pointer-events-none" />
        <Hexagon className="w-32 h-32 text-[#ff4500] mb-8" strokeWidth={1} />
        <Link href="/dashboard" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto h-20 px-12 bg-[#ff4500] text-black hover:bg-white hover:text-black transition-all duration-300 rounded-none font-heading font-black text-2xl uppercase tracking-widest border-none shadow-[0_0_30px_rgba(255,69,0,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] group">
            Launch App Demo <ArrowUpRight className="w-8 h-8 ml-4 group-hover:rotate-45 transition-transform" />
          </Button>
        </Link>
      </div>
    )
  }
];

export default function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < SLIDES.length - 1) setCurrentSlide(c => c + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(c => c - 1);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        setCurrentSlide(c => (c < SLIDES.length - 1 ? c + 1 : c));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setCurrentSlide(c => (c > 0 ? c - 1 : c));
      }
    };

    let isScrolling = false;
    const handleWheel = (e: WheelEvent) => {
      // Prevent triggering multiple times per swipe
      if (isScrolling) return;
      
      // Threshold to distinguish real swipes from tiny accidental trackpad movements
      if (Math.abs(e.deltaX) > 40 || Math.abs(e.deltaY) > 40) {
        isScrolling = true;
        
        if (e.deltaX > 0 || e.deltaY > 0) {
          setCurrentSlide(c => (c < SLIDES.length - 1 ? c + 1 : c));
        } else {
          setCurrentSlide(c => (c > 0 ? c - 1 : c));
        }

        // Lock scrolling for a short duration to prevent flying through multiple slides
        setTimeout(() => {
          isScrolling = false;
        }, 800);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const slide = SLIDES[currentSlide];

  return (
    <div className="h-screen bg-[#050505] text-white font-sans selection:bg-[#ff4500] selection:text-white flex flex-col overflow-hidden relative">
      
      {/* Absolute Back Button */}
      <Link href="/" className="absolute top-6 left-6 z-50 text-white/40 hover:text-white flex items-center gap-2 font-mono text-xs uppercase tracking-widest transition-colors">
        <ArrowLeft className="w-4 h-4" /> Exit Pitch
      </Link>

      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]" />
      </div>

      <main className="flex-1 flex flex-col z-10 relative">
        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/5">
          <div 
            className="h-full bg-[#ff4500] transition-all duration-500 ease-out"
            style={{ width: `${((currentSlide + 1) / SLIDES.length) * 100}%` }}
          />
        </div>

        {/* Slide Content */}
        <div className="flex-1 container mx-auto px-6 py-6 lg:py-12 flex flex-col justify-center">
          <div key={slide.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center min-h-[50vh]">
              
              {/* Left Column: Text Content */}
              <div className="lg:col-span-6 space-y-4">
                <div className="font-mono text-sm text-[#ff4500] tracking-widest uppercase flex items-center gap-2">
                  <Terminal className="w-4 h-4" /> [ {slide.eyebrow} ]
                </div>
                <h2 className="text-4xl md:text-6xl font-heading font-black uppercase tracking-tighter leading-none mb-6">
                  {slide.title.split(' ').map((word, i) => (
                    <span key={i} className={i === slide.title.split(' ').length - 1 && slide.id !== 'solution' ? 'text-white/20' : ''}>
                      {word}{' '}
                    </span>
                  ))}
                </h2>
                {slide.content}
              </div>

              {/* Right Column: Visuals */}
              {slide.visual}
            </div>
          </div>
        </div>

        {/* Controls Navigation */}
        <div className="border-t border-white/10 bg-[#020202] p-6 flex justify-between items-center mt-auto">
          <div className="font-mono text-xs text-white/40 uppercase tracking-widest hidden md:block">
            Slide {currentSlide + 1} of {SLIDES.length}
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="flex-1 md:flex-none bg-transparent border-white/20 text-white hover:bg-white hover:text-black transition-all rounded-none h-14 px-8 font-heading font-bold uppercase tracking-widest disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-white"
            >
              <ArrowLeft className="w-5 h-5 mr-2" /> Back
            </Button>
            
            <Button
              onClick={nextSlide}
              disabled={currentSlide === SLIDES.length - 1}
              className="flex-1 md:flex-none bg-[#ff4500] text-black hover:bg-white hover:text-black transition-all duration-300 rounded-none h-14 px-8 font-heading font-bold uppercase tracking-widest border-none disabled:opacity-20 disabled:hover:bg-[#ff4500] disabled:hover:text-black"
            >
              Next <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

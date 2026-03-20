'use client';

import { useEffect, useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

export function DashboardTutorial() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the tutorial
    const hasSeenTutorial = localStorage.getItem('invoice_vault_tutorial_seen');
    if (!hasSeenTutorial) {
      setRun(true);
    }

    // Listen for custom event to restart tutorial
    const handleRestart = () => setRun(true);
    window.addEventListener('restart-tutorial', handleRestart);

    return () => {
      window.removeEventListener('restart-tutorial', handleRestart);
    };
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('invoice_vault_tutorial_seen', 'true');
    }
  };

  const steps: Step[] = [
    {
      target: 'body',
      content: (
        <div className="text-left">
          <h3 className="text-xl font-heading font-bold text-[#ff4500] mb-2 uppercase">Welcome to InvoiceVault</h3>
          <p className="font-sans text-sm text-white/80 leading-relaxed">
            This is a yield-bearing escrow protocol. We bridge the gap between DAOs waiting for code and developers waiting for cash. Let's take a quick tour!
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '#tour-role-switcher',
      content: (
        <div className="text-left">
          <h3 className="text-lg font-heading font-bold text-[#ff4500] mb-2 uppercase">Switch Your Role</h3>
          <p className="font-sans text-sm text-white/80 leading-relaxed mb-2">
            InvoiceVault is a two-sided marketplace. You can instantly toggle between acting as a <strong>DAO (Payer)</strong> and a <strong>Builder (Payee)</strong>.
          </p>
          <p className="font-mono text-xs text-[#ff4500] bg-[#ff4500]/10 p-2 border border-[#ff4500]/20">Try clicking this button later to see the other perspective!</p>
        </div>
      ),
      placement: 'bottom-end',
    },
    {
      target: '#tour-dao-form',
      content: (
        <div className="text-left">
          <h3 className="text-lg font-heading font-bold text-[#ff4500] mb-2 uppercase">Locking Funds</h3>
          <p className="font-sans text-sm text-white/80 leading-relaxed">
            When you are acting as a <strong>DAO</strong>, you use this form to create a new grant. You deposit stablecoins (simulated with STX on testnet) into the Clarity smart contract.
          </p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '#tour-dao-list',
      content: (
        <div className="text-left">
          <h3 className="text-lg font-heading font-bold text-[#ff4500] mb-2 uppercase">Track Escrows</h3>
          <p className="font-sans text-sm text-white/80 leading-relaxed">
            Once locked, your grants appear here. The funds remain perfectly safe in the smart contract until the Builder finishes the work.
          </p>
        </div>
      ),
      placement: 'left',
    },
    {
      target: '#tour-builder-list',
      content: (
        <div className="text-left">
          <h3 className="text-lg font-heading font-bold text-[#ff4500] mb-2 uppercase">Tokenizing Invoices</h3>
          <p className="font-sans text-sm text-white/80 leading-relaxed">
            If you switch your role to a <strong>Builder</strong>, you will see your pending payouts here. You can click "Get Upfront Liquidity" to sell the invoice at a discount for immediate cash.
          </p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '#tour-marketplace',
      content: (
        <div className="text-left">
          <h3 className="text-lg font-heading font-bold text-[#ff4500] mb-2 uppercase">Provide Liquidity</h3>
          <p className="font-sans text-sm text-white/80 leading-relaxed">
            DeFi Investors come to the Marketplace to find tokenized invoices. They fund them with sBTC to earn the locked USDCx yield.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '#tour-portfolio',
      content: (
        <div className="text-left">
          <h3 className="text-lg font-heading font-bold text-[#ff4500] mb-2 uppercase">Claim Yield</h3>
          <p className="font-sans text-sm text-white/80 leading-relaxed mb-2">
            Once a GitHub PR is merged, our automated Oracle settles the contract. Investors go to their Portfolio to claim their profitable yield!
          </p>
          <p className="font-mono text-xs text-white/40 border-t border-white/10 pt-2 mt-2">End of tour. Start building!</p>
        </div>
      ),
      placement: 'bottom',
    }
  ];

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          arrowColor: '#050505',
          backgroundColor: '#050505',
          overlayColor: 'rgba(0, 0, 0, 0.8)',
          primaryColor: '#ff4500',
          textColor: '#ffffff',
          width: 400,
          zIndex: 1000,
        },
        tooltip: {
          border: '1px solid rgba(255, 69, 0, 0.5)',
          borderRadius: '0px',
          padding: '24px',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        buttonNext: {
          backgroundColor: '#ff4500',
          color: '#000',
          borderRadius: '0px',
          fontFamily: 'monospace',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          padding: '10px 20px',
        },
        buttonBack: {
          color: 'rgba(255,255,255,0.5)',
          fontFamily: 'monospace',
          textTransform: 'uppercase',
          marginRight: '10px',
        },
        buttonSkip: {
          color: 'rgba(255,255,255,0.3)',
          fontFamily: 'monospace',
          textTransform: 'uppercase',
        }
      }}
    />
  );
}

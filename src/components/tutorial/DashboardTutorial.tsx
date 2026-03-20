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
          <p className="font-sans text-sm text-white/80 leading-relaxed">
            InvoiceVault is a two-sided marketplace. Click here anytime to instantly toggle between acting as a <strong>DAO (Payer)</strong> and a <strong>Builder (Payee)</strong>!
          </p>
        </div>
      ),
      placement: 'bottom-end',
    },
    {
      target: '#tour-dashboard-content',
      content: (
        <div className="text-left">
          <h3 className="text-lg font-heading font-bold text-[#ff4500] mb-2 uppercase">The Control Panel</h3>
          <p className="font-sans text-sm text-white/80 leading-relaxed">
            This is your main dashboard. When you are a <strong>DAO</strong>, you lock funds here. When you are a <strong>Builder</strong>, you come here to tokenize your invoices for upfront cash.
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
          <p className="font-sans text-sm text-white/80 leading-relaxed">
            Once a GitHub PR is merged, the contract settles automatically. Investors go to their Portfolio to claim their profitable yield!
          </p>
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

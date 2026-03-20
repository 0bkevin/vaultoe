import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { makeContractCall, broadcastTransaction, uintCV } from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import { db } from '@/db';
import { invoices } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getOraclePrivateKey } from '@/lib/oracle';

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-hub-signature-256');
    const bodyText = await request.text();
    
    if (!verifyGitHubSignature(signature, bodyText)) {
      return NextResponse.json({ error: 'Unauthorized: Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(bodyText);

    if (payload.action !== 'closed' || payload.pull_request.merged !== true) {
      return NextResponse.json({ message: 'Ignored: PR not merged' }, { status: 200 });
    }

    const prUrl = payload.pull_request.html_url;
    console.log(`PR Merged detected: ${prUrl}`);

    const matchingInvoices = await db.select().from(invoices).where(eq(invoices.githubPrUrl, prUrl));
    
    if (matchingInvoices.length === 0) {
      return NextResponse.json({ message: 'Ignored: PR not linked to any active escrow' }, { status: 200 });
    }

    const invoice = matchingInvoices[0];

    if (invoice.status === 'SETTLED') {
      return NextResponse.json({ message: 'Escrow already settled' }, { status: 200 });
    }

    if (invoice.onchainId === null) {
      return NextResponse.json({ error: 'Invoice not locked on-chain' }, { status: 400 });
    }

    let oraclePrivateKey: string;
    try {
      oraclePrivateKey = await getOraclePrivateKey();
    } catch {
      return NextResponse.json({ error: 'Oracle not configured' }, { status: 500 });
    }

    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_NAME || 'invoice-vault';

    if (!contractAddress) {
      return NextResponse.json({ error: 'Contract address not configured' }, { status: 500 });
    }

    const transaction = await makeContractCall({
      contractAddress,
      contractName,
      functionName: 'resolve-escrow',
      functionArgs: [uintCV(invoice.onchainId)],
      senderKey: oraclePrivateKey,
      network: STACKS_TESTNET,
    });

    let broadcastResponse;
    try {
      broadcastResponse = await broadcastTransaction({ transaction, network: STACKS_TESTNET });
    } catch (broadcastError) {
      console.error('Broadcast failed:', broadcastError);
      return NextResponse.json({ error: 'Failed to broadcast transaction' }, { status: 500 });
    }

    await db.update(invoices)
      .set({ status: 'SETTLED' })
      .where(eq(invoices.id, invoice.id));

    console.log(`Escrow ${invoice.onchainId} resolved. TxID: ${broadcastResponse.txid}`);

    return NextResponse.json(
      { 
        message: 'Escrow resolved successfully', 
        txId: broadcastResponse.txid,
        invoiceId: invoice.id,
        escrowId: invoice.onchainId
      }, 
      { status: 200 }
    );

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function verifyGitHubSignature(signature: string | null, payload: string): boolean {
  if (!signature) return false;
  
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('GITHUB_WEBHOOK_SECRET not set - bypassing verification for development');
    return true;
  }

  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch {
    return false;
  }
}

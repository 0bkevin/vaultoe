import { NextResponse } from 'next/server';
import { makeContractCall, broadcastTransaction, uintCV } from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import { db } from '@/db';
import { invoices } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getOraclePrivateKey } from '@/lib/oracle';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { invoiceId } = body;

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Missing invoice ID' },
        { status: 400 }
      );
    }

    const matchingInvoices = await db.select().from(invoices).where(eq(invoices.id, invoiceId));
    
    if (matchingInvoices.length === 0) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const invoice = matchingInvoices[0];

    if (invoice.status === 'SETTLED') {
      return NextResponse.json({ error: 'Invoice already settled' }, { status: 400 });
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
      return NextResponse.json(
        { error: 'Contract address not configured' },
        { status: 500 }
      );
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
      console.error("Broadcast failed:", broadcastError);
      return NextResponse.json({ error: 'Failed to broadcast transaction' }, { status: 500 });
    }

    await db.update(invoices)
      .set({ status: 'SETTLED' })
      .where(eq(invoices.id, invoice.id));

    console.log(`Invoice ${invoice.onchainId} settled via oracle simulation.`);

    return NextResponse.json(
      { 
        message: 'Escrow resolved successfully (simulated)', 
        txId: broadcastResponse.txid 
      }, 
      { status: 200 }
    );

  } catch (error) {
    console.error('Oracle simulation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

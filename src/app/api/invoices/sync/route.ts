import { NextResponse } from 'next/server';
import { db } from '@/db';
import { invoices } from '@/db/schema';
import { isNull, isNotNull, and } from 'drizzle-orm';
import { eq } from 'drizzle-orm';

export async function POST() {
  try {
    // Find all invoices that have a txId but no onchainId
    const pendingInvoices = await db
      .select()
      .from(invoices)
      .where(and(isNull(invoices.onchainId), isNotNull(invoices.txId)));

    if (pendingInvoices.length === 0) {
      return NextResponse.json({ message: 'No pending invoices to sync' }, { status: 200 });
    }

    let syncedCount = 0;

    for (const invoice of pendingInvoices) {
      if (!invoice.txId) continue;

      try {
        // Poll the Stacks API for the transaction status
        const response = await fetch(`https://api.testnet.hiro.so/extended/v1/tx/${invoice.txId}`);
        if (!response.ok) continue;

        const txData = await response.json();

        // If the transaction was successful and has a result
        if (txData.tx_status === 'success' && txData.tx_result && txData.tx_result.repr) {
          // Parse the repr to get the escrow-id (e.g., "(ok u5)" -> "5")
          const match = txData.tx_result.repr.match(/\(ok u(\d+)\)/);
          
          if (match && match[1]) {
            const onchainId = parseInt(match[1], 10);

            // Update the invoice in the database
            await db.update(invoices)
              .set({ onchainId, status: 'LOCKED' })
              .where(eq(invoices.id, invoice.id));

            console.log(`Synced invoice ${invoice.id} with onchainId ${onchainId}`);
            syncedCount++;
          }
        } else if (txData.tx_status === 'abort_by_response' || txData.tx_status === 'abort_by_post_condition') {
            console.error(`Transaction ${invoice.txId} failed.`);
        }
      } catch (err) {
        console.error(`Failed to sync invoice ${invoice.id}:`, err);
      }
    }

    return NextResponse.json(
      { message: `Successfully synced ${syncedCount} invoices`, syncedCount },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in sync endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

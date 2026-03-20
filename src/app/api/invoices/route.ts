import { NextResponse } from 'next/server';
import { db } from '@/db';
import { invoices, users } from '@/db/schema';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      daoPrincipal, 
      builderPrincipal, 
      title, 
      description, 
      amountUsdcx, 
      githubPrUrl,
      txId
    } = body;

    if (!daoPrincipal || !builderPrincipal || !amountUsdcx || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Ensure users exist to satisfy foreign key constraints
    await db.insert(users).values({
      principal: daoPrincipal,
      role: 'DAO',
      createdAt: new Date(),
    }).onConflictDoNothing();

    await db.insert(users).values({
      principal: builderPrincipal,
      role: 'BUILDER',
      createdAt: new Date(),
    }).onConflictDoNothing();

    const newInvoice = {
      id: randomUUID(),
      daoPrincipal,
      builderPrincipal,
      title,
      description: description || '',
      amountUsdcx: Number(amountUsdcx),
      status: 'LOCKED',
      githubPrUrl: githubPrUrl || '',
      txId: txId || null,
      createdAt: new Date(),
    };

    await db.insert(invoices).values(newInvoice);

    return NextResponse.json(
      { message: 'Invoice escrow metadata saved successfully', invoice: newInvoice },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving invoice:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const allInvoices = await db.select().from(invoices);
    
    return NextResponse.json(
      { invoices: allInvoices },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, discountBps, onchainId } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing invoice id' },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};
    if (status) updates.status = status;
    if (discountBps !== undefined) updates.discountBps = discountBps;
    if (onchainId !== undefined) updates.onchainId = onchainId;

    await db.update(invoices)
      .set(updates)
      .where(eq(invoices.id, id));

    return NextResponse.json(
      { message: 'Invoice updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

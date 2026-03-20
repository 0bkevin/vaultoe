import { NextResponse } from 'next/server';
import { db } from '@/db';
import { investments, invoices } from '@/db/schema';
import { randomUUID } from 'crypto';
import { eq, and } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { invoiceId, investorPrincipal, amountSbtc, sharePercentage } = body;

    if (!invoiceId || !investorPrincipal || !amountSbtc || !sharePercentage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newInvestment = {
      id: randomUUID(),
      invoiceId,
      investorPrincipal,
      amountSbtc: Number(amountSbtc),
      sharePercentage: Number(sharePercentage),
      createdAt: new Date(),
    };

    await db.insert(investments).values(newInvestment);

    return NextResponse.json(
      { message: 'Investment recorded successfully', investment: newInvestment },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error recording investment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get('invoiceId');
    const investor = searchParams.get('investor');

    let results;
    if (invoiceId && investor) {
      results = await db.select().from(investments).where(
        and(
          eq(investments.invoiceId, invoiceId),
          eq(investments.investorPrincipal, investor)
        )
      );
    } else if (invoiceId) {
      results = await db.select().from(investments).where(
        eq(investments.invoiceId, invoiceId)
      );
    } else if (investor) {
      results = await db.select().from(investments).where(
        eq(investments.investorPrincipal, investor)
      );
    } else {
      results = await db.select().from(investments);
    }

    return NextResponse.json(
      { investments: results },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching investments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

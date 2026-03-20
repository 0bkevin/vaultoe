import { NextResponse } from 'next/server';
import { db } from '@/db';
import { invoices, investments, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const invoiceResult = await db.select().from(invoices).where(eq(invoices.id, id));
    
    if (invoiceResult.length === 0) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const invoice = invoiceResult[0];

    const invoiceInvestments = await db.select().from(investments).where(eq(investments.invoiceId, id));

    const totalFunded = invoiceInvestments.reduce((sum, inv) => sum + inv.amountSbtc, 0);

    const [daoUser, builderUser] = await Promise.all([
      invoice.daoPrincipal ? db.select().from(users).where(eq(users.principal, invoice.daoPrincipal)) : Promise.resolve([]),
      invoice.builderPrincipal ? db.select().from(users).where(eq(users.principal, invoice.builderPrincipal)) : Promise.resolve([]),
    ]);

    return NextResponse.json({
      invoice,
      investments: invoiceInvestments,
      totalFunded,
      dao: daoUser[0] || null,
      builder: builderUser[0] || null,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

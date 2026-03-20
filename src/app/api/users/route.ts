import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const principal = searchParams.get('principal');

    if (principal) {
      const user = await db.select().from(users).where(eq(users.principal, principal));
      if (user.length === 0) {
        return NextResponse.json({ user: null }, { status: 200 });
      }
      return NextResponse.json({ user: user[0] }, { status: 200 });
    }

    const allUsers = await db.select().from(users);
    return NextResponse.json({ users: allUsers }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { principal, name, description, role, githubUrl, websiteUrl } = body;

    if (!principal || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await db.select().from(users).where(eq(users.principal, principal));

    if (existingUser.length > 0) {
      const updates: Record<string, unknown> = {};
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (role !== undefined) updates.role = role;
      if (githubUrl !== undefined) updates.githubUrl = githubUrl;
      if (websiteUrl !== undefined) updates.websiteUrl = websiteUrl;

      await db.update(users).set(updates).where(eq(users.principal, principal));
      return NextResponse.json({ message: 'User updated', user: { ...existingUser[0], ...updates } }, { status: 200 });
    }

    const newUser = {
      principal,
      name: name || '',
      description: description || '',
      role,
      githubUrl: githubUrl || '',
      websiteUrl: websiteUrl || '',
      createdAt: new Date(),
    };

    await db.insert(users).values(newUser);
    return NextResponse.json({ message: 'User created', user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

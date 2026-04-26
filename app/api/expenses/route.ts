import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  date: string;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const expensesJson = cookieStore.get('expenses')?.value;
    
    const expenses: Expense[] = expensesJson ? JSON.parse(expensesJson) : [];
    
    return NextResponse.json(expenses);
  } catch (error) {
    console.error('[v0] Error loading expenses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, category, description, date } = body;

    if (!amount || !category || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const expensesJson = cookieStore.get('expenses')?.value;
    const expenses: Expense[] = expensesJson ? JSON.parse(expensesJson) : [];

    const newExpense: Expense = {
      id: randomUUID(),
      amount: parseFloat(amount),
      category,
      description: description || null,
      date,
      created_at: new Date().toISOString(),
    };

    expenses.unshift(newExpense);

    // Set cookie with max age of 30 days
    cookieStore.set('expenses', JSON.stringify(expenses), {
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error) {
    console.error('[v0] Error creating expense:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

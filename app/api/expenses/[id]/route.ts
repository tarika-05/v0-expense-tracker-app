import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  date: string;
  created_at: string;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const expensesJson = cookieStore.get('expenses')?.value;
    
    let expenses: Expense[] = expensesJson ? JSON.parse(expensesJson) : [];
    
    // Filter out the expense to delete
    expenses = expenses.filter((expense) => expense.id !== id);

    // Update cookie
    cookieStore.set('expenses', JSON.stringify(expenses), {
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

'use client';

import { Card } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  date: string;
  created_at: string;
}

interface ExpenseSummaryProps {
  expenses: Expense[];
}

export function ExpenseSummary({ expenses }: ExpenseSummaryProps) {
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const byCategory = expenses.reduce(
    (acc, expense) => {
      const existing = acc.find((item) => item.category === expense.category);
      if (existing) {
        existing.amount += expense.amount;
      } else {
        acc.push({
          category: expense.category,
          amount: expense.amount,
        });
      }
      return acc;
    },
    [] as Array<{ category: string; amount: number }>
  );

  const topCategory = byCategory.length > 0
    ? byCategory.reduce((max, cat) => (cat.amount > max.amount ? cat : max))
    : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-2">Total Expenses</p>
            <p className="text-3xl font-bold">${totalExpenses.toFixed(2)}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div>
          <p className="text-sm text-gray-600 mb-2">Transactions</p>
          <p className="text-3xl font-bold">{expenses.length}</p>
        </div>
      </Card>

      <Card className="p-6">
        <div>
          <p className="text-sm text-gray-600 mb-2">Top Category</p>
          <p className="text-xl font-bold">
            {topCategory ? `${topCategory.category} ($${topCategory.amount.toFixed(2)})` : '-'}
          </p>
        </div>
      </Card>
    </div>
  );
}

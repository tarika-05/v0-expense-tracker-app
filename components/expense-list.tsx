'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  date: string;
  created_at: string;
}

interface ExpenseListProps {
  expenses: Expense[];
  onExpenseDeleted: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Food': 'bg-orange-100 text-orange-800',
  'Transportation': 'bg-blue-100 text-blue-800',
  'Entertainment': 'bg-purple-100 text-purple-800',
  'Shopping': 'bg-pink-100 text-pink-800',
  'Utilities': 'bg-green-100 text-green-800',
  'Healthcare': 'bg-red-100 text-red-800',
  'Education': 'bg-indigo-100 text-indigo-800',
  'Other': 'bg-gray-100 text-gray-800',
};

export function ExpenseList({ expenses, onExpenseDeleted }: ExpenseListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete expense');
      }

      onExpenseDeleted();
    } catch (error) {
      console.error('Error deleting expense:', error);
    } finally {
      setDeletingId(null);
    }
  };

  if (expenses.length === 0) {
    return (
      <Card className="p-6 text-center text-gray-500">
        No expenses yet. Add one to get started!
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Description</th>
              <th className="px-6 py-3 text-right text-sm font-semibold">Amount</th>
              <th className="px-6 py-3 text-center text-sm font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm">
                  {format(new Date(expense.date), 'MMM dd, yyyy')}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      CATEGORY_COLORS[expense.category] || CATEGORY_COLORS['Other']
                    }`}
                  >
                    {expense.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  {expense.description || '-'}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-right">
                  ₹{expense.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(expense.id)}
                    disabled={deletingId === expense.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

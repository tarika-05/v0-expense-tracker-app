'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ExpenseForm } from '@/components/expense-form';
import { ExpenseList } from '@/components/expense-list';
import { ExpenseSummary } from '@/components/expense-summary';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  date: string;
  created_at: string;
}

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  useEffect(() => {
    // Check authentication and load expenses
    const loadData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Redirect to sign in or show sign in UI
          setLoading(false);
          return;
        }

        setUser(session.user);
        loadExpenses();
      } catch (error) {
        console.error('[v0] Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setUser(session.user);
          loadExpenses();
        } else {
          setUser(null);
          setExpenses([]);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/expenses');
      
      if (!response.ok) {
        throw new Error('Failed to load expenses');
      }

      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error('[v0] Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Expense Tracker</h1>
            <p className="text-gray-600 mb-8">
              Please sign in to your Supabase account to continue.
            </p>
            <a
              href={`${supabaseUrl}/auth/v1/magic-link`}
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Expense Tracker</h1>
            <p className="text-gray-600 mt-2">Welcome, {user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>

        <div className="space-y-6">
          <ExpenseSummary expenses={expenses} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ExpenseForm onExpenseAdded={loadExpenses} />
            </div>
            
            <div className="lg:col-span-2">
              <ExpenseList expenses={expenses} onExpenseDeleted={loadExpenses} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

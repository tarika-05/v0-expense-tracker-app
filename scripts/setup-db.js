import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('[v0] Starting database setup...');

    // Create expenses table
    const { error: createError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS expenses (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          amount DECIMAL(12, 2) NOT NULL,
          category VARCHAR(50) NOT NULL,
          description TEXT,
          date DATE NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
        CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

        ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can select their own expenses" ON expenses
          FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert their own expenses" ON expenses
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own expenses" ON expenses
          FOR UPDATE USING (auth.uid() = user_id);

        CREATE POLICY "Users can delete their own expenses" ON expenses
          FOR DELETE USING (auth.uid() = user_id);
      `,
    });

    if (createError) {
      console.error('[v0] Error creating table:', createError);
    } else {
      console.log('[v0] Database setup completed successfully');
    }
  } catch (error) {
    console.error('[v0] Setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();

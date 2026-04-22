// --- ./src/lib/supabase.ts ---
import { createClient } from '@supabase/supabase-js';

// Ensure you add these to a .env.local file in your frontend root:
// NEXT_PUBLIC_SUPABASE_URL=your-url
// NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
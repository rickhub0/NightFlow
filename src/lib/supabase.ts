import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === '' || supabaseAnonKey === '') {
    return null;
  }

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    return supabaseInstance;
  } catch (e) {
    console.error("Failed to initialize Supabase:", e);
    return null;
  }
};

export const supabase = getSupabase();

export type Task = {
  id: string;
  user_id: string;
  title: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  due_at: string | null;
  completed: boolean;
  created_at: string;
};

export type Timer = {
  id: string;
  user_id: string;
  task_id: string | null;
  duration: number;
  started_at: string;
  status: 'active' | 'paused' | 'completed';
};

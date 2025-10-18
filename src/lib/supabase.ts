import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ChatUser {
  id: string;
  username: string;
  display_name: string;
  password_hash: string;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

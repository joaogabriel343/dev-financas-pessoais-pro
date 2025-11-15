

import { supabase } from "./supabase";

export interface AccountRow {
  id: number;
  created_at: string;
  name: string;
  type: 'bank' | 'cash' | 'investment';
  balance: number;
  icon: string | null;
  user_id: string;
}

export async function listAccounts(userId: string): Promise<AccountRow[]> {
  const { data, error } = await supabase
    .from('accounts')
    .select('id, created_at, name, type, balance, icon, user_id')
    .eq('user_id', userId)
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((a: any) => ({ ...a, balance: Number(a.balance) })) as AccountRow[];
}
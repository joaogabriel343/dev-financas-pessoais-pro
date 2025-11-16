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

export async function createAccount(input: { user_id: string; name: string; type: 'bank' | 'cash' | 'investment'; balance: number; icon?: string }) {
  const { data, error } = await supabase
    .from('accounts')
    .insert([{ user_id: input.user_id, name: input.name, type: input.type, balance: input.balance, icon: input.icon || null }])
    .select('id, created_at, name, type, balance, icon, user_id')
    .single();
  if (error) throw error;
  return { ...data, balance: Number((data as any).balance) } as AccountRow;
}

export async function updateAccount(input: { id: number; name: string; type: 'bank' | 'cash' | 'investment'; balance: number; icon?: string }) {
  const { data, error } = await supabase
    .from('accounts')
    .update({ name: input.name, type: input.type, balance: input.balance, icon: input.icon || null })
    .eq('id', input.id)
    .select('id, created_at, name, type, balance, icon, user_id')
    .single();
  if (error) throw error;
  return { ...data, balance: Number((data as any).balance) } as AccountRow;
}

export async function deleteAccount(id: number) {
  const { error } = await supabase.from('accounts').delete().eq('id', id);
  if (error) throw error;
}


import { supabase } from "./supabase";

export type TransactionType = "income" | "expense";

export interface TransactionRow {
  id: number;
  created_at: string;
  type: TransactionType;
  amount: number; // coerced to number
  date: string; // YYYY-MM-DD
  description: string;
  category_id: number;
  account_id: number;
  user_id: string;
}

export interface TransactionWithNames extends TransactionRow {
  category_name: string;
  account_name: string;
}

export async function listTransactions(userId: string): Promise<TransactionWithNames[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("id, created_at, type, amount, date, description, category_id, account_id, user_id")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  const rows = (data ?? []).map((r: any) => ({
    ...r,
    amount: Number(r.amount),
  })) as TransactionRow[];

  if (rows.length === 0) return [];

  const categoryIds = Array.from(new Set(rows.map(r => r.category_id)));
  const accountIds = Array.from(new Set(rows.map(r => r.account_id)));

  const [{ data: categories, error: catErr }, { data: accounts, error: accErr }] = await Promise.all([
    supabase.from("categories").select("id, name").in("id", categoryIds),
    supabase.from("accounts").select("id, name").in("id", accountIds),
  ]);

  if (catErr) throw catErr;
  if (accErr) throw accErr;

  const catMap = new Map<number, string>((categories ?? []).map((c: any) => [c.id as number, c.name as string]));
  const accMap = new Map<number, string>((accounts ?? []).map((a: any) => [a.id as number, a.name as string]));

  return rows.map(r => ({
    ...r,
    category_name: catMap.get(r.category_id) ?? "",
    account_name: accMap.get(r.account_id) ?? "",
  }));
}

export async function deleteTransaction(id: number) {
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;
}

export async function updateTransaction(input: {
  id: number;
  type: TransactionType;
  amount: number;
  date: string; // YYYY-MM-DD
  description: string;
  category_id: number;
  account_id: number;
}) {
  const { data, error } = await supabase
    .from('transactions')
    .update({
      type: input.type,
      amount: input.amount,
      date: input.date,
      description: input.description,
      category_id: input.category_id,
      account_id: input.account_id,
    })
    .eq('id', input.id)
    .select('id, created_at, type, amount, date, description, category_id, account_id, user_id')
    .single();
  if (error) throw error;
  return { ...data, amount: Number((data as any).amount) } as TransactionRow;
}
// Adicione esta função no final do arquivo src/lib/transactions.ts

export async function createTransaction(input: {
  type: TransactionType;
  amount: number;
  date: string; // YYYY-MM-DD
  description: string;
  category_id: number;
  account_id: number;
  user_id: string; // Precisamos do ID do usuário logado
}) {
  const { data, error } = await supabase
    .from('transactions')
    .insert([
      {
        type: input.type,
        amount: input.amount,
        date: input.date,
        description: input.description,
        category_id: input.category_id,
        account_id: input.account_id,
        user_id: input.user_id,
      },
    ])
    .select()
    .single(); // .select().single() retorna o registro que acabamos de criar

  if (error) {
    console.error('Supabase error:', error);
    throw error;
  }

  return data;
}

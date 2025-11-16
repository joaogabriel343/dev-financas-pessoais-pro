import { supabase } from "./supabase";

export interface BudgetRow {
  id: number;
  created_at: string;
  user_id: string;
  category_id: number;
  month: string; // ISO date (YYYY-MM-DD)
  limit_amount: number;
  spent: number;
}

export interface BudgetWithCategory extends BudgetRow {
  category_name: string;
}

export function startOfMonthISO(date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  return d.toISOString().split("T")[0];
}

export async function listBudgets(userId: string, month?: string): Promise<BudgetWithCategory[]> {
  // Fetch budgets
  let query = supabase
    .from("budgets")
    .select("id, created_at, user_id, category_id, month, limit_amount, spent")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (month) {
    query = query.eq("month", month);
  }

  const { data: budgets, error } = await query;
  if (error) throw error;

  const rows = (budgets ?? []) as BudgetRow[];
  if (rows.length === 0) return [];

  // Fetch categories to map names
  const categoryIds = Array.from(new Set(rows.map(r => r.category_id)));
  const { data: categories, error: catError } = await supabase
    .from("categories")
    .select("id, name")
    .in("id", categoryIds);
  if (catError) throw catError;

  const nameById = new Map<number, string>((categories ?? []).map(c => [c.id as number, (c as any).name as string]));

  return rows.map(r => ({
    ...r,
    category_name: nameById.get(r.category_id) ?? "",
  }));
}

export async function upsertBudget(input: { user_id: string; category_id: number; month: string; limit_amount: number }) {
  const { data, error } = await supabase
    .from("budgets")
    .upsert({
      user_id: input.user_id,
      category_id: input.category_id,
      month: input.month,
      limit_amount: input.limit_amount,
    }, { onConflict: "user_id,category_id,month" })
    .select("id, created_at, user_id, category_id, month, limit_amount, spent")
    .single();

  if (error) throw error;
  return data as BudgetRow;
}

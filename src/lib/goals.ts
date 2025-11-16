import { supabase } from "./supabase";

export interface GoalRow {
  id: number;
  created_at: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string; // YYYY-MM-DD
}

export async function listGoals(userId: string): Promise<GoalRow[]> {
  const { data, error } = await supabase
    .from("goals")
    .select("id, created_at, user_id, name, target_amount, current_amount, deadline")
    .eq("user_id", userId)
    .order("deadline", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((g: any) => ({
    ...g,
    target_amount: Number(g.target_amount ?? 0),
    current_amount: Number(g.current_amount ?? 0),
  })) as GoalRow[];
}

export async function createGoal(input: {
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string; // YYYY-MM-DD
}): Promise<GoalRow> {
  const { data, error } = await supabase
    .from("goals")
    .insert([
      {
        user_id: input.user_id,
        name: input.name,
        target_amount: input.target_amount,
        current_amount: input.current_amount,
        deadline: input.deadline,
      },
    ])
    .select("id, created_at, user_id, name, target_amount, current_amount, deadline")
    .single();

  if (error) throw error;
  const g: any = data;
  return {
    ...g,
    target_amount: Number(g.target_amount ?? 0),
    current_amount: Number(g.current_amount ?? 0),
  } as GoalRow;
}

export async function updateGoal(input: {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string; // YYYY-MM-DD
}): Promise<GoalRow> {
  const { data, error } = await supabase
    .from("goals")
    .update({
      name: input.name,
      target_amount: input.target_amount,
      current_amount: input.current_amount,
      deadline: input.deadline,
    })
    .eq("id", input.id)
    .select("id, created_at, user_id, name, target_amount, current_amount, deadline")
    .single();

  if (error) throw error;
  const g: any = data;
  return {
    ...g,
    target_amount: Number(g.target_amount ?? 0),
    current_amount: Number(g.current_amount ?? 0),
  } as GoalRow;
}

export async function deleteGoal(id: number): Promise<void> {
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) throw error;
}
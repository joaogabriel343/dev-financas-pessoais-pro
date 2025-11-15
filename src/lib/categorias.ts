import { supabase } from "./supabase";

export type CategoryType = "income" | "expense";

export interface Category {

  id: number;
  created_at: string;
  name: string;
  type: CategoryType;
  user_id: string;
}

export async function listCategories(userId?: string) {
  const query = supabase
    .from("categories")
    .select("id, created_at, name, type, user_id")
    .order("name", { ascending: true });

  const { data, error } = userId ? await query.eq("user_id", userId) : await query;

  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function createCategory(input: { name: string; type: CategoryType; user_id: string }) {
  const { data, error } = await supabase
    .from("categories")
    .insert([{ name: input.name, type: input.type, user_id: input.user_id }])
    .select("id, created_at, name, type, user_id")
    .single();

  if (error) throw error;
  return data as Category;
}

export async function deleteCategory(id: number) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}
	id: number;
	created_at: string;
	name: string;
	type: CategoryType;
	user_id: string;
}

export async function listCategories(userId?: string) {
	const query = supabase
		.from("categories")
		.select("id, created_at, name, type, user_id")
		.order("name", { ascending: true });

	const { data, error } = userId ? await query.eq("user_id", userId) : await query;

	if (error) throw error;
	return (data ?? []) as Category[];
}

export async function createCategory(input: { name: string; type: CategoryType; user_id: string }) {
	const { data, error } = await supabase
		.from("categories")
		.insert([{ name: input.name, type: input.type, user_id: input.user_id }])
		.select("id, created_at, name, type, user_id")
		.single();

	if (error) throw error;
	return data as Category;
}

export async function deleteCategory(id: number) {
	const { error } = await supabase.from("categories").delete().eq("id", id);
	if (error) throw error;
}


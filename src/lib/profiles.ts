import { supabase } from "./supabase";

export interface ProfileRow {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export async function getProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar perfil:", error);
    return null;
  }

  return data;
}

export async function updateProfile(userId: string, input: { name: string; email: string }): Promise<ProfileRow> {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      name: input.name,
      email: input.email,
    })
    .eq("id", userId)
    .select("id, name, email, created_at, updated_at")
    .single();

  if (error) throw error;
  return data as ProfileRow;
}

export async function createProfile(input: { id: string; name: string; email: string }): Promise<ProfileRow> {
  const { data, error } = await supabase
    .from("profiles")
    .insert([
      {
        id: input.id,
        name: input.name,
        email: input.email,
      },
    ])
    .select("id, name, email, created_at, updated_at")
    .single();

  if (error) throw error;
  return data as ProfileRow;
}

import { supabase } from "@/integrations/supabase/client";

type Row = Record<string, unknown>;

export async function currentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Not signed in");
  return data.user.id;
}

export async function fetchAll<T = any>(
  table: string,
  opts: { orderBy?: string; ascending?: boolean; match?: Row } = {},
): Promise<T[]> {
  const { orderBy = "created_at", ascending = false, match } = opts;
  let query = (supabase.from(table as never) as any).select("*").order(orderBy, { ascending });
  if (match) query = query.match(match);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as T[];
}

export async function fetchOne<T = any>(table: string, id: string): Promise<T | null> {
  const { data, error } = await (supabase.from(table as never) as any)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as T | null;
}

export async function insertRow<T = any>(table: string, values: Row): Promise<T> {
  const user_id = await currentUserId();
  const { data, error } = await (supabase.from(table as never) as any)
    .insert({ ...values, user_id })
    .select()
    .single();
  if (error) throw error;
  return data as T;
}

export async function updateRow<T = any>(table: string, id: string, values: Row): Promise<T> {
  const { data, error } = await (supabase.from(table as never) as any)
    .update(values)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as T;
}

export async function deleteRow(table: string, id: string): Promise<void> {
  const { error } = await (supabase.from(table as never) as any).delete().eq("id", id);
  if (error) throw error;
}

export type Settings = {
  user_id: string;
  creator_name: string;
  greeting_name: string;
  avatar_url: string | null;
  timezone: string;
  default_platform: string;
  target_videos: number;
  target_streams: number;
  target_shorts: number;
  target_followers: number;
  socials: unknown;
  preferences?: unknown;
};

export async function fetchSettings(): Promise<Settings> {
  const user_id = await currentUserId();
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("user_id", user_id)
    .maybeSingle();
  if (error) throw error;
  if (data) return data as Settings;
  const { data: created, error: insertError } = await supabase
    .from("settings")
    .insert({ user_id })
    .select()
    .single();
  if (insertError) throw insertError;
  return created as Settings;
}

export async function saveSettings(values: Partial<Settings>): Promise<Settings> {
  const user_id = await currentUserId();
  const { data, error } = await supabase
    .from("settings")
    .update(values as never)
    .eq("user_id", user_id)
    .select()
    .single();
  if (error) throw error;
  return data as Settings;
}

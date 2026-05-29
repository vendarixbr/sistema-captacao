import { createClient } from "@supabase/supabase-js";
import type { LandingPage } from "./types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase environment variables are not set. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are defined in your .env file.",
  );
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");

// Landing Pages

export async function getLandingPages(): Promise<LandingPage[]> {
  const { data, error } = await supabase
    .from("landing_pages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as LandingPage[];
}

export async function getLandingPageById(id: string): Promise<LandingPage | null> {
  const { data, error } = await supabase
    .from("landing_pages")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as LandingPage;
}

export async function getLandingPageBySlug(slug: string): Promise<LandingPage | null> {
  const { data, error } = await supabase
    .from("landing_pages")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as LandingPage;
}

export async function createLandingPage(
  payload: Omit<LandingPage, "id" | "created_at" | "updated_at">,
): Promise<LandingPage> {
  const { data, error } = await supabase
    .from("landing_pages")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data as LandingPage;
}

export async function updateLandingPage(
  id: string,
  payload: Partial<Omit<LandingPage, "id" | "created_at">>,
): Promise<LandingPage> {
  const { data, error } = await supabase
    .from("landing_pages")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as LandingPage;
}

export async function deleteLandingPage(id: string): Promise<void> {
  const { error } = await supabase.from("landing_pages").delete().eq("id", id);
  if (error) throw error;
}

// Storage — upload de imagem para o bucket landing-images
export async function uploadLandingImage(
  slug: string,
  section: "logo" | "hero" | "about",
  file: File,
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${slug}/${section}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("landing-images")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("landing-images").getPublicUrl(path);
  return data.publicUrl;
}

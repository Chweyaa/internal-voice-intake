import { createBrowserClient } from '@supabase/ssr';
import type { IntakeEntry } from '@/types';

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

export async function getEntries(): Promise<IntakeEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('intake_entries')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateStatus(
  id: string,
  status: IntakeEntry['status']
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('intake_entries')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
}

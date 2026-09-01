import { getSupabaseClient } from '@/lib/supabase';

const client = () => getSupabaseClient();

export async function signInBusiness(email: string, password: string) {
  const { data, error } = await client().auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw new Error(error.message);
  if (!data.session) throw new Error('Business sign-in did not create a session.');
  return data.session;
}

export async function signOutBusiness() {
  const { error } = await client().auth.signOut();
  if (error) throw new Error(error.message);
}

export async function getBusinessAuthUser() {
  const { data, error } = await client().auth.getUser();
  if (error) throw new Error(error.message);
  return data.user;
}

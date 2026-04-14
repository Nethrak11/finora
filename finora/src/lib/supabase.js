import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  key || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    realtime: { params: { eventsPerSecond: 2 } }
  }
)

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/dashboard' }
  })
}

export async function signInWithEmail(email, password) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signUpWithEmail(email, password, name) {
  return supabase.auth.signUp({
    email, password,
    options: { data: { full_name: name } }
  })
}

export async function signOut() {
  const { error } = await supabase.auth.signOut({ scope: 'global' })
  // Clear localStorage manually as backup
  try {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('finora-') || k.startsWith('sb-')) localStorage.removeItem(k)
    })
  } catch {}
  return { error }
}

export async function fetchTransactions(userId) {
  return supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(500)
}

export async function insertTransaction(txn) {
  return supabase.from('transactions').insert([txn]).select()
}

export async function fetchUserProfile(userId) {
  return supabase.from('users').select('*').eq('id', userId).single()
}

export async function upsertUserProfile(profile) {
  return supabase.from('users').upsert([profile], { onConflict: 'id' }).select()
}

export async function deleteUserAccount(userId) {
  // Delete all user data first
  await supabase.from('transactions').delete().eq('user_id', userId)
  await supabase.from('ai_conversations').delete().eq('user_id', userId)
  await supabase.from('tips_log').delete().eq('user_id', userId)
  await supabase.from('users').delete().eq('id', userId)
  // Sign out after deletion
  await supabase.auth.signOut()
}

export function subscribeToTransactions(userId, callback) {
  return supabase
    .channel(`transactions-${userId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'transactions',
      filter: `user_id=eq.${userId}`
    }, callback)
    .subscribe()
}

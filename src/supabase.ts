import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const projectUrl =
  import.meta.env.VITE_SUPABASE_URL ??
  'https://mxhcalnpqkfzqhbmguuu.supabase.co'

const publishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  'sb_publishable_n4fhJOeIsGQYWz-xsBGJYw_2JdMimTE'

export const supabase = createClient<Database>(projectUrl, publishableKey, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true,
  },
})

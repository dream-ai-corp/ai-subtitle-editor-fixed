import { boot } from 'quasar/wrappers'
import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Export for use in components
export default boot(({ app }) => {
  // Make supabase available in the app
  app.config.globalProperties.$supabase = supabase
})

// Export types for use in components
export type { User, Session, AuthError } from '@supabase/supabase-js' 
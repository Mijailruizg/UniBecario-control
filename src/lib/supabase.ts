import { createClient } from '@supabase/supabase-js';

// Clave publicable (no secret ni service_role). Supabase Auth + RLS controlan acceso.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gieqvogvvidjmwzzgduz.supabase.co';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_-eveK9pyIJOvF7LPcsAI1w_VATNKLTc';
export const supabase = createClient(supabaseUrl, supabasePublishableKey);

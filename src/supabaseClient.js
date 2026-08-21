import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  // eslint-disable-next-line no-console
  console.error(
    'Supabase env vars ausentes. Defina REACT_APP_SUPABASE_URL e REACT_APP_SUPABASE_ANON_KEY (.env local ou nas variaveis de ambiente do Vercel).'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

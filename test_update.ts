import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

async function run() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return console.log("no creds");
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase.from('profiles').update({ approved: true, status: 'approved' }).eq('id', 'f88a0c46-f1ac-4461-9cfd-459c79598f0f').select();
  console.log("Update result:", data, error);
}
run();

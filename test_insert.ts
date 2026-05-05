import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

async function run() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return console.log("no creds");
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase.from('profiles').insert({
    id: "065f0e08-22fa-466d-affb-4f9b3c032a2d", // The id of the user seeded
    email: "hastyjoel1@gmail.com",
    username: "hasty",
    class: "admin",
    role: "admin",
    approved: true
  }).select();
  console.log("Insert result:", data, error);
}
run();

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFetch() {
  console.log("Signing in as Admin...");
  // Try fetching without login first (Projects should be readable by public)
  const { data: publicData, error: publicError } = await supabase.from('projects').select('id, title');
  
  if (publicError) {
    console.error("Public Fetch Error:", publicError);
  } else {
    console.log(`Public Fetch Success: Found ${publicData.length} projects`);
  }
}

testFetch();

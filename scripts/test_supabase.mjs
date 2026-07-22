import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Need to resolve back to the project root to find .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkUsers() {
  console.log("Fetching registered users from Supabase Auth...");
  const { data, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error("Error fetching users:", error.message);
    return;
  }

  console.log(`Found ${data.users.length} users in the database.`);
  data.users.forEach(user => {
    console.log(`\nUser: ${user.email}`);
    console.log(`- Created at: ${user.created_at}`);
    console.log(`- Email confirmed: ${user.email_confirmed_at ? 'Yes (' + user.email_confirmed_at + ')' : 'NO (This prevents login!)'}`);
    console.log(`- Last sign in: ${user.last_sign_in_at || 'Never'}`);
  });
}

checkUsers();

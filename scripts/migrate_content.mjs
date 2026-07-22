import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { projectsData } from '../src/data/projectsData.js';
import { updates } from '../src/data/updates.js';

// Load variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase URL or Service Role Key in .env.local!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateProjects() {
  console.log('Migrating Projects...');
  for (const project of projectsData) {
    const { error } = await supabase.from('projects').upsert({
      id: project.id,
      title: project.title,
      description: project.description,
      image: project.image,
      tags: project.tags,
      github_url: project.githubUrl,
      live_url: project.liveUrl,
      featured: project.featured,
      stats: project.stats || [],
      pipeline: project.pipeline || [],
      architecture: project.architecture || [],
      code: project.code || ''
    });

    if (error) {
      console.error(`❌ Failed to insert project: ${project.id}`, error);
    } else {
      console.log(`✅ Inserted project: ${project.id}`);
    }
  }
}

async function migrateUpdates() {
  console.log('\nMigrating Updates...');
  for (const update of updates) {
    const { error } = await supabase.from('updates').insert({
      version: update.version,
      label: update.label,
      date: update.date,
      unread: update.unread,
      items: update.items || []
    });

    if (error) {
      console.error(`❌ Failed to insert update: ${update.version}`, error);
    } else {
      console.log(`✅ Inserted update: ${update.version}`);
    }
  }
}

async function main() {
  await migrateProjects();
  await migrateUpdates();
  console.log('\n🎉 Migration Complete!');
}

main();

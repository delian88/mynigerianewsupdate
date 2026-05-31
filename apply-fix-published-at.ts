import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const projectUrl = process.env.VITE_SUPABASE_URL!;
const serviceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!;

if (!projectUrl || !serviceKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

// Use Supabase REST API with service key to run raw SQL
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.resolve(__dirname, 'supabase/migrations/20260531170000_fix_published_at_and_rls.sql');
const query = fs.readFileSync(sqlPath, 'utf8');

// Extract project ref from URL
const projectRef = new URL(projectUrl).hostname.split('.')[0];
const apiEndpoint = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

console.log(`Connecting to project: ${projectRef}`);
console.log('Applying published_at fix + RLS migration...');

const res = await fetch(apiEndpoint, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query }),
});

const body = await res.json().catch(() => ({}));

if (!res.ok) {
  console.error(`❌ Migration Failed (${res.status}):`, JSON.stringify(body, null, 2));
  process.exit(1);
} else {
  console.log(`✅ Migration applied successfully! published_at values backfilled and RLS policies updated.`);
}

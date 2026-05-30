import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const projectUrl = process.env.VITE_SUPABASE_URL!;
const pat = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!;

if (!projectUrl || !pat) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

// Extract project ref from URL
const projectRef = new URL(projectUrl).hostname.split('.')[0];
const apiEndpoint = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

// Read SQL file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.resolve(__dirname, 'supabase/migrations/20260530130000_create_profiles_table.sql');
const query = fs.readFileSync(sqlPath, 'utf8');

console.log(`Connecting to project: ${projectRef}`);
console.log('Applying profiles migration...');

const res = await fetch(apiEndpoint, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${pat}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query }),
});

const body = await res.json().catch(() => ({}));

if (!res.ok) {
  console.error(`❌ Migration Failed (${res.status}):`, JSON.stringify(body));
  process.exit(1);
} else {
  console.log(`✅ Profiles migration applied successfully!`);
}

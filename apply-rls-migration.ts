/**
 * Apply RLS policies to site_settings and podcasts via Supabase Management API.
 * Uses Personal Access Token (PAT) stored as VITE_SUPABASE_SERVICE_ROLE_KEY.
 */
import dotenv from 'dotenv';
dotenv.config();

const projectUrl = process.env.VITE_SUPABASE_URL!; // e.g. https://dsqwhzcaiyvcliigmggd.supabase.co
const pat = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!;

if (!projectUrl || !pat) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

// Extract project ref from URL
const projectRef = new URL(projectUrl).hostname.split('.')[0];
const apiEndpoint = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

const statements = [
  `ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY`,
  `DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='site_settings' AND policyname='Public read site_settings'
  ) THEN
    CREATE POLICY "Public read site_settings" ON public.site_settings FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='site_settings' AND policyname='Service role write site_settings'
  ) THEN
    CREATE POLICY "Service role write site_settings" ON public.site_settings FOR ALL
      USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='podcasts' AND policyname='Public read podcasts'
  ) THEN
    CREATE POLICY "Public read podcasts" ON public.podcasts FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='podcasts' AND policyname='Service role write podcasts'
  ) THEN
    CREATE POLICY "Service role write podcasts" ON public.podcasts FOR ALL
      USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$`,
];

console.log(`Connecting to project: ${projectRef}`);

let allOk = true;
for (const query of statements) {
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
    console.error(`❌ Failed (${res.status}):`, JSON.stringify(body));
    allOk = false;
  } else {
    console.log(`✅ OK:`, query.split('\n')[0].trim().slice(0, 60));
  }
}

if (allOk) {
  console.log('\n✅ All RLS policies applied successfully!');
} else {
  console.log('\n⚠️  Some statements failed. Run the SQL below manually in the Supabase SQL editor:');
  console.log(`\nURL: ${projectUrl.replace('.supabase.co', '')}.supabase.co → SQL Editor\n`);
  console.log(statements.join(';\n\n') + ';');
}

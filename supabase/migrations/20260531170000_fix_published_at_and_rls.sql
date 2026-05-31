-- Fix published_at for any articles where it is null (backfill from created_at)
UPDATE public.articles
SET published_at = created_at
WHERE published_at IS NULL;

-- Ensure public read policy exists on articles (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'articles'
      AND policyname = 'Public read articles'
  ) THEN
    CREATE POLICY "Public read articles"
      ON public.articles FOR SELECT
      USING (true);
  END IF;
END $$;

-- Allow authenticated users (admins using anon key) to insert/update/delete
-- This is needed since the admin dashboard may use the anon key in some write paths
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'articles'
      AND policyname = 'Authenticated write articles'
  ) THEN
    CREATE POLICY "Authenticated write articles"
      ON public.articles FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

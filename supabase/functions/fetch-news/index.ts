import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ── XML helpers ──────────────────────────────────────────────────────────────

function extractFirst(xml: string, ...tags: string[]): string {
  for (const tag of tags) {
    // Match both <tag> and <tag attr="..."> variants
    const re = new RegExp(`<${tag}(?:[^>]*)>([\\s\\S]*?)<\\/${tag}>`, 'i');
    const m = xml.match(re);
    if (m) return stripCdata(m[1].trim());
  }
  return '';
}

function stripCdata(s: string): string {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

function extractAttr(xml: string, tag: string, attr: string): string {
  const re = new RegExp(`<${tag}[^>]+${attr}=["']([^"']+)["']`, 'i');
  const m = xml.match(re);
  return m ? m[1] : '';
}

function extractImageFromContent(html: string): string | null {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

function cleanExcerpt(html: string, maxLen = 300): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, maxLen);
}

// ── RSS parser ────────────────────────────────────────────────────────────────

interface Article {
  title: string;
  content: string;
  excerpt: string;
  cover_image_url: string | null;
  category: string;
  source_url: string | null;
  published_at: string;
}

async function fetchRssFeed(url: string, category: string): Promise<Article[]> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'MyNigeriaNews/1.0 RSS Reader' },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const xml = await response.text();

    // Split on <item> tags
    const itemBlocks = xml.split(/<item[\s>]/i).slice(1);

    return itemBlocks.map((block): Article => {
      // Close the block at </item>
      const item = block.split(/<\/item>/i)[0];

      const title = extractFirst(item, 'title');

      // Full article content — prefer content:encoded, fallback description
      const fullContent = extractFirst(item, 'content:encoded') || extractFirst(item, 'description');

      // Clean excerpt
      const excerpt = cleanExcerpt(fullContent, 300);

      // Cover image: try multiple sources
      const cover_image_url =
        extractAttr(item, 'media:content', 'url') ||
        extractAttr(item, 'media:thumbnail', 'url') ||
        extractAttr(item, 'enclosure', 'url') ||
        extractImageFromContent(fullContent) ||
        null;

      // Link
      const source_url = extractFirst(item, 'link') || null;

      // Published date
      const pubDateStr = extractFirst(item, 'pubDate') || extractFirst(item, 'dc:date');
      let published_at: string;
      try {
        published_at = pubDateStr ? new Date(pubDateStr).toISOString() : new Date().toISOString();
      } catch {
        published_at = new Date().toISOString();
      }

      return {
        title: title || 'Untitled',
        content: fullContent,
        excerpt,
        cover_image_url,
        category,
        source_url,
        published_at,
      };
    }).filter(a => a.title && a.title !== 'Untitled');

  } catch (err) {
    console.error(`Error fetching RSS from ${url}:`, err);
    return [];
  }
}

// ── Feeds list ────────────────────────────────────────────────────────────────

const FEEDS = [
  { url: 'https://punchng.com/feed/',                          category: 'National'  },
  { url: 'https://www.vanguardngr.com/feed/',                  category: 'Politics'  },
  { url: 'https://guardian.ng/feed/',                          category: 'Business'  },
  { url: 'https://www.premiumtimesng.com/feed',                category: 'National'  },
  { url: 'https://businessday.ng/feed/',                       category: 'Economy'   },
  { url: 'https://dailytrust.com/feed/',                       category: 'National'  },
  { url: 'http://rss.cnn.com/rss/edition_africa.rss',          category: 'World'     },
  { url: 'https://techcabal.com/feed/',                        category: 'Tech'      },
];

// ── Handler ───────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Delete auto-fetched articles older than 3 days to keep database footprint small
    // Manually created articles do not have a source_url, so they are perfectly safe.
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const { error: deleteError } = await supabase
      .from('articles')
      .delete()
      .not('source_url', 'is', null)
      .lt('created_at', threeDaysAgo);

    if (deleteError) {
      console.error('Error pruning old articles:', deleteError);
    } else {
      console.log('Successfully pruned old automatically-fetched articles.');
    }

    let allArticles: Article[] = [];

    for (const feed of FEEDS) {
      const articles = await fetchRssFeed(feed.url, feed.category);
      allArticles.push(...articles.slice(0, 10)); // max 10 per feed
    }

    // Deduplicate by title before upserting
    const seen = new Set<string>();
    const unique = allArticles.filter(a => {
      const key = a.title.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (unique.length === 0) {
      return new Response(
        JSON.stringify({ success: true, count: 0, message: 'No articles fetched' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { error, count } = await supabase
      .from('articles')
      .upsert(unique, {
        onConflict: 'title',
        ignoreDuplicates: true,
        count: 'estimated',
      });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, fetched: unique.length, inserted: count }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );

  } catch (err: any) {
    console.error('fetch-news error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});

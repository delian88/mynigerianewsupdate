import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY!;

const anon = createClient(supabaseUrl, anonKey);

console.log('Testing anon key SELECT access to articles...');
const { data: selectData, error: selectError } = await anon
  .from('articles')
  .select('id, title')
  .limit(1);
console.log('SELECT articles error:', selectError);

console.log('Testing anon key INSERT access to articles...');
const { data: insertData, error: insertError } = await anon
  .from('articles')
  .insert([{ title: 'Test Anon Article ' + Math.random(), content: 'Content', category: 'National' }])
  .select();
console.log('INSERT articles error:', insertError);

console.log('Testing anon key INSERT access to site_settings...');
const { data: settingsData, error: settingsError } = await anon
  .from('site_settings')
  .insert([{ about_us_text: 'Test settings from anon' }])
  .select();
console.log('INSERT site_settings error:', settingsError);

console.log('Testing anon key INSERT access to podcasts...');
const { data: podcastData, error: podcastError } = await anon
  .from('podcasts')
  .insert([{ title: 'Test podcast from anon', audio_url: 'http://example.com/audio.mp3' }])
  .select();
console.log('INSERT podcasts error:', podcastError);


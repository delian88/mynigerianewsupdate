import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

console.log('Testing Supabase Connection...');
console.log('URL:', supabaseUrl);
console.log('Anon Key length:', supabaseAnonKey.length);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  try {
    console.log('\n--- Querying marketplace_cars (exact catalog query) ---');
    const { data: cars, error: carsErr } = await supabase
      .from('marketplace_cars')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    console.log('Cars Error:', carsErr);
    console.log('Cars Data Count:', cars?.length);
    if (cars && cars.length > 0) {
      console.log('Sample Car Title:', cars[0].title);
    }

    console.log('\n--- Querying subscription_plans ---');
    const { data: plans, error: plansErr } = await supabase
      .from('subscription_plans')
      .select('*');
    console.log('Plans Error:', plansErr);
    console.log('Plans Data Count:', plans?.length);
    if (plans && plans.length > 0) {
      console.log('Sample Plan:', plans[0]);
      console.log('Type of price:', typeof plans[0].price);
    }

  } catch (err) {
    console.error('Caught unexpected error:', err);
  }
}

run();

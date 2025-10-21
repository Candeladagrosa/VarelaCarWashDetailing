import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zchjlocrpknyllzcmlep.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjaGpsb2NycGtueWxsemNtbGVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MTkwMTEsImV4cCI6MjA3NTE5NTAxMX0.x54P6oK_9LuG6Qmbh_Jn8UGtXPlT74piHkJPGzv2Wa0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
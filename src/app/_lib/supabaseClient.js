import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://afmapfamqdsqcmakxzam.supabase.co/";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbWFwZmFtcWRzcWNtYWt4emFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY0MTI2NTQsImV4cCI6MjA0MTk4ODY1NH0.nwYY8qSQvEFtNGJjCi7gU8QdlsUIkiI1AgpuvnDr6lo";
export const supabase = createClient(supabaseUrl, supabaseKey);

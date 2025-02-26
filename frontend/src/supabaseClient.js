import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://qxkstgchkmbyouzksoik.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4a3N0Z2Noa21ieW91emtzb2lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1ODUyODksImV4cCI6MjA1NjE2MTI4OX0.dLgy-izlE53twoPBtuwN5krK7mQB_EVpJS5TabTKUNU" 
);

export default supabase;

// Supabase project "Raasta" (Frankfurt). The anon key is safe to publish.
// Never put the Claude API key here: it lives only as a Supabase Edge Function secret.
window.RAASTA_CONFIG = {
  SUPABASE_URL: "https://uutsrmaomrfbnewgisqs.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1dHNybWFvbXJmYm5ld2dpc3FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2MjIwNzQsImV4cCI6MjEwOTE5ODA3NH0.f4mAMocP9nBMQ29nFSxDnmNH3Jpg6yh4iNUhSpddQME",
  CONTACT_EMAIL: "raheelgul063@gmail.com",   // shown on the privacy page, e.g. "hello@raasta.pk"
  IMPRESSUM_ADDRESS: ["Halbauer Weg 21", "12249 Berlin (Lankwitz)", "Germany"],  // e.g. ["Musterstrasse 1", "10115 Berlin", "Germany"]; required for a complete Impressum
  GOOGLE_LOGIN: false  // set to true after Google is switched on in Supabase (README, Google login)
};
// To preview without Supabase (Demo mode), set both values above to "".

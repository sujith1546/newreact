async function run() {
  const r = await fetch('https://pkdxooxhluzhkaarlguj.supabase.co/rest/v1/pg_policies?tablename=eq.site_settings', {
    headers: {
      apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrZHhvb3hobHV6aGthYXJsZ3VqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDY5OTI4NiwiZXhwIjoyMTAwMjc1Mjg2fQ.CUlSJdqmIcmi9FKUhDf6RpM5IlanYu5EOh1O-TftIWo',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrZHhvb3hobHV6aGthYXJsZ3VqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDY5OTI4NiwiZXhwIjoyMTAwMjc1Mjg2fQ.CUlSJdqmIcmi9FKUhDf6RpM5IlanYu5EOh1O-TftIWo'
    }
  });
  console.log(await r.json());
}
run();

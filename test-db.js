const fetch = require('node-fetch');
async function run() {
  const r = await fetch('https://pkdxooxhluzhkaarlguj.supabase.co/rest/v1/site_settings?select=*', {
    headers: {
      apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrZHhvb3hobHV6aGthYXJsZ3VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2OTkyODYsImV4cCI6MjEwMDI3NTI4Nn0.ulcJbL2CCGrQmHh6drzF0M0a3sOHpE02__xVsqgKXf4',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrZHhvb3hobHV6aGthYXJsZ3VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2OTkyODYsImV4cCI6MjEwMDI3NTI4Nn0.ulcJbL2CCGrQmHh6drzF0M0a3sOHpE02__xVsqgKXf4'
    }
  });
  console.log(await r.json());
}
run();

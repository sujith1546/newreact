const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://pkdxooxhluzhkaarlguj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrZHhvb3hobHV6aGthYXJsZ3VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2OTkyODYsImV4cCI6MjEwMDI3NTI4Nn0.ulcJbL2CCGrQmHh6drzF0M0a3sOHpE02__xVsqgKXf4');

console.log('Connecting to Realtime...');
const channel = supabase.channel('test-channel')
  .on(
    'postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'site_settings' },
    (payload) => {
      console.log('RECEIVED REALTIME PAYLOAD:', payload);
    }
  )
  .subscribe((status) => {
    console.log('Subscription status:', status);
    
    if (status === 'SUBSCRIBED') {
       // Trigger an update after 2 seconds to test it
       setTimeout(async () => {
         console.log('Triggering update via Service Role...');
         const adminClient = createClient('https://pkdxooxhluzhkaarlguj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrZHhvb3hobHV6aGthYXJsZ3VqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDY5OTI4NiwiZXhwIjoyMTAwMjc1Mjg2fQ.CUlSJdqmIcmi9FKUhDf6RpM5IlanYu5EOh1O-TftIWo');
         await adminClient.from('site_settings').update({ maintenance_message: 'testing realtime ' + Date.now() }).eq('id', 1);
         console.log('Update sent. Waiting for event...');
       }, 2000);
    }
  });

setTimeout(() => {
  console.log('Done testing.');
  process.exit(0);
}, 10000);

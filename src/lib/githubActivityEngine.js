export async function fetchGithubActivity(username) {
  const days = 364;
  const activityData = new Array(days).fill(0);
  
  try {
    const res = await fetch(`https://api.github.com/users/${username}/events/public?per_page=100`);
    if (res.ok) {
      const events = await res.json();
      const today = new Date();
      today.setHours(0,0,0,0);
      
      events.forEach(event => {
        if (event.type === 'PushEvent') {
          const eventDate = new Date(event.created_at);
          eventDate.setHours(0,0,0,0);
          const diffTime = Math.abs(today - eventDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays < days) {
            const commitCount = event.payload.commits ? event.payload.commits.length : 1;
            activityData[diffDays] += commitCount;
          }
        }
      });
    }
  } catch (e) {
    console.warn("Could not fetch real GitHub events.", e);
  }

  return activityData.reverse();
}

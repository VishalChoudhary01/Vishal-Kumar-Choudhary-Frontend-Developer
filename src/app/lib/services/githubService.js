let cachedRepoCount = null;
let cacheTimestamp = null;
const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours

export async function getCachedRepoCount(username = 'VishalChoudhary01') {
  // Return cached data if still valid
  if (cachedRepoCount && cacheTimestamp && 
      Date.now() - cacheTimestamp < CACHE_DURATION) {
    return cachedRepoCount;
  }

  try {
    const response = await fetch(`https://api.github.com/users/${username}`);
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const userData = await response.json();
    const repoCount = userData.public_repos;

    // Cache the result
    cachedRepoCount = repoCount;
    cacheTimestamp = Date.now();

    return repoCount;
  } catch (error) {
    console.error('Failed to fetch GitHub repo count:', error);
    // Return cached data even if expired as fallback
    return cachedRepoCount;
  }
}
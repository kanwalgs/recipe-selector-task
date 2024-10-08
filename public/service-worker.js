const CACHE_NAME = 'recipes-cache';
const API_URL_PREFIX = 'https://dummyjson.com/recipes';
const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 1 day cache expiration

// Install event: Open the cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(() => {
      console.log('Cache opened');
    })
  );
});

// Message event: Handle requests from the app
self.addEventListener('message', async (event) => {
  const { type, recipeId } = event.data;

  try {
    if (type === 'FETCH_RECIPES_LIST') {
      const cachedList = await getCachedResponse(`${API_URL_PREFIX}?select=name`);
      if (cachedList) {
        event.source.postMessage({ type: 'RECIPES_LIST', data: cachedList });
      } else {
        fetchWithCache(`${API_URL_PREFIX}?select=name`, event, 'RECIPES_LIST');
      }
    }

    if (type === 'FETCH_RECIPE_DETAILS' && recipeId) {
      const cachedRecipe = await getCachedResponse(`${API_URL_PREFIX}/${recipeId}`);
      if (cachedRecipe) {
        event.source.postMessage({ type: 'RECIPE_DETAILS', data: cachedRecipe });
      } else {
        fetchWithCache(`${API_URL_PREFIX}/${recipeId}`, event, 'RECIPE_DETAILS');
      }
    }
  } catch (error) {
    event.source.postMessage({ error: 'Error fetching data from network or cache.' });
  }
});

/* 
* Makes the API call
* Stores response in cache
* Calls function to clean up cache
*/
async function fetchWithCache(url, event, type) {
  try {
    const response = await fetch(url, {
      headers: {
        'Cache-Control': 'max-age=3600, stale-while-revalidate=86400', // Cache for 1 hour, revalidate in background for 1 day
      },
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const data = await response.json();
    event.source.postMessage({ type, data });

    const cache = await caches.open(CACHE_NAME);
    cache.put(url, new Response(JSON.stringify(data)));

    // Clean up old cache entries
    cleanUpCache(cache);

  } catch (error) {
    console.error('Fetch error:', error);
    event.source.postMessage({ error: 'Failed to fetch data.' });
  }
}

/*
* Returns cache response if url matches
* Checks if the cache entry is expired, returns null if expired or no match
*/
async function getCachedResponse(url) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(url);

  if (cachedResponse) {
    const dateHeader = cachedResponse.headers.get('Date');
    if (dateHeader && new Date(dateHeader).getTime() + CACHE_EXPIRATION_MS < Date.now()) {
      console.log(`Cache expired for ${url}`);
      await cache.delete(url);
      return null;
    }

    return cachedResponse.json();
  }

  return null;
}

/* 
* Cleans up stale cache entries based on expiration
*/
async function cleanUpCache(cache) {
  const keys = await cache.keys();
  keys.forEach(async (request) => {
    const cachedResponse = await cache.match(request);
    const dateHeader = cachedResponse?.headers.get('Date');

    if (dateHeader && new Date(dateHeader).getTime() + CACHE_EXPIRATION_MS < Date.now()) {
      await cache.delete(request);
      console.log(`Deleted stale cache: ${request.url}`);
    }
  });
}

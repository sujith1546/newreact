import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * useRealtimeData
 * 
 * A custom hook to fetch initial data and subscribe to real-time changes.
 * 
 * @param {string} table - The Supabase table name.
 * @param {object} options - Options object.
 * @param {string} [options.select='*'] - Columns to select.
 * @param {boolean} [options.single=false] - Whether to expect a single object instead of an array.
 * @param {string} [options.orderColumn] - Column to order by.
 * @param {boolean} [options.ascending=true] - Sort direction.
 * @param {object} [options.filter] - Simple equality filter e.g., { column: 'id', value: 1 }
 * @returns {object} { data, setData, loading, error }
 */
export const globalDataCache = {};
export const fetchPromises = {};

// Intelligent Automated Image Preloader
function preloadImagesFromData(data) {
  if (!data) return;
  const extractUrls = (obj) => {
    if (typeof obj === 'string') {
      // Catch standard images and Supabase storage URLs
      if (
        obj.startsWith('http') && 
        (obj.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) || obj.includes('/storage/v1/object/public/'))
      ) {
        const img = new Image();
        img.src = obj;
      }
    } else if (Array.isArray(obj)) {
      obj.forEach(extractUrls);
    } else if (typeof obj === 'object' && obj !== null) {
      Object.values(obj).forEach(extractUrls);
    }
  };
  
  // Run on idle callback so we don't block the main thread
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => extractUrls(data));
  } else {
    setTimeout(() => extractUrls(data), 200);
  }
}

export async function prefetchTable(table, options = {}) {
  const {
    select = '*',
    single = false,
    orderColumn = 'id',
    ascending = true,
    filter = null,
  } = options;

  const cacheKey = `${table}_${JSON.stringify({ select, single, orderColumn, ascending, filter })}`;

  if (globalDataCache[cacheKey] !== undefined) return globalDataCache[cacheKey];
  
  if (fetchPromises[cacheKey]) return fetchPromises[cacheKey];

  let query = supabase.from(table).select(select);
  if (filter) query = query.eq(filter.column, filter.value);
  if (!single && orderColumn) query = query.order(orderColumn, { ascending });
  if (single) query = query.single();

  fetchPromises[cacheKey] = query.then(({ data, error }) => {
    if (!error) {
      globalDataCache[cacheKey] = data;
      preloadImagesFromData(data); // Automatically cache images inside the fetched data
    }
    delete fetchPromises[cacheKey];
    return { data, error };
  });

  return fetchPromises[cacheKey];
}

export default function useRealtimeData(table, options = {}) {
  const {
    select = '*',
    single = false,
    orderColumn = 'id',
    ascending = true,
    filter = null,
    disableRealtime = false
  } = options;

  const cacheKey = `${table}_${JSON.stringify({ select, single, orderColumn, ascending, filter })}`;

  const [data, setData] = useState(() => 
    globalDataCache[cacheKey] !== undefined ? globalDataCache[cacheKey] : (single ? null : [])
  );
  // Only show loading if cache is empty
  const [loading, setLoading] = useState(globalDataCache[cacheKey] === undefined);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      // Don't trigger loading state if we already have cached data (Stale-While-Revalidate)
      if (globalDataCache[cacheKey] === undefined) {
        setLoading(true);
      }
      
      let query = supabase.from(table).select(select);

      if (filter) {
        query = query.eq(filter.column, filter.value);
      }

      if (!single && orderColumn) {
        query = query.order(orderColumn, { ascending });
      }

      if (single) {
        query = query.single();
      }

      // Deduplicate simultaneous fetches
      if (!fetchPromises[cacheKey]) {
        fetchPromises[cacheKey] = query.then(({ data, error }) => {
          if (!error) {
            globalDataCache[cacheKey] = data;
            preloadImagesFromData(data); // Automatically cache images
          }
          delete fetchPromises[cacheKey];
          return { data, error };
        });
      }

      const { data: result, error: fetchError } = await fetchPromises[cacheKey];
      
      if (isMounted) {
        if (fetchError) {
          setError(fetchError);
          // BUG FIX: Do NOT wipe existing cache if offline revalidation fails
          if (globalDataCache[cacheKey] === undefined) {
            setData(single ? null : []);
          }
        } else {
          setData(result);
        }
        setLoading(false);
      }
    }

    fetchData();

    if (disableRealtime) return;

    let channel = null;

    // Debounce the Realtime channel setup to avoid React StrictMode rapid mount/unmount WSS abortion
    const subTimeout = setTimeout(() => {
      if (!isMounted) return;

      const channelName = `public:${table}-${Math.random().toString(36).substring(7)}`;
      channel = supabase
        .channel(channelName)
        .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
          if (!isMounted) return;
          
          const { eventType, new: newRow, old: oldRow } = payload;
          
          setData((currentData) => {
            if (single) {
              if (filter && newRow && newRow[filter.column] !== filter.value) {
                return currentData;
              }
              if (eventType === 'DELETE') return null;
              return { ...currentData, ...newRow };
            }

            if (eventType === 'INSERT') {
              if (currentData.some(item => item.id === newRow.id)) {
                return currentData.map(item => item.id === newRow.id ? { ...item, ...newRow } : item);
              }
              return [newRow, ...currentData];
            }

            if (eventType === 'UPDATE') {
              return currentData.map((item) => (item.id === newRow.id ? { ...item, ...newRow } : item));
            }

            if (eventType === 'DELETE') {
              return currentData.filter((item) => item.id !== oldRow.id);
            }

            return currentData;
          });
        })
        .subscribe();
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(subTimeout);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [table, select, single, orderColumn, ascending, filter?.column, filter?.value]);

  return { data, setData, loading, error };
}

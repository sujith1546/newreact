import { useState, useEffect } from 'react';
import { supabase, safeRemoveChannel } from '../lib/supabaseClient';

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

function getStorageCache(cacheKey) {
  try {
    const raw = localStorage.getItem('swr_cache_' + cacheKey);
    return raw ? JSON.parse(raw) : undefined;
  } catch (e) {
    return undefined;
  }
}

function setStorageCache(cacheKey, data) {
  try {
    localStorage.setItem('swr_cache_' + cacheKey, JSON.stringify(data));
  } catch (e) {}
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

  if (globalDataCache[cacheKey] === undefined) {
    const stored = getStorageCache(cacheKey);
    if (stored !== undefined) {
      globalDataCache[cacheKey] = stored;
    }
  }

  if (globalDataCache[cacheKey] !== undefined) {
    // Silent background revalidation
    if (!fetchPromises[cacheKey]) {
      const t0 = performance.now();
      let query = supabase.from(table).select(select);
      if (filter) query = query.eq(filter.column, filter.value);
      if (!single && orderColumn) query = query.order(orderColumn, { ascending });
      if (single) query = query.single();

      fetchPromises[cacheKey] = query.then(({ data, error }) => {
        const pingMs = Math.round(performance.now() - t0);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('db-telemetry', { detail: { pingMs, table } }));
        }
        if (!error && data) {
          globalDataCache[cacheKey] = data;
          setStorageCache(cacheKey, data);
          preloadImagesFromData(data);
        }
        delete fetchPromises[cacheKey];
        return { data, error };
      }).catch(err => {
        delete fetchPromises[cacheKey];
        return { data: globalDataCache[cacheKey] || (single ? null : []), error: null };
      });
    }
    return globalDataCache[cacheKey];
  }
  
  if (fetchPromises[cacheKey]) return fetchPromises[cacheKey];

  const t0 = performance.now();
  let query = supabase.from(table).select(select);
  if (filter) query = query.eq(filter.column, filter.value);
  if (!single && orderColumn) query = query.order(orderColumn, { ascending });
  if (single) query = query.single();

  fetchPromises[cacheKey] = query.then(({ data, error }) => {
    const pingMs = Math.round(performance.now() - t0);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('db-telemetry', { detail: { pingMs, table } }));
    }
    if (!error && data) {
      globalDataCache[cacheKey] = data;
      setStorageCache(cacheKey, data);
      preloadImagesFromData(data);
    }
    delete fetchPromises[cacheKey];
    return { data, error };
  }).catch(err => {
    delete fetchPromises[cacheKey];
    return { data: globalDataCache[cacheKey] || (single ? null : []), error: null };
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

  const [data, setData] = useState(() => {
    if (globalDataCache[cacheKey] !== undefined) return globalDataCache[cacheKey];
    const stored = getStorageCache(cacheKey);
    if (stored !== undefined) {
      globalDataCache[cacheKey] = stored;
      return stored;
    }
    return single ? null : [];
  });
  // Only show loading if cache is empty
  const [loading, setLoading] = useState(data === null || (Array.isArray(data) && data.length === 0 && globalDataCache[cacheKey] === undefined));
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
          } else if (error.code === '42501' || error.status === 403 || error.message?.includes('permission denied')) {
            // Silently suppress RLS permission denied errors
            delete fetchPromises[cacheKey];
            return { data: globalDataCache[cacheKey] || (single ? null : []), error: null };
          }
          delete fetchPromises[cacheKey];
          return { data, error };
        }).catch(err => {
          delete fetchPromises[cacheKey];
          return { data: globalDataCache[cacheKey] || (single ? null : []), error: null };
        });
      }

      let { data: result, error: fetchError } = await fetchPromises[cacheKey];

      // Automatic fallback for missing order column
      if (fetchError && orderColumn && orderColumn !== 'created_at' && orderColumn !== 'id' && fetchError.status !== 403) {
        try {
          let fallbackQuery = supabase.from(table).select(select);
          if (filter) fallbackQuery = fallbackQuery.eq(filter.column, filter.value);
          fallbackQuery = fallbackQuery.order('created_at', { ascending });
          if (single) fallbackQuery = fallbackQuery.single();
          const { data: fbData, error: fbError } = await fallbackQuery;
          if (!fbError) {
            result = fbData;
            fetchError = null;
            globalDataCache[cacheKey] = fbData;
          }
        } catch (e) {}
      }

      if (isMounted) {
        if (fetchError) {
          setError(fetchError);
          // Fallback to cached data or local storage if 403 / RLS error occurs
          if (globalDataCache[cacheKey] !== undefined) {
            setData(globalDataCache[cacheKey]);
          } else {
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

    // Small delay to avoid React StrictMode rapid mount/unmount WebSocket abort
    const subTimeout = setTimeout(() => {
      if (!isMounted) return;

      const channelName = `public:${table}-${Math.random().toString(36).substring(7)}`;
      channel = supabase
        .channel(channelName)
        .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
          if (!isMounted) return;

          const { eventType, new: newRow, old: oldRow } = payload;

          setData((currentData) => {
            let nextData = currentData;

            if (single) {
              if (filter && newRow && newRow[filter.column] !== filter.value) {
                nextData = currentData;
              } else if (eventType === 'DELETE') {
                nextData = null;
              } else {
                nextData = { ...currentData, ...newRow };
              }
            } else {
              if (eventType === 'INSERT') {
                if (currentData.some(item => item.id === newRow.id)) {
                  nextData = currentData.map(item => item.id === newRow.id ? { ...item, ...newRow } : item);
                } else {
                  nextData = [newRow, ...currentData];
                }
              } else if (eventType === 'UPDATE') {
                nextData = currentData.map((item) => (item.id === newRow.id ? { ...item, ...newRow } : item));
              } else if (eventType === 'DELETE') {
                nextData = currentData.filter((item) => item.id !== oldRow.id);
              }
            }

            // Keep globalDataCache in sync so newly-mounted components read fresh data.
            globalDataCache[cacheKey] = nextData;
            // Also update the localStorage SWR cache so page refreshes are fast.
            setStorageCache(cacheKey, nextData);
            // Broadcast a custom event so any other listeners can react immediately.
            try {
              window.dispatchEvent(new CustomEvent('pcms_data_updated', { detail: { table, eventType } }));
            } catch (_) {}

            return nextData;
          });
        })
        .subscribe();
    }, 50);

    return () => {
      isMounted = false;
      clearTimeout(subTimeout);
      safeRemoveChannel(channel);
    };
  }, [table, select, single, orderColumn, ascending, filter?.column, filter?.value]);

  return { data, setData, loading, error };
}

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
export default function useRealtimeData(table, options = {}) {
  const {
    select = '*',
    single = false,
    orderColumn = 'id',
    ascending = true,
    filter = null
  } = options;

  const [data, setData] = useState(single ? null : []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      setLoading(true);
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

      const { data: result, error: fetchError } = await query;
      
      if (isMounted) {
        if (fetchError) {
          setError(fetchError);
          setData(single ? null : []);
        } else {
          setData(result);
        }
        setLoading(false);
      }
    }

    fetchData();

    // Set up Realtime Subscription
    const channel = supabase
      .channel(`public:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
        if (!isMounted) return;
        
        const { eventType, new: newRow, old: oldRow } = payload;
        
        setData((currentData) => {
          if (single) {
            // For single object (like site_settings), just replace if it matches the filter
            if (filter && newRow && newRow[filter.column] !== filter.value) {
              return currentData;
            }
            if (eventType === 'DELETE') return null;
            return { ...currentData, ...newRow };
          }

          // For arrays
          if (eventType === 'INSERT') {
            // Check if it already exists (optimistic update might have added it)
            if (currentData.some(item => item.id === newRow.id)) {
              return currentData.map(item => item.id === newRow.id ? { ...item, ...newRow } : item);
            }
            // Append or prepend? Let's just prepend. We could sort it properly but this works for most cases
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

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [table, select, single, orderColumn, ascending, filter?.column, filter?.value]);

  return { data, setData, loading, error };
}

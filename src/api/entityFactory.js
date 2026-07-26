import { supabase } from '@/lib/supabaseClient';

/**
 * Parses a sort string like "-created_date" or "order" into
 * { column, ascending }.
 */
function parseSort(sort) {
  if (!sort) return null;
  const descending = sort.startsWith('-');
  const column = descending ? sort.slice(1) : sort;
  return { column, ascending: !descending };
}

function throwIfError(error) {
  if (error) {
    const err = new Error(error.message);
    err.status = error.code;
    err.details = error.details;
    throw err;
  }
}

/**
 * Creates an entity client with the same shape the app already calls:
 *   entity.list(sort, limit)
 *   entity.filter(queryObj, sort, limit)
 *   entity.get(id)
 *   entity.create(data)
 *   entity.update(id, data)
 *   entity.delete(id)
 */
export function createEntity(tableName) {
  return {
    async list(sort, limit) {
      let query = supabase.from(tableName).select('*');
      const parsedSort = parseSort(sort);
      if (parsedSort) query = query.order(parsedSort.column, { ascending: parsedSort.ascending });
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      throwIfError(error);
      return data ?? [];
    },

    async filter(queryObj = {}, sort, limit) {
      let query = supabase.from(tableName).select('*');
      Object.entries(queryObj).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      const parsedSort = parseSort(sort);
      if (parsedSort) query = query.order(parsedSort.column, { ascending: parsedSort.ascending });
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      throwIfError(error);
      return data ?? [];
    },

    async get(id) {
      const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single();
      throwIfError(error);
      return data;
    },

    async create(payload) {
      const { data, error } = await supabase.from(tableName).insert(payload).select().single();
      throwIfError(error);
      return data;
    },

    async update(id, payload) {
      const { data, error } = await supabase.from(tableName).update(payload).eq('id', id).select().single();
      throwIfError(error);
      return data;
    },

    async delete(id) {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      throwIfError(error);
      return { id };
    },
  };
}

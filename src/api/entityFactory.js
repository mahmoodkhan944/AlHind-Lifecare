import { supabase } from '@/lib/supabaseClient';
import { HIDDEN_COUNTRIES, hideCountriesNow, isHiddenCountry } from '@/lib/siteConfig';

// Hospital ids in hidden countries (e.g. Turkey) — cached for the page visit.
let hiddenHospitalIds = null;
async function getHiddenHospitalIds() {
  if (!hiddenHospitalIds) {
    hiddenHospitalIds = supabase
      .from('hospitals')
      .select('id, country')
      .then(({ data }) => new Set((data || []).filter((h) => isHiddenCountry(h.country)).map((h) => String(h.id))))
      .catch(() => new Set());
  }
  return hiddenHospitalIds;
}

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
export function createEntity(tableName, options = {}) {
  const { publicInsert = false, ignoreDuplicates = false, countryColumn = null, hospitalColumn = null } = options;

  // On the public site, leave out rows from hidden countries (see
  // src/lib/siteConfig.js). Done in the query itself so "show 4" still
  // returns 4 rows. Rows with no country are kept.
  const hideByCountry = (query) => {
    if (!countryColumn || !hideCountriesNow()) return query;
    const list = HIDDEN_COUNTRIES.map((c) => `"${c}"`).join(',');
    return query.or(`${countryColumn}.is.null,${countryColumn}.not.in.(${list})`);
  };

  // Also drop rows linked to a hospital in a hidden country.
  const dropHiddenHospitals = async (rows) => {
    if (!hospitalColumn || !hideCountriesNow() || rows.length === 0) return rows;
    const hidden = await getHiddenHospitalIds();
    return hidden.size ? rows.filter((r) => !hidden.has(String(r[hospitalColumn]))) : rows;
  };

  return {
    async list(sort, limit) {
      let query = hideByCountry(supabase.from(tableName).select('*'));
      const parsedSort = parseSort(sort);
      if (parsedSort) query = query.order(parsedSort.column, { ascending: parsedSort.ascending });
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      throwIfError(error);
      return dropHiddenHospitals(data ?? []);
    },

    async filter(queryObj = {}, sort, limit) {
      let query = hideByCountry(supabase.from(tableName).select('*'));
      Object.entries(queryObj).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      const parsedSort = parseSort(sort);
      if (parsedSort) query = query.order(parsedSort.column, { ascending: parsedSort.ascending });
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      throwIfError(error);
      return dropHiddenHospitals(data ?? []);
    },

    async get(id) {
      const { data, error } = await hideByCountry(supabase.from(tableName).select('*').eq('id', id)).single();
      throwIfError(error);
      const [row] = await dropHiddenHospitals([data]);
      if (!row) throwIfError({ message: 'Not found', code: 'PGRST116' });
      return row;
    },

    async create(payload) {
      // Public form tables (leads, newsletter, appointments): visitors may
      // INSERT but not SELECT (RLS), so `.select()` after insert would fail
      // with "new row violates row-level security policy". Insert without
      // reading the row back.
      if (publicInsert) {
        const { error } = await supabase.from(tableName).insert(payload);
        // 23505 = unique violation (e.g. already-subscribed email) — treat as success
        if (error && !(ignoreDuplicates && error.code === '23505')) throwIfError(error);
        return { ...payload };
      }

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
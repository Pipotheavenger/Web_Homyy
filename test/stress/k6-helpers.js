/**
 * k6 HTTP helpers for Supabase REST API
 *
 * These wrap k6/http calls to simplify Supabase interactions.
 * k6 uses its own JavaScript runtime (not Node.js), so no npm imports.
 */

import http from 'k6/http';

/**
 * Sign in via Supabase Auth (GoTrue)
 * POST /auth/v1/token?grant_type=password
 * @returns {{ access_token: string, user: { id: string } }}
 */
export function supabaseSignIn(baseUrl, anonKey, email, password) {
  const url = `${baseUrl}/auth/v1/token?grant_type=password`;
  const payload = JSON.stringify({ email, password });

  const res = http.post(url, payload, {
    headers: {
      'Content-Type': 'application/json',
      apikey: anonKey,
    },
  });

  if (res.status !== 200) {
    console.error(`Auth failed for ${email}: ${res.status} ${res.body}`);
    return null;
  }

  return JSON.parse(res.body);
}

/**
 * SELECT from a table via PostgREST (with user JWT)
 * GET /rest/v1/{table}?{queryParams}
 */
export function supabaseSelect(baseUrl, anonKey, jwt, table, queryParams) {
  const url = `${baseUrl}/rest/v1/${table}?${queryParams}`;

  const res = http.get(url, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${jwt}`,
      'Content-Type': 'application/json',
    },
  });

  if (res.status !== 200) {
    console.error(`SELECT ${table} failed: ${res.status} ${res.body}`);
    return null;
  }

  return JSON.parse(res.body);
}

/**
 * SELECT from a table via PostgREST (with service-role key, no RLS)
 */
export function supabaseSelectAdmin(baseUrl, serviceRoleKey, table, queryParams) {
  const url = `${baseUrl}/rest/v1/${table}?${queryParams}`;

  const res = http.get(url, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (res.status !== 200) {
    console.error(`SELECT(admin) ${table} failed: ${res.status} ${res.body}`);
    return null;
  }

  return JSON.parse(res.body);
}

/**
 * INSERT into a table via PostgREST (with user JWT)
 * POST /rest/v1/{table}
 * Uses Prefer: return=representation to get the inserted row back
 */
export function supabaseInsert(baseUrl, anonKey, jwt, table, body) {
  const url = `${baseUrl}/rest/v1/${table}`;

  const res = http.post(url, JSON.stringify(body), {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${jwt}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
  });

  if (res.status !== 201) {
    console.error(`INSERT ${table} failed: ${res.status} ${res.body}`);
    return null;
  }

  const parsed = JSON.parse(res.body);
  return Array.isArray(parsed) ? parsed[0] : parsed;
}

/**
 * INSERT with service-role key (no RLS)
 */
export function supabaseInsertAdmin(baseUrl, serviceRoleKey, table, body) {
  const url = `${baseUrl}/rest/v1/${table}`;

  const res = http.post(url, JSON.stringify(body), {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
  });

  if (res.status !== 201) {
    console.error(`INSERT(admin) ${table} failed: ${res.status} ${res.body}`);
    return null;
  }

  const parsed = JSON.parse(res.body);
  return Array.isArray(parsed) ? parsed[0] : parsed;
}

/**
 * PATCH a table via PostgREST (with service-role key)
 * PATCH /rest/v1/{table}?{filters}
 */
export function supabasePatchAdmin(baseUrl, serviceRoleKey, table, filters, body) {
  const url = `${baseUrl}/rest/v1/${table}?${filters}`;

  const res = http.patch(url, JSON.stringify(body), {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
  });

  if (res.status !== 204 && res.status !== 200) {
    console.error(`PATCH ${table} failed: ${res.status} ${res.body}`);
    return false;
  }

  return true;
}

/**
 * Call an RPC function via PostgREST (with user JWT)
 * POST /rest/v1/rpc/{fnName}
 */
export function supabaseRpc(baseUrl, anonKey, jwt, fnName, params) {
  const url = `${baseUrl}/rest/v1/rpc/${fnName}`;

  const res = http.post(url, JSON.stringify(params || {}), {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${jwt}`,
      'Content-Type': 'application/json',
    },
  });

  if (res.status !== 200) {
    console.error(`RPC ${fnName} failed: ${res.status} ${res.body}`);
    return null;
  }

  try {
    return JSON.parse(res.body);
  } catch {
    return res.body;
  }
}

/**
 * Call an RPC function with service-role key (admin, no RLS)
 */
export function supabaseRpcAdmin(baseUrl, serviceRoleKey, fnName, params) {
  const url = `${baseUrl}/rest/v1/rpc/${fnName}`;

  const res = http.post(url, JSON.stringify(params || {}), {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (res.status !== 200) {
    console.error(`RPC(admin) ${fnName} failed: ${res.status} ${res.body}`);
    return null;
  }

  try {
    return JSON.parse(res.body);
  } catch {
    return res.body;
  }
}

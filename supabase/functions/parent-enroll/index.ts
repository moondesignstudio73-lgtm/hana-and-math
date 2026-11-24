const headers = {
  'Access-Control-Allow-Origin': 'https://moondesignstudio73-lgtm.github.io',
  'Access-Control-Allow-Headers': 'apikey, authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

function reply(status: number) {
  return new Response(JSON.stringify({ enrolled: status === 201 }), { status, headers });
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response(null, { headers });
  if (request.method !== 'POST') return reply(405);
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = body?.password;
  const code = body?.code;
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254 ||
      typeof password !== 'string' || password.length < 8 || password.length > 128 ||
      typeof code !== 'string' || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(code)) {
    return reply(400);
  }

  const base = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!base || !key) return reply(503);
  const internalHeaders = { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' };
  const query = new URLSearchParams({ select: 'email', code: 'eq.' + code, expires_at: 'gt.' + new Date().toISOString() });
  const lookup = await fetch(base + '/rest/v1/academy_invitations?' + query, { headers: internalHeaders });
  if (!lookup.ok) return reply(503);
  const [invitation] = await lookup.json();
  if (!invitation || invitation.email !== email) return reply(400);

  const created = await fetch(base + '/auth/v1/admin/users', {
    method: 'POST', headers: internalHeaders,
    body: JSON.stringify({ email, password, email_confirm: true, app_metadata: { academy_invite: code } }),
  });
  return reply(created.ok ? 201 : created.status >= 500 ? 503 : 400);
});

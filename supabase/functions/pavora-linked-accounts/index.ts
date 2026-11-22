import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';

const URL = Deno.env.get('SUPABASE_URL') || '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const ORIGIN = 'https://max791687.github.io';
const admin = createClient(URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const headers = {
  'Content-Type': 'application/json', 'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': ORIGIN,
  'Access-Control-Allow-Headers': 'authorization,apikey,content-type,x-client-info',
  'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Vary': 'Origin',
};
function reply(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), { status, headers });
}
function validPassword(password: unknown): password is string {
  return typeof password === 'string' && password.length >= 8 && password.length <= 128;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (req.method !== 'POST' || req.headers.get('origin') !== ORIGIN)
    return reply({ error: 'Request not allowed.' }, 403);
  if (Number(req.headers.get('content-length') || 0) > 4096)
    return reply({ error: 'Request is too large.' }, 400);
  try {
    const bearer = req.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!bearer) return reply({ error: 'Please log in first.' }, 401);
    const { data: identity, error: identityError } = await admin.auth.getUser(bearer);
    const root = identity?.user;
    if (identityError || !root) return reply({ error: 'Please log in again.' }, 401);
    // Child accounts cannot become roots of another three-account group.
    const { data: isChild, error: childError } = await admin.from('pv_linked_accounts')
      .select('child_id').eq('child_id', root.id).maybeSingle();
    if (childError) throw childError;
    if (isChild) return reply({ error: 'Manage IDs from the original email account.' }, 403);
    if (!root.email || !root.email_confirmed_at || root.email.endsWith('.invalid'))
      return reply({ error: 'Verify your original email before managing extra IDs.' }, 403);

    const input = await req.json();
    const action = String(input?.action || '');
    const { data: children, error: listError } = await admin.from('pv_linked_accounts')
      .select('child_id,slot').eq('root_id', root.id).order('slot');
    if (listError) throw listError;

    if (action === 'list') {
      const accounts = [];
      for (const child of children || []) {
        const { data: profile } = await admin.from('profiles')
          .select('username,display_name').eq('id', child.child_id).maybeSingle();
        if (profile) accounts.push({ slot: child.slot, username: profile.username, display_name: profile.display_name });
      }
      return reply({ accounts, total: accounts.length + 1, max: 3 });
    }
    if (action !== 'create' && action !== 'reset') return reply({ error: 'Unknown action.' }, 400);
    const masterPassword = String(input?.masterPassword || '');
    if (!masterPassword || masterPassword.length > 1024) return reply({ error: 'Original account password required.' }, 400);
    // Require the owner's password again for privileged actions, not just a cached browser session.
    const passwordClient = createClient(URL, ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error: passwordError } = await passwordClient.auth.signInWithPassword({ email: root.email, password: masterPassword });
    if (passwordError) return reply({ error: 'Original account password is incorrect.' }, 403);

    const password = input?.newPassword;
    if (!validPassword(password)) return reply({ error: 'New password must have 8–128 characters.' }, 400);
    if (action === 'reset') {
      const username = String(input?.username || '').trim();
      const { data: profile } = await admin.from('profiles').select('id,username').eq('username', username).maybeSingle();
      if (!profile || !(children || []).some((child) => child.child_id === profile.id))
        return reply({ error: 'This ID is not linked to your recovery email.' }, 404);
      const { error } = await admin.auth.admin.updateUserById(profile.id, { password });
      if (error) throw error;
      return reply({ message: 'Password updated. Log in with this username and the new password.' });
    }

    if ((children || []).length >= 2) return reply({ error: 'Maximum 3 IDs per email reached.' }, 409);
    const username = String(input?.username || '').trim();
    const displayName = String(input?.displayName || '').trim();
    if (!/^[a-zA-Z0-9_]{3,24}$/.test(username) || !displayName || displayName.length > 60)
      return reply({ error: 'Enter a valid username and name.' }, 400);
    const { data: taken, error: takenError } = await admin.from('profiles')
      .select('id').ilike('username', username).limit(1);
    if (takenError) throw takenError;
    if (taken?.length) return reply({ error: 'Username already taken.' }, 409);
    const slot = (children || []).some((child) => child.slot === 2) ? 3 : 2;
    // Internal credentials have their own Auth user ID; the only recovery email is the verified root.
    const internalEmail = `${crypto.randomUUID()}@ids.pavora.invalid`;
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: internalEmail, password, email_confirm: true,
      user_metadata: { username, display_name: displayName },
    });
    if (createError || !created.user) return reply({ error: 'Could not create ID. Try again.' }, 503);
    try {
      const { error: profileError } = await admin.from('profiles').insert({
        id: created.user.id, username, display_name: displayName,
      });
      if (profileError) throw profileError;
      const { error: linkError } = await admin.from('pv_linked_accounts').insert({
        root_id: root.id, child_id: created.user.id, slot,
      });
      if (linkError) throw linkError;
    } catch (_error) {
      // Includes the concurrent slot-claim race: never leave an unlinked login behind.
      await admin.auth.admin.deleteUser(created.user.id);
      return reply({ error: 'ID could not be created. Try a different username.' }, 409);
    }
    return reply({ message: 'New ID created. Sign in using its username and password.', username }, 201);
  } catch (error) {
    console.error('Linked accounts:', String((error as Error)?.message || error));
    return reply({ error: 'Service temporarily unavailable.' }, 503);
  }
});

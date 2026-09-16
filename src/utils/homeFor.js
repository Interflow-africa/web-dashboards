/* ─────────────────────────────────────────────────────────────────
   Where a signed-in user belongs.

   Staff accounts come back with a BLANK role, so any check that only
   tests for 'artist' routes them to the org dashboard — a shell they
   have no access to. They belong at the door screen.

   Lives in its own module so both App (PublicRoute) and LoginPage can
   import it without creating a cycle.
   ───────────────────────────────────────────────────────────────── */

export const homeFor = (user) => {
  const role = user?.role;
  if (!role) return '/check-in';
  if (role === 'artist') return user?.is_onboarded ? '/dashboard' : '/onboarding/artist';
  return user?.is_onboarded ? '/org/dashboard' : '/onboarding/organization';
};

export default homeFor;

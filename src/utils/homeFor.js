/* ─────────────────────────────────────────────────────────────────
   Where a signed-in user belongs.

   `is_staff` is the only signal that an account can reach /admin —
   admin accounts carry an ordinary role (often organization, sometimes
   blank), so role tells us nothing about access. It's checked first,
   and the console is the single staff home: the door scanner lives as
   an entry inside it rather than competing to be the landing page.

   Lives in its own module so App (PublicRoute), LoginPage and the
   login hook can all import it without creating a cycle.
   ───────────────────────────────────────────────────────────────── */

export const homeFor = (user) => {
  if (user?.is_staff) return '/admin';

  const role = user?.role;
  if (!role) return '/check-in';
  if (role === 'artist') return user?.is_onboarded ? '/dashboard' : '/onboarding/artist';
  return user?.is_onboarded ? '/org/dashboard' : '/onboarding/organization';
};

export default homeFor;

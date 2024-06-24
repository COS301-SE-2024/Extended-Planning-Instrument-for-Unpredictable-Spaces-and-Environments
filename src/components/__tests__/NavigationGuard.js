import { supabase } from '../../supabase';

export async function navigationGuard(to, from, next) {
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session;

  if (to.meta?.requiresAuth && !session) {
    next({ name: 'login' });
    return;
  }

  if (session) {
    const { data: roleData } = await supabase.functions.invoke();
    const userRole = roleData.data[0]?.Role;

    if (userRole === 'Unknown') {
      next({ name: 'home' });
      return;
    }

    if (to.meta?.requiredRole && to.meta.requiredRole !== userRole) {
      next({ name: userRole.toLowerCase() });
      return;
    }

    if (to.name === 'login' || to.name === 'signup') {
      next({ name: userRole.toLowerCase() });
      return;
    }
  }

  next();
}

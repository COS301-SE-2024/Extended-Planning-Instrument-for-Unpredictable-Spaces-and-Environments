import { describe, it, expect, beforeEach, vi } from 'vitest';
import { navigationGuard } from '../__tests__/NavigationGuard';
import { supabase } from '../../supabase';

// Mock the supabase methods
vi.mock('../../supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('Router Navigation Guards', () => {
  let next;

  beforeEach(() => {
    vi.clearAllMocks();
    next = vi.fn();
  });

  it('redirects to login if no session exists and route requires auth', async () => {
    supabase.auth.getSession.mockResolvedValueOnce({ data: { session: null } });
    const to = { meta: { requiresAuth: true }, name: 'dashboard' };
    const from = {};

    await navigationGuard(to, from, next);

    expect(next).toHaveBeenCalledWith({ name: 'login' });
  });

  it('proceeds to route if no session exists and route does not require auth', async () => {
    supabase.auth.getSession.mockResolvedValueOnce({ data: { session: null } });
    const to = { meta: { requiresAuth: false }, name: 'home' };
    const from = {};

    await navigationGuard(to, from, next);

    expect(next).toHaveBeenCalled();
  });

  it('redirects to role-based page if session exists but role does not match route requirement', async () => {
    supabase.auth.getSession.mockResolvedValueOnce({ data: { session: { user: { email: 'test@example.com' } } } });
    supabase.functions.invoke.mockResolvedValueOnce({ data: { data: [{ Role: 'Packer' }] } });
    const to = { meta: { requiresAuth: true, requiredRole: 'Manager' }, name: 'dashboard' };
    const from = {};

    await navigationGuard(to, from, next);

    expect(next).toHaveBeenCalledWith({ name: 'packer' });
  });

  it('proceeds to route if session exists and role matches route requirement', async () => {
    supabase.auth.getSession.mockResolvedValueOnce({ data: { session: { user: { email: 'test@example.com' } } } });
    supabase.functions.invoke.mockResolvedValueOnce({ data: { data: [{ Role: 'Manager' }] } });
    const to = { meta: { requiresAuth: true, requiredRole: 'Manager' }, name: 'dashboard' };
    const from = {};

    await navigationGuard(to, from, next);

    expect(next).toHaveBeenCalled();
  });

  it('redirects to home if session exists but role is unknown', async () => {
    supabase.auth.getSession.mockResolvedValueOnce({ data: { session: { user: { email: 'test@example.com' } } } });
    supabase.functions.invoke.mockResolvedValueOnce({ data: { data: [{ Role: 'Unknown' }] } });
    const to = { meta: { requiresAuth: true }, name: 'dashboard' };
    const from = {};

    await navigationGuard(to, from, next);

    expect(next).toHaveBeenCalledWith({ name: 'home' });
  });

  it('redirects to appropriate role-based page if navigating to login or signup with session', async () => {
    supabase.auth.getSession.mockResolvedValueOnce({ data: { session: { user: { email: 'test@example.com' } } } });
    supabase.functions.invoke.mockResolvedValueOnce({ data: { data: [{ Role: 'Driver' }] } });
    const to = { name: 'login', meta: {} }; // Ensure meta is defined
    const from = {};

    await navigationGuard(to, from, next);

    expect(next).toHaveBeenCalledWith({ name: 'driver' });
  });
});

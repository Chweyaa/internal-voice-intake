import { vi } from 'vitest';

export const mockSupabaseClient = {
  auth: {
    signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
    signUp: vi.fn().mockResolvedValue({ error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    getUser: vi.fn().mockResolvedValue({
      data: { user: { email: 'test@example.com' } },
    }),
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    }),
  }),
};

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: () => mockSupabaseClient,
  createServerClient: () => mockSupabaseClient,
}));

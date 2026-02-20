import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import './mocks/next-navigation';
import './mocks/vapi';
import { mockSupabaseClient } from './mocks/supabase';
import { mockRouter } from './mocks/next-navigation';
import DashboardPage from '@/app/page';
import type { IntakeEntry } from '@/types';

const mockEntries: IntakeEntry[] = [
  {
    id: '1',
    created_at: '2026-02-20T10:00:00Z',
    caller_name: 'John Doe',
    topic: 'IT Support',
    summary: 'Laptop not starting',
    action_items: 'Escalate to IT',
    raw_transcript: 'Agent: Hi. User: My laptop is broken.',
    status: 'new',
  },
  {
    id: '2',
    created_at: '2026-02-19T09:00:00Z',
    caller_name: null,
    topic: null,
    summary: null,
    action_items: null,
    raw_transcript: null,
    status: 'resolved',
  },
];

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockEntries, error: null }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });
  });

  it('renders header and user email', async () => {
    render(<DashboardPage />);
    expect(screen.getByText('Voice Intake Log')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  it('renders entries table with data', async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    expect(screen.getByText('IT Support')).toBeInTheDocument();
    expect(screen.getByText('Laptop not starting')).toBeInTheDocument();
  });

  it('renders null fields as dashes', async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(3);
    });
  });

  it('renders Start New Intake button', async () => {
    render(<DashboardPage />);
    expect(screen.getByText('Start New Intake')).toBeInTheDocument();
  });

  it('renders Refresh button', async () => {
    render(<DashboardPage />);
    expect(screen.getByText('Refresh')).toBeInTheDocument();
  });

  it('signs out and redirects to login', async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Sign out')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Sign out'));
    await waitFor(() => {
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
    });
    expect(mockRouter.push).toHaveBeenCalledWith('/login');
  });

  it('shows empty state when no entries', async () => {
    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });

    render(<DashboardPage />);
    await waitFor(() => {
      expect(
        screen.getByText('No entries yet. Start an intake above.')
      ).toBeInTheDocument();
    });
  });
});

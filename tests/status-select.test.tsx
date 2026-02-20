import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { mockSupabaseClient } from './mocks/supabase';
import StatusSelect from '@/components/StatusSelect';
import type { IntakeEntry } from '@/types';

const mockEntry: IntakeEntry = {
  id: '1',
  created_at: '2026-02-20T10:00:00Z',
  caller_name: 'John Doe',
  topic: 'IT Support',
  summary: 'Laptop issue',
  action_items: null,
  raw_transcript: null,
  status: 'new',
};

describe('StatusSelect', () => {
  const onUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });
  });

  it('renders with current status selected', () => {
    render(<StatusSelect entry={mockEntry} onUpdate={onUpdate} />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('new');
  });

  it('renders all three status options', () => {
    render(<StatusSelect entry={mockEntry} onUpdate={onUpdate} />);
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Resolved')).toBeInTheDocument();
  });

  it('calls updateStatus and onUpdate when changed', async () => {
    render(<StatusSelect entry={mockEntry} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'in_progress' },
    });

    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('intake_entries');
    });
    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalled();
    });
  });
});

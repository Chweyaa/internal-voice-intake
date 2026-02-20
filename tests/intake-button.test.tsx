import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import './mocks/supabase';
import './mocks/vapi';
import IntakeButton from '@/components/IntakeButton';

describe('IntakeButton', () => {
  const onSessionEnd = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Start New Intake button initially', () => {
    render(<IntakeButton onSessionEnd={onSessionEnd} />);
    expect(screen.getByText('Start New Intake')).toBeInTheDocument();
  });

  it('does not show any status indicators initially', () => {
    render(<IntakeButton onSessionEnd={onSessionEnd} />);
    expect(screen.queryByText('Connecting...')).not.toBeInTheDocument();
    expect(screen.queryByText('Session active...')).not.toBeInTheDocument();
    expect(screen.queryByText('Submitting...')).not.toBeInTheDocument();
  });

  it('button is not disabled initially', () => {
    render(<IntakeButton onSessionEnd={onSessionEnd} />);
    expect(screen.getByText('Start New Intake')).not.toBeDisabled();
  });
});

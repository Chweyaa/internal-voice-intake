import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import './mocks/next-navigation';
import { mockSupabaseClient } from './mocks/supabase';
import { mockRouter } from './mocks/next-navigation';
import RegisterPage from '@/app/register/page';

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email and password inputs', () => {
    render(<RegisterPage />);
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('renders create account button', () => {
    render(<RegisterPage />);
    expect(
      screen.getByRole('button', { name: 'Create Account' })
    ).toBeInTheDocument();
  });

  it('renders link to login page', () => {
    render(<RegisterPage />);
    expect(screen.getByText('Sign in')).toHaveAttribute('href', '/login');
  });

  it('calls signUp and redirects on success', async () => {
    render(<RegisterPage />);
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'new@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
      });
    });
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });
  });

  it('shows error on failed registration', async () => {
    mockSupabaseClient.auth.signUp.mockResolvedValueOnce({
      error: { message: 'Email already registered' },
    });

    render(<RegisterPage />);
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'existing@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(screen.getByText('Email already registered')).toBeInTheDocument();
    });
  });
});

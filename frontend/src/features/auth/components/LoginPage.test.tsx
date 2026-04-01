import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { LoginPage } from './LoginPage';
import { AuthProvider } from '../hooks/useAuth';

vi.mock('../services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

const renderLogin = () =>
  render(<MemoryRouter><AuthProvider><LoginPage /></AuthProvider></MemoryRouter>);

describe('LoginPage', () => {
  it('renders email and password inputs', () => {
    renderLogin();
    expect(screen.getByTestId('login-email-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-password-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-submit-button')).toBeInTheDocument();
  });

  it('shows validation errors for empty submission', async () => {
    renderLogin();
    fireEvent.click(screen.getByTestId('login-submit-button'));
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('shows error message on failed login', async () => {
    const { authService } = await import('../services/auth.service');
    (authService.login as any).mockRejectedValueOnce({ response: { data: { message: 'Invalid credentials' } } });
    renderLogin();
    fireEvent.change(screen.getByTestId('login-email-input'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByTestId('login-password-input'), { target: { value: 'Password1' } });
    fireEvent.click(screen.getByTestId('login-submit-button'));
    await waitFor(() => expect(screen.getByText('Invalid credentials')).toBeInTheDocument());
  });
});

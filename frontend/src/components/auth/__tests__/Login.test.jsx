import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';

const loginMock = vi.fn();

vi.mock('../../../context/AuthContext.jsx', () => ({
  useAuth: () => ({ login: loginMock }),
}));

import Login from '../Login.jsx';

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

describe('Login form validation', () => {
  it('shows validation errors and does not call login when fields are empty', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText('Enter a valid email')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('rejects a malformed email address', async () => {
    const user = userEvent.setup();
    const { container } = renderLogin();

    await user.type(container.querySelector('input[name="email"]'), 'not-an-email');
    await user.type(container.querySelector('input[name="password"]'), 'somepassword');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText('Enter a valid email')).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('calls login with the entered credentials once the form is valid', async () => {
    loginMock.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    const { container } = renderLogin();

    await user.type(container.querySelector('input[name="email"]'), 'user@example.com');
    await user.type(container.querySelector('input[name="password"]'), 'correcthorse');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(loginMock).toHaveBeenCalledWith('user@example.com', 'correcthorse');
  });
});

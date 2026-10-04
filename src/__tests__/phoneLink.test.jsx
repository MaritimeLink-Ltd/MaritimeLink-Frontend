import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';

vi.mock('../services/authService', () => ({
  default: { redeemPhoneLink: vi.fn() },
}));

import authService from '../services/authService';
import PhoneLink from '../pages/personal/PhoneLink';

function WalletStub() {
  const { search } = useLocation();
  return <p>Document Wallet {search}</p>;
}

const renderAt = (entry) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/phone-link" element={<PhoneLink />} />
        <Route path="/personal/documents" element={<WalletStub />} />
      </Routes>
    </MemoryRouter>,
  );

/** An unexpired, unsigned JWT-shaped token: the page only reads its `exp`. */
const liveToken = () => `x.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))}.y`;

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('PhoneLink', () => {
  it('redeems the one-time token from the fragment and opens the wallet', async () => {
    authService.redeemPhoneLink.mockResolvedValue({ token: 't', data: { user: { id: 'p1' } } });

    renderAt({ pathname: '/phone-link', hash: '#t=abc123' });

    expect(await screen.findByText(/Document Wallet/)).toBeInTheDocument();
    expect(authService.redeemPhoneLink).toHaveBeenCalledOnce();
    expect(authService.redeemPhoneLink).toHaveBeenCalledWith('abc123');
  });

  it('opens the upload screen on the folder chosen on the desktop', async () => {
    authService.redeemPhoneLink.mockResolvedValue({ token: 't', data: { user: { id: 'p1' } } });

    renderAt({ pathname: '/phone-link', hash: '#t=abc123&f=medical' });

    expect(await screen.findByText('Document Wallet ?upload=medical')).toBeInTheDocument();
  });

  it('shows a sign-in option when the link has expired', async () => {
    authService.redeemPhoneLink.mockRejectedValue(
      Object.assign(new Error('401'), { status: 401, data: { message: 'This phone link has expired or was already used.' } }),
    );

    renderAt({ pathname: '/phone-link', hash: '#t=old' });

    expect(await screen.findByText(/expired or was already used/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/signin');
  });

  it('opens the wallet anyway when this phone is already signed in (code scanned twice)', async () => {
    localStorage.setItem('authToken', liveToken());
    localStorage.setItem('userType', 'professional');
    authService.redeemPhoneLink.mockRejectedValue(Object.assign(new Error('401'), { status: 401 }));

    renderAt({ pathname: '/phone-link', hash: '#t=used' });

    await waitFor(() => expect(screen.getByText(/Document Wallet/)).toBeInTheDocument());
  });
});

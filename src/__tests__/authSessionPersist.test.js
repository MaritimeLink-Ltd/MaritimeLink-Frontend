import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../utils/httpClient', () => ({
  default: { post: vi.fn() },
}));

import httpClient from '../utils/httpClient';
import authService from '../services/authService';

const loginResponse = {
  status: 'success',
  token: 'session-jwt',
  data: {
    user: {
      id: 'pro-1',
      fullname: 'Sam Seafarer',
      email: 'sam@example.com',
      profilePhotoUrl: 'https://cdn.example.com/p.png',
      status: 'VERIFIED',
      kyc: null,
      kycSubmitted: false,
    },
  },
};

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('professional session storage', () => {
  it('password login stores the session as before', async () => {
    httpClient.post.mockResolvedValue(loginResponse);

    await authService.login({ email: 'sam@example.com', password: 'x' });

    expect(localStorage.getItem('authToken')).toBe('session-jwt');
    expect(localStorage.getItem('professionalId')).toBe('pro-1');
    expect(localStorage.getItem('profileImage')).toBe('https://cdn.example.com/p.png');
    expect(localStorage.getItem('professionalVerificationStatus')).toBe('VERIFIED');
    expect(localStorage.getItem('adminVerified')).toBe('true');
    expect(JSON.parse(localStorage.getItem('userProfile')).fullName).toBe('Sam Seafarer');
  });

  it('phone link replaces whoever was signed in on the phone', async () => {
    localStorage.setItem('authToken', 'someone-else');
    localStorage.setItem('recruiterId', 'rec-9');
    localStorage.setItem('adminUserType', 'recruiter');
    httpClient.post.mockResolvedValue(loginResponse);

    await authService.redeemPhoneLink('one-time');

    expect(httpClient.post).toHaveBeenCalledWith(
      '/api/professional/phone-link/redeem',
      { token: 'one-time' },
      { skipAuth: true },
    );
    expect(localStorage.getItem('authToken')).toBe('session-jwt');
    expect(localStorage.getItem('userType')).toBe('professional');
    expect(localStorage.getItem('userEmail')).toBe('sam@example.com');
    expect(localStorage.getItem('recruiterId')).toBeNull();
    expect(localStorage.getItem('adminUserType')).toBeNull();
  });

  it('a failed phone link leaves the existing session alone', async () => {
    localStorage.setItem('authToken', 'still-signed-in');
    httpClient.post.mockRejectedValue(Object.assign(new Error('expired'), { status: 401 }));

    await expect(authService.redeemPhoneLink('dead')).rejects.toThrow();
    expect(localStorage.getItem('authToken')).toBe('still-signed-in');
  });
});

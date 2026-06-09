import { describe, it, expect } from 'vitest';
import {
  isAccountPendingReview,
  isAccountStage1Approved,
  normalizeAccountStatus,
  shouldShowAccountPendingWelcome,
} from '../utils/accountStatus';

describe('accountStatus', () => {
  it('normalizes account status values', () => {
    expect(normalizeAccountStatus('pending')).toBe('PENDING');
    expect(normalizeAccountStatus(' verified ')).toBe('VERIFIED');
  });

  it('detects pending Stage 1 review', () => {
    expect(isAccountPendingReview({ status: 'PENDING' })).toBe(true);
    expect(isAccountPendingReview({ status: 'VERIFIED' })).toBe(false);
    expect(isAccountPendingReview({ status: 'APPROVED' })).toBe(false);
  });

  it('shows welcome screen only when account is pending and KYC is not submitted', () => {
    expect(shouldShowAccountPendingWelcome({ status: 'PENDING' })).toBe(true);
    expect(
      shouldShowAccountPendingWelcome({
        status: 'PENDING',
        kycSubmitted: true,
      }),
    ).toBe(false);
    expect(
      shouldShowAccountPendingWelcome({
        status: 'PENDING',
        kyc: { status: 'PENDING', documentFrontUrl: 'https://example.com/id.jpg' },
      }),
    ).toBe(false);
    expect(shouldShowAccountPendingWelcome({ status: 'VERIFIED' })).toBe(false);
  });

  it('detects approved Stage 1 accounts', () => {
    expect(isAccountStage1Approved({ status: 'VERIFIED' })).toBe(true);
    expect(isAccountStage1Approved({ status: 'APPROVED' })).toBe(true);
    expect(isAccountStage1Approved({ status: 'PENDING' })).toBe(false);
  });
});

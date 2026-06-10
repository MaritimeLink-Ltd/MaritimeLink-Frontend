import { describe, it, expect } from 'vitest';
import {
  isAccountPendingReview,
  isAccountStage1Approved,
  isProfessionalNavigationRestricted,
  isPathAllowedDuringLimitedAccess,
  normalizeAccountStatus,
  shouldShowAccountPendingWelcome,
} from '../utils/accountStatus';
import { isKycUnderReview } from '../utils/kycStatus';

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

  it('allows resume, documents, and profile routes during limited access', () => {
    expect(isPathAllowedDuringLimitedAccess('/personal/dashboard')).toBe(true);
    expect(isPathAllowedDuringLimitedAccess('/personal/resume')).toBe(true);
    expect(isPathAllowedDuringLimitedAccess('/personal/documents')).toBe(true);
    expect(isPathAllowedDuringLimitedAccess('/personal/profile')).toBe(true);
    expect(isPathAllowedDuringLimitedAccess('/personal/profile/change-password')).toBe(true);
    expect(isPathAllowedDuringLimitedAccess('/personal/jobs')).toBe(false);
    expect(isPathAllowedDuringLimitedAccess('/personal/training')).toBe(false);
    expect(isPathAllowedDuringLimitedAccess('/personal/chats')).toBe(false);
  });

  it('restricts navigation when KYC is submitted but not yet approved', () => {
    const profile = {
      status: 'VERIFIED',
      kycSubmitted: true,
      kyc: { status: 'PENDING', documentFrontUrl: 'https://example.com/id.jpg' },
    };
    expect(isKycUnderReview(profile)).toBe(true);
    expect(isProfessionalNavigationRestricted(profile)).toBe(true);
  });

  it('allows full navigation when KYC is approved', () => {
    const profile = {
      status: 'VERIFIED',
      kycSubmitted: true,
      kyc: { status: 'APPROVED' },
    };
    expect(isKycUnderReview(profile)).toBe(false);
    expect(isProfessionalNavigationRestricted(profile)).toBe(false);
  });
});

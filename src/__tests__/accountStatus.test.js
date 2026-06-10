import { describe, it, expect } from 'vitest';
import {
  isAccountPendingReview,
  isAccountStage1Approved,
  isPathAllowedDuringStage1Pending,
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

  it('allows resume, documents, and profile routes during Stage 1 pending review', () => {
    expect(isPathAllowedDuringStage1Pending('/personal/dashboard')).toBe(true);
    expect(isPathAllowedDuringStage1Pending('/personal/resume')).toBe(true);
    expect(isPathAllowedDuringStage1Pending('/personal/documents')).toBe(true);
    expect(isPathAllowedDuringStage1Pending('/personal/profile')).toBe(true);
    expect(isPathAllowedDuringStage1Pending('/personal/profile/change-password')).toBe(true);
    expect(isPathAllowedDuringStage1Pending('/personal/jobs')).toBe(false);
    expect(isPathAllowedDuringStage1Pending('/personal/training')).toBe(false);
    expect(isPathAllowedDuringStage1Pending('/personal/chats')).toBe(false);
  });
});

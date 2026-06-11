import { describe, it, expect } from 'vitest';
import {
  getDashboardWelcomeMessages,
  isAccountPendingReview,
  isAccountStage1Approved,
  isProfessionalNavigationRestricted,
  isRecruiterNavigationRestricted,
  isTrainingProviderNavigationRestricted,
  isPathAllowedDuringLimitedAccess,
  isPathAllowedDuringRecruiterLimitedAccess,
  isPathAllowedDuringTrainingProviderLimitedAccess,
  normalizeAccountStatus,
  shouldShowAccountPendingWelcome,
  shouldShowDashboardWelcome,
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

  it('shows dashboard welcome until Stage 2 KYC is approved', () => {
    expect(shouldShowDashboardWelcome({ status: 'PENDING' })).toBe(true);
    expect(
      shouldShowDashboardWelcome({
        status: 'PENDING',
        kycSubmitted: true,
        kyc: { status: 'PENDING' },
      }),
    ).toBe(true);
    expect(
      shouldShowDashboardWelcome({
        status: 'VERIFIED',
        kycSubmitted: true,
        kyc: { status: 'PENDING' },
      }),
    ).toBe(true);
    expect(
      shouldShowDashboardWelcome({
        status: 'APPROVED',
        kycSubmitted: false,
      }),
    ).toBe(true);
    expect(
      shouldShowDashboardWelcome({
        status: 'VERIFIED',
        kycSubmitted: true,
        kyc: { status: 'APPROVED' },
      }),
    ).toBe(false);
  });

  it('returns role-specific welcome copy for Stage 1 vs Stage 2', () => {
    const stage1 = getDashboardWelcomeMessages({ status: 'PENDING' }, 'recruiter');
    expect(stage1.reviewMessage).toMatch(/under review by our team/i);
    expect(stage1.setupHint).toMatch(/Profile Settings/i);

    const kycPending = getDashboardWelcomeMessages(
      {
        status: 'APPROVED',
        kycSubmitted: true,
        kyc: { status: 'PENDING' },
      },
      'trainer',
    );
    expect(kycPending.reviewMessage).toMatch(/identity verification/i);
    expect(kycPending.setupHint).toMatch(/browse all sections/i);
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

  it('allows recruiter dashboard and settings during Stage 1 limited access', () => {
    expect(isPathAllowedDuringRecruiterLimitedAccess('/recruiter-dashboard')).toBe(true);
    expect(isPathAllowedDuringRecruiterLimitedAccess('/recruiter/settings')).toBe(true);
    expect(isPathAllowedDuringRecruiterLimitedAccess('/admin/settings')).toBe(true);
    expect(isPathAllowedDuringRecruiterLimitedAccess('/recruiter/jobs')).toBe(false);
    expect(isPathAllowedDuringRecruiterLimitedAccess('/recruiter/chats')).toBe(false);
  });

  it('allows trainer dashboard and profile during Stage 1 limited access', () => {
    expect(isPathAllowedDuringTrainingProviderLimitedAccess('/trainingprovider-dashboard')).toBe(true);
    expect(isPathAllowedDuringTrainingProviderLimitedAccess('/trainingprovider/profile')).toBe(true);
    expect(isPathAllowedDuringTrainingProviderLimitedAccess('/trainingprovider/courses')).toBe(false);
    expect(isPathAllowedDuringTrainingProviderLimitedAccess('/trainingprovider/chats')).toBe(false);
  });

  it('does not restrict navigation when KYC is pending but Stage 1 is approved', () => {
    const profile = {
      status: 'VERIFIED',
      kycSubmitted: true,
      kyc: { status: 'PENDING', documentFrontUrl: 'https://example.com/id.jpg' },
    };
    expect(isKycUnderReview(profile)).toBe(true);
    expect(isProfessionalNavigationRestricted(profile)).toBe(false);
    expect(isRecruiterNavigationRestricted({ ...profile, status: 'APPROVED' })).toBe(false);
    expect(isTrainingProviderNavigationRestricted({ ...profile, status: 'APPROVED' })).toBe(false);
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

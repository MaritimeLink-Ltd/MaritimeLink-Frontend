import { describe, it, expect, beforeEach } from 'vitest';
import {
  hasStage2KycAccess,
  hasSubmittedKyc,
  shouldPromptVerifyIdentity,
  mergeAuthUserProfile,
  persistKycSubmittedToProfile,
} from '../utils/kycStatus';

describe('hasStage2KycAccess', () => {
  it('returns false for empty or missing profile', () => {
    expect(hasStage2KycAccess(null)).toBe(false);
    expect(hasStage2KycAccess({})).toBe(false);
  });

  it('returns false when KYC is rejected even if isVerified is stale', () => {
    expect(
      hasStage2KycAccess({
        isVerified: true,
        kyc: { status: 'REJECTED' },
      }),
    ).toBe(false);
  });

  it('returns true when kyc status is approved or verified', () => {
    expect(hasStage2KycAccess({ kyc: { status: 'APPROVED' } })).toBe(true);
    expect(hasStage2KycAccess({ kycStatus: 'verified' })).toBe(true);
  });

  it('returns true when verified badge is issued (isVerified)', () => {
    expect(hasStage2KycAccess({ isVerified: true })).toBe(true);
  });

  it('returns false for stage-1-only recruiter (approved account, no stage 2)', () => {
    expect(
      hasStage2KycAccess({
        status: 'APPROVED',
        isVerified: false,
        kyc: { status: 'PENDING' },
      }),
    ).toBe(false);
  });

  it('returns false when KYC not started', () => {
    expect(
      hasStage2KycAccess({
        status: 'APPROVED',
        isVerified: false,
      }),
    ).toBe(false);
  });
});

describe('hasSubmittedKyc', () => {
  it('detects submitted flow from flags and documents', () => {
    expect(hasSubmittedKyc({ kycSubmitted: true })).toBe(true);
    expect(
      hasSubmittedKyc({
        kyc: { status: 'PENDING', documentFrontUrl: 'https://example.com/id.jpg' },
      }),
    ).toBe(true);
  });

  it('returns false before submission', () => {
    expect(hasSubmittedKyc({ kyc: { status: 'NOT_STARTED' } })).toBe(false);
  });
});

describe('shouldPromptVerifyIdentity', () => {
  it('prompts when user lacks stage 2 and has not submitted KYC', () => {
    expect(
      shouldPromptVerifyIdentity({
        isAdminVerified: false,
        sessionSkipped: false,
        profile: { status: 'APPROVED' },
      }),
    ).toBe(true);
  });

  it('does not prompt after stage 2 access', () => {
    expect(
      shouldPromptVerifyIdentity({
        isAdminVerified: true,
        profile: {},
      }),
    ).toBe(false);
  });

  it('does not prompt when KYC already submitted (under review)', () => {
    expect(
      shouldPromptVerifyIdentity({
        isAdminVerified: false,
        profile: { kycSubmitted: true, kyc: { status: 'PENDING' } },
      }),
    ).toBe(false);
  });

  it('does not prompt when user skipped for this session', () => {
    expect(
      shouldPromptVerifyIdentity({
        isAdminVerified: false,
        sessionSkipped: true,
        profile: {},
      }),
    ).toBe(false);
  });
});

describe('mergeAuthUserProfile', () => {
  beforeEach(() => {
    localStorage.setItem(
      'userProfile',
      JSON.stringify({
        kycSubmitted: true,
        kyc: { status: 'PENDING', documentFrontUrl: 'https://example.com/front.jpg' },
      }),
    );
  });

  it('preserves local KYC submission when API profile omits it', () => {
    const merged = mergeAuthUserProfile({ fullname: 'Test User', email: 't@example.com' });
    expect(merged.kycSubmitted).toBe(true);
    expect(merged.kyc?.documentFrontUrl).toBe('https://example.com/front.jpg');
  });
});

describe('persistKycSubmittedToProfile', () => {
  it('writes kycSubmitted flags to localStorage', () => {
    persistKycSubmittedToProfile();
    expect(localStorage.getItem('kycSubmitted')).toBe('true');
    const profile = JSON.parse(localStorage.getItem('userProfile'));
    expect(profile.kycSubmitted).toBe(true);
    expect(profile.hasSubmittedKyc).toBe(true);
  });
});

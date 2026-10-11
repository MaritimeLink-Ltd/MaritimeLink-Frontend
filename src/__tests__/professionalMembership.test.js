import { describe, it, expect } from 'vitest';
import { isPremiumTier, isProfessionalPremium } from '../utils/isPremiumTier';
import { PROFESSIONAL_SUBSCRIPTIONS_HIDDEN } from '../constants/professionalMembership';

describe('professional membership while the app is free', () => {
  it('opens every premium feature to professionals, whatever tier has loaded', () => {
    expect(PROFESSIONAL_SUBSCRIPTIONS_HIDDEN).toBe(true);
    expect(isProfessionalPremium('FREE')).toBe(true);
    expect(isProfessionalPremium(undefined)).toBe(true);
    expect(isProfessionalPremium('PRO')).toBe(true);
  });

  it('leaves the underlying tier check unchanged', () => {
    expect(isPremiumTier('FREE')).toBe(false);
    expect(isPremiumTier('pro')).toBe(true);
  });
});

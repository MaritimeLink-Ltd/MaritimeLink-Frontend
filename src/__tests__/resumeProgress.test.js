import { describe, it, expect, beforeEach } from 'vitest';
import {
  RESUME_SECTIONS,
  calculateResumeCompletion,
  getResumeBuilderPath,
  isResumeSubmitted,
  normalizeProfessionType,
  readStoredResumeProgress,
  resolveProfessionType,
  saveResumeProgress,
} from '../utils/resumeProgress';

const filledPersonalInfo = {
  firstName: 'Kingsley',
  lastName: 'Osifo',
  dateOfBirth: '1990-04-12',
};

describe('resumeProgress', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('reports 0% for an untouched resume', () => {
    expect(calculateResumeCompletion({}, 'officer')).toBe(0);
  });

  it('does not count personal info backfilled from the signup profile', () => {
    // resumeService fills first/last name from the stored profile, so names alone
    // must not make the section look complete.
    expect(
      calculateResumeCompletion({ personalInfo: { firstName: 'Kingsley', lastName: 'Osifo' } }, 'officer'),
    ).toBe(0);
  });

  it('counts one of eight officer sections as 13%', () => {
    expect(calculateResumeCompletion({ personalInfo: filledPersonalInfo }, 'officer')).toBe(13);
  });

  it('scales to the section count of each profession', () => {
    const oneSection = { personalInfo: filledPersonalInfo };
    expect(RESUME_SECTIONS.ratings).toHaveLength(7);
    expect(calculateResumeCompletion(oneSection, 'ratings')).toBe(14);
    expect(calculateResumeCompletion(oneSection, 'catering')).toBe(13);
  });

  it('recognises data in every officer section shape', () => {
    const complete = {
      personalInfo: filledPersonalInfo,
      professionalSummary: { professionalSummary: 'Master mariner with 10 years at sea.' },
      skills: { skills: [{ name: 'Navigation', level: 4 }] },
      licensesEndorsements: { licenses: [{ licenseName: 'Master' }], endorsements: [] },
      seaServiceLog: { seaServiceEntries: [{ vesselName: 'MV Test' }] },
      academicQualifications: { academicQualifications: [{ qualificationName: 'BSc' }] },
      medicalTravelDocs: { medicalDocuments: [{ certificateName: 'ENG1' }] },
      biometricsNextOfKin: { biometricData: { height: '180' } },
    };

    expect(calculateResumeCompletion(complete, 'officer')).toBe(100);
  });

  it('ignores the gender the API mapper defaults in', () => {
    expect(
      calculateResumeCompletion({ biometricsNextOfKin: { biometricData: { gender: 'Male' } } }, 'officer'),
    ).toBe(0);
  });

  it('counts catering licenses and certificates', () => {
    expect(
      calculateResumeCompletion(
        { professionalLicensesCertificates: { certificates: [{ certificateName: 'Food Safety' }] } },
        'catering',
      ),
    ).toBe(13);
  });

  it('normalizes profession names from the API, session and resume preview', () => {
    expect(normalizeProfessionType('RATINGS_AND_CREW')).toBe('ratings');
    expect(normalizeProfessionType('CATERING_AND_MEDICAL')).toBe('catering');
    expect(normalizeProfessionType('medical')).toBe('catering');
    expect(normalizeProfessionType('rating')).toBe('ratings');
    expect(normalizeProfessionType('')).toBe('');
  });

  it('prefers the session profession over the stored profile, and defaults to officer', () => {
    expect(resolveProfessionType({ profession: 'CATERING_AND_MEDICAL' })).toBe('catering');
    sessionStorage.setItem('professionType', 'ratings');
    expect(resolveProfessionType({ profession: 'CATERING_AND_MEDICAL' })).toBe('ratings');
    sessionStorage.clear();
    expect(resolveProfessionType({})).toBe('officer');
  });

  it('routes to the builder that owns the resume', () => {
    expect(getResumeBuilderPath('officer')).toBe('/officer-dashboard');
    expect(getResumeBuilderPath('ratings')).toBe('/ratings-dashboard');
    expect(getResumeBuilderPath('CATERING_AND_MEDICAL')).toBe('/catering-medical-dashboard');
    expect(getResumeBuilderPath('')).toBe('/officer-dashboard');
  });

  it('stores progress per professional', () => {
    localStorage.setItem('professionalId', 'pro-1');
    saveResumeProgress(38);
    expect(readStoredResumeProgress()).toEqual({ percent: 38, submitted: false });

    localStorage.setItem('professionalId', 'pro-2');
    expect(readStoredResumeProgress()).toEqual({ percent: null, submitted: false });
  });

  it('keeps a resume submitted once it has been submitted', () => {
    localStorage.setItem('professionalId', 'pro-1');
    saveResumeProgress(100, { submitted: true });
    saveResumeProgress(88);

    expect(readStoredResumeProgress()).toEqual({ percent: 88, submitted: true });
  });

  it('treats a submitted flag or a finished resume as submitted', () => {
    expect(isResumeSubmitted({ percent: 13, submitted: false })).toBe(false);
    expect(isResumeSubmitted({ percent: 99, submitted: false })).toBe(false);
    expect(isResumeSubmitted({ percent: 13, submitted: true })).toBe(true);
    expect(isResumeSubmitted({ percent: 100, submitted: false })).toBe(true);
    expect(isResumeSubmitted({})).toBe(false);
  });
});

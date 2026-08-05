import { describe, it, expect, beforeEach } from 'vitest';
import resumeService from '../services/resumeService';
import { calculateResumeCompletion } from '../utils/resumeProgress';

/**
 * The dashboard measures completion from data the API mapper produces, while the
 * builder measures the same sections from its own local state. These guard the
 * join between the two — in particular the mapper's fallbacks, which fill fields
 * the user never entered.
 */

/** Shape of GET /api/professional/resume after getResume() flattens `resume`. */
const FULL_API_RESUME = {
  firstName: 'Kingsley',
  lastName: 'Osifo',
  dateOfBirth: '1990-04-12T00:00:00.000Z',
  address: '12 Dock Road',
  city: 'Lagos',
  country: 'Nigeria',
  phoneCode: '+234',
  phoneNumber: '8012345678',
  emailAddress: 'kingsley@example.com',
  summary: 'Master mariner with ten years at sea.',
  skills: [{ skillName: 'Navigation', rating: 4 }],
  licenses: [
    { name: 'Master Mariner', number: 'M-1', country: 'NG', isEndorsement: false },
    { name: 'GMDSS', number: 'E-1', country: 'NG', isEndorsement: true },
  ],
  seaService: [{ companyName: 'Blue Line', role: 'Second Officer', vesselName: 'MV Test' }],
  education: [{ qualificationName: 'BSc Nautical Science', institution: 'MAN' }],
  stcwCertificates: [{ qualification: 'Basic Safety', certificateNumber: 'S-1' }],
  medicalTravelDocuments: [{ name: 'ENG1', documentNumber: 'MD-1', type: 'MEDICAL' }],
  travelDocuments: [{ name: 'Seaman Book', documentNumber: 'SB-1' }],
  biometrics: { gender: 'MALE', height: 180, weight: 78, eyeColor: 'Brown' },
  nextOfKin: [{ name: 'Ada Osifo', relationship: 'Sister', phoneNumber: '801' }],
  referees: [{ name: 'Capt. Bello', phoneNumber: '802' }],
};

describe('resume completion from API payloads', () => {
  beforeEach(() => {
    // The mapper backfills names from the signup profile when the resume has none.
    localStorage.setItem(
      'userProfile',
      JSON.stringify({ firstName: 'Kingsley', lastName: 'Osifo', email: 'kingsley@example.com' }),
    );
  });

  it('reports 0% for a professional who has never opened the resume', () => {
    const mapped = resumeService.mapApiToOfficerData({});
    expect(mapped.personalInfo.firstName).toBe('Kingsley'); // backfilled, not entered
    expect(calculateResumeCompletion(mapped, 'officer')).toBe(0);
  });

  it('reports 100% for a fully populated officer resume', () => {
    const mapped = resumeService.mapApiToOfficerData(FULL_API_RESUME);
    expect(calculateResumeCompletion(mapped, 'officer')).toBe(100);
  });

  it('counts partial officer resumes section by section', () => {
    const mapped = resumeService.mapApiToOfficerData({
      firstName: 'Kingsley',
      lastName: 'Osifo',
      dateOfBirth: '1990-04-12T00:00:00.000Z',
      summary: 'Master mariner with ten years at sea.',
    });

    expect(calculateResumeCompletion(mapped, 'officer')).toBe(25);
  });

  it('reports 100% for ratings, which has no licenses section', () => {
    const mapped = resumeService.mapApiToRatingsData(FULL_API_RESUME);
    expect(mapped.licensesEndorsements).toBeUndefined();
    expect(calculateResumeCompletion(mapped, 'ratings')).toBe(100);
  });

  it('reports 100% for catering, whose licenses live under their own key', () => {
    const cateringApi = {
      ...FULL_API_RESUME,
      licenses: [
        { name: 'Ship Cook', number: 'C-1', country: 'NG', isCertificate: false, isEndorsement: false },
        { name: 'Food Safety', number: 'C-2', country: 'NG', isCertificate: true },
      ],
    };

    const mapped = resumeService.mapApiToCateringData(cateringApi);
    expect(mapped.professionalLicensesCertificates.licenses).toHaveLength(1);
    expect(calculateResumeCompletion(mapped, 'catering')).toBe(100);
  });

  it('does not count a resume as started from the mapper defaults alone', () => {
    // gender is left unset (no silent 'Male' default) and the phone country
    // code defaults to '+44' for every resume the mapper touches — neither
    // may register as user-entered data.
    const mapped = resumeService.mapApiToOfficerData({});
    expect(mapped.biometricsNextOfKin.biometricData.gender).toBe('');
    expect(mapped.personalInfo.countryCode).toBe('+44');
    expect(calculateResumeCompletion(mapped, 'officer')).toBe(0);
  });
});

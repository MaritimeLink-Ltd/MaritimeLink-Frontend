import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, cleanup } from '@testing-library/react';

vi.mock('../services/resumeService', () => ({
  default: {
    getResume: vi.fn(),
    mapApiToOfficerData: vi.fn((data) => data),
    mapApiToRatingsData: vi.fn((data) => data),
    mapApiToCateringData: vi.fn((data) => data),
  },
}));

import { useResumeProgress } from '../hooks/useResumeProgress';
import resumeService from '../services/resumeService';

const COMPLETE_RESUME = {
  personalInfo: { firstName: 'Kingsley', lastName: 'Osifo', dateOfBirth: '1990-04-12' },
  professionalSummary: { professionalSummary: 'Master mariner.' },
  skills: { skills: [{ name: 'Navigation' }] },
  licensesEndorsements: { licenses: [{ licenseName: 'Master' }] },
  seaServiceLog: { seaServiceEntries: [{ vesselName: 'MV Test' }] },
  academicQualifications: { academicQualifications: [{ qualificationName: 'BSc' }] },
  medicalTravelDocs: { medicalDocuments: [{ certificateName: 'ENG1' }] },
  biometricsNextOfKin: { biometricData: { height: '180' } },
};

describe('useResumeProgress', () => {
  beforeEach(() => {
    localStorage.setItem('professionalId', 'pro-1');
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('does not report progress while the resume is still loading', async () => {
    resumeService.getResume.mockResolvedValue(COMPLETE_RESUME);

    const { result } = renderHook(() => useResumeProgress({ enabled: true }));

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.percent).toBe(100);
    expect(result.current.submitted).toBe(true);
  });

  it('reloads when the account status arrives after mount', async () => {
    // Professional login returns no `status`, so the dashboard mounts believing
    // the account is not pending and only enables this hook once /me lands.
    resumeService.getResume.mockResolvedValue(COMPLETE_RESUME);

    const { result, rerender } = renderHook(({ enabled }) => useResumeProgress({ enabled }), {
      initialProps: { enabled: false },
    });

    expect(result.current.isLoading).toBe(false);
    expect(resumeService.getResume).not.toHaveBeenCalled();

    rerender({ enabled: true });

    // Must not claim a 0% resume in the gap before the fetch resolves.
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.percent).toBe(100);
  });

  it('falls back to stored progress when the resume cannot be fetched', async () => {
    localStorage.setItem('resumeProgress:pro-1', '38');
    resumeService.getResume.mockRejectedValue(new Error('offline'));

    const { result } = renderHook(() => useResumeProgress({ enabled: true }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.percent).toBe(38);
    expect(result.current.submitted).toBe(false);
  });

  it('uses the builder that matches the profession', async () => {
    sessionStorage.setItem('professionType', 'medical');
    resumeService.getResume.mockResolvedValue({});

    const { result } = renderHook(() => useResumeProgress({ enabled: true }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.professionType).toBe('catering');
    expect(result.current.builderPath).toBe('/catering-medical-dashboard');
    expect(resumeService.mapApiToCateringData).toHaveBeenCalled();
  });
});

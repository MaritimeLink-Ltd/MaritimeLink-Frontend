import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const navigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

// The dashboard body is irrelevant here and pulls in the whole API surface.
vi.mock('../pages/personal/dashboard/dashboard-sections/Dashboard', () => ({
  default: () => <div>Dashboard home</div>,
}));
vi.mock('../components/kyc/KycStage2Banner', () => ({ default: () => null }));

vi.mock('../services/resumeService', () => ({
  default: {
    getResume: vi.fn(),
    mapApiToOfficerData: vi.fn((data) => data),
    mapApiToRatingsData: vi.fn((data) => data),
    mapApiToCateringData: vi.fn((data) => data),
  },
}));

import PersonalDashboard from '../pages/personal/dashboard/PersonalDashboard';
import resumeService from '../services/resumeService';

const PART_BUILT_RESUME = {
  personalInfo: { firstName: 'Kingsley', lastName: 'Osifo', dateOfBirth: '1990-04-12' },
};

const COMPLETE_RESUME = {
  ...PART_BUILT_RESUME,
  professionalSummary: { professionalSummary: 'Master mariner.' },
  skills: { skills: [{ name: 'Navigation' }] },
  licensesEndorsements: { licenses: [{ licenseName: 'Master' }] },
  seaServiceLog: { seaServiceEntries: [{ vesselName: 'MV Test' }] },
  academicQualifications: { academicQualifications: [{ qualificationName: 'BSc' }] },
  medicalTravelDocs: { medicalDocuments: [{ certificateName: 'ENG1' }] },
  biometricsNextOfKin: { biometricData: { height: '180' } },
};

function renderDashboard() {
  return render(
    <MemoryRouter>
      <PersonalDashboard />
    </MemoryRouter>,
  );
}

describe('PersonalDashboard Stage 1 welcome', () => {
  beforeEach(() => {
    navigate.mockClear();
    localStorage.setItem('professionalId', 'pro-1');
    localStorage.setItem(
      'userProfile',
      JSON.stringify({ status: 'PENDING', profession: 'OFFICER' }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('shows saved progress and a way back into the resume while it is unfinished', async () => {
    resumeService.getResume.mockResolvedValue(PART_BUILT_RESUME);

    renderDashboard();

    expect(
      await screen.findByText(/your Resume is 13% complete/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/unlock your Digital Career Profile/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/under review/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /continue building resume/i }));
    expect(navigate).toHaveBeenCalledWith('/officer-dashboard');
  });

  it('shows the under-review message once the resume is complete', async () => {
    resumeService.getResume.mockResolvedValue(COMPLETE_RESUME);

    renderDashboard();

    expect(
      await screen.findByText('Thank you for completing and submitting your profile.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Your information is currently under review by our team.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/still update your Resume, Documents, and Profile/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/No further action is required/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /continue building resume/i }),
    ).not.toBeInTheDocument();
  });

  it('shows the under-review message when the resume was submitted below 100%', async () => {
    localStorage.setItem('resumeSubmitted:pro-1', 'true');
    resumeService.getResume.mockResolvedValue(PART_BUILT_RESUME);

    renderDashboard();

    expect(
      await screen.findByText('Thank you for completing and submitting your profile.'),
    ).toBeInTheDocument();
  });

  it('falls back to the progress the builder stored when the resume cannot be fetched', async () => {
    localStorage.setItem('resumeProgress:pro-1', '38');
    resumeService.getResume.mockRejectedValue(new Error('offline'));

    renderDashboard();

    expect(await screen.findByText(/your Resume is 38% complete/i)).toBeInTheDocument();
  });

  it('shows the dashboard itself once Stage 1 is approved', async () => {
    localStorage.setItem(
      'userProfile',
      JSON.stringify({ status: 'VERIFIED', profession: 'OFFICER' }),
    );

    renderDashboard();

    await waitFor(() => expect(screen.getByText('Dashboard home')).toBeInTheDocument());
    expect(resumeService.getResume).not.toHaveBeenCalled();
  });
});

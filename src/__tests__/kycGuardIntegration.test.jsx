import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

vi.mock('../context/KycContext', () => ({
  useKyc: vi.fn(),
}));

import KycRestrictedView from '../components/kyc/KycRestrictedView';
import { useKyc } from '../context/KycContext';

const ROOT = join(import.meta.dirname, '..');

afterEach(() => {
  cleanup();
});

function readSource(relativePath) {
  return readFileSync(join(ROOT, relativePath), 'utf8');
}

describe('KycRestrictedView', () => {
  it('renders verification prompt and starts KYC flow on button click', () => {
    const handleKycRequiredStart = vi.fn();
    useKyc.mockReturnValue({
      actions: {
        handleKycRequiredStart,
        handleStartVerification: vi.fn(),
      },
    });

    render(
      <KycRestrictedView
        actionLabel="view professional profiles"
        onBack={vi.fn()}
      />,
    );

    expect(screen.getByText('Identity verification required')).toBeInTheDocument();
    expect(screen.getByText(/view professional profiles/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /complete kyc verification/i }));
    expect(handleKycRequiredStart).toHaveBeenCalledOnce();
  });

  it('shows under-review state when KYC is pending admin approval', () => {
    render(
      <KycRestrictedView
        actionLabel="publish jobs"
        isUnderReview
        onBack={vi.fn()}
      />,
    );

    expect(screen.getByText('Verification in progress')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /complete kyc verification/i })).not.toBeInTheDocument();
  });
});

describe('KYC guard wiring (smoke)', () => {
  const guardedFiles = [
    {
      file: 'pages/admin/recruiter-dashboard/search/AdminSearch.jsx',
      mustInclude: ['guardRestrictedAction', 'VIEW_PROFESSIONAL_PROFILE'],
    },
    {
      file: 'pages/admin/recruiter-dashboard/jobs/JobDetail.jsx',
      mustInclude: ['navigateToApplicantProfile', 'MESSAGE_PROFESSIONAL'],
    },
    {
      file: 'pages/admin/recruiter-dashboard/candidate/CandidateSummary.jsx',
      mustInclude: ['KycRestrictedView', 'requiresKycForProfileView'],
      mustNotInclude: ['skipKycOnTrainingProviderProfile'],
    },
    {
      file: 'pages/admin/trainingprovider-dashboard/bookings/BookingDetail.jsx',
      mustInclude: ['VIEW_PROFESSIONAL_PROFILE', 'guardRestrictedAction'],
    },
    {
      file: 'pages/admin/trainingprovider-dashboard/demand/AllExpiries.jsx',
      mustInclude: ['VIEW_PROFESSIONAL_PROFILE', 'guardRestrictedAction'],
    },
    {
      file: 'pages/admin/trainingprovider-dashboard/courses/SessionAttendance.jsx',
      mustInclude: ['navigateToAttendeeProfile', 'navigateToAttendeeMessage'],
    },
    {
      file: 'pages/personal/CVResume.jsx',
      mustInclude: ['KycRestrictedView', 'VIEW_RESUME'],
    },
    {
      file: 'pages/personal/dashboard/dashboard-sections/ApplyToJob.jsx',
      mustInclude: ['APPLY_JOB', 'guardRestrictedAction'],
    },
    {
      file: 'pages/personal/dashboard/dashboard-sections/DocumentsWallet.jsx',
      mustInclude: ['SHARE_DOCUMENT_LINK', 'EXPORT_RESUME'],
    },
  ];

  it.each(guardedFiles)('guards are present in $file', ({ file, mustInclude, mustNotInclude = [] }) => {
    const source = readSource(file);
    for (const snippet of mustInclude) {
      expect(source, `${file} should include ${snippet}`).toContain(snippet);
    }
    for (const snippet of mustNotInclude) {
      expect(source, `${file} should not include ${snippet}`).not.toContain(snippet);
    }
  });
});

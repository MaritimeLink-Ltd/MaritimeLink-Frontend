import { describe, it, expect, beforeEach, vi } from 'vitest';
import httpClient from '../utils/httpClient';
import resumeService from '../services/resumeService';
import { mergePendingDrafts } from '../utils/resumeStepSync';

/**
 * "Save & Continue Later" PUTs the builder's whole state to the bulk endpoint,
 * which validates with Zod. Zod *strips unknown keys silently*, so a payload
 * whose shape drifts from the schema still returns 200 while quietly dropping
 * the data — which is exactly how personal info, biometrics and the medical /
 * travel documents went missing. These lock the wire shape to the schema.
 *
 * Zod also rejects `null` for `.optional()` fields and `''` for `.email()`, so
 * blanks must be omitted rather than sent — a single stray null 400s the entire
 * save, losing every section at once.
 */
describe('bulk resume save payload', () => {
  let sentPayload;

  beforeEach(() => {
    sentPayload = undefined;
    vi.spyOn(httpClient, 'put').mockImplementation(async (_url, payload) => {
      sentPayload = payload;
      return { status: 'success' };
    });
  });

  /** Builder state as the dashboards hold it, with every section filled in. */
  const ALL_DATA = {
    personalInfo: {
      firstName: 'Kingsley',
      lastName: 'Osifo',
      dateOfBirth: '1990-04-12',
      streetAddress: '12 Dock Road',
      city: 'Lagos',
      state: 'Lagos',
      zipCode: '100001',
      country: 'Nigeria',
      countryCode: '+234',
      contactNumber: '8012345678',
      email: 'kingsley@example.com',
    },
    professionalSummary: { professionalSummary: 'Master mariner with ten years at sea.' },
    skills: { skills: [{ name: 'Navigation', rating: 4 }] },
    licensesEndorsements: { licenses: [], endorsements: [] },
    seaServiceLog: {
      seaServiceEntries: [
        {
          companyName: 'Acme Shipping',
          role: 'Third Engineer',
          vesselName: 'Glen Sannox',
          imoNo: '1234567',
          flag: 'NG',
          type: 'LNG Tanker',
          dwt: '50000',
          meType: 'MAN B&W',
          kwt: '9000',
          joiningDate: '2023-03-08',
          till: '2026-08-01',
        },
      ],
    },
    academicQualifications: { academicQualifications: [], stcwCertificates: [] },
    medicalTravelDocs: {
      medicalDocuments: [{ certificateName: 'Yellow Fever', certificateNumber: 'YF-1' }],
      travelDocuments: [{ documentName: 'Passport', documentNumber: 'P-1' }],
    },
    biometricsNextOfKin: {
      biometricData: {
        gender: 'Male',
        height: '180',
        weight: '75',
        bmi: '23',
        eyeColor: 'Brown',
        overallSize: 'Medium',
        shoeSize: '9',
      },
      nextOfKinList: [
        { name: 'Jane Doe', relationship: 'Sister', countryCode: '+234', phone: '8011111111' },
      ],
      refereesList: [
        { name: 'John Smith', position: 'Captain', company: 'Acme', countryCode: '+44', phone: '7011111111' },
      ],
    },
  };

  it('sends personal info and biometrics flat, as the schema declares them', async () => {
    await resumeService.submitBulkResume(ALL_DATA, 'PUT');

    // Nested objects are unknown keys to the schema and would be stripped.
    expect(sentPayload.personalInfo).toBeUndefined();
    expect(sentPayload.biometrics).toBeUndefined();

    expect(sentPayload).toMatchObject({
      firstName: 'Kingsley',
      lastName: 'Osifo',
      address: '12 Dock Road',
      city: 'Lagos',
      postcode: '100001',
      country: 'Nigeria',
      phoneCode: '+234',
      phoneNumber: '8012345678',
      emailAddress: 'kingsley@example.com',
      gender: 'MALE',
      height: 180,
      weight: 75,
      eyeColor: 'Brown',
    });
  });

  it('splits medical and travel documents into the two arrays the schema expects', async () => {
    await resumeService.submitBulkResume(ALL_DATA, 'PUT');

    expect(sentPayload.medicalTravelDocuments).toBeUndefined();
    expect(sentPayload.medicalCertificates).toHaveLength(1);
    expect(sentPayload.medicalCertificates[0].name).toBe('Yellow Fever');
    expect(sentPayload.travelDocuments).toHaveLength(1);
    expect(sentPayload.travelDocuments[0].name).toBe('Passport');
  });

  it('names the sea service KW field kwtType so the value is not dropped', async () => {
    await resumeService.submitBulkResume(ALL_DATA, 'PUT');

    expect(sentPayload.seaService[0].kwtType).toBe('9000');
    expect(sentPayload.seaService[0].kwType).toBeUndefined();
  });

  it('keeps the referee company name', async () => {
    await resumeService.submitBulkResume(ALL_DATA, 'PUT');

    expect(sentPayload.referees[0].companyName).toBe('Acme');
  });

  it('omits blank optional fields rather than sending null, which Zod rejects', async () => {
    await resumeService.submitBulkResume(
      {
        ...ALL_DATA,
        personalInfo: { firstName: 'Kingsley', lastName: 'Osifo' },
        biometricsNextOfKin: {
          biometricData: { gender: '', height: '', weight: '' },
          nextOfKinList: [{ name: 'Jane Doe', countryCode: '+234', phone: '8011111111' }],
          refereesList: [{ name: 'John Smith', countryCode: '+44', phone: '7011111111' }],
        },
      },
      'PUT',
    );

    // An empty emailAddress fails .email() and would 400 the whole save.
    expect('emailAddress' in sentPayload).toBe(false);
    expect('height' in sentPayload).toBe(false);
    expect('gender' in sentPayload).toBe(false);
    expect('email' in sentPayload.nextOfKin[0]).toBe(false);
    expect('position' in sentPayload.referees[0]).toBe(false);
  });
});

describe('mergePendingDrafts', () => {
  it('folds a typed-but-not-added entry into its list so saving keeps it', () => {
    const merged = mergePendingDrafts({
      seaServiceLog: {
        seaServiceEntries: [{ vesselName: 'Glen Sannox' }],
        __drafts: { seaServiceEntries: { vesselName: 'LNG Lagos II' } },
      },
    });

    expect(merged.seaServiceLog.seaServiceEntries).toEqual([
      { vesselName: 'Glen Sannox' },
      { vesselName: 'LNG Lagos II' },
    ]);
    // Bookkeeping must not reach the wire.
    expect(merged.seaServiceLog.__drafts).toBeUndefined();
  });

  it('ignores a section with no pending draft', () => {
    const merged = mergePendingDrafts({
      seaServiceLog: { seaServiceEntries: [{ vesselName: 'Glen Sannox' }], __drafts: { seaServiceEntries: null } },
    });

    expect(merged.seaServiceLog.seaServiceEntries).toHaveLength(1);
    expect(merged.seaServiceLog.__drafts).toBeUndefined();
  });

  it('leaves an emptied list empty, so a removal is not undone', () => {
    const merged = mergePendingDrafts({
      seaServiceLog: { seaServiceEntries: [], __drafts: { seaServiceEntries: null } },
    });

    expect(merged.seaServiceLog.seaServiceEntries).toEqual([]);
  });
});

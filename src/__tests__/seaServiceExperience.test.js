import { describe, expect, it } from 'vitest';
import {
  buildSeaServiceExperience,
  calculateTotalSeaTime,
  formatTotalSeaTimeLabel,
  getVesselTypeBreakdown,
  normalizeSeaServiceLog,
} from '../utils/seaServiceExperience';

const sampleLogs = [
  {
    companyName: 'Maritime Corp',
    role: 'Second Officer',
    vesselName: 'LNG Lagos 2',
    vesselType: 'LNG Tanker',
    joiningDate: '2020-01-01',
    tillDate: '2022-01-01',
  },
  {
    companyName: 'Oceanic Ltd',
    role: 'Chief Officer',
    vesselName: 'LNG Pioneer',
    vesselType: 'LNG Tanker',
    joiningDate: '2022-02-01',
    tillDate: '2023-02-01',
  },
  {
    companyName: 'Offshore Co',
    role: 'Chief Officer',
    vesselName: 'OSV Pioneer',
    vesselType: 'Offshore Support Vessel',
    joiningDate: '2023-03-01',
    tillDate: '2024-03-01',
  },
];

describe('seaServiceExperience', () => {
  it('sums total sea time across all records in years and months', () => {
    const total = calculateTotalSeaTime(sampleLogs);
    expect(total.totalMonths).toBeGreaterThan(0);
    expect(total.years).toBeGreaterThan(0);
    expect(formatTotalSeaTimeLabel(sampleLogs)).toMatch(/^Total Sea Time: \d+ year/);
  });

  it('groups duplicate vessel types and sums their time', () => {
    const breakdown = getVesselTypeBreakdown(sampleLogs);
    expect(breakdown).toHaveLength(2);
    expect(breakdown.map((entry) => entry.vesselType)).toEqual([
      'LNG Tanker',
      'Offshore Support Vessel',
    ]);
  });

  it('builds Figma-style experience lines with vessel type breakdown', () => {
    const experience = buildSeaServiceExperience(sampleLogs);
    expect(experience.experienceLines[0]).toMatch(/^Total Sea Time:/);
    expect(experience.experienceLines.some((line) => line.startsWith('LNG Tanker:'))).toBe(true);
    expect(
      experience.experienceLines.some((line) => line.startsWith('Offshore Support Vessel:')),
    ).toBe(true);
    expect(experience.uniqueVesselTypes).toHaveLength(2);
  });

  it('keeps vessel name separate from vessel type', () => {
    const normalized = normalizeSeaServiceLog({
      vesselName: 'LNG Lagos 2',
      type: 'LNG Tanker',
      joiningDate: '2020-01-01',
      till: '2022-01-01',
    });

    expect(normalized.vesselName).toBe('LNG Lagos 2');
    expect(normalized.vesselType).toBe('LNG Tanker');
    expect(buildSeaServiceExperience([normalized]).experienceLines.some((line) =>
      line.includes('LNG Lagos 2'),
    )).toBe(false);
  });

  it('ignores entries where vessel type was mistakenly set to vessel name', () => {
    const experience = buildSeaServiceExperience([
      {
        vesselName: 'LNG Lagos 2',
        vesselType: 'LNG Lagos 2',
        joiningDate: '2020-01-01',
        tillDate: '2022-01-01',
      },
      {
        vesselName: 'LNG Pioneer',
        vesselType: 'LNG Tanker',
        joiningDate: '2022-02-01',
        tillDate: '2023-02-01',
      },
    ]);

    expect(experience.byVesselType).toHaveLength(1);
    expect(experience.byVesselType[0].vesselType).toBe('LNG Tanker');
  });

  it('reads wizard field aliases (type, till)', () => {
    const total = calculateTotalSeaTime([
      {
        vesselName: 'Support One',
        type: 'Offshore Support Vessel',
        joiningDate: '2023-01-01',
        till: '2024-01-01',
      },
    ]);

    expect(total.totalMonths).toBeGreaterThan(0);
  });
});

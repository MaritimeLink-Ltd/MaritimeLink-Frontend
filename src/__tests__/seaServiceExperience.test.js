import { describe, expect, it } from 'vitest';
import {
  buildSeaServiceExperience,
  calculateTotalSeaTime,
  formatTotalSeaTimeLabel,
  getVesselTypeBreakdown,
  normalizeSeaServiceLog,
  pluralizeVesselTypeDisplay,
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
    expect(formatTotalSeaTimeLabel(sampleLogs)).toMatch(/^\d+ year.*sea time$/);
  });

  it('groups duplicate vessel types and sums their time', () => {
    const breakdown = getVesselTypeBreakdown(sampleLogs);
    expect(breakdown).toHaveLength(2);
    expect(breakdown.map((entry) => entry.vesselType)).toEqual([
      'LNG Tanker',
      'Offshore Support Vessel',
    ]);
  });

  it('merges plural vessel type variants', () => {
    const breakdown = getVesselTypeBreakdown([
      {
        vesselName: 'Glen Sannox',
        vesselType: 'RoRo Ferries',
        joiningDate: '2024-12-27',
        tillDate: '2026-04-12',
      },
      {
        vesselName: 'Loch Seaforth',
        vesselType: 'RoRo Ferry',
        joiningDate: '2026-05-13',
        tillDate: '2026-05-28',
      },
    ]);

    expect(breakdown).toHaveLength(1);
    expect(breakdown[0].totalMonths).toBeGreaterThan(1);
  });

  it('builds Figma-style experience lines', () => {
    const experience = buildSeaServiceExperience(sampleLogs);
    expect(experience.experienceLines[0]).toMatch(/total sea service$/);
    expect(
      experience.experienceLines.some((line) => line.includes('on LNG Tankers')),
    ).toBe(true);
    expect(
      experience.experienceLines.some((line) =>
        line.includes('on Offshore Support Vessels'),
      ),
    ).toBe(true);
    expect(experience.uniqueVesselTypes).toHaveLength(2);
  });

  it('pluralizes vessel types for breakdown lines', () => {
    expect(pluralizeVesselTypeDisplay('LNG Tanker')).toBe('LNG Tankers');
    expect(pluralizeVesselTypeDisplay('Offshore Support Vessel')).toBe(
      'Offshore Support Vessels',
    );
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

  it('ignores generic placeholder vessel types', () => {
    const experience = buildSeaServiceExperience([
      {
        vesselName: 'Test Ship',
        vesselType: 'Vessel',
        joiningDate: '2026-04-01',
        tillDate: '2026-04-24',
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
    expect(experience.experienceLines.some((line) => line.includes('on Vessel'))).toBe(
      false,
    );
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

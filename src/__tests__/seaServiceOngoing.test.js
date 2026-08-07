import { describe, it, expect } from 'vitest';
import {
  calculateTotalSeaTime,
  getVesselTypeBreakdown,
} from '../utils/seaServiceExperience';
import { sortSeaService } from '../utils/resumeEntryOrder';

/**
 * A professional who has not signed off yet has no end date to give, so the
 * Sea Service step records that posting with an empty `till` (chosen with the
 * "I am still on this vessel" tick). Everything downstream has to read a
 * missing end date as "still running" rather than as missing data — otherwise
 * a seafarer's current contract, often their longest, scores as zero.
 */
describe('sea service still in progress', () => {
  const daysAgo = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
  };

  it('counts an open-ended posting up to today rather than as zero', () => {
    const total = calculateTotalSeaTime([
      { vesselType: 'LNG Tanker', joiningDate: daysAgo(400), tillDate: '' },
    ]);

    // ~400 days ≈ 1 year, 1 month. Assert the band, not the exact day, so the
    // test does not drift with the calendar.
    expect(total.years).toBe(1);
    expect(total.totalMonths).toBeGreaterThan(12);
    expect(total.totalMonths).toBeLessThan(14);
  });

  it('still counts a completed posting from its own end date', () => {
    const total = calculateTotalSeaTime([
      { vesselType: 'Bulk Carrier', joiningDate: '2020-01-01', tillDate: '2021-01-01' },
    ]);

    expect(total.years).toBe(1);
    expect(total.months).toBe(0);
  });

  it('adds an ongoing posting to the vessel-type breakdown', () => {
    const [breakdown] = getVesselTypeBreakdown([
      { vesselType: 'LNG Tanker', joiningDate: daysAgo(200), tillDate: '' },
    ]);

    expect(breakdown.vesselType).toBe('LNG Tanker');
    expect(breakdown.totalMonths).toBeGreaterThan(0);
  });

  it('ignores an entry with no joining date, which says nothing about duration', () => {
    const total = calculateTotalSeaTime([{ vesselType: 'Tug', joiningDate: '', tillDate: '' }]);
    expect(total.totalMonths).toBe(0);
  });

  it('orders a current posting above older completed ones', () => {
    const ordered = sortSeaService([
      { role: 'Trainee', joiningDate: '2015-01-01', till: '2016-01-01' },
      { role: 'Third Engineer', joiningDate: '2024-06-01', till: '' },
      { role: 'Fourth Engineer', joiningDate: '2020-01-01', till: '2022-01-01' },
    ]);

    expect(ordered.map((e) => e.role)).toEqual([
      'Third Engineer',
      'Fourth Engineer',
      'Trainee',
    ]);
  });
});

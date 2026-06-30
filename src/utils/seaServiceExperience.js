const MS_PER_DAY = 1000 * 60 * 60 * 24;
const MS_PER_MONTH = 1000 * 60 * 60 * 24 * 30.44;
const DAYS_PER_YEAR = 365.25;
const DAYS_PER_MONTH = 30.44;

const GENERIC_VESSEL_TYPE_KEYS = new Set([
  'vessel',
  'none',
  'n/a',
  'na',
  'unknown',
  'other',
]);

const normalizeVesselTypeKey = (value) => {
  let key = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

  if (!key || GENERIC_VESSEL_TYPE_KEYS.has(key)) return '';

  const words = key.split(' ');
  const last = words[words.length - 1];

  if (last.endsWith('ies') && last.length > 4) {
    words[words.length - 1] = `${last.slice(0, -3)}y`;
  } else if (last.endsWith('es') && last.length > 3 && !last.endsWith('ss')) {
    words[words.length - 1] = last.slice(0, -2);
  } else if (last.endsWith('s') && last.length > 2 && !last.endsWith('ss')) {
    words[words.length - 1] = last.slice(0, -1);
  }

  return words.join(' ');
};

const displayVesselType = (value) => String(value || '').trim();

export const normalizeSeaServiceLog = (log = {}) => ({
  ...log,
  vesselType: log.vesselType || log.vessel_type || log.type || '',
  vesselName: log.vesselName || log.vessel_name || '',
  joiningDate: log.joiningDate || log.joining_date || log.signOn || '',
  tillDate: log.tillDate || log.till_date || log.till || log.signOff || '',
  role: log.role || '',
});

const resolveVesselTypeLabel = (log = {}) => {
  const vesselType = displayVesselType(log.vesselType || log.vessel_type || log.type);
  const vesselName = displayVesselType(log.vesselName || log.vessel_name);
  const typeKey = normalizeVesselTypeKey(vesselType);

  if (!typeKey) return '';

  if (vesselName && normalizeVesselTypeKey(vesselName) === typeKey) {
    return '';
  }

  return vesselType;
};

/** Returns raw decimal days between two dates (no rounding — accumulate then round once at the end). */
const diffDaysBetween = (joiningDate, tillDate) => {
  if (!joiningDate || !tillDate) return 0;
  const start = new Date(joiningDate);
  const end = new Date(tillDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0;
  return Math.max(0, (end.getTime() - start.getTime()) / MS_PER_DAY);
};

/** Convert total raw days to { years, months, days, totalMonths }. */
const totalDaysToYMD = (totalDays) => {
  const safe = Math.max(0, totalDays);
  const years = Math.floor(safe / DAYS_PER_YEAR);
  const remainingDays = safe - years * DAYS_PER_YEAR;
  const months = Math.floor(remainingDays / DAYS_PER_MONTH);
  const days = Math.round(remainingDays - months * DAYS_PER_MONTH);
  return { years, months, days, totalMonths: safe / DAYS_PER_MONTH };
};

/** Kept for any external callers — returns raw decimal months. */
export const diffMonthsBetween = (joiningDate, tillDate) => {
  return diffDaysBetween(joiningDate, tillDate) / DAYS_PER_MONTH;
};

/** Kept for backward compatibility. */
export const monthsToYearsAndMonths = (totalMonths) => {
  const safeTotal = Math.max(0, totalMonths);
  return {
    years: Math.floor(safeTotal / 12),
    months: safeTotal % 12,
    totalMonths: safeTotal,
  };
};

/** Format as "3 years 1 month 15 days", omitting zero parts. */
export const formatSeaServiceDurationCompact = (years, months, days = 0) => {
  const parts = [];
  if (years > 0) parts.push(`${years} year${years === 1 ? '' : 's'}`);
  if (months > 0) parts.push(`${months} month${months === 1 ? '' : 's'}`);
  if (days > 0) parts.push(`${days} day${days === 1 ? '' : 's'}`);
  return parts.join(' ') || '0 days';
};

export const formatSeaServiceDuration = (years, months) => {
  const parts = [];

  if (years > 0) {
    parts.push(`${years} year${years === 1 ? '' : 's'}`);
  }
  if (months > 0) {
    parts.push(`${months} month${months === 1 ? '' : 's'}`);
  }

  return parts.join(', ') || '0 months';
};

export const pluralizeVesselTypeDisplay = (label) => {
  const trimmed = displayVesselType(label);
  if (!trimmed) return '';

  const lower = trimmed.toLowerCase();
  if (lower.endsWith('s')) return trimmed;

  if (lower.endsWith('y') && !/[aeiou]y$/i.test(trimmed)) {
    return `${trimmed.slice(0, -1)}ies`;
  }

  return `${trimmed}s`;
};

export const calculateTotalSeaTime = (logs = []) => {
  const normalized = logs.map(normalizeSeaServiceLog);
  const totalRawDays = normalized.reduce(
    (sum, log) => sum + diffDaysBetween(log.joiningDate, log.tillDate),
    0,
  );
  return totalDaysToYMD(totalRawDays);
};

export const getVesselTypeBreakdown = (logs = []) => {
  const normalized = logs.map(normalizeSeaServiceLog);
  const vesselDays = new Map();

  normalized.forEach((log) => {
    const label = resolveVesselTypeLabel(log);
    const key = normalizeVesselTypeKey(label);
    if (!key) return;

    const days = diffDaysBetween(log.joiningDate, log.tillDate);
    if (days <= 0) return;

    const existing = vesselDays.get(key);
    if (existing) {
      existing.days += days;
      if (label.length > existing.label.length) {
        existing.label = label;
      }
      return;
    }

    vesselDays.set(key, { label, days });
  });

  return [...vesselDays.values()]
    .map(({ label, days }) => {
      const duration = totalDaysToYMD(days);
      return {
        vesselType: label,
        ...duration,
        label: formatSeaServiceDurationCompact(duration.years, duration.months, duration.days),
      };
    })
    .sort((a, b) => b.totalMonths - a.totalMonths);
};

export const buildSeaServiceExperience = (logs = []) => {
  const normalized = logs.map(normalizeSeaServiceLog);
  const total = calculateTotalSeaTime(normalized);
  const byVesselType = getVesselTypeBreakdown(normalized);
  const experienceLines = [];
  const totalCompact = formatSeaServiceDurationCompact(total.years, total.months, total.days);

  if (total.totalMonths > 0) {
    experienceLines.push(`${totalCompact} total sea service`);
  }

  byVesselType.forEach((entry) => {
    experienceLines.push(
      `${entry.label} on ${pluralizeVesselTypeDisplay(entry.vesselType)}`,
    );
  });

  if (normalized.length > 0) {
    const sorted = [...normalized].sort(
      (a, b) => new Date(a.joiningDate || 0).getTime() - new Date(b.joiningDate || 0).getTime(),
    );
    const lastRole = sorted[sorted.length - 1]?.role;

    if (lastRole) {
      experienceLines.push(`Current Rank: ${lastRole}`);
    }
  }

  return {
    total: {
      ...total,
      label: totalCompact,
    },
    byVesselType,
    experienceLines,
    uniqueVesselTypes: byVesselType.map((entry) => entry.vesselType),
  };
};

export const formatTotalSeaTimeLabel = (logs = []) => {
  const { total } = buildSeaServiceExperience(logs);
  if (total.totalMonths <= 0) return 'No sea service recorded';
  return `${total.label} sea time`;
};

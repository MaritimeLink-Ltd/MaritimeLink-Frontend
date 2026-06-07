const MS_PER_MONTH = 1000 * 60 * 60 * 24 * 30.44;

const normalizeVesselTypeKey = (value) =>
  String(value || '')
    .trim()
    .toLowerCase();

const displayVesselType = (value) =>
  String(value || '').trim();

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

  if (!vesselType) return '';
  if (vesselName && normalizeVesselTypeKey(vesselType) === normalizeVesselTypeKey(vesselName)) {
    return '';
  }

  return vesselType;
};

export const diffMonthsBetween = (joiningDate, tillDate) => {
  if (!joiningDate || !tillDate) return 0;

  const start = new Date(joiningDate);
  const end = new Date(tillDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return 0;
  }

  const diffTime = end.getTime() - start.getTime();
  return Math.max(0, Math.round(diffTime / MS_PER_MONTH));
};

export const monthsToYearsAndMonths = (totalMonths) => {
  const safeTotal = Math.max(0, totalMonths);
  return {
    years: Math.floor(safeTotal / 12),
    months: safeTotal % 12,
    totalMonths: safeTotal,
  };
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

export const calculateTotalSeaTime = (logs = []) => {
  const normalized = logs.map(normalizeSeaServiceLog);
  const totalMonths = normalized.reduce(
    (sum, log) => sum + diffMonthsBetween(log.joiningDate, log.tillDate),
    0,
  );

  return monthsToYearsAndMonths(totalMonths);
};

export const getVesselTypeBreakdown = (logs = []) => {
  const normalized = logs.map(normalizeSeaServiceLog);
  const vesselMonths = new Map();

  normalized.forEach((log) => {
    const label = resolveVesselTypeLabel(log);
    const key = normalizeVesselTypeKey(label);
    if (!key) return;

    const months = diffMonthsBetween(log.joiningDate, log.tillDate);
    if (months <= 0) return;

    const existing = vesselMonths.get(key);
    if (existing) {
      existing.months += months;
      return;
    }

    vesselMonths.set(key, { label, months });
  });

  return [...vesselMonths.values()]
    .map(({ label, months }) => {
      const duration = monthsToYearsAndMonths(months);
      return {
        vesselType: label,
        ...duration,
        label: formatSeaServiceDuration(duration.years, duration.months),
      };
    })
    .sort((a, b) => b.totalMonths - a.totalMonths);
};

export const buildSeaServiceExperience = (logs = []) => {
  const normalized = logs.map(normalizeSeaServiceLog);
  const total = calculateTotalSeaTime(normalized);
  const byVesselType = getVesselTypeBreakdown(normalized);
  const experienceLines = [];

  if (total.totalMonths > 0) {
    experienceLines.push(
      `Total Sea Time: ${formatSeaServiceDuration(total.years, total.months)}`,
    );
  }

  byVesselType.forEach((entry) => {
    experienceLines.push(`${entry.vesselType}: ${entry.label}`);
  });

  if (normalized.length > 0) {
    const sorted = [...normalized].sort(
      (a, b) => new Date(a.joiningDate || 0).getTime() - new Date(b.joiningDate || 0).getTime(),
    );
    const firstRole = sorted[0]?.role;
    const lastRole = sorted[sorted.length - 1]?.role;

    if (firstRole && lastRole && firstRole !== lastRole) {
      experienceLines.push(`Rank Progression: ${firstRole} to ${lastRole}`);
    } else if (lastRole) {
      experienceLines.push(`Current Rank: ${lastRole}`);
    }
  }

  return {
    total: {
      ...total,
      label: formatSeaServiceDuration(total.years, total.months),
    },
    byVesselType,
    experienceLines,
    uniqueVesselTypes: byVesselType.map((entry) => entry.vesselType),
  };
};

export const formatTotalSeaTimeLabel = (logs = []) => {
  const { total } = buildSeaServiceExperience(logs);
  if (total.totalMonths <= 0) return 'No sea service recorded';
  return `Total Sea Time: ${total.label}`;
};

/**
 * Normalize API / Zod validation errors into user-facing strings.
 */

const FIELD_LABELS = {
  summary: 'Professional summary',
  professionalSummary: 'Professional summary',
  firstName: 'First name',
  lastName: 'Last name',
  email: 'Email',
  emailAddress: 'Email',
  skillName: 'Skill',
};

function humanizeZodMessage(message) {
  if (!message || typeof message !== 'string') return '';

  const tooSmallMatch = message.match(/Too small: expected string to have >= (\d+) characters/i);
  if (tooSmallMatch) {
    return `Write at least ${tooSmallMatch[1]} characters`;
  }

  const tooBigMatch = message.match(/Too big: expected string to have <= (\d+) characters/i);
  if (tooBigMatch) {
    return `Use at most ${tooBigMatch[1]} characters`;
  }

  return message;
}

function fieldLabel(field) {
  if (!field) return '';
  if (FIELD_LABELS[field]) return FIELD_LABELS[field];
  return String(field)
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

function issueToMessage(issue) {
  if (!issue) return '';
  if (typeof issue === 'string') return issue;
  if (typeof issue !== 'object') return String(issue);

  const path = Array.isArray(issue.path) ? issue.path.filter(Boolean) : [];
  const field = path[path.length - 1];
  const label = fieldLabel(field);
  const isStringIssue = issue.type === 'string' || issue.origin === 'string';

  if (issue.code === 'too_small' && isStringIssue && issue.minimum != null) {
    if (field === 'summary' || field === 'professionalSummary') {
      return `Write at least ${issue.minimum} characters`;
    }
    return label
      ? `${label}: enter at least ${issue.minimum} characters`
      : `Enter at least ${issue.minimum} characters`;
  }

  if (issue.code === 'too_big' && isStringIssue && issue.maximum != null) {
    return label
      ? `${label}: use at most ${issue.maximum} characters`
      : `Use at most ${issue.maximum} characters`;
  }

  if (issue.code === 'invalid_type' && label) {
    return `${label} is invalid`;
  }

  if (issue.message) return humanizeZodMessage(issue.message);
  return '';
}

function issuesToMessage(issues) {
  if (!Array.isArray(issues) || issues.length === 0) return '';
  const messages = issues.map(issueToMessage).filter(Boolean);
  return [...new Set(messages)].join(' ');
}

function parseMaybeJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith('[')) return null;
  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function messageFromValue(message) {
  if (message == null) return '';
  if (typeof message === 'string') {
    const parsed = parseMaybeJsonArray(message);
    if (parsed) return issuesToMessage(parsed) || humanizeZodMessage(message);
    return humanizeZodMessage(message) || message;
  }
  if (Array.isArray(message)) return issuesToMessage(message);
  if (typeof message === 'object') return issueToMessage(message);
  return String(message);
}

/**
 * @param {unknown} data - Parsed API error body
 * @param {string} [fallback]
 * @returns {string}
 */
export function formatApiErrorPayload(data, fallback = 'An error occurred') {
  if (data == null) return fallback;

  if (typeof data === 'string') {
    return messageFromValue(data) || fallback;
  }

  if (Array.isArray(data)) {
    return issuesToMessage(data) || fallback;
  }

  if (typeof data === 'object') {
    for (const key of ['errors', 'details', 'validationErrors', 'issues']) {
      if (Array.isArray(data[key])) {
        const msg = issuesToMessage(data[key]);
        if (msg) return msg;
      }
    }

    const fromMessage = messageFromValue(data.message ?? data.error ?? data.msg);
    if (fromMessage) return fromMessage;
  }

  return fallback;
}

/**
 * @param {Error & { data?: unknown }} [error]
 * @param {string} [fallback]
 * @returns {string}
 */
export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;

  const fromData = error.data != null ? formatApiErrorPayload(error.data, '') : '';
  if (fromData) return fromData;

  const fromMessage = messageFromValue(error.message);
  if (fromMessage && fromMessage !== 'An error occurred') return fromMessage;

  return fallback;
}

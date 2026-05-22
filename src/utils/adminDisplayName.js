/**
 * Display labels for admin authors in notes, chat, and compliance UI.
 */

export function formatAdminNameFromEmail(email) {
  if (!email || typeof email !== 'string') return 'Admin';
  const local = email.split('@')[0] || email;
  const pretty = local
    .replace(/[._+-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
    .trim();
  return pretty || 'Admin';
}

/** e.g. "Umair (Admin)" — matches support chat labeling */
export function formatAdminChatDisplayName(admin) {
  const email = admin?.email;
  if (!email) return 'Support (Admin)';
  const name = formatAdminNameFromEmail(email);
  return name === 'Admin' ? 'Support (Admin)' : `${name} (Admin)`;
}

export function getAdminInitials(nameOrEmail) {
  const s = String(nameOrEmail || '').trim();
  if (!s) return 'AD';
  if (s.includes('@')) {
    return s
      .split('@')[0]
      .split(/[.\s_+-]+/)
      .filter(Boolean)
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  return s
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/** Normalize API note payloads (KYC, accounts, support) for UI lists */
export function mapAdminNoteFromApi(note, index = 0) {
  const email =
    note?.admin?.email ||
    note?.author?.email ||
    (typeof note?.author === 'string' && note.author.includes('@')
      ? note.author
      : null) ||
    note?.authorEmail ||
    null;
  const authorName =
    note?.author?.name ||
    (typeof note?.author === 'string' && !note.author.includes('@')
      ? note.author
      : null) ||
    formatAdminNameFromEmail(email);

  return {
    id: note?.id ?? index,
    content: (note?.content || note?.note || note?.text || '').trim(),
    authorName,
    authorEmail: email || '',
    initials: getAdminInitials(authorName || email),
    time: note?.createdAt ? new Date(note.createdAt).toLocaleString() : '',
  };
}

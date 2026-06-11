import countriesData from '../data/countires.json';

/** @type {{ name: string, code: string, emoji: string, image: string }[]} */
export const COUNTRIES = [...countriesData]
  .map(({ name, code, emoji, image }) => ({ name, code, emoji: emoji || '', image: image || '' }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const COUNTRY_NAMES = COUNTRIES.map((c) => c.name);

export function findCountryByName(name) {
  const value = String(name || '').trim();
  if (!value) return null;
  return COUNTRIES.find((c) => c.name === value) || null;
}

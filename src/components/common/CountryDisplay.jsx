import { findCountryByName } from '../../utils/countries';

/**
 * Displays a country name with its flag (SVG image from countires.json).
 * Falls back to plain text if the country can't be matched.
 */
export default function CountryDisplay({ name, fallback = 'N/A', className = '' }) {
  const value = String(name || '').trim();
  if (!value) return <>{fallback}</>;

  const country = findCountryByName(value);

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {country?.image && (
        <img
          src={country.image}
          alt=""
          className="w-4 h-3 object-cover rounded-sm shrink-0"
          loading="lazy"
        />
      )}
      <span>{value}</span>
    </span>
  );
}

import { COUNTRIES } from '../../utils/countries';

const DEFAULT_CLASS =
  'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors';

/**
 * Dropdown of countries from countires.json.
 * Compatible with standard form onChange handlers (e.target.name / e.target.value).
 */
export default function CountrySelect({
  id,
  name,
  value = '',
  onChange,
  className,
  placeholder = 'Select country',
  disabled = false,
  required = false,
  includeEmpty = true,
}) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      className={className || DEFAULT_CLASS}
    >
      {includeEmpty && <option value="">{placeholder}</option>}
      {COUNTRIES.map((country) => (
        <option key={country.code} value={country.name}>
          {country.emoji ? `${country.emoji} ` : ''}
          {country.name}
        </option>
      ))}
    </select>
  );
}

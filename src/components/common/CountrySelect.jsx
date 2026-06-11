import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { COUNTRIES, findCountryByName } from '../../utils/countries';

const DEFAULT_CLASS =
  'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors';

/**
 * Custom dropdown of countries from countires.json, showing each country's flag.
 * Native <select><option> elements can't render images, so this renders a
 * button + listbox instead while keeping the same onChange contract
 * (e.target.name / e.target.value) as a standard form control.
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
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const selectedCountry = findCountryByName(value);

  const handleSelect = (countryName) => {
    setOpen(false);
    onChange?.({ target: { name, value: countryName, type: 'select-one' } });
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        required={required}
        onClick={() => setOpen((prev) => !prev)}
        className={`${className || DEFAULT_CLASS} flex items-center justify-between gap-2 text-left`}
      >
        <span className="flex items-center gap-2 min-w-0">
          {selectedCountry?.image && (
            <img
              src={selectedCountry.image}
              alt=""
              className="w-4 h-3 object-cover rounded-sm shrink-0"
            />
          )}
          <span className={`truncate ${value ? '' : 'text-gray-400'}`}>
            {value || placeholder}
          </span>
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg py-1"
        >
          {includeEmpty && (
            <li
              role="option"
              aria-selected={!value}
              onClick={() => handleSelect('')}
              className="px-3 py-2 text-sm text-gray-400 hover:bg-gray-50 cursor-pointer"
            >
              {placeholder}
            </li>
          )}
          {COUNTRIES.map((country) => (
            <li
              key={country.code}
              role="option"
              aria-selected={value === country.name}
              onClick={() => handleSelect(country.name)}
              className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${
                value === country.name ? 'bg-gray-100 font-medium' : ''
              }`}
            >
              {country.image && (
                <img
                  src={country.image}
                  alt=""
                  className="w-4 h-3 object-cover rounded-sm shrink-0"
                  loading="lazy"
                />
              )}
              <span>{country.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

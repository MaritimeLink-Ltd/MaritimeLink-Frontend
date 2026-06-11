import { useEffect, useRef, useState } from 'react';
import { COUNTRIES } from '../../utils/countries';

const MAX_SUGGESTIONS = 8;

/**
 * Plain text input for location search that also suggests matching
 * countries (with flags) from countires.json as the user types.
 * Keeps the same value/onChange contract as a normal text input so it
 * can drop into existing layouts without affecting other styling.
 */
export default function LocationAutocomplete({
  id,
  name,
  value = '',
  onChange,
  className,
  placeholder = 'Location',
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

  const query = String(value || '').trim().toLowerCase();
  const suggestions = query
    ? COUNTRIES.filter((country) => country.name.toLowerCase().includes(query)).slice(0, MAX_SUGGESTIONS)
    : [];

  const handleSelect = (countryName) => {
    setOpen(false);
    onChange?.({ target: { name, value: countryName, type: 'text' } });
  };

  return (
    <div ref={containerRef} className="contents">
      <input
        id={id}
        name={name}
        type="text"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange?.(e);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className={className}
      />

      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1 z-50 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg py-1"
        >
          {suggestions.map((country) => (
            <li
              key={country.code}
              role="option"
              aria-selected={value === country.name}
              onClick={() => handleSelect(country.name)}
              className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
            >
              {country.image && (
                <img
                  src={country.image}
                  alt=""
                  className="w-4 h-3 object-cover rounded-sm shrink-0"
                  loading="lazy"
                />
              )}
              <span className="truncate">{country.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

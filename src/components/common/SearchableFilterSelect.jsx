import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

/**
 * Filter dropdown with inline search (for long option lists e.g. countries).
 */
export default function SearchableFilterSelect({
    label,
    value,
    onChange,
    options = [],
    placeholder = 'Search...',
    minWidth = 'min-w-[180px]',
}) {
    const id = `filter-${String(label || 'select').toLowerCase().replace(/\s+/g, '-')}`;
    const containerRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');

    const selectedLabel =
        options.find((opt) => opt.value === value)?.label || options[0]?.label || 'Select';

    const filteredOptions = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return options;
        return options.filter(
            (opt) => opt.value === 'all' || String(opt.label || '').toLowerCase().includes(q),
        );
    }, [options, query]);

    useEffect(() => {
        if (!open) return undefined;

        const handlePointerDown = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        return () => document.removeEventListener('mousedown', handlePointerDown);
    }, [open]);

    const handleSelect = (nextValue) => {
        onChange(nextValue);
        setOpen(false);
        setQuery('');
    };

    return (
        <div ref={containerRef} className={`flex flex-col gap-1 relative ${minWidth}`}>
            <label
                htmlFor={id}
                className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider cursor-pointer"
            >
                {label}
            </label>
            <button
                id={id}
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between gap-2 pl-3 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#003971]/15 focus:border-[#003971] cursor-pointer ${minWidth}`}
                aria-expanded={open}
                aria-haspopup="listbox"
            >
                <span className="truncate text-left">{selectedLabel}</span>
                <ChevronDown
                    className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                    aria-hidden
                />
            </button>

            {open && (
                <div
                    className="absolute left-0 top-full z-50 mt-1 w-full min-w-[240px] bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
                    role="listbox"
                >
                    <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={placeholder}
                                className="w-full pl-8 pr-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971]/15 focus:border-[#003971]"
                                autoFocus
                            />
                        </div>
                    </div>
                    <ul className="max-h-56 overflow-y-auto py-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <li key={opt.value}>
                                    <button
                                        type="button"
                                        role="option"
                                        aria-selected={value === opt.value}
                                        onClick={() => handleSelect(opt.value)}
                                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                                            value === opt.value
                                                ? 'bg-[#003971]/5 text-[#003971] font-semibold'
                                                : 'text-gray-700'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                </li>
                            ))
                        ) : (
                            <li className="px-3 py-3 text-sm text-gray-500 text-center">No matches</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

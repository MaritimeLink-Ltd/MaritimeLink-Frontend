import { useState, useRef, useEffect } from 'react';
import { FiShare2, FiDownload, FiChevronDown } from 'react-icons/fi';
import { Crown } from 'lucide-react';

/**
 * Combined Share / Download PDF control for resume pages.
 */
export default function ResumeExportMenu({ onShare, onDownload }) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;

        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    const runAction = (action) => {
        setOpen(false);
        action();
    };

    return (
        <div ref={menuRef} className="relative" data-html2canvas-ignore="true">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                aria-expanded={open}
                aria-haspopup="menu"
                className="hidden sm:flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#152b47] transition-colors shadow-sm min-h-[44px]"
            >
                <FiDownload size={16} />
                <span className="font-medium text-sm">Export Resume</span>
                <FiChevronDown
                    size={16}
                    className={`transition-transform ${open ? 'rotate-180' : ''}`}
                />
            </button>

            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                aria-expanded={open}
                aria-haspopup="menu"
                className="sm:hidden p-2.5 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#152b47] transition-colors shadow-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
                <FiDownload size={18} />
            </button>

            {open && (
                <div
                    role="menu"
                    className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                >
                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => runAction(onShare)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50 transition-colors text-left"
                    >
                        <Crown size={14} className="text-yellow-500 shrink-0" />
                        <FiShare2 size={16} className="text-[#1E3A5F] shrink-0" />
                        Share Resume
                    </button>
                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => runAction(onDownload)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50 transition-colors text-left"
                    >
                        <Crown size={14} className="text-yellow-500 shrink-0" />
                        <FiDownload size={16} className="text-[#1E3A5F] shrink-0" />
                        Download PDF
                    </button>
                </div>
            )}
        </div>
    );
}

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import ModalOverlay from '../common/ModalOverlay';
import TermsContent from './TermsContent';

const SCROLL_BOTTOM_THRESHOLD = 16;

/**
 * "I agree to the Terms & Conditions" checkbox.
 * The checkbox stays disabled until the user opens the Terms & Conditions
 * modal and scrolls through the full content at least once.
 */
export default function TermsAgreementField({
    id = 'terms',
    name = 'terms',
    required = true,
    checked,
    onChange,
}) {
    const [showModal, setShowModal] = useState(false);
    const [hasReadTerms, setHasReadTerms] = useState(false);
    const contentRef = useRef(null);

    const checkScrolledToBottom = () => {
        const el = contentRef.current;
        if (!el) return;
        const reachedBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= SCROLL_BOTTOM_THRESHOLD;
        if (reachedBottom) setHasReadTerms(true);
    };

    useEffect(() => {
        if (!showModal) return undefined;
        const frame = requestAnimationFrame(checkScrolledToBottom);
        return () => cancelAnimationFrame(frame);
    }, [showModal]);

    const inputProps = {
        id,
        name,
        type: 'checkbox',
        required,
        disabled: !hasReadTerms,
        className: 'h-4 w-4 mt-1 text-[#003971] focus:ring-[#003971] border-gray-300 rounded disabled:opacity-60 disabled:cursor-not-allowed',
    };
    if (checked !== undefined) inputProps.checked = checked;
    if (onChange) inputProps.onChange = onChange;

    return (
        <div>
            <div className="flex items-start">
                <input {...inputProps} />
                <label htmlFor={id} className="ml-2 block text-sm text-gray-600">
                    You agree to our{' '}
                    <button
                        type="button"
                        onClick={() => setShowModal(true)}
                        className="text-[#003971] hover:underline font-medium"
                    >
                        Terms & Conditions
                    </button>
                </label>
            </div>
            {!hasReadTerms && (
                <p className="mt-1 ml-6 text-xs text-gray-400">
                    Please open and read the Terms & Conditions to enable this checkbox.
                </p>
            )}

            <ModalOverlay isOpen={showModal} onClose={() => setShowModal(false)} className="max-w-2xl">
                <div className="bg-white rounded-2xl shadow-xl flex flex-col max-h-[85vh]">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900">Terms & Conditions</h2>
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="text-gray-400 hover:text-gray-600"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div
                        ref={contentRef}
                        onScroll={checkScrolledToBottom}
                        className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5"
                    >
                        <TermsContent />
                    </div>
                    <div className="px-5 py-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            disabled={!hasReadTerms}
                            className="w-full bg-[#003971] text-white py-2.5 px-4 rounded-md hover:bg-[#002855] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {hasReadTerms ? 'Done' : 'Scroll to read all terms'}
                        </button>
                    </div>
                </div>
            </ModalOverlay>
        </div>
    );
}

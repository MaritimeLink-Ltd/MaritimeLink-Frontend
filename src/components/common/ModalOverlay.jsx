import { useEffect } from 'react';
import { createPortal } from 'react-dom';

const DEFAULT_Z_INDEX = 10000;

function getPortalRoot() {
    if (typeof document === 'undefined') return null;
    let root = document.getElementById('modal-portal');
    if (!root) {
        root = document.createElement('div');
        root.id = 'modal-portal';
        document.body.appendChild(root);
    }
    return root;
}

/**
 * Full-viewport modal backdrop rendered via portal on document.body.
 * Fixes clipped or partial overlays when modals live inside scrollable dashboard layouts.
 */
export default function ModalOverlay({
    isOpen,
    onClose,
    children,
    className = '',
    overlayClassName = '',
    closeOnBackdrop = true,
    zIndex = DEFAULT_Z_INDEX,
}) {
    useEffect(() => {
        if (!isOpen) return undefined;

        const previousBodyOverflow = document.body.style.overflow;
        const previousHtmlOverflow = document.documentElement.style.overflow;
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousBodyOverflow;
            document.documentElement.style.overflow = previousHtmlOverflow;
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const portalRoot = getPortalRoot();
    if (!portalRoot) return null;

    const handleBackdropMouseDown = (e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
            onClose?.();
        }
    };

    return createPortal(
        <div
            className={`fixed inset-0 ${overlayClassName}`}
            style={{
                zIndex,
                width: '100vw',
                height: '100dvh',
                minHeight: '100vh',
            }}
            role="presentation"
        >
            <div
                className="absolute inset-0 bg-black/60"
                aria-hidden="true"
                onMouseDown={handleBackdropMouseDown}
            />
            <div
                className="relative z-[1] flex min-h-full w-full items-center justify-center overflow-y-auto p-4"
                onMouseDown={handleBackdropMouseDown}
            >
                <div
                    className={`relative mx-auto w-full ${className || 'max-w-lg'}`.trim()}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    {children}
                </div>
            </div>
        </div>,
        portalRoot,
    );
}

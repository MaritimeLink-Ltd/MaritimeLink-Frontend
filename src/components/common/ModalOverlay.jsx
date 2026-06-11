import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { lockBodyScroll, unlockBodyScroll } from '../../utils/bodyScrollLock';

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
 * Portaling avoids white gaps when parent layouts use overflow:hidden.
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

        lockBodyScroll();

        return () => {
            unlockBodyScroll();
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
            className={`fixed top-0 left-0 w-full h-full ${overlayClassName}`.trim()}
            style={{
                zIndex,
                margin: 0,
                padding: 0,
            }}
            role="presentation"
        >
            <div
                className="absolute top-0 left-0 w-full h-full bg-black/60"
                aria-hidden="true"
                onMouseDown={handleBackdropMouseDown}
            />
            <div
                className="absolute top-0 left-0 z-[1] flex h-full w-full items-center justify-center overflow-y-auto overscroll-contain p-4"
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

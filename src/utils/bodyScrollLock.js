let lockCount = 0;
let savedScrollY = 0;
/** @type {Record<string, string> | null} */
let savedBodyStyles = null;

/**
 * Prevents background scroll without the white gap at the top of the viewport.
 * Uses position:fixed on body (reference: modal scroll-lock pattern).
 */
export function lockBodyScroll() {
    if (typeof document === 'undefined') return;

    lockCount += 1;
    if (lockCount > 1) return;

    savedScrollY = window.scrollY || window.pageYOffset || 0;
    savedBodyStyles = {
        position: document.body.style.position,
        top: document.body.style.top,
        left: document.body.style.left,
        right: document.body.style.right,
        width: document.body.style.width,
        overflow: document.body.style.overflow,
        paddingRight: document.body.style.paddingRight,
    };

    const scrollbarWidth = Math.max(
        0,
        window.innerWidth - document.documentElement.clientWidth,
    );

    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    document.documentElement.style.overflow = 'hidden';
}

export function unlockBodyScroll() {
    if (typeof document === 'undefined') return;

    lockCount = Math.max(0, lockCount - 1);
    if (lockCount > 0 || !savedBodyStyles) return;

    document.body.style.position = savedBodyStyles.position;
    document.body.style.top = savedBodyStyles.top;
    document.body.style.left = savedBodyStyles.left;
    document.body.style.right = savedBodyStyles.right;
    document.body.style.width = savedBodyStyles.width;
    document.body.style.overflow = savedBodyStyles.overflow;
    document.body.style.paddingRight = savedBodyStyles.paddingRight;
    document.documentElement.style.overflow = '';

    window.scrollTo(0, savedScrollY);
    savedBodyStyles = null;
}

import { useEffect, useState } from 'react';
import { faviconUrl, resolveCompanyLogoUrl } from '../../utils/companyLogo';

/**
 * Company logo with favicon and initial fallbacks when the primary image fails to load.
 */
export default function CompanyLogo({
    logo,
    website,
    companyName = 'Company',
    className = 'block w-auto h-auto max-w-full max-h-[56px] object-contain',
    initialClassName = 'w-16 h-16 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-2xl font-bold text-[#003971]',
}) {
    const primarySrc = resolveCompanyLogoUrl(logo, website);
    const fallbackSrc = faviconUrl(website);
    const [src, setSrc] = useState(primarySrc);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        setSrc(resolveCompanyLogoUrl(logo, website));
        setFailed(false);
    }, [logo, website]);

    const handleError = () => {
        if (failed) return;
        if (fallbackSrc && src !== fallbackSrc) {
            setSrc(fallbackSrc);
            return;
        }
        setFailed(true);
    };

    if (failed || !src) {
        return (
            <div className={initialClassName}>
                {(companyName || 'C').charAt(0).toUpperCase()}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={`${companyName} logo`}
            className={className}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={handleError}
        />
    );
}

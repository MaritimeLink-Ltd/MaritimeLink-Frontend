import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { hasAcceptedTermsLocally } from '../utils/termsAcceptance';

export function useTermsAcceptance({ enabled = true } = {}) {
    const navigate = useNavigate();
    const location = useLocation();
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        if (!enabled) {
            setStatus('accepted');
            return undefined;
        }

        if (location.pathname === '/accept-terms') {
            setStatus('accepted');
            return undefined;
        }

        if (hasAcceptedTermsLocally()) {
            setStatus('accepted');
            return undefined;
        }

        setStatus('pending');
        navigate('/accept-terms', {
            replace: true,
            state: {
                returnTo: `${location.pathname}${location.search}`,
            },
        });

        return undefined;
    }, [enabled, location.pathname, location.search, navigate]);

    return status;
}

export default useTermsAcceptance;

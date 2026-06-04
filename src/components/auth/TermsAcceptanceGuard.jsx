import { Loader2 } from 'lucide-react';
import useTermsAcceptance from '../../hooks/useTermsAcceptance';

function TermsAcceptanceGuard({ children, enabled = true }) {
    const status = useTermsAcceptance({ enabled });

    if (!enabled || status === 'accepted') {
        return children;
    }

    return (
        <div className="min-h-[50vh] flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center text-gray-500">
                <Loader2 size={32} className="animate-spin text-[#003971] mb-3" />
                <p className="text-sm">Loading...</p>
            </div>
        </div>
    );
}

export default TermsAcceptanceGuard;

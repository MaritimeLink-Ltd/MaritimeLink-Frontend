import { Crown, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ModalOverlay from '../common/ModalOverlay';

/**
 * Shared paywall dialog for Recruiter feature gates (Free/Flex/Premium).
 * Replaces per-page copy-pasted "Premium Feature" modals.
 */
function RecruiterUpgradeModal({ isOpen, onClose, featureLabel, jobId }) {
    const navigate = useNavigate();

    const handleUpgrade = () => {
        onClose?.();
        navigate('/recruiter/manage-subscription', { state: { jobId } });
    };

    return (
        <ModalOverlay isOpen={isOpen} onClose={onClose} className="max-w-md">
            <div className="bg-white rounded-2xl p-6 sm:p-8 w-full relative shadow-2xl text-center">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="mb-6 flex justify-center">
                    <div className="w-16 h-16 bg-[#003366] rounded-full flex items-center justify-center">
                        <Crown size={32} className="text-yellow-400 fill-yellow-400" />
                    </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">Upgrade Required</h3>
                <p className="text-gray-500 mb-8 text-sm sm:text-base">
                    {featureLabel
                        ? `${featureLabel} requires a Flex or Premium Recruiter plan.`
                        : 'This feature requires a Flex or Premium Recruiter plan.'}
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={handleUpgrade}
                        className="w-full bg-[#003366] text-white py-3.5 px-4 rounded-xl hover:bg-blue-900 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
                    >
                        <Crown size={20} />
                        View Plans
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full text-gray-500 hover:text-gray-700 py-3.5 px-4 rounded-xl font-medium transition-colors border border-gray-200 hover:bg-gray-50 bg-white"
                    >
                        Not Now
                    </button>
                </div>
            </div>
        </ModalOverlay>
    );
}

export default RecruiterUpgradeModal;

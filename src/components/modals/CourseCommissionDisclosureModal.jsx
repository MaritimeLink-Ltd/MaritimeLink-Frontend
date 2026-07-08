import { Percent } from 'lucide-react';
import ModalOverlay from '../common/ModalOverlay';

function CourseCommissionDisclosureModal({ isOpen, onConfirm, onCancel }) {
    return (
        <ModalOverlay isOpen={isOpen} onClose={onCancel} className="max-w-lg">
            <div className="bg-white rounded-2xl p-6 sm:p-8 w-full shadow-xl">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                        <Percent className="h-8 w-8 text-[#003971]" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
                    Before you publish
                </h2>

                <p className="text-center text-gray-600 mb-8">
                    MaritimeLink takes a <strong>12% commission</strong> on internal training bookings
                    made through the platform — you keep the remaining <strong>88%</strong>.
                </p>

                <div className="space-y-3">
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="w-full bg-[#003971] text-white py-3 rounded-xl font-bold hover:bg-[#002855] transition-colors"
                    >
                        I Understand, Publish Course
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full text-gray-600 font-medium hover:text-gray-900 transition-colors py-2"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </ModalOverlay>
    );
}

export default CourseCommissionDisclosureModal;

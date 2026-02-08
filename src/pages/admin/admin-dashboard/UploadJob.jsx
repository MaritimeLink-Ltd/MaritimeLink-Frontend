import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, X } from 'lucide-react';

function UploadJob({ onBack: onBackProp }) {
    const navigate = useNavigate();
    const location = useLocation();
    const editData = location.state?.jobData;
    const isEditMode = location.state?.isEdit || false;
    const dashboardType = location.state?.dashboardType || 'recruiter'; // 'admin' or 'recruiter'

    const returnPath = location.state?.returnPath;

    const [step, setStep] = useState(1);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [formData, setFormData] = useState({
        jobTitle: '',
        location: '',
        category: 'Officer',
        contractType: 'Temporary',
        salary: '',
        description: ''
    });

    useEffect(() => {
        if (isEditMode && editData) {
            setFormData({
                jobTitle: editData.jobTitle || editData.title || '',
                location: editData.location || '',
                category: editData.category || 'Officer',
                contractType: editData.contractType || editData.type || 'Temporary',
                salary: editData.salary || '',
                description: editData.description || ''
            });
        }
    }, [isEditMode, editData]);

    const categories = ['Officer', 'Ratings & Crew', 'Catering & Medical'];
    const contractTypes = ['Temporary', 'Contract', 'Permanent'];

    const handleNext = () => {
        setStep(2);
    };

    const handleBack = () => {
        if (step === 1) {
            if (onBackProp) {
                // If onBack callback is provided, use it (for inline rendering)
                onBackProp();
            } else {
                // Navigate back to previous page in history
                navigate(-1);
            }
        } else {
            setStep(1);
        }
    };

    const handlePublish = () => {
        console.log('Publishing job:', formData);
        // Show success modal
        setShowSuccessModal(true);
    };

    const handleCloseModal = () => {
        setShowSuccessModal(false);
        // Navigate back to previous page in history
        navigate(-1);
    };

    return (
        <div className="max-w-7xl py-3 px-6">
            {/* Header */}
            <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 text-sm font-medium"
            >
                <ArrowLeft className="h-4 w-4" />
                Back
            </button>

            <div className="mb-4">
                <h1 className="text-[24px] font-bold text-gray-900 mb-1">{isEditMode ? 'Edit Job' : 'Create a Job'}</h1>
                <p className="text-gray-500 text-sm">{isEditMode ? 'Update your job listing details' : 'Post a new job listing to the marketplace'}</p>
            </div>

            {/* Form Card */}
            <div className={`${step === 1 ? "max-w-xl" : "max-w-2xl"} mx-auto`}>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    {step === 1 ? (
                        <div className="space-y-3">
                            {/* Job Title */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                                    Job Title
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter your job title"
                                    value={formData.jobTitle}
                                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f]"
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter your location"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f]"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                                    Category
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => setFormData({ ...formData, category })}
                                            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${formData.category === category
                                                ? 'bg-[#1e5a8f] text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Contract Type */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                                    Contract Type
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {contractTypes.map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setFormData({ ...formData, contractType: type })}
                                            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${formData.contractType === type
                                                ? 'bg-[#1e5a8f] text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Salary */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                                    Salary
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter salary"
                                    value={formData.salary}
                                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f]"
                                />
                            </div>

                            {/* Next Button */}
                            <button
                                onClick={handleNext}
                                className="w-full bg-[#1e5a8f] text-white py-2.5 rounded-xl font-bold text-sm hover:bg-[#164a7a] transition-colors shadow-sm mt-2"
                            >
                                Next
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Job Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                                    Enter job description
                                </label>
                                <textarea
                                    placeholder="Enter your job title"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={10}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f] resize-none"
                                />
                            </div>

                            {/* Publish Button */}
                            <button
                                onClick={handlePublish}
                                className="w-full bg-[#1e5a8f] text-white py-2.5 rounded-xl font-bold text-sm hover:bg-[#164a7a] transition-colors shadow-sm"
                            >
                                {isEditMode ? 'Update Job' : 'Publish Job'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 relative animate-[scale-in_0.2s_ease-out]">
                        {/* Success Icon */}
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle className="h-12 w-12 text-green-600" />
                            </div>

                            {/* Title */}
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                {isEditMode ? 'Job Updated Successfully!' : 'Job Created Successfully!'}
                            </h2>

                            {/* Message */}
                            <p className="text-gray-600 mb-8">
                                {isEditMode ? 'Your job listing has been updated.' : 'Your job listing has been published to the marketplace.'}
                            </p>

                            {/* Action Button */}
                            <button
                                onClick={handleCloseModal}
                                className="w-full bg-[#1e5a8f] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#164a7a] transition-colors"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UploadJob;

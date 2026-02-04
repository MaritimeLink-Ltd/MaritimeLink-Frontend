import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function UploadJob({ onBack: onBackProp }) {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        jobTitle: '',
        location: '',
        category: 'Officer',
        contractType: 'Temporary',
        salary: '',
        description: ''
    });

    const categories = ['Officer', 'Ratings & Crew', 'Catering & Medical'];
    const contractTypes = ['Temporary', 'Contract', 'Permanent'];

    const handleNext = () => {
        setStep(2);
    };

    const handleBack = () => {
        if (step === 1) {
            if (onBackProp) {
                onBackProp();
            } else {
                navigate('/admin-dashboard');
            }
        } else {
            setStep(1);
        }
    };

    const handlePublish = () => {
        console.log('Publishing job:', formData);
        // Handle job publication
        if (onBackProp) {
            onBackProp();
        } else {
            navigate('/admin-dashboard');
        }
    };

    return (
        <div className="max-w-7xl py-6">
            {/* Header */}
            <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm font-medium"
            >
                <ArrowLeft className="h-4 w-4" />
                Back
            </button>

            <div className="mb-6">
                <h1 className="text-[28px] font-bold text-gray-900 mb-1">Create a Job</h1>
                <p className="text-gray-500 text-sm">Post a new job listing to the marketplace</p>
            </div>

            {/* Form Card */}
            <div className={`${step === 1 ? "max-w-xl" : "max-w-2xl"} mx-auto`}>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    {step === 1 ? (
                        <div className="space-y-5">
                            {/* Job Title */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Job Title
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter your job title"
                                    value={formData.jobTitle}
                                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f]"
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter your location"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f]"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
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
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
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
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Salary
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter salary"
                                    value={formData.salary}
                                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f]"
                                />
                            </div>

                            {/* Next Button */}
                            <button
                                onClick={handleNext}
                                className="w-full bg-[#1e5a8f] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#164a7a] transition-colors shadow-sm mt-3"
                            >
                                Next
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {/* Job Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Enter job description
                                </label>
                                <textarea
                                    placeholder="Enter your job title"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={12}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f] resize-none"
                                />
                            </div>

                            {/* Publish Button */}
                            <button
                                onClick={handlePublish}
                                className="w-full bg-[#1e5a8f] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#164a7a] transition-colors shadow-sm"
                            >
                                Publish Job
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UploadJob;

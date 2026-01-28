import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function CreateCourse() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        courseTitle: '',
        location: '',
        category: 'STCW',
        certificationType: 'Mandatory',
        description: ''
    });

    const categories = ['STCW', 'Option 2', 'Option 3'];
    const certificationTypes = ['Mandatory', 'Optional'];

    const handleNext = () => {
        setStep(2);
    };

    const handleBack = () => {
        if (step === 1) {
            navigate('/admin-dashboard');
        } else {
            setStep(1);
        }
    };

    const handlePublish = () => {
        console.log('Publishing course:', formData);
        navigate('/admin-dashboard');
    };

    return (
        <div className="max-w-7xl py-6 mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`${step === 1 ? "max-w-xl" : "max-w-2xl"} mx-auto`}>
                {/* Header */}
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm font-medium transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>

                <div className="mb-6 text-left">
                    <h1 className="text-[28px] font-bold text-gray-900 mb-1">Create a Course</h1>
                    <p className="text-gray-500 text-sm">Post a new course listing to the marketplace</p>
                </div>
            </div>

            {/* Form Card */}
            <div className={`${step === 1 ? "max-w-xl" : "max-w-2xl"} mx-auto`}>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    {step === 1 ? (
                        <div className="space-y-5">
                            {/* Course Title */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Course Title
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter your job title"
                                    value={formData.courseTitle}
                                    onChange={(e) => setFormData({ ...formData, courseTitle: e.target.value })}
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

                            {/* Certification Type */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Certification Type
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {certificationTypes.map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setFormData({ ...formData, certificationType: type })}
                                            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${formData.certificationType === type
                                                ? 'bg-[#1e5a8f] text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
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
                            {/* Course Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Enter course description
                                </label>
                                <textarea
                                    placeholder="Enter your course title"
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

export default CreateCourse;

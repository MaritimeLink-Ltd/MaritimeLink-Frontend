import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, CheckCircle } from 'lucide-react';

export default function EditCourse() {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const [step, setStep] = useState(1);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [form, setForm] = useState({
        title: '',
        location: '',
        category: 'STCW',
        certification: 'Mandatory',
        fee: '',
        description: ''
    });

    // Mock course data - in real app, fetch from API based on courseId
    useEffect(() => {
        // Simulate API call to fetch course data
        const mockCourseData = {
            'STCW-BST-001': {
                title: 'STCW Basic Safety Training',
                location: 'Aberdeen, UK',
                category: 'STCW',
                certification: 'Mandatory',
                fee: '450',
                description: 'This comprehensive 5-day course covers all aspects of basic safety training as required by the STCW Convention. Topics include personal survival techniques, fire prevention and firefighting, elementary first aid, and personal safety and social responsibilities.'
            },
            '000001': {
                title: 'STCW Basic Safety',
                location: 'Aberdeen, UK',
                category: 'STCW',
                certification: 'Mandatory',
                fee: '450',
                description: 'Basic safety training course covering all STCW requirements.'
            },
            '000002': {
                title: 'Advanced Firefighting',
                location: 'London, UK',
                category: 'STCW',
                certification: 'Mandatory',
                fee: '650',
                description: 'Advanced firefighting techniques and fire team management.'
            },
            '000003': {
                title: 'Fast Rescue Boat Operator',
                location: 'Southampton, UK',
                category: 'STCW',
                certification: 'Mandatory',
                fee: '550',
                description: 'Training for fast rescue boat operations and crew management.'
            }
        };

        // Simulate loading
        setTimeout(() => {
            const courseData = mockCourseData[courseId] || mockCourseData['STCW-BST-001'];
            setForm(courseData);
            setIsLoading(false);
        }, 500);
    }, [courseId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdate = () => {
        setShowSuccessModal(true);
        // Auto redirect to courses page after 2 seconds
        setTimeout(() => {
            navigate('/trainingprovider/courses');
        }, 2000);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-transparent p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-[#003971] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading course data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to Course
                    </button>
                    <h1 className="text-[28px] font-bold text-gray-900 mb-2">Edit Course</h1>
                    <p className="text-gray-500 text-sm">Update your course listing details</p>
                </div>

                {/* Main Form Card */}
                <div className="bg-white rounded-[20px] p-8 shadow-sm border border-gray-100 min-h-[600px] flex flex-col relative">
                    {step === 1 ? (
                        <div className="flex flex-col h-full">
                            <div className="space-y-6 flex-1">
                                {/* Course Title */}
                                <div>
                                    <label className="block text-gray-900 font-medium mb-2 text-base">Course Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        placeholder="Enter your course title"
                                        value={form.title}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent placeholder-gray-400"
                                    />
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="block text-gray-900 font-medium mb-2 text-base">Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        placeholder="Enter your location"
                                        value={form.location}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent placeholder-gray-400"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-gray-900 font-medium mb-3 text-base">Category</label>
                                    <div className="flex flex-wrap gap-3">
                                        {['STCW', 'Option 2', 'Option 3'].map((cat) => (
                                            <button
                                                type="button"
                                                key={cat}
                                                className={`px-6 py-2 rounded-full font-medium text-sm transition-all border ${form.category === cat
                                                    ? 'bg-[#003971] text-white border-[#003971] shadow-sm'
                                                    : 'bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100'
                                                    }`}
                                                onClick={() => setForm((prev) => ({ ...prev, category: cat }))}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Certification Type */}
                                <div>
                                    <label className="block text-gray-900 font-medium mb-3 text-base">Certification Type</label>
                                    <div className="flex flex-wrap gap-3">
                                        {['Mandatory', 'Optional'].map((type) => (
                                            <button
                                                type="button"
                                                key={type}
                                                className={`px-6 py-2 rounded-full font-medium text-sm transition-all border ${form.certification === type
                                                    ? 'bg-[#003971] text-white border-[#003971] shadow-sm'
                                                    : 'bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100'
                                                    }`}
                                                onClick={() => setForm((prev) => ({ ...prev, certification: type }))}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Course Fee */}
                                <div>
                                    <label className="block text-gray-900 font-medium mb-2 text-base">Course Fee</label>
                                    <input
                                        type="text"
                                        name="fee"
                                        placeholder="Enter your course fee"
                                        value={form.fee}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            {/* Next Button */}
                            <div className="pt-6 mt-auto">
                                <button
                                    type="button"
                                    className="w-full py-3.5 rounded-lg bg-[#003971] text-white font-bold text-base hover:bg-[#002855] transition-all shadow-sm"
                                    onClick={() => setStep(2)}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full">
                            <div className="space-y-6 flex-1">
                                {/* Description */}
                                <div className="flex-1 flex flex-col h-full">
                                    <label className="block text-gray-900 font-medium mb-3 text-base">Enter course description</label>
                                    <textarea
                                        name="description"
                                        placeholder="Enter your course description"
                                        value={form.description}
                                        onChange={handleChange}
                                        className="w-full flex-1 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent resize-none placeholder-gray-400 min-h-[300px]"
                                    />
                                </div>
                            </div>

                            {/* Button Row */}
                            <div className="pt-6 mt-auto flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-3.5 rounded-lg border border-gray-300 text-gray-700 font-bold text-base hover:bg-gray-50 transition-all"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={handleUpdate}
                                    className="flex-1 py-3.5 rounded-lg bg-[#003971] text-white font-bold text-base hover:bg-[#002855] transition-all shadow-sm"
                                >
                                    Update Course
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Course Updated Successfully!</h3>
                            <p className="text-sm text-gray-500">
                                Your course "{form.title}" has been updated successfully.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

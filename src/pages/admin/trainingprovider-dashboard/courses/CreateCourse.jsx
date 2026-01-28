import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function CreateCourse() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        title: '',
        location: '',
        category: 'STCW',
        certification: 'Mandatory',
        fee: '',
        description: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

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
                        Back to Dashboard
                    </button>
                    <h1 className="text-[28px] font-bold text-gray-900 mb-2">Create a Course</h1>
                    <p className="text-gray-500 text-sm">Post a new course listing to the marketplace</p>
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
                                        placeholder="Enter your job title"
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

                            {/* Publish Button */}
                            <div className="pt-6 mt-auto">
                                <button
                                    type="submit"
                                    className="w-full py-3.5 rounded-lg bg-[#003971] text-white font-bold text-base hover:bg-[#002855] transition-all shadow-sm"
                                >
                                    Publish Job
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

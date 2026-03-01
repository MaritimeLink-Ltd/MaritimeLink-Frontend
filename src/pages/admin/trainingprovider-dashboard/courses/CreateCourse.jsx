import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronDown,
    CheckCircle,
    BookOpen,
    Calendar,
    MapPin,
    Users
} from 'lucide-react';

const certificateTypes = [
    'STCW Basic Safety',
    'Advanced Firefighting',
    'Fast Rescue Boat',
    'GWO Sea Survival',
    'Medical Care Onboard',
    'ECDIS',
    'Confined Space'
];

export default function CreateCourse() {
    const navigate = useNavigate();
    const location = useLocation();
    const isAdmin = location.pathname.includes('/admin/');
    const [step, setStep] = useState(1);
    const [addSessionChoice, setAddSessionChoice] = useState(null); // null | 'add' | 'skip'
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successConfig, setSuccessConfig] = useState({ mode: 'published', title: '' });

    const [form, setForm] = useState({
        title: '',
        certificateType: 'STCW Basic Safety',
        category: 'STCW',
        certification: 'Mandatory',
        defaultDuration: '3 Days',
        price: '',
        description: ''
    });

    const [savedSessions, setSavedSessions] = useState([]);
    const [sessionForm, setSessionForm] = useState({
        startDate: '',
        endDate: '',
        location: '',
        seatCapacity: '',
        enrollmentDeadline: ''
    });

    const emptySessionForm = {
        startDate: '',
        endDate: '',
        location: '',
        seatCapacity: '',
        enrollmentDeadline: ''
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSessionChange = (e) => {
        const { name, value } = e.target;
        setSessionForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveDraft = () => {
        setSuccessConfig({ mode: 'draft', title: form.title || 'New Course' });
        setShowSuccessModal(true);
        setTimeout(() => {
            setShowSuccessModal(false);
            navigate(isAdmin ? '/admin/marketplace' : '/trainingprovider/courses');
        }, 1500);
    };

    const handleContinue = () => {
        setStep(2);
    };

    const handleSkipToDashboard = () => {
        // Save course as draft, no session
        setSuccessConfig({ mode: 'draft', title: form.title || 'New Course' });
        setShowSuccessModal(true);
        setTimeout(() => {
            setShowSuccessModal(false);
            navigate(isAdmin ? '/admin-dashboard' : '/trainingprovider-dashboard');
        }, 1500);
    };

    const handleSaveSession = () => {
        // Save session to list and show new empty form
        const newSession = { ...sessionForm, id: Date.now() };
        setSavedSessions((prev) => [...prev, newSession]);
        setSessionForm(emptySessionForm);
    };

    const handleSavePublish = () => {
        // Publish course - include current form if filled, plus all saved sessions
        setSuccessConfig({ mode: 'published', title: form.title || 'New Course' });
        setShowSuccessModal(true);
        setTimeout(() => {
            setShowSuccessModal(false);
            navigate(isAdmin ? '/admin/marketplace' : '/trainingprovider/courses');
        }, 1500);
    };

    const handleCancel = () => {
        navigate(isAdmin ? '/admin/marketplace' : '/trainingprovider/courses');
    };

    return (
        <div className="flex flex-col min-h-full">
            <div className="max-w-4xl mx-auto w-full p-6">
                {/* Breadcrumb */}
                <div className="flex items-center text-xs text-gray-500 mb-3">
                    <button
                        type="button"
                        onClick={() => navigate(isAdmin ? '/admin/marketplace' : '/trainingprovider/courses')}
                        className="hover:text-[#003971] font-medium flex items-center gap-1"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        {step === 1 ? (isAdmin ? 'Marketplace' : 'Course Management') : 'Create Course'}
                    </button>
                    <span className="mx-2">/</span>
                    <span className="font-medium text-gray-700">
                        {step === 1 ? 'Create Course' : 'Step 2: Add First Session'}
                    </span>
                </div>

                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-11 w-11 rounded-xl bg-[#EBF3FF] flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-[#003971]" />
                        </div>
                        <div>
                            <h1 className="text-[26px] md:text-[28px] font-bold text-gray-900">
                                {step === 1 ? 'Create a Course' : 'Step 2: Add First Session'}
                            </h1>
                            <p className="text-sm text-gray-500 mt-0.5">
                                {step === 1
                                    ? 'Post a new course listing to the marketplace'
                                    : 'Schedule an initial session for your new course.'}
                            </p>
                        </div>
                    </div>

                    {step === 1 && (
                        <div className="flex items-center gap-2 mt-4">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold bg-[#003971] text-white">
                                1
                            </span>
                            <span className="h-0.5 w-8 rounded-full bg-gray-200" />
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold bg-gray-200 text-gray-500">
                                2
                            </span>
                            <span className="text-xs text-gray-500 ml-2">Step 1 of 2</span>
                        </div>
                    )}
                    {step === 2 && (
                        <div className="flex items-center gap-2 mt-4">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold bg-[#003971] text-white">
                                1
                            </span>
                            <span className="h-0.5 w-8 rounded-full bg-[#003971]" />
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold bg-[#003971] text-white">
                                2
                            </span>
                            <span className="text-xs text-gray-500 ml-2">Step 2 of 2</span>
                        </div>
                    )}
                </div>

                {/* Main Form Card */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 min-h-[400px] flex flex-col">
                    {step === 1 ? (
                        <>
                            <div className="space-y-6 flex-1">
                                {/* Course Title */}
                                <div>
                                    <label className="block text-gray-900 font-medium mb-2 text-base">
                                        Course Title
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        placeholder="Enter course title"
                                        value={form.title}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/15 focus:border-[#003971] placeholder-gray-400"
                                    />
                                </div>

                                {/* Certificate Type */}
                                <div>
                                    <label className="block text-gray-900 font-medium mb-2 text-base">
                                        Certificate Type
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="certificateType"
                                            value={form.certificateType}
                                            onChange={handleChange}
                                            className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/15 focus:border-[#003971] bg-white pr-10"
                                        >
                                            {certificateTypes.map((ct) => (
                                                <option key={ct} value={ct}>
                                                    {ct}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    </div>
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-gray-900 font-medium mb-3 text-base">
                                        Category
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {['STCW', 'Option 2', 'Option 3'].map((cat) => (
                                            <button
                                                type="button"
                                                key={cat}
                                                className={`px-6 py-2 rounded-full font-medium text-sm transition-all border ${
                                                    form.category === cat
                                                        ? 'bg-[#003971] text-white border-[#003971] shadow-sm'
                                                        : 'bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100'
                                                }`}
                                                onClick={() =>
                                                    setForm((prev) => ({ ...prev, category: cat }))
                                                }
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Certification Type */}
                                <div>
                                    <label className="block text-gray-900 font-medium mb-3 text-base">
                                        Certification Type
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {['Mandatory', 'Optional'].map((type) => (
                                            <button
                                                type="button"
                                                key={type}
                                                className={`px-6 py-2 rounded-full font-medium text-sm transition-all border ${
                                                    form.certification === type
                                                        ? 'bg-[#003971] text-white border-[#003971] shadow-sm'
                                                        : 'bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100'
                                                }`}
                                                onClick={() =>
                                                    setForm((prev) => ({ ...prev, certification: type }))
                                                }
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Default Duration & Course Price */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-gray-900 font-medium mb-2 text-base">
                                            Default Duration (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            name="defaultDuration"
                                            placeholder="e.g. 3 Days"
                                            value={form.defaultDuration}
                                            onChange={handleChange}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/15 focus:border-[#003971] placeholder-gray-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-900 font-medium mb-2 text-base">
                                            Course Price | USD
                                        </label>
                                        <input
                                            type="text"
                                            name="price"
                                            placeholder="e.g. 750"
                                            value={form.price}
                                            onChange={handleChange}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/15 focus:border-[#003971] placeholder-gray-400"
                                        />
                                    </div>
                                </div>

                                {/* Course Description & Requirements */}
                                <div>
                                    <label className="block text-gray-900 font-medium mb-2 text-base">
                                        Course Description & Requirements
                                    </label>
                                    <textarea
                                        name="description"
                                        placeholder="Provide a detailed description for the course. Include any prerequisites, required equipment, or important info."
                                        value={form.description}
                                        onChange={handleChange}
                                        rows={6}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/15 focus:border-[#003971] resize-none placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            {/* Page 1 Actions */}
                            <div className="pt-8 mt-6 border-t border-gray-100 flex flex-wrap gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={handleSaveDraft}
                                    className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all"
                                >
                                    Save as Draft
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleContinue}
                                    className="px-5 py-2.5 rounded-xl bg-[#003971] text-white font-semibold text-sm hover:bg-[#002455] transition-all shadow-sm"
                                >
                                    Continue
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Would you like to add a session now? */}
                            <div className="mb-6">
                                <p className="text-base font-medium text-gray-900 mb-2">
                                    Would you like to add a session now?
                                </p>
                                <p className="text-sm text-gray-500 mb-4">
                                    You can skip this step and add sessions later from Course Management.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setAddSessionChoice('add')}
                                        className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                                            addSessionChoice === 'add'
                                                ? 'bg-[#003971] text-white shadow-sm'
                                                : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        Add Session Now
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAddSessionChoice('skip');
                                            handleSkipToDashboard();
                                        }}
                                        className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                                            addSessionChoice === 'skip'
                                                ? 'bg-[#003971] text-white shadow-sm'
                                                : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        Skip to Dashboard
                                    </button>
                                </div>
                            </div>

                            {/* Saved Sessions List */}
                            {addSessionChoice === 'add' && savedSessions.length > 0 && (
                                <div className="pt-4 border-t border-gray-100 mb-6">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                        Saved Sessions ({savedSessions.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {savedSessions.map((s, idx) => (
                                            <div
                                                key={s.id}
                                                className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm"
                                            >
                                                <span className="font-medium text-gray-700">
                                                    Session {idx + 1}: {s.startDate || '—'} – {s.endDate || '—'}
                                                    {s.location && ` • ${s.location}`}
                                                    {s.seatCapacity && ` • ${s.seatCapacity} seats`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Session Form (when Add Session Now) */}
                            {addSessionChoice === 'add' && (
                                <div className="space-y-6 pt-4 border-t border-gray-100">
                                    <h3 className="text-base font-semibold text-gray-900">
                                        {savedSessions.length > 0 ? 'Add Another Session' : 'Session Details'}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-gray-900 font-medium mb-2 text-base">
                                                Start Date
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="startDate"
                                                    placeholder="e.g. Jun 10, 2024"
                                                    value={sessionForm.startDate}
                                                    onChange={handleSessionChange}
                                                    className="w-full border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/15 focus:border-[#003971] placeholder-gray-400"
                                                />
                                                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-gray-900 font-medium mb-2 text-base">
                                                End Date
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="endDate"
                                                    placeholder="e.g. Jun 12, 2024"
                                                    value={sessionForm.endDate}
                                                    onChange={handleSessionChange}
                                                    className="w-full border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/15 focus:border-[#003971] placeholder-gray-400"
                                                />
                                                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-gray-900 font-medium mb-2 text-base">
                                            Location
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                name="location"
                                                placeholder="Enter session location (city or facility)"
                                                value={sessionForm.location}
                                                onChange={handleSessionChange}
                                                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/15 focus:border-[#003971] placeholder-gray-400"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-gray-900 font-medium mb-2 text-base">
                                            Seat Capacity
                                        </label>
                                        <p className="text-xs text-gray-500 mb-1">
                                            Specify the maximum number of seats available for the session.
                                        </p>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                name="seatCapacity"
                                                placeholder="e.g. 16"
                                                value={sessionForm.seatCapacity}
                                                onChange={handleSessionChange}
                                                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/15 focus:border-[#003971] placeholder-gray-400"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-gray-900 font-medium mb-2 text-base">
                                            Enrollment Deadline
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="enrollmentDeadline"
                                                placeholder="Set deadline for enrollment"
                                                value={sessionForm.enrollmentDeadline}
                                                onChange={handleSessionChange}
                                                className="w-full border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/15 focus:border-[#003971] placeholder-gray-400"
                                            />
                                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Page 2 Actions */}
                            <div className="pt-8 mt-6 border-t border-gray-100 flex flex-wrap gap-3 justify-between">
                                <button
                                    type="button"
                                    onClick={() => { setStep(1); setAddSessionChoice(null); }}
                                    className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all"
                                >
                                    Back
                                </button>
                                <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                {addSessionChoice === 'skip' && (
                                    <button
                                        type="button"
                                        onClick={handleSkipToDashboard}
                                        className="px-5 py-2.5 rounded-xl bg-[#003971] text-white font-semibold text-sm hover:bg-[#002455] transition-all shadow-sm"
                                    >
                                        Save Draft & Go to Dashboard
                                    </button>
                                )}
                                {addSessionChoice === 'add' && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handleSaveSession}
                                            className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all"
                                        >
                                            Save
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSavePublish}
                                            className="px-5 py-2.5 rounded-xl bg-[#003971] text-white font-semibold text-sm hover:bg-[#002455] transition-all shadow-sm"
                                        >
                                            Save & Publish
                                        </button>
                                    </>
                                )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {successConfig.mode === 'published'
                                    ? 'Course Published!'
                                    : 'Draft Saved'}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {successConfig.mode === 'published' ? (
                                    <>
                                        "{successConfig.title}" is now live and visible on the
                                        marketplace.
                                    </>
                                ) : (
                                    <>
                                        "{successConfig.title}" has been saved as a draft. Add more
                                        sessions from Course Management when ready.
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

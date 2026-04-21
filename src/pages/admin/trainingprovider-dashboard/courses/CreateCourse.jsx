import { useState, useRef } from 'react';
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
import httpClient from '../../../../utils/httpClient';
import { API_ENDPOINTS } from '../../../../config/api.config';
import { countryCodes } from '../../../../utils/countryCodes';

const courseTitleOptions = [
    'STCW Basic Safety Training',
    'Advanced Firefighting',
    'Medical First Aid',
    'Bridge Resource Management',
    'STCW Refresher Course',
    'Other'
];

function openDatePicker(inputRef) {
    const el = inputRef?.current;
    if (!el) return;
    try {
        if (typeof el.showPicker === 'function') {
            el.showPicker();
            return;
        }
    } catch {
        /* showPicker can throw if not user-activated in some environments */
    }
    el.click();
}

function formatSessionDateDisplay(value) {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CreateCourse() {
    const navigate = useNavigate();
    const location = useLocation();
    const isAdmin = location.pathname.includes('/admin/');
    const [step, setStep] = useState(1);
    const [addSessionChoice, setAddSessionChoice] = useState(null); // null | 'add' | 'skip'
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successConfig, setSuccessConfig] = useState({ mode: 'published', title: '' });
    const [isLoading, setIsLoading] = useState(false);

    const [form, setForm] = useState({
        title: 'STCW Basic Safety Training',
        otherCourseTitle: '',
        category: 'STCW',
        courseType: 'Initial',
        issuingAuthority: 'United Kingdom',
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

    const sessionStartDateRef = useRef(null);
    const sessionEndDateRef = useRef(null);
    const sessionEnrollmentDeadlineRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSessionChange = (e) => {
        const { name, value } = e.target;
        setSessionForm((prev) => ({ ...prev, [name]: value }));
    };

    const saveCourseAsDraft = async () => {
        let formattedCategory = form.category;
        if (form.category === 'STCW') formattedCategory = 'STCW_CERTIFICATES';
        else formattedCategory = form.category.toUpperCase().replace(/ & /g, '_').replace(/ /g, '_');

        const payload = {
            title: form.title === 'Other' ? form.otherCourseTitle : form.title,
            location: 'N/A', // Location is typically set in session, defaulting to N/A for draft
            category: formattedCategory,
            contractType: 'Full-time',
            description: form.description,
            price: Number(form.price) || 0,
            courseType: 'INTERNAL'
        };

        return await httpClient.post(API_ENDPOINTS.COURSES.DRAFTS, payload);
    };

    const handleSaveDraft = async () => {
        setIsLoading(true);
        try {
            await saveCourseAsDraft();
            setSuccessConfig({ mode: 'draft', title: form.title === 'Other' ? form.otherCourseTitle : form.title || 'New Course' });
            setShowSuccessModal(true);
            setTimeout(() => {
                setShowSuccessModal(false);
                navigate(isAdmin ? '/admin/marketplace' : '/trainingprovider/courses');
            }, 1500);
        } catch (error) {
            console.error('Error saving draft:', error);
            alert(error.message || 'Failed to save draft');
        } finally {
            setIsLoading(false);
        }
    };

    const handleContinue = () => {
        setStep(2);
    };

    const handleSkipToDashboard = async () => {
        // Save course as draft, no session
        setIsLoading(true);
        try {
            await saveCourseAsDraft();
            setSuccessConfig({ mode: 'draft', title: form.title === 'Other' ? form.otherCourseTitle : form.title || 'New Course' });
            setShowSuccessModal(true);
            setTimeout(() => {
                setShowSuccessModal(false);
                navigate(isAdmin ? '/admin-dashboard' : '/trainingprovider-dashboard');
            }, 1500);
        } catch (error) {
            console.error('Error saving draft:', error);
            alert(error.message || 'Failed to save draft');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSession = () => {
        // Save session to list and show new empty form
        const newSession = { ...sessionForm, id: Date.now() };
        setSavedSessions((prev) => [...prev, newSession]);
        setSessionForm(emptySessionForm);
    };

    const handleSavePublish = async () => {
        setIsLoading(true);
        try {
            // 1. Create Draft Course
            const response = await saveCourseAsDraft();
            const courseId = response.data?.course?.id;

            if (!courseId) {
                throw new Error("Failed to get draft course ID");
            }
            
            // 2. Add Sessions (if any)
            if (addSessionChoice === 'add') {
                const sessionsToCreate = [...savedSessions];
                if (sessionForm.startDate) {
                    sessionsToCreate.push({ ...sessionForm, id: Date.now() });
                }

                for (const s of sessionsToCreate) {
                    const locationStr = s.location || 'N/A';
                    const sessionPayload = {
                        startDate: s.startDate ? new Date(s.startDate).toISOString() : new Date().toISOString(),
                        endDate: s.endDate ? new Date(s.endDate).toISOString() : new Date().toISOString(),
                        startTime: "09:00",
                        endTime: "17:00",
                        location: locationStr,
                        instructor: "TBD", // Defaulting as form doesn't capture instructor
                        totalSeats: Number(s.seatCapacity) || 10
                    };
                    
                    try {
                        await httpClient.post(
                            API_ENDPOINTS.COURSES.CREATE_SESSION(courseId),
                            sessionPayload
                        );
                    } catch (sessionErr) {
                        console.error('Failed to create session:', sessionErr);
                        // Continue to next sessions even if one fails
                    }
                }
            }

            // 3. Publish the Course
            await httpClient.patch(API_ENDPOINTS.COURSES.PUBLISH(courseId));

            setSuccessConfig({ mode: 'published', title: form.title === 'Other' ? form.otherCourseTitle : form.title });
            setShowSuccessModal(true);
            setTimeout(() => {
                setShowSuccessModal(false);
                navigate(isAdmin ? '/admin/marketplace' : '/trainingprovider/courses');
            }, 1500);

        } catch (error) {
            console.error('Error creating/publishing course:', error);
            alert(error.message || 'Failed to publish course');
        } finally {
            setIsLoading(false);
        }
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
                                    <div className="relative">
                                        <select
                                            name="title"
                                            value={form.title}
                                            onChange={handleChange}
                                            className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/15 focus:border-[#003971] bg-white pr-10"
                                        >
                                            {courseTitleOptions.map((title) => (
                                                <option key={title} value={title}>
                                                    {title}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    </div>
                                    {form.title === 'Other' && (
                                        <input
                                            type="text"
                                            name="otherCourseTitle"
                                            placeholder="Enter course title"
                                            value={form.otherCourseTitle}
                                            onChange={handleChange}
                                            className="w-full mt-3 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/15 focus:border-[#003971] placeholder-gray-400"
                                        />
                                    )}
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-gray-900 font-medium mb-3 text-base">
                                        Category
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {['STCW', 'Safety & Security', 'Medical & First Aid', 'Navigation', 'Engineering', 'Offshore', 'Management'].map((cat) => (
                                            <button
                                                type="button"
                                                key={cat}
                                                className={`px-6 py-2 rounded-full font-medium text-sm transition-all border ${form.category === cat
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

                                {/* Course Type */}
                                <div>
                                    <label className="block text-gray-900 font-medium mb-3 text-base">
                                        Course Type
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {['Refresher', 'Upgrade', 'Initial', 'Other'].map((type) => (
                                            <button
                                                type="button"
                                                key={type}
                                                className={`px-6 py-2 rounded-full font-medium text-sm transition-all border ${form.courseType === type
                                                        ? 'bg-[#003971] text-white border-[#003971] shadow-sm'
                                                        : 'bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100'
                                                    }`}
                                                onClick={() =>
                                                    setForm((prev) => ({ ...prev, courseType: type }))
                                                }
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Issuing Authority */}
                                <div>
                                    <label className="block text-gray-900 font-medium mb-2 text-base">
                                        Issuing Authority
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="issuingAuthority"
                                            value={form.issuingAuthority}
                                            onChange={handleChange}
                                            className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/15 focus:border-[#003971] bg-white pr-10"
                                        >
                                            {countryCodes.map((item) => (
                                                <option key={item.country} value={item.country}>
                                                    {item.country}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    </div>
                                </div>

                                {/* Duration & Course Price */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-gray-900 font-medium mb-2 text-base">
                                            Duration
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
                                        className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all ${addSessionChoice === 'add'
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
                                        className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all ${addSessionChoice === 'skip'
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
                                                    Session {idx + 1}:{' '}
                                                    {formatSessionDateDisplay(s.startDate) || '—'} –{' '}
                                                    {formatSessionDateDisplay(s.endDate) || '—'}
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
                                                    ref={sessionStartDateRef}
                                                    type="date"
                                                    name="startDate"
                                                    value={sessionForm.startDate}
                                                    onChange={handleSessionChange}
                                                    className="w-full border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/15 focus:border-[#003971] [color-scheme:light] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                                                />
                                                <button
                                                    type="button"
                                                    aria-label="Open calendar for start date"
                                                    onClick={() => openDatePicker(sessionStartDateRef)}
                                                    className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#003971] focus:outline-none focus:ring-2 focus:ring-[#003971]/20"
                                                >
                                                    <Calendar className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-gray-900 font-medium mb-2 text-base">
                                                End Date
                                            </label>
                                            <div className="relative">
                                                <input
                                                    ref={sessionEndDateRef}
                                                    type="date"
                                                    name="endDate"
                                                    value={sessionForm.endDate}
                                                    onChange={handleSessionChange}
                                                    className="w-full border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/15 focus:border-[#003971] [color-scheme:light] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                                                />
                                                <button
                                                    type="button"
                                                    aria-label="Open calendar for end date"
                                                    onClick={() => openDatePicker(sessionEndDateRef)}
                                                    className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#003971] focus:outline-none focus:ring-2 focus:ring-[#003971]/20"
                                                >
                                                    <Calendar className="h-4 w-4" />
                                                </button>
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
                                                ref={sessionEnrollmentDeadlineRef}
                                                type="date"
                                                name="enrollmentDeadline"
                                                value={sessionForm.enrollmentDeadline}
                                                onChange={handleSessionChange}
                                                className="w-full border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/15 focus:border-[#003971] [color-scheme:light] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                                            />
                                            <button
                                                type="button"
                                                aria-label="Open calendar for enrollment deadline"
                                                onClick={() => openDatePicker(sessionEnrollmentDeadlineRef)}
                                                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#003971] focus:outline-none focus:ring-2 focus:ring-[#003971]/20"
                                            >
                                                <Calendar className="h-4 w-4" />
                                            </button>
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
                                                disabled={isLoading}
                                                className="px-5 py-2.5 rounded-xl bg-[#003971] text-white font-semibold text-sm hover:bg-[#002455] transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                                            >
                                                {isLoading ? (
                                                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                ) : null}
                                                {isLoading ? 'Publishing...' : 'Save & Publish'}
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

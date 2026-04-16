import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronDown,
    CheckCircle,
    BookOpen,
    Loader2
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

export default function EditCourse() {
    const navigate = useNavigate();
    const location = useLocation();
    const isAdmin = location.pathname.includes('/admin/');
    const returnPath = location.state?.returnPath;
    const { courseId } = useParams();

    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

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

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                setIsLoading(true);
                const response = await httpClient.get(API_ENDPOINTS.COURSES.GET_BY_ID(courseId));
                if (response.status === 'success' && response.data?.course) {
                    const course = response.data.course;
                    const isStandardTitle = courseTitleOptions.includes(course.title);
                    setForm({
                        title: isStandardTitle ? course.title : 'Other',
                        otherCourseTitle: isStandardTitle ? '' : (course.title || ''),
                        category: course.category || 'STCW',
                        courseType: course.courseType || 'Initial',
                        issuingAuthority: course.issuingAuthority || 'United Kingdom',
                        defaultDuration: course.duration || '3 Days',
                        price: course.price?.toString() || '',
                        description: course.description || ''
                    });
                }
            } catch (err) {
                console.error('Failed to fetch course data for editing:', err);
            } finally {
                setIsLoading(false);
            }
        };

        if (courseId) {
            fetchCourseData();
        }
    }, [courseId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        try {
            setIsUpdating(true);
            const payload = {
                title: form.title === 'Other' ? form.otherCourseTitle : form.title,
                category: form.category,
                courseType: form.courseType,
                issuingAuthority: form.issuingAuthority,
                duration: form.defaultDuration,
                description: form.description,
                price: Number(form.price) || 0,
                currency: 'USD',
                contractType: 'Full-time'
            };

            const response = await httpClient.put(API_ENDPOINTS.COURSES.UPDATE(courseId), payload);
            if (response.status === 'success') {
                setShowSuccessModal(true);
                setTimeout(() => {
                    navigate(
                        returnPath ||
                            (isAdmin ? `/admin/marketplace` : `/trainingprovider/courses/${courseId}`)
                    );
                }, 2000);
            }
        } catch (err) {
            console.error('Failed to update course:', err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancel = () => {
        navigate(
            returnPath || (isAdmin ? '/admin/marketplace' : `/trainingprovider/courses/${courseId}`)
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-[400px] bg-transparent p-6 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#003971] mb-4" />
                <p className="text-gray-500 font-medium">Loading course specifics...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full">
            <div className="max-w-4xl mx-auto w-full p-6">
                {/* Breadcrumb */}
                <div className="flex items-center text-xs text-gray-500 mb-3">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="hover:text-[#003971] font-medium flex items-center gap-1"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        {isAdmin ? 'Marketplace' : 'Course Details'}
                    </button>
                    <span className="mx-2">/</span>
                    <span className="font-medium text-gray-700">Edit Course</span>
                </div>

                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-11 w-11 rounded-xl bg-[#EBF3FF] flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-[#003971]" />
                        </div>
                        <div>
                            <h1 className="text-[26px] md:text-[28px] font-bold text-gray-900">
                                Edit Course
                            </h1>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Modify and update properties of your existing course.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Form Card */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 min-h-[400px] flex flex-col">
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
                                    placeholder="Enter custom course title"
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

                    {/* Actions */}
                    <div className="pt-8 mt-6 border-t border-gray-100 flex flex-wrap gap-3 justify-end">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isUpdating}
                            className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleUpdate}
                            disabled={isUpdating}
                            className="px-5 py-2.5 flex items-center justify-center rounded-xl bg-[#003971] text-white font-semibold text-sm hover:bg-[#002455] transition-all shadow-sm min-w-[120px] disabled:opacity-75"
                        >
                            {isUpdating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            {isUpdating ? 'Saving...' : 'Update Course'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-4">
                                <CheckCircle className="h-8 w-8 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Course Updated!</h3>
                            <p className="text-sm text-gray-500">
                                The course features have been modified successfully.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, X, Pause, Upload, MapPin, Calendar, Loader2, Trash2 } from 'lucide-react';
import jobService from '../../../services/jobService';

function UploadJob({ onBack: onBackProp }) {
    const navigate = useNavigate();
    const location = useLocation();
    const editData = location.state?.jobData;
    const isEditMode = location.state?.isEdit || false;
    const dashboardType = location.state?.dashboardType || 'recruiter'; // 'admin' or 'recruiter'

    const returnPath = location.state?.returnPath;

    const [step, setStep] = useState(1);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isPublished, setIsPublished] = useState(editData?.status === 'Active' || false);
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [showPauseModal, setShowPauseModal] = useState(false);
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isClosed, setIsClosed] = useState(editData?.status === 'Closed' || false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isStatusUpdating, setIsStatusUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [formData, setFormData] = useState({
        jobTitle: '',
        region: 'Global',
        category: 'Officer',
        contractType: 'Temporary',
        salary: '',
        closingDate: '',
        description: ''
    });

    const API_TO_CATEGORY = {
        'OFFICER': 'Officer',
        'RATINGS_AND_CREW': 'Ratings & Crew',
        'CATERING_AND_MEDICAL': 'Catering & Medical'
    };

    const API_TO_CONTRACT = {
        'TEMPORARY': 'Temporary',
        'CONTRACT': 'Contract',
        'PERMANENT': 'Permanent'
    };

    const normalizeStatus = (value) => String(value || '').toUpperCase();
    const isClosedStatus = (value) => ['EXPIRED', 'FILLED', 'REMOVED'].includes(normalizeStatus(value));
    /** Jobs list maps `closingDate` to a Date; API returns ISO strings — both must work for `<input type="date">`. */
    const closingDateToInputValue = (value) => {
        if (value == null || value === '') return '';
        if (value instanceof Date && !Number.isNaN(value.getTime())) {
            const y = value.getFullYear();
            const m = String(value.getMonth() + 1).padStart(2, '0');
            const d = String(value.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }
        if (typeof value === 'string') {
            const s = value.trim();
            if (!s) return '';
            return s.includes('T') ? s.split('T')[0] : s.slice(0, 10);
        }
        return '';
    };

    const navigateBackToListing = () => {
        if (onBackProp) {
            onBackProp();
            return;
        }
        if (returnPath) {
            navigate(returnPath, {
                state: {
                    refreshJobsAt: Date.now(),
                },
            });
            return;
        }
        navigate(-1);
    };

    useEffect(() => {
        if (isEditMode && editData) {
            const normalizedStatus = normalizeStatus(editData.status);
            setIsPublished(normalizedStatus === 'ACTIVE');
            setIsPaused(normalizedStatus === 'DRAFT');
            setIsClosed(isClosedStatus(normalizedStatus));
            setFormData({
                jobTitle: editData.jobTitle || editData.title || '',
                region: editData.region || editData.location || 'Global',
                category: API_TO_CATEGORY[editData.category] || editData.category || 'Officer',
                contractType: API_TO_CONTRACT[editData.contractType] || editData.contractType || editData.type || 'Temporary',
                salary: editData.salary || '',
                closingDate: closingDateToInputValue(editData.closingDate),
                description: editData.description || ''
            });
        }
    }, [isEditMode, editData]);

    const categories = ['Officer', 'Ratings & Crew', 'Catering & Medical'];
    const contractTypes = ['Temporary', 'Contract', 'Permanent'];
    const regions = ['Global', 'UK', 'India', 'Singapore', 'Middle East', 'Europe', 'Southeast Asia', 'Africa'];

    const handleNext = () => {
        setStep(2);
    };

    const handlePublishToggle = () => {
        setShowPublishModal(true);
    };

    const confirmPublishToggle = async () => {
        if (!isEditMode || !editData?.id) {
            setIsPublished(!isPublished);
            setShowPublishModal(false);
            return;
        }

        setIsStatusUpdating(true);
        setSubmitError('');
        try {
            const nextStatus = isPublished ? 'DRAFT' : 'ACTIVE';
            await jobService.updateJobStatus(editData.id, nextStatus);
            setIsPublished(nextStatus === 'ACTIVE');
            setIsPaused(nextStatus === 'DRAFT');
            setIsClosed(false);
            setShowPublishModal(false);
        } catch (error) {
            console.error('Failed to update job publish status:', error);
            setSubmitError(error?.data?.message || error?.message || 'Could not update job status.');
        } finally {
            setIsStatusUpdating(false);
        }
    };

    const handlePauseToggle = () => {
        setShowPauseModal(true);
    };

    const confirmPauseToggle = async () => {
        if (!isEditMode || !editData?.id) {
            setIsPaused(!isPaused);
            setShowPauseModal(false);
            return;
        }

        setIsStatusUpdating(true);
        setSubmitError('');
        try {
            const nextStatus = isPaused ? 'ACTIVE' : 'DRAFT';
            await jobService.updateJobStatus(editData.id, nextStatus);
            setIsPaused(nextStatus === 'DRAFT');
            setIsPublished(nextStatus === 'ACTIVE');
            setIsClosed(false);
            setShowPauseModal(false);
        } catch (error) {
            console.error('Failed to pause/resume job:', error);
            setSubmitError(error?.data?.message || error?.message || 'Could not update job status.');
        } finally {
            setIsStatusUpdating(false);
        }
    };

    const handleCloseJob = () => {
        setShowCloseModal(true);
    };

    const confirmCloseJob = async () => {
        if (!editData?.id) {
            setIsClosed(true);
            setShowCloseModal(false);
            navigateBackToListing();
            return;
        }

        setIsStatusUpdating(true);
        setSubmitError('');
        try {
            await jobService.updateJobStatus(editData.id, 'EXPIRED');
            setIsClosed(true);
            setIsPublished(false);
            setIsPaused(false);
            setShowCloseModal(false);
            navigateBackToListing();
        } catch (error) {
            console.error('Failed to close job:', error);
            setSubmitError(error?.data?.message || error?.message || 'Could not close this job.');
        } finally {
            setIsStatusUpdating(false);
        }
    };

    const confirmDeleteJob = async () => {
        if (!editData?.id) return;

        setIsDeleting(true);
        setSubmitError('');
        try {
            await jobService.deleteJob(editData.id);
            setShowDeleteModal(false);
            navigateBackToListing();
        } catch (error) {
            console.error('Failed to delete job:', error);
            setSubmitError(error?.data?.message || error?.message || 'Could not delete this job.');
        } finally {
            setIsDeleting(false);
        }
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

    const handlePublish = async () => {
        await submitJob('ACTIVE');
    };

    const handleSaveDraft = async () => {
        await submitJob('DRAFT');
    };

    const submitJob = async (status) => {
        // Validate required fields
        if (!formData.jobTitle.trim()) {
            setSubmitError('Job title is required.');
            return;
        }
        if (!formData.description.trim()) {
            setSubmitError('Job description is required.');
            return;
        }

        setIsSubmitting(true);
        setSubmitError('');

        try {
            const payload = {
                title: formData.jobTitle,
                location: formData.region,
                category: formData.category,
                contractType: formData.contractType,
                salary: formData.salary,
                description: formData.description,
                closingDate: formData.closingDate || undefined,
                status,
            };

            let response;
            if (isEditMode && editData?.id) {
                response = await jobService.updateJob(editData.id, payload);
                console.log('Job updated successfully:', response);
                if (status === 'DRAFT') {
                    await jobService.updateJobStatus(editData.id, 'DRAFT');
                }
            } else {
                response = await jobService.createJob(payload);
                console.log('Job created successfully:', response);
            }
            setIsPublished(status === 'ACTIVE');
            setIsPaused(status === 'DRAFT');
            setIsClosed(false);
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Failed to create job:', error);
            const message = error?.data?.message || error?.message || 'Failed to create job. Please try again.';
            setSubmitError(message);
        } finally {
            setIsSubmitting(false);
        }
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

            <div className="mb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-[24px] font-bold text-gray-900">{isEditMode ? 'Edit Job' : 'Create a Job'}</h1>
                        {isEditMode && (
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${isPublished
                                ? 'bg-green-100 text-green-700'
                                : isClosed
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                {isClosed ? 'Closed' : isPublished ? 'Published' : 'Unpublished'}
                            </span>
                        )}
                    </div>
                    <p className="text-gray-500 text-sm">{isEditMode ? 'Update your job listing details' : 'Post a new job listing to the marketplace'}</p>
                </div>

                {isEditMode && (
                    <div className="flex items-center gap-3">
                        {!isClosed && (
                            <button
                                onClick={handlePauseToggle}
                                className={`flex items-center gap-2 px-5 py-2.5 border rounded-lg font-semibold transition-colors text-sm ${isPaused
                                    ? 'border-green-300 text-green-600 hover:bg-green-50'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Pause className="h-4 w-4" />
                                {isPaused ? 'Resume' : 'Pause'}
                            </button>
                        )}
                        {!isPublished && !isClosed && (
                            <button
                                onClick={handlePublishToggle}
                                className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm"
                            >
                                <Upload className="h-4 w-4" />
                                Publish
                            </button>
                        )}
                        {!isClosed ? (
                            <button
                                onClick={handleCloseJob}
                                className="flex items-center gap-2 px-5 py-2.5 border border-red-300 rounded-lg text-red-600 font-semibold hover:bg-red-50 transition-colors text-sm"
                            >
                                <X className="h-4 w-4" />
                                Close Job
                            </button>
                        ) : (
                            <span className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-50 text-red-700 font-semibold text-sm">
                                Closed
                            </span>
                        )}
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 border border-red-200 rounded-lg text-red-700 font-semibold hover:bg-red-50 transition-colors text-sm"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete Job
                        </button>
                    </div>
                )}
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

                            {/* Region */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                                    Region
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <select
                                        value={formData.region}
                                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f] appearance-none bg-white cursor-pointer"
                                    >
                                        {regions.map((region) => (
                                            <option key={region} value={region}>{region}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Closing Date (Optional) */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                                    Closing Date <span className="text-gray-400 font-normal">(Optional)</span>
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="date"
                                        value={formData.closingDate}
                                        onChange={(e) => setFormData({ ...formData, closingDate: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f] cursor-pointer"
                                    />
                                </div>
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
                                <p className="text-xs text-gray-500 mb-2">
                                    Include as much detail as possible to attract the right candidates. We recommend covering:
                                </p>
                                <ul className="text-xs text-gray-500 mb-3 space-y-1 pl-4 list-disc">
                                    <li>Role responsibilities and duties</li>
                                    <li>Candidate specifications (experience, rank, sea time)</li>
                                    <li>Required certifications (CoC, STCW, medical certificates)</li>
                                    <li>Required documents (passport, visa, seaman's book)</li>
                                    <li>Vessel type and trade area details</li>
                                </ul>
                                <textarea
                                    placeholder="e.g. We are seeking an experienced Chief Engineer for our LNG Tanker fleet. The ideal candidate should hold a valid Chief Engineer CoC, STCW certificates, medical fitness certificate, and have a minimum of 5 years sea time on LNG vessels..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={10}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f] resize-none"
                                />
                            </div>

                            {/* Error Message */}
                            {submitError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                    {submitError}
                                </div>
                            )}

                            {/* Publish Button */}
                            <button
                                onClick={handlePublish}
                                disabled={isSubmitting}
                                className="w-full bg-[#1e5a8f] text-white py-2.5 rounded-xl font-bold text-sm hover:bg-[#164a7a] transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Job' : 'Publish Job')}
                            </button>
                            <button
                                onClick={handleSaveDraft}
                                disabled={isSubmitting}
                                className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Saving...' : (isEditMode ? 'Save as Draft' : 'Save Draft')}
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
                                {isEditMode ? 'Job Updated Successfully!' : 'Job Saved Successfully!'}
                            </h2>

                            {/* Message */}
                            <p className="text-gray-600 mb-8">
                                {isEditMode
                                    ? 'Your job listing has been updated.'
                                    : isPublished
                                        ? 'Your job listing has been published to the marketplace.'
                                        : 'Your job listing has been saved as a draft.'}
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

            {/* Publish/Unpublish Modal */}
            {showPublishModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            {isPublished ? 'Unpublish Job?' : 'Publish Job?'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {isPublished
                                ? 'Are you sure you want to unpublish this job? It will no longer be visible to candidates.'
                                : 'Are you sure you want to publish this job? It will be visible to all candidates on the platform.'}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowPublishModal(false)}
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmPublishToggle}
                                disabled={isStatusUpdating}
                                className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-colors ${isPublished
                                    ? 'bg-gray-700 text-white hover:bg-gray-800'
                                    : 'bg-[#003971] text-white hover:bg-[#002855]'
                                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                            >
                                {isStatusUpdating ? 'Updating...' : (isPublished ? 'Unpublish' : 'Publish')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pause/Resume Modal */}
            {showPauseModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            {isPaused ? 'Resume Job?' : 'Pause Job?'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {isPaused
                                ? 'Are you sure you want to resume this job? It will start accepting new applications again.'
                                : 'Are you sure you want to pause this job? New applications will not be accepted until you resume it.'}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowPauseModal(false)}
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmPauseToggle}
                                disabled={isStatusUpdating}
                                className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-colors ${isPaused
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-orange-600 text-white hover:bg-orange-700'
                                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                            >
                                {isStatusUpdating ? 'Updating...' : (isPaused ? 'Resume' : 'Pause')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Close Job Modal */}
            {showCloseModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            Close Job?
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to close this job? This action cannot be undone. The job will be archived and will no longer accept applications.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCloseModal(false)}
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmCloseJob}
                                disabled={isStatusUpdating}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isStatusUpdating ? 'Closing...' : 'Close Job'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            Delete Job?
                        </h3>
                        <p className="text-gray-600 mb-6">
                            This will permanently remove the job and its listing. Please make sure you really want to delete it.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteJob}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete Job'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UploadJob;

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Building2, CheckCircle2, Upload, FileType, Check, Star, Folder, ChevronRight, Loader2 } from 'lucide-react';
import jobService from '../../../../services/jobService';
import resumeService from '../../../../services/resumeService';
import documentService from '../../../../services/documentService';
// Logo image is now in public/images. Use direct path in <img src="/images/logo.png" />

const ApplyToJob = () => {
    const navigate = useNavigate();
    const { jobId } = useParams();
    const [selectedResume, setSelectedResume] = useState(null);
    const [uploadedResume, setUploadedResume] = useState(null);
    const [coverLetterMode, setCoverLetterMode] = useState('write');
    const [coverLetter, setCoverLetter] = useState('');
    const [uploadedCoverLetter, setUploadedCoverLetter] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const fileInputRef = useRef(null);
    const coverLetterInputRef = useRef(null);

    const [step, setStep] = useState(1);
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(null);

    const [job, setJob] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [platformResume, setPlatformResume] = useState(null);
    const [documentWalletItems, setDocumentWalletItems] = useState([]);
    const [isApplying, setIsApplying] = useState(false);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setIsLoading(true);
                const [jobResponse, resumeResponse, docResponse] = await Promise.all([
                    jobService.getProfessionalJobById(jobId).catch(() => null),
                    resumeService.getResume().catch(() => null),
                    documentService.getDocuments().catch(() => null)
                ]);

                if (jobResponse?.status === 'success' && jobResponse.data?.job) {
                    const apiJob = jobResponse.data.job;
                    setJob({
                        id: apiJob.id,
                        title: apiJob.title,
                        company: apiJob.recruiter?.organizationName || 'MaritimeLink Admin',
                        salary: apiJob.salary,
                        location: apiJob.location || 'Global',
                        type: apiJob.contractType
                    });
                }

                if (resumeResponse && resumeResponse.updatedAt) {
                    setPlatformResume({
                        id: 'platform',
                        title: 'MaritimeLink Profile CV',
                        createdDate: `Updated ${new Date(resumeResponse.updatedAt).toLocaleDateString()}`
                    });
                } else {
                    setPlatformResume({
                        id: 'platform',
                        title: 'MaritimeLink Profile CV',
                        createdDate: 'Up-to-date'
                    });
                }

                if (docResponse?.status === 'success' && docResponse.data?.documents) {
                    setDocumentWalletItems(
                        docResponse.data.documents.map(d => ({
                            id: d.id,
                            title: d.name,
                            expiry: d.expiryDate ? new Date(d.expiryDate).toLocaleDateString() : 'N/A',
                            type: d.category || 'Document'
                        }))
                    );
                }
            } catch (error) {
                console.error("Failed to fetch application data", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (jobId) {
            fetchAllData();
        }
    }, [jobId]);

    const resumes = platformResume ? [platformResume] : [];

    const documentFolders = Object.entries(
        documentWalletItems.reduce((folders, document) => {
            if (!folders[document.type]) {
                folders[document.type] = [];
            }
            folders[document.type].push(document);
            return folders;
        }, {})
    ).map(([name, documents]) => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        documents
    }));

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadedResume(file);
            setSelectedResume('uploaded');
        }
    };

    const handleCoverLetterUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadedCoverLetter(file);
        }
    };

    const handleApply = async () => {
        if (!selectedResume) return;

        setIsApplying(true);
        try {
            let cvUrl = undefined;
            if (selectedResume === 'uploaded' && uploadedResume) {
                const cvRes = await jobService.uploadCV(uploadedResume);
                if (cvRes.status === 'success' && cvRes.data?.url) {
                    cvUrl = cvRes.data.url;
                }
            }

            let coverLetterUrl = undefined;
            let coverLetterText = undefined;
            if (coverLetterMode === 'upload' && uploadedCoverLetter) {
                const clRes = await jobService.uploadCoverLetter(uploadedCoverLetter);
                if (clRes.status === 'success' && clRes.data?.url) {
                    coverLetterUrl = clRes.data.url;
                }
            } else if (coverLetterMode === 'write' && coverLetter.trim()) {
                coverLetterText = coverLetter;
            }

            const applicationData = {
                coverLetter: coverLetterText,
                coverLetterUrl: coverLetterUrl,
                cvUrl: cvUrl,
                documentIds: selectedDocuments
            };

            const applyRes = await jobService.applyToJob(jobId, applicationData);
            if (applyRes.status === 'success') {
                setShowSuccessModal(true);
                setTimeout(() => {
                    setShowSuccessModal(false);
                    navigate('/personal/jobs');
                }, 2000);
            }
        } catch (error) {
            console.error('Application failed:', error);
            alert('Failed to submit application. Please try again.');
        } finally {
            setIsApplying(false);
        }
    };

    return (
        <div className="w-full min-h-screen flex justify-center py-10 px-4 sm:px-8 bg-white lg:bg-gray-50 overflow-y-auto">
            {/* Main Form Container - matching dashboard sizing */}
            <div className="w-full max-w-xl bg-white lg:rounded-2xl lg:shadow-md p-2 sm:p-8 h-auto flex flex-col mb-10">
                {isLoading || !job ? (
                    <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                        <Loader2 size={32} className="animate-spin text-[#003971]" />
                    </div>
                ) : (
                    <>
                        {/* Back Button and Title */}
                        <div className="mb-6">
                    <button
                        onClick={() => step === 2 ? setStep(1) : navigate('/personal/jobs')}
                        className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4 transition-colors min-h-[44px]"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-lg font-medium">{step === 2 ? 'Back to Setup' : 'Apply To Job'}</span>
                    </button>

                    {/* Job Info Card */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                                    {job.title}
                                </h2>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                    <Building2 size={14} />
                                    <span>{job.company}</span>
                                </div>
                                <div className="text-sm text-gray-800 font-medium">
                                    {job.salary}
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-[#003971] text-sm">
                                <MapPin size={14} />
                                <span>{job.location}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Step 1: CV & Cover Letter */}
                {step === 1 && (
                    <>
                        {/* Select Resume Section */}
                        <div className="mb-6">
                            <h3 className="text-base font-semibold text-gray-800 mb-4">Select or Upload CV</h3>

                            {/* Platform Resume Card (Highlighted) */}
                            <div className="space-y-4">
                                {resumes.map((resume) => (
                                    <div
                                        key={resume.id}
                                        onClick={() => setSelectedResume(resume.id)}
                                        className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all overflow-hidden ${selectedResume === resume.id
                                            ? 'border-[#003971] bg-[#003971]/5 shadow-md'
                                            : 'border-yellow-400 bg-yellow-50/30 hover:shadow-md'
                                            }`}
                                    >
                                        {/* Recommended Badge */}
                                        <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1 shadow-sm border border-yellow-500">
                                            <Star size={12} className="fill-yellow-900" />
                                            Platform CV
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="flex-1 flex flex-col justify-center mt-2">
                                                <h4 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
                                                    {resume.title}
                                                </h4>
                                                <p className="text-sm text-gray-600 mb-3">{resume.createdDate}</p>
                                                <p className="text-xs text-gray-500 leading-snug max-w-sm">This is your MaritimeLink profile CV. We highly recommend using this as employers prefer reviewing standard platform profiles.</p>
                                            </div>

                                            {/* Checkmark */}
                                            <div className="self-center pr-2">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors border ${selectedResume === resume.id ? 'bg-[#003971] border-[#003971]' : 'border-gray-300 bg-white'}`}>
                                                    {selectedResume === resume.id && <Check size={14} className="text-white" strokeWidth={3} />}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="relative flex items-center py-2">
                                    <div className="flex-grow border-t border-gray-200"></div>
                                    <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">OR</span>
                                    <div className="flex-grow border-t border-gray-200"></div>
                                </div>

                                {/* Upload Custom CV Area */}
                                <div
                                    onClick={() => {
                                        if (uploadedResume) setSelectedResume('uploaded');
                                        else fileInputRef.current.click();
                                    }}
                                    className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all ${selectedResume === 'uploaded'
                                        ? 'border-[#003971] bg-[#003971]/5 shadow-md'
                                        : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                                        }`}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        accept=".pdf,.doc,.docx"
                                        className="hidden"
                                    />
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${uploadedResume ? 'bg-blue-100 text-[#003971]' : 'bg-gray-100 text-gray-500'}`}>
                                            {uploadedResume ? <FileType size={24} /> : <Upload size={24} />}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-base font-semibold text-gray-800">
                                                {uploadedResume ? uploadedResume.name : 'Upload Custom CV'}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                {uploadedResume ? `Size: ${(uploadedResume.size / 1024 / 1024).toFixed(2)} MB` : 'PDF, DOC, DOCX up to 5MB'}
                                            </p>
                                        </div>
                                        <div className="self-center">
                                            {uploadedResume && (
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors border ${selectedResume === 'uploaded' ? 'bg-[#003971] border-[#003971]' : 'border-gray-300 bg-white'}`}>
                                                    {selectedResume === 'uploaded' && <Check size={14} className="text-white" strokeWidth={3} />}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cover Letter Section */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-base font-semibold text-gray-800">Cover Letter <span className="text-gray-400 font-normal text-sm">(Optional)</span></h3>
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setCoverLetterMode('write')}
                                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${coverLetterMode === 'write' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Write
                                    </button>
                                    <button
                                        onClick={() => setCoverLetterMode('upload')}
                                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${coverLetterMode === 'upload' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Upload
                                    </button>
                                </div>
                            </div>

                            {coverLetterMode === 'write' ? (
                                <>
                                    <p className="text-sm text-gray-500 mb-3">Introduce yourself and explain why you're a great fit for this role.</p>
                                    <textarea
                                        value={coverLetter}
                                        onChange={(e) => setCoverLetter(e.target.value)}
                                        placeholder="Write your cover letter here..."
                                        className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent resize-none text-sm text-gray-700 placeholder-gray-400"
                                    />
                                </>
                            ) : (
                                <>
                                    <p className="text-sm text-gray-500 mb-3">Upload your custom cover letter document.</p>
                                    <div
                                        onClick={() => coverLetterInputRef.current.click()}
                                        className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${uploadedCoverLetter
                                            ? 'border-[#003971] bg-[#003971]/5 shadow-sm'
                                            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                                            }`}
                                    >
                                        <input
                                            type="file"
                                            ref={coverLetterInputRef}
                                            onChange={handleCoverLetterUpload}
                                            accept=".pdf,.doc,.docx"
                                            className="hidden"
                                        />
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${uploadedCoverLetter ? 'bg-blue-100 text-[#003971]' : 'bg-gray-100 text-gray-500'}`}>
                                            {uploadedCoverLetter ? <FileType size={24} /> : <Upload size={24} />}
                                        </div>
                                        <h4 className="text-base font-semibold text-gray-800 mb-1 text-center">
                                            {uploadedCoverLetter ? uploadedCoverLetter.name : 'Click to Upload Cover Letter'}
                                        </h4>
                                        <p className="text-sm text-gray-500 text-center">
                                            {uploadedCoverLetter ? `Size: ${(uploadedCoverLetter.size / 1024 / 1024).toFixed(2)} MB` : 'PDF, DOC, DOCX up to 5MB'}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Next Button */}
                        <button
                            onClick={() => setStep(2)}
                            disabled={!selectedResume}
                            className={`w-full py-3 rounded-full text-white font-medium transition-colors min-h-[44px] mt-4 ${selectedResume
                                ? 'bg-[#003971] hover:bg-[#003971]/90'
                                : 'bg-gray-400 cursor-not-allowed'
                                }`}
                        >
                            Next
                        </button>
                    </>
                )}

                {/* Step 2: Document Wallet */}
                {step === 2 && (
                    <>
                        <div className="mb-6">
                            <h3 className="text-base font-semibold text-gray-800 mb-2">Select From Document Wallet <span className="text-gray-400 font-normal text-sm">(Optional)</span></h3>
                            <p className="text-sm text-gray-500 mb-4">Choose any additional documents or certificates you'd like to include with this application.</p>

                            {!selectedFolder ? (
                                <div className="space-y-3">
                                    {documentFolders.map((folder) => (
                                        <div
                                            key={folder.id}
                                            onClick={() => setSelectedFolder(folder)}
                                            className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-colors ${folder.documents.some((doc) => selectedDocuments.includes(doc.id))
                                                ? 'border-[#003971] bg-[#003971]/5'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${folder.documents.some((doc) => selectedDocuments.includes(doc.id))
                                                    ? 'bg-[#003971] text-white'
                                                    : 'bg-[#003971]/10 text-[#003971]'
                                                    }`}>
                                                    <Folder size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-800">{folder.name}</h4>
                                                    <p className="text-xs text-gray-500">{folder.documents.length} document(s)</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {folder.documents.some((doc) => selectedDocuments.includes(doc.id)) && (
                                                    <span className="text-xs font-semibold text-[#003971]">
                                                        {folder.documents.filter((doc) => selectedDocuments.includes(doc.id)).length} selected
                                                    </span>
                                                )}
                                                <ChevronRight size={18} className="text-gray-400" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedFolder(null)}
                                        className="flex items-center gap-2 text-sm text-[#003971] hover:text-[#002855] mb-3"
                                    >
                                        <ArrowLeft size={16} />
                                        Back to Folders
                                    </button>

                                    <div className="space-y-3">
                                        {selectedFolder.documents.map((doc) => (
                                            <div
                                                key={doc.id}
                                                onClick={() => {
                                                    if (selectedDocuments.includes(doc.id)) {
                                                        setSelectedDocuments(selectedDocuments.filter(id => id !== doc.id));
                                                    } else {
                                                        setSelectedDocuments([...selectedDocuments, doc.id]);
                                                    }
                                                }}
                                                className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${selectedDocuments.includes(doc.id) ? 'border-[#003971] bg-[#003971]/5' : 'border-gray-200 hover:border-gray-300'}`}
                                            >
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center mr-4 ${selectedDocuments.includes(doc.id) ? 'bg-[#003971] border-[#003971]' : 'border-gray-300 bg-white'}`}>
                                                    {selectedDocuments.includes(doc.id) && <Check size={14} className="text-white" strokeWidth={3} />}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-semibold text-gray-800">{doc.title}</h4>
                                                    <div className="flex gap-3 text-xs text-gray-500 mt-1">
                                                        <span className="bg-gray-100 px-2 rounded">{doc.type}</span>
                                                        <span>Expires: {doc.expiry}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Apply Button */}
                        <button
                            onClick={handleApply}
                            disabled={isApplying}
                            className={`w-full py-3 rounded-full text-white font-medium transition-colors min-h-[44px] mt-4 flex items-center justify-center ${isApplying ? 'bg-[#003971]/70' : 'bg-[#003971] hover:bg-[#003971]/90'}`}
                        >
                            {isApplying ? <Loader2 size={18} className="animate-spin" /> : 'Submit Application'}
                        </button>
                    </>
                )}
                    </>
                )}
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 size={32} className="text-green-600" />
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-800 mb-2">Applied Successfully!</h3>
                        <p className="text-gray-600">Your application has been submitted.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplyToJob;

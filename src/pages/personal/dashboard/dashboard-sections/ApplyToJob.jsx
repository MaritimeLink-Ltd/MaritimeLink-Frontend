import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Building2, CheckCircle2, Upload, FileType, Check, Star, Folder, ChevronRight } from 'lucide-react';
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

    // Sample job data
    const jobs = {
        '1': {
            id: 1,
            title: 'Senior Seafarer',
            company: 'ABC Company',
            salary: 'GBP 50000',
            location: 'London',
            type: 'Full Time'
        },
        '2': {
            id: 2,
            title: 'Marine Engineer',
            company: 'Ocean Dynamics Ltd',
            salary: 'GBP 45000',
            location: 'Southampton',
            type: 'Full Time'
        },
        '3': {
            id: 3,
            title: 'Deck Officer',
            company: 'Maritime Solutions',
            salary: 'GBP 55000',
            location: 'Liverpool',
            type: 'Contract'
        },
        '4': {
            id: 4,
            title: 'Chief Engineer',
            company: 'Seafarers International',
            salary: 'GBP 65000',
            location: 'Glasgow',
            type: 'Full Time'
        },
        '5': {
            id: 5,
            title: 'Navigation Officer',
            company: 'Global Maritime Group',
            salary: 'GBP 48000',
            location: 'London',
            type: 'Full Time'
        }
    };

    const job = jobs[jobId] || jobs['1'];

    // Sample resume data
    const resumes = [
        {
            id: 1,
            title: 'My CV 2026',
            createdDate: 'Created 12 Dec 2025',
            thumbnail: 'https://placehold.co/300x400/f3f4f6/a3a3a3?text=CV+2026'
        }
    ];

    // Sample document wallet data
    const documentWalletItems = [
        { id: 'doc1', title: 'Certificate of Competency', expiry: '31 Dec 2026', type: 'License Certificate' },
        { id: 'doc2', title: 'Basic Safety Training', expiry: '31 Dec 2026', type: 'STCW Certificate' },
        { id: 'doc3', title: 'Medical Fitness Certificate', expiry: '31 Dec 2026', type: 'Medical Certificate' },
        { id: 'doc4', title: 'Passport', expiry: '31 Dec 2026', type: 'Travel Document' },
        { id: 'doc5', title: 'Seaman Book', expiry: '31 Dec 2026', type: 'Seaman Document' },
        { id: 'doc6', title: 'Engineering Degree', expiry: '31 Dec 2026', type: 'Academic Certificate' }
    ];

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

    const handleApply = () => {
        if (selectedResume) {
            // Handle job application submission
            const applicationData = {
                jobId,
                resumeType: selectedResume === 'uploaded' ? 'uploaded' : 'platform',
                resumeData: selectedResume === 'uploaded' ? uploadedResume : resumes.find(r => r.id === selectedResume),
                coverLetterMode,
                coverLetterData: coverLetterMode === 'write' ? coverLetter : uploadedCoverLetter,
                selectedDocuments
            };
            console.log('Applying with data:', applicationData);
            setShowSuccessModal(true);
            setTimeout(() => {
                setShowSuccessModal(false);
                navigate('/personal/jobs');
            }, 2000);
        }
    };

    return (
        <div className="w-full min-h-screen flex justify-center py-10 px-4 sm:px-8 bg-white lg:bg-gray-50 overflow-y-auto">
            {/* Main Form Container - matching dashboard sizing */}
            <div className="w-full max-w-xl bg-white lg:rounded-2xl lg:shadow-md p-2 sm:p-8 h-auto flex flex-col mb-10">
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
                            className="w-full py-3 rounded-full text-white font-medium transition-colors min-h-[44px] mt-4 bg-[#003971] hover:bg-[#003971]/90"
                        >
                            Submit Application
                        </button>
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

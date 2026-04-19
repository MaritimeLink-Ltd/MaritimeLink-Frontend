import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Scan, CheckCircle, ArrowLeft, Loader2, Eye, ZoomIn, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import documentService from '../../../../services/documentService';

const UploadDocument = ({ onBack, onCompletion, category }) => {
    const fileInputRef = useRef(null);
    const filePreviewUrlRef = useRef(null);

    // ─── Tab Setup ────────────────────────────────────────────────────────────
    const initialTabMap = {
        'licenses': 'Licenses & Endorsements',
        'stcw': 'STCW Certificates',
        'medical': 'Medical Certificates',
        'seaman': 'Seaman Book data/Stamp pages',
        'travel': 'Travel Documents',
        'academic': 'Academic Qualifications',
        'company': 'Company Letters / Misc',
        'appraisals': 'Recent Appraisals'
    };

    const tabs = [
        'Licenses & Endorsements',
        'STCW Certificates',
        'Medical Certificates',
        'Seaman Book data/Stamp pages',
        'Travel Documents',
        'Academic Qualifications',
        'Company Letters / Misc',
        'Recent Appraisals'
    ];

    const defaultTab = category?.id ? (initialTabMap[category.id] || 'Licenses & Endorsements') : 'Licenses & Endorsements';
    const [activeTab, setActiveTab] = useState(defaultTab);

    // ─── State ────────────────────────────────────────────────────────────────
    const [selectedFile, setSelectedFile] = useState(null);
    const [ocrState, setOcrState] = useState('idle');   // 'idle' | 'scanning' | 'completed'
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedDocId, setUploadedDocId] = useState(null);     // ID from OCR upload
    const [ocrCompleted, setOcrCompleted] = useState(false);    // True after OCR upload succeeds
    const [uploadedFileUrl, setUploadedFileUrl] = useState(null); // URL from API after upload
    const [ocrMatchStatus, setOcrMatchStatus] = useState(null); // API matchStatus details for OCR mismatch UI
    const [showFullPreview, setShowFullPreview] = useState(false); // Full-screen preview modal
    const [localPreviewUrl, setLocalPreviewUrl] = useState(null);  // Local blob URL for preview

    // Manage local blob URL lifecycle — create on file select, revoke on cleanup
    useEffect(() => {
        if (selectedFile) {
            // Revoke previous blob URL if any
            if (filePreviewUrlRef.current) {
                URL.revokeObjectURL(filePreviewUrlRef.current);
            }
            const url = URL.createObjectURL(selectedFile);
            filePreviewUrlRef.current = url;
            setLocalPreviewUrl(url);
        } else {
            if (filePreviewUrlRef.current) {
                URL.revokeObjectURL(filePreviewUrlRef.current);
                filePreviewUrlRef.current = null;
            }
            setLocalPreviewUrl(null);
        }
        return () => {
            if (filePreviewUrlRef.current) {
                URL.revokeObjectURL(filePreviewUrlRef.current);
                filePreviewUrlRef.current = null;
            }
        };
    }, [selectedFile]);

    const [formData, setFormData] = useState({
        certificateName: '',
        certificateNumber: '',
        issuingCountry: '',
        dateOfIssue: '',
        validTill: ''
    });

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /** Whether the active tab requires OCR & certificate fields */
    const isOcrRequired = !['Company Letters / Misc', 'Recent Appraisals'].includes(activeTab);

    /** Map tab label → backend ENUM string */
    const getCategoryEnum = (tabName) => {
        const normalized = String(tabName).toLowerCase();
        if (normalized.includes('license')) return 'LICENSES_ENDORSEMENTS';
        if (normalized.includes('stcw')) return 'STCW_CERTIFICATES';
        if (normalized.includes('medical')) return 'MEDICAL_CERTIFICATES';
        if (normalized.includes('seaman')) return 'SEAMANS_BOOK';
        if (normalized.includes('travel')) return 'TRAVEL_DOCUMENTS';
        if (normalized.includes('academic')) return 'ACADEMIC_QUALIFICATIONS';
        if (normalized.includes('company') || normalized.includes('misc')) return 'MISC_COMPANY_LETTERS';
        if (normalized.includes('appraisal')) return 'RECENT_APPRAISALS';
        return 'LICENSES_ENDORSEMENTS'; // Safe fallback
    };

    /** Safely convert a date string to full ISO format expected by the backend */
    const toISODate = (dateStr) => {
        if (!dateStr) return '';
        try { return new Date(dateStr).toISOString(); }
        catch { return ''; }
    };

    const formatMismatchValue = (key, value) => {
        if (!value) return 'empty';

        if (key === 'issueDate' || key === 'expiryDate') {
            const date = new Date(value);
            if (!Number.isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
            }
        }

        return String(value);
    };

    // ─── Handlers ─────────────────────────────────────────────────────────────

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        // Reset OCR state when switching tabs
        setSelectedFile(null);
        setOcrState('idle');
        setOcrCompleted(false);
        setUploadedDocId(null);
        setUploadedFileUrl(null);
        setOcrMatchStatus(null);
        setLocalPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setFormData({ certificateName: '', certificateNumber: '', issuingCountry: '', dateOfIssue: '', validTill: '' });
    };

    /**
     * REAL OCR FLOW:
     * 1. File is selected → immediately upload to API
     * 2. API runs OCR and returns ocrData
     * 3. Pre-fill form fields with extracted data
     * 4. User reviews & corrects the data
     * 5. On "Upload Document" click → PATCH to update confirmed data
     */
    const runRealOCR = async (file) => {
        setOcrState('scanning');
        try {
            const uploadData = {
                file,
                category: getCategoryEnum(activeTab),
                name: file.name.split('.')[0], // Temporary name; user updates in form
                number: '',
                issuingCountry: '',
                issueDate: '',
                expiryDate: '',
            };

            const response = await documentService.uploadDocument(uploadData);
            const payload = response?.data || {};
            const savedDoc = payload.document || response?.document || null;
            const ocrData = payload.ocrData || response?.ocrData || null;
            const matchStatus = payload.matchStatus || response?.matchStatus || null;

            // Pre-fill form with REAL extracted data from the API
            if (ocrData) {
                setFormData({
                    certificateName: ocrData.name || savedDoc?.name || '',
                    certificateNumber: ocrData.number || '',
                    issuingCountry: ocrData.issuingCountry || '',
                    dateOfIssue: ocrData.issueDate
                        ? ocrData.issueDate.split('T')[0]
                        : '',
                    validTill: ocrData.expiryDate
                        ? ocrData.expiryDate.split('T')[0]
                        : '',
                });
            }

            // Store the doc ID and file URL so we can PATCH with confirmed data
            setUploadedDocId(savedDoc?.id || null);
            setUploadedFileUrl(savedDoc?.fileUrl || savedDoc?.url || null);
            setOcrMatchStatus(matchStatus);
            setOcrCompleted(true);
            setOcrState('completed');

            toast.success('Document scanned! Please review and confirm the details.', {
                duration: 4000,
                position: 'top-right',
            });

            // Auto-close OCR modal after short delay
            setTimeout(() => setOcrState('idle'), 2000);

        } catch (error) {
            console.error('OCR upload error:', error);
            setOcrState('idle');
            setOcrCompleted(false);
            setOcrMatchStatus(null);
            toast.error('OCR scanning failed. Please fill in the details manually.', {
                position: 'top-right',
            });
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Reset the input so the same file can be re-selected
        if (fileInputRef.current) fileInputRef.current.value = '';

        setSelectedFile(file);
        setFormData(prev => ({ ...prev, certificateName: file.name.split('.')[0] }));
        setOcrCompleted(false);
        setUploadedDocId(null);
        setUploadedFileUrl(null);
        setOcrMatchStatus(null);

        if (isOcrRequired) {
            await runRealOCR(file);
        }
    };

    const handleDragOver = (e) => e.preventDefault();

    const handleDrop = async (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (!file) return;

        setSelectedFile(file);
        setFormData(prev => ({ ...prev, certificateName: file.name.split('.')[0] }));
        setOcrCompleted(false);
        setUploadedDocId(null);
        setUploadedFileUrl(null);
        setOcrMatchStatus(null);
        if (fileInputRef.current) fileInputRef.current.value = '';

        if (isOcrRequired) {
            await runRealOCR(file);
        }
    };

    /**
     * CONFIRM / FINAL UPLOAD:
     * - OCR tabs:      PATCH the already-uploaded doc with user-verified data
     * - Non-OCR tabs:  Fresh POST upload with just name + file
     */
    const handleUploadClick = async () => {
        if (!selectedFile) {
            toast.error('Please upload a document first.', { position: 'top-right' });
            return;
        }

        // Field validation
        const requiredFields = isOcrRequired
            ? ['certificateName', 'certificateNumber', 'issuingCountry', 'dateOfIssue', 'validTill']
            : ['certificateName'];

        const hasEmpty = requiredFields.some(f => !formData[f]?.trim());
        if (hasEmpty) {
            toast.error('Please fill in all required fields.', { position: 'top-right' });
            return;
        }

        try {
            setIsUploading(true);
            let finalDoc;

            if (isOcrRequired && ocrCompleted && uploadedDocId) {
                /**
                 * OCR path:
                 * File was already uploaded during OCR scan.
                 * Now we PATCH the same document with the user-confirmed data.
                 */
                const updatePayload = {
                    name: formData.certificateName,
                    number: formData.certificateNumber || '',
                    issuingCountry: formData.issuingCountry || '',
                    issueDate: toISODate(formData.dateOfIssue),
                    expiryDate: toISODate(formData.validTill),
                };

                const response = await documentService.updateDocument(uploadedDocId, updatePayload);
                finalDoc = response?.data?.document || response?.document;

            } else {
                /**
                 * Non-OCR path (Company Letters / Misc, Recent Appraisals):
                 * Single direct upload — no OCR extraction needed.
                 */
                const uploadData = {
                    file: selectedFile,
                    category: getCategoryEnum(activeTab),
                    name: formData.certificateName,
                    number: formData.certificateNumber || '',
                    issuingCountry: formData.issuingCountry || '',
                    issueDate: toISODate(formData.dateOfIssue),
                    expiryDate: toISODate(formData.validTill),
                };

                const response = await documentService.uploadDocument(uploadData);
                finalDoc = response?.data?.document || response?.document;
            }

            toast.success('Document uploaded successfully!', { position: 'top-right' });

            // Reset form for next upload
            const completedDoc = {
                ...finalDoc,
                title: finalDoc?.name || formData.certificateName,
                type: activeTab,
                image: finalDoc?.fileUrl || localPreviewUrl,
                status: 'Pending Approval',
                statusColor: 'bg-yellow-500',
            };

            // Reset all state so user can upload another document
            setSelectedFile(null);
            setOcrState('idle');
            setOcrCompleted(false);
            setUploadedDocId(null);
            setUploadedFileUrl(null);
            setOcrMatchStatus(null);
            setLocalPreviewUrl(null);
            setShowFullPreview(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
            setFormData({ certificateName: '', certificateNumber: '', issuingCountry: '', dateOfIssue: '', validTill: '' });

            if (onCompletion) {
                onCompletion(completedDoc);
            }

        } catch (error) {
            console.error('Upload confirm error:', error);
            toast.error(error.message || 'Failed to upload document. Please try again.', {
                position: 'top-right',
            });
        } finally {
            setIsUploading(false);
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="w-full max-w-7xl mx-auto p-8 relative">
            <Toaster />

            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-[#003971] mb-4 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">Back</span>
                </button>
                <h1 className="text-3xl font-semibold text-gray-800">Upload Document</h1>
                <p className="text-gray-500 mt-1 text-lg">Upload new documents to keep your profile updated</p>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-3 mb-8">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => handleTabChange(tab)}
                        className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${activeTab === tab
                                ? 'bg-[#003366] text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex flex-col lg:flex-row gap-8">

                {/* ── Form Section ───────────────────────────────────────────── */}
                <div className="flex-1 space-y-6">

                    {/* Document Name — always visible */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Document Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="certificateName"
                            value={formData.certificateName}
                            onChange={handleInputChange}
                            placeholder="Enter document name"
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-600"
                        />
                    </div>

                    {/* OCR-required fields */}
                    {isOcrRequired && (
                        <>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Certificate Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="certificateNumber"
                                    value={formData.certificateNumber}
                                    onChange={handleInputChange}
                                    placeholder="Enter certificate number"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-600"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Issuing Country <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="issuingCountry"
                                    value={formData.issuingCountry}
                                    onChange={handleInputChange}
                                    placeholder="Enter issuing country"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-600"
                                />
                            </div>

                            <div className="flex gap-6">
                                <div className="flex-1 space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Date Of Issue <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="dateOfIssue"
                                        value={formData.dateOfIssue}
                                        onChange={handleInputChange}
                                        onClick={(e) => e.target.showPicker()}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-600"
                                    />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Valid Till <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="validTill"
                                        value={formData.validTill}
                                        onChange={handleInputChange}
                                        onClick={(e) => e.target.showPicker()}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-600"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* OCR Notice Banner */}
                    {isOcrRequired && ocrCompleted && (
                        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                            <CheckCircle size={18} className="mt-0.5 shrink-0 text-blue-600" />
                            <p>
                                The fields above have been pre-filled using OCR extraction.
                                Please review and correct any inaccuracies before confirming.
                            </p>
                        </div>
                    )}

                    {/* OCR mismatch details from API */}
                    {isOcrRequired && ocrCompleted && ocrMatchStatus?.details && ocrMatchStatus?.isFullyMatched === false && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                            <p className="font-semibold mb-2">OCR mismatch found</p>
                            <ul className="space-y-1.5 list-disc pl-5">
                                {Object.entries(ocrMatchStatus.details)
                                    .filter(([, detail]) => detail && detail.isMatched === false)
                                    .map(([key, detail]) => {
                                        const labelMap = {
                                            name: 'Name',
                                            number: 'Certificate Number',
                                            issuingCountry: 'Issuing Country',
                                            issueDate: 'Date Of Issue',
                                            expiryDate: 'Valid Till',
                                        };
                                        const label = labelMap[key] || key;
                                        return (
                                            <li key={key}>
                                                <span className="font-medium">{label}:</span>{' '}
                                                Entered: <span className="font-medium">{formatMismatchValue(key, detail.entered)}</span>,
                                                Extracted: <span className="font-medium">{formatMismatchValue(key, detail.extracted)}</span>
                                            </li>
                                        );
                                    })}
                            </ul>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-4">
                        <button
                            onClick={handleUploadClick}
                            disabled={isUploading || ocrState === 'scanning'}
                            className="w-full flex justify-center items-center gap-2 bg-[#003366] text-white py-3 rounded-lg font-medium hover:bg-blue-900 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Uploading...
                                </>
                            ) : (
                                'Upload Document'
                            )}
                        </button>
                        <button
                            onClick={onBack}
                            className="w-full bg-gray-50 text-gray-600 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>

                {/* ── File Drop Zone ─────────────────────────────────────────── */}
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Image / PDF
                    </label>

                    {/* Show document preview when OCR completed and we have a file URL or local file */}
                    {ocrCompleted && selectedFile ? (
                        <div className="w-full h-[400px] rounded-2xl border-2 border-solid border-green-200 bg-white overflow-hidden relative group">
                            {/* OCR Badge */}
                            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
                                <CheckCircle size={14} />
                                OCR Complete
                            </div>

                            {/* Preview Content */}
                            <div className="w-full h-full flex items-center justify-center bg-gray-50 p-2">
                                {selectedFile.type?.startsWith('image/') ? (
                                    <img
                                        src={uploadedFileUrl || localPreviewUrl}
                                        alt="Document preview"
                                        className="max-w-full max-h-full object-contain rounded-lg"
                                        onError={(e) => {
                                            // Fallback to local file if remote URL fails
                                            if (uploadedFileUrl && localPreviewUrl) {
                                                e.target.src = localPreviewUrl;
                                            }
                                        }}
                                    />
                                ) : selectedFile.type === 'application/pdf' ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center">
                                        <iframe
                                            src={uploadedFileUrl || localPreviewUrl}
                                            title="PDF Preview"
                                            className="w-full h-full rounded-lg border-0"
                                            onError={() => {}}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-3">
                                        <FileText size={56} className="text-[#003366]" />
                                        <span className="text-sm font-medium text-gray-700 break-all max-w-xs text-center">
                                            {selectedFile.name}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Hover Overlay with Actions */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowFullPreview(true);
                                        }}
                                        className="flex items-center gap-2 bg-white text-gray-800 px-4 py-2.5 rounded-lg shadow-lg font-medium text-sm hover:bg-gray-100 transition-colors"
                                    >
                                        <ZoomIn size={16} />
                                        View Full
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            fileInputRef.current?.click();
                                        }}
                                        className="flex items-center gap-2 bg-white text-gray-800 px-4 py-2.5 rounded-lg shadow-lg font-medium text-sm hover:bg-gray-100 transition-colors"
                                    >
                                        <Upload size={16} />
                                        Change
                                    </button>
                                </div>
                            </div>

                            {/* File name footer */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
                                <p className="text-white text-sm font-medium truncate">{selectedFile.name}</p>
                                <p className="text-white/70 text-xs">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileSelect}
                                accept="image/*,application/pdf"
                            />
                        </div>
                    ) : (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            className="w-full h-[400px] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition-all"
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileSelect}
                                accept="image/*,application/pdf"
                            />

                            {selectedFile ? (
                                <div className="flex flex-col items-center p-6 text-center">
                                    {selectedFile.type?.startsWith('image/') ? (
                                        <img
                                            src={localPreviewUrl}
                                            alt="Selected document"
                                            className="max-w-full max-h-[280px] object-contain rounded-lg mb-3"
                                        />
                                    ) : (
                                        <FileText size={48} className="text-[#003366] mb-4" />
                                    )}
                                    <span className="text-sm font-medium text-gray-800 break-all max-w-xs">
                                        {selectedFile.name}
                                    </span>
                                    <span className="text-xs text-gray-400 mt-1">
                                        Click to change
                                    </span>
                                </div>
                            ) : (
                                <>
                                    <div className="p-4 bg-white rounded-xl shadow-sm mb-3">
                                        <Upload size={24} className="text-gray-400" />
                                    </div>
                                    <span className="text-lg font-medium text-gray-400">Upload Here</span>
                                    <span className="text-sm text-gray-400 mt-1">Drag & drop or click to browse</span>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── OCR Modal Overlay ────────────────────────────────────────── */}
            {ocrState !== 'idle' && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-8 w-[400px] shadow-xl">
                        <div className="flex flex-col items-center">
                            {ocrState === 'scanning' ? (
                                <>
                                    <div className="text-[#003971] mb-4 animate-pulse">
                                        <Scan size={40} />
                                    </div>
                                    <h3 className="text-xl font-medium text-gray-800 mb-2">Scanning Document</h3>
                                    <p className="text-sm text-gray-500 mb-6 text-center">
                                        Extracting information via OCR. Please wait…
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="text-[#003366] mb-4">
                                        <CheckCircle size={40} fill="#003366" className="text-white" />
                                    </div>
                                    <h3 className="text-xl font-medium text-gray-800 mb-2">OCR Completed</h3>
                                    <p className="text-sm text-gray-500 mb-6 text-center">
                                        Information extracted. Please review the pre-filled fields.
                                    </p>
                                </>
                            )}

                            {/* Skeleton Loader */}
                            <div className="w-full space-y-3">
                                {[1, 0.75, 0.9, 1, 0.8, 0.85].map((w, i) => (
                                    <div
                                        key={i}
                                        className="h-4 bg-gray-100 rounded-full animate-pulse"
                                        style={{ width: `${w * 100}%`, animationDelay: `${i * 75}ms` }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Full-Screen Document Preview Modal ─────────────────────── */}
            {showFullPreview && selectedFile && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#003366] rounded-lg flex items-center justify-center">
                                    <Eye size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 truncate max-w-md">{selectedFile.name}</h3>
                                    <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowFullPreview(false)}
                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>

                        {/* Preview Content */}
                        <div className="flex-1 overflow-auto flex items-center justify-center p-6 bg-gray-100">
                            {selectedFile.type?.startsWith('image/') ? (
                                <img
                                    src={uploadedFileUrl || localPreviewUrl}
                                    alt="Document full preview"
                                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                                    onError={(e) => {
                                        if (uploadedFileUrl && localPreviewUrl) {
                                            e.target.src = localPreviewUrl;
                                        }
                                    }}
                                />
                            ) : selectedFile.type === 'application/pdf' ? (
                                <iframe
                                    src={uploadedFileUrl || localPreviewUrl}
                                    title="PDF Full Preview"
                                    className="w-full h-[70vh] rounded-lg border-0 shadow-lg"
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-4 py-12">
                                    <FileText size={72} className="text-[#003366]" />
                                    <span className="text-lg font-medium text-gray-700">{selectedFile.name}</span>
                                    <span className="text-sm text-gray-500">Preview not available for this file type</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadDocument;

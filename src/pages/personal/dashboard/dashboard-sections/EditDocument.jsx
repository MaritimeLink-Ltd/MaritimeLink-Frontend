import React, { useState } from 'react';
import { Upload, Calendar, FileText, Scan, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import documentService from '../../../../services/documentService';

const EditDocument = ({ onBack, onCompletion, document }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = React.useRef(null);
    const [activeTab, setActiveTab] = useState(document?.type || 'Medical Certificates');
    
    // Pre-fill form with document data
    const [formData, setFormData] = useState({
        certificateName: document?.name || document?.title || '',
        certificateNumber: document?.certificateNumber || document?.number || '',
        issuingCountry: document?.issuingCountry || '',
        dateOfIssue: document?.dateOfIssue || document?.issueDate || '',
        validTill: document?.validTill || document?.expires || document?.expiryDate || ''
    });

    const tabs = [
        'Licenses and Endorsements',
        'Seaman Book data/Stamp pages',
        'Medical Certificates',
        'Travel Documents'
    ];

    const [ocrState, setOcrState] = useState('idle'); // 'idle', 'scanning', 'completed'
    const [isUpdating, setIsUpdating] = useState(false);
    const [dateError, setDateError] = useState('');
    const today = new Date().toISOString().split('T')[0];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (name === 'dateOfIssue') {
            setDateError('');
        }
    };

    const simulateOCR = (file) => {
        setOcrState('scanning');

        // Simulate scanning duration
        setTimeout(() => {
            setOcrState('completed');

            // Auto close after completion
            setTimeout(() => {
                setOcrState('idle');
            }, 2000);
        }, 3000);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            simulateOCR(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            setSelectedFile(file);
            simulateOCR(file);
        }
    };

    const handleUpdateDocument = () => {
        // Validate date of issue is not in the future
        if (formData.dateOfIssue) {
            const issueDate = new Date(formData.dateOfIssue);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (issueDate > today) {
                setDateError('Please enter valid date');
                return;
            }
        }
        // Validate dates
        if (formData.dateOfIssue && formData.validTill) {
            const issueDate = new Date(formData.dateOfIssue);
            const validDate = new Date(formData.validTill);
            if (issueDate >= validDate) {
                setDateError('Date of Issue must be before Valid Till date');
                return;
            }
        }
        setDateError('');

        const updateData = async () => {
            try {
                setIsUpdating(true);
                
                // Construct the payload to match what the backend expects
                // Since this is PATCH, we might not need FormData unless we are changing the file.
                // Assuming backend expects JSON if no file, or FormData if there is a file change.
                // Helper to format date to full ISO string
                const toISODate = (dateStr) => {
                    if (!dateStr) return '';
                    try {
                        return new Date(dateStr).toISOString();
                    } catch (e) {
                        return '';
                    }
                };

                let payload;
                
                if (selectedFile) {
                    payload = new FormData();
                    payload.append('document', selectedFile);
                    if (formData.certificateName) payload.append('name', formData.certificateName);
                    if (formData.certificateNumber) payload.append('number', formData.certificateNumber);
                    if (formData.issuingCountry) payload.append('issuingCountry', formData.issuingCountry);
                    if (formData.dateOfIssue) payload.append('issueDate', toISODate(formData.dateOfIssue));
                    if (formData.validTill) payload.append('expiryDate', toISODate(formData.validTill));
                } else {
                    payload = {
                        name: formData.certificateName,
                        number: formData.certificateNumber,
                        issuingCountry: formData.issuingCountry,
                        issueDate: toISODate(formData.dateOfIssue),
                        expiryDate: toISODate(formData.validTill)
                    };
                }

                // If document.id is essentially a local timestamp from earlier, the backend call will fail.
                // We'll proceed optimistically if no ID exists, though typically it should be provided by DB.
                if (document?.id && typeof document.id !== 'number') {
                     await documentService.updateDocument(document.id, payload);
                }

                toast.success('Document updated successfully!');
                
                if (onCompletion) {
                    onCompletion({
                        ...document,
                        ...formData,
                        type: activeTab,
                        image: selectedFile ? URL.createObjectURL(selectedFile) : document?.image
                    });
                }
            } catch (error) {
                toast.error(error.message || 'Failed to update document.');
            } finally {
                setIsUpdating(false);
            }
        };

        updateData();
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-8 relative">
            <Toaster />
            {/* Header with Back Button */}
            <div className="mb-8">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-[#003971] mb-4 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">Back</span>
                </button>
                <h1 className="text-3xl font-semibold text-gray-800">Edit Document</h1>
                <p className="text-gray-500 mt-1 text-lg">Update document details and upload new version</p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-3 mb-8">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
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
                {/* Form Section */}
                <div className="flex-1 space-y-6">
                    {/* Certificate Name */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Certificate Name</label>
                        <input
                            type="text"
                            name="certificateName"
                            placeholder="Enter certificate name"
                            value={formData.certificateName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-600"
                        />
                    </div>

                    {/* Certificate Number */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Certificate Number</label>
                        <input
                            type="text"
                            name="certificateNumber"
                            placeholder="Enter certificate number"
                            value={formData.certificateNumber}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-600"
                        />
                    </div>

                    {/* Issuing Country */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Issuing Country</label>
                        <input
                            type="text"
                            name="issuingCountry"
                            placeholder="Enter country name"
                            value={formData.issuingCountry}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-600"
                        />
                    </div>

                    {/* Dates */}
                    <div className="flex gap-6">
                        <div className="flex-1 space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Date Of Issue</label>
                            <input
                                type="date"
                                name="dateOfIssue"
                                value={formData.dateOfIssue}
                                onChange={handleInputChange}
                                max={today}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-600"
                                onClick={(e) => e.target.showPicker()}
                            />
                            {dateError && (
                                <p className="text-red-500 text-xs mt-1">{dateError}</p>
                            )}
                        </div>
                        <div className="flex-1 space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Valid Till</label>
                            <input
                                type="date"
                                name="validTill"
                                value={formData.validTill}
                                onChange={handleInputChange}
                                min={formData.dateOfIssue || new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-600"
                                onClick={(e) => e.target.showPicker()}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-4">
                        <button 
                            onClick={handleUpdateDocument}
                            disabled={isUpdating}
                            className="w-full flex justify-center items-center gap-2 bg-[#003366] text-white py-3 rounded-lg font-medium hover:bg-blue-900 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isUpdating ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Updating...
                                </>
                            ) : (
                                'Update Document'
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

                {/* Upload Area */}
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image/Pdf</label>
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
                                <FileText size={48} className="text-[#003366] mb-4" />
                                <span className="text-lg font-medium text-gray-800 break-all max-w-xs">{selectedFile.name}</span>
                                <span className="text-sm text-gray-500 mt-2">Click to change</span>
                            </div>
                        ) : document?.fileUrl ? (
                            <div className="flex flex-col items-center p-6 text-center w-full">
                                <div className="mb-4 max-h-[300px] overflow-hidden w-full flex items-center justify-center bg-gray-50 rounded-lg">
                                    <img 
                                        src={document.fileUrl} 
                                        alt={document.title || document.name}
                                        className="max-w-full h-auto max-h-[300px] object-contain"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://placehold.co/400x300/f3f4f6/9ca3af?text=Document+Preview";
                                        }}
                                    />
                                </div>
                                <span className="text-sm text-gray-500 mt-2">Click to upload new file</span>
                            </div>
                        ) : (
                            <>
                                <div className="p-4 bg-white rounded-xl shadow-sm mb-3">
                                    <Upload size={24} className="text-gray-400" />
                                </div>
                                <span className="text-lg font-medium text-gray-400">Upload Here</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* OCR Modal */}
            {ocrState !== 'idle' && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-8 w-[400px] shadow-xl animate-in fade-in zoom-in duration-300">
                        <div className="flex flex-col items-center">
                            {ocrState === 'scanning' && (
                                <>
                                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                                        <Scan size={40} className="text-blue-600 animate-pulse" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Scanning Document...</h3>
                                    <p className="text-gray-500 text-center">
                                        Please wait while we extract information from your document
                                    </p>
                                </>
                            )}

                            {ocrState === 'completed' && (
                                <>
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle size={40} className="text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Scan Complete!</h3>
                                    <p className="text-gray-500 text-center">
                                        Document information has been extracted successfully
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditDocument;

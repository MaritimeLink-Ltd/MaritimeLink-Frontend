import React, { useState } from 'react';
import { Upload, Calendar, FileText, Scan, CheckCircle, ArrowLeft } from 'lucide-react';

const EditDocument = ({ onBack, onCompletion, document }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = React.useRef(null);
    const [activeTab, setActiveTab] = useState(document?.type || 'Medical Certificates');
    
    // Pre-fill form with document data
    const [formData, setFormData] = useState({
        certificateName: document?.title || '',
        certificateNumber: document?.certificateNumber || '',
        issuingCountry: document?.issuingCountry || '',
        dateOfIssue: document?.dateOfIssue || '',
        validTill: document?.validTill || document?.expires || ''
    });

    const tabs = [
        'Licenses and Endorsements',
        'Seaman Book data/Stamp pages',
        'Medical Certificates',
        'Travel Documents'
    ];

    const [ocrState, setOcrState] = useState('idle'); // 'idle', 'scanning', 'completed'
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

        // Call completion handler with updated data
        if (onCompletion) {
            onCompletion({
                ...document,
                ...formData,
                type: activeTab,
                image: selectedFile ? URL.createObjectURL(selectedFile) : document?.image
            });
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-8 relative">
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
                            className="w-full bg-[#003366] text-white py-3 rounded-lg font-medium hover:bg-blue-900 transition-colors"
                        >
                            Update Document
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
                        ) : document?.image ? (
                            <div className="flex flex-col items-center p-6 text-center">
                                <div className="mb-4 max-h-[300px] overflow-hidden">
                                    <img 
                                        src={document.image} 
                                        alt={document.title}
                                        className="max-w-full h-auto rounded-lg"
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

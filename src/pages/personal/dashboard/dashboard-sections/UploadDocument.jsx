import React, { useState } from 'react';
import { Upload, Calendar, FileText, Scan, CheckCircle, ArrowLeft } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const UploadDocument = ({ onBack, onCompletion }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = React.useRef(null);
    const [activeTab, setActiveTab] = useState('Licenses & Endorsements');

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

    const [ocrState, setOcrState] = useState('idle'); // 'idle', 'scanning', 'completed'
    const [formData, setFormData] = useState({
        certificateName: '',
        certificateNumber: '',
        issuingCountry: '',
        dateOfIssue: '',
        validTill: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const simulateOCR = (file) => {
        setOcrState('scanning');

        // Simulate scanning duration
        setTimeout(() => {
            setOcrState('completed');

            // Populate form with mock extracted data
            setFormData({
                certificateName: file.name.split('.')[0] || 'Sample Certificate',
                certificateNumber: 'CERT-' + Math.floor(Math.random() * 100000),
                issuingCountry: 'United Kingdom',
                dateOfIssue: new Date().toISOString().split('T')[0],
                validTill: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split('T')[0]
            });

            toast.success('Document scanned successfully! Please review the extracted information.', {
                duration: 4000,
                position: 'top-right',
            });

            // Auto close after completion
            setTimeout(() => {
                setOcrState('idle');
            }, 2000);
        }, 3000);
    };

    const isOcrRequired = !['Company Letters / Misc', 'Recent Appraisals'].includes(activeTab);

    const handleUploadClick = () => {
        if (!selectedFile) {
            toast.error('Please upload a document first.', { position: 'top-right' });
            return;
        }

        if (isOcrRequired) {
            // Simulating validation failure randomly for demo OR if fields are missing
            const isInformationCorrect = Math.random() > 0.3; // 70% chance of success for demo

            if (!formData.certificateName || !formData.certificateNumber || !formData.issuingCountry || !formData.dateOfIssue || !formData.validTill) {
                toast.error('Please fill in all the required fields.', { position: 'top-right' });
                return;
            }

            if (!isInformationCorrect) {
                toast.error('The extracted information seems incorrect. Please review and correct the details or re-upload the document.', {
                    duration: 5000,
                    position: 'top-right'
                });
                return;
            }
        } else {
            // Basic validation for non-OCR docs (e.g., just Name)
            if (!formData.certificateName) {
                toast.error('Please enter a document name.', { position: 'top-right' });
                return;
            }
        }

        toast.success('Document uploaded successfully!', { position: 'top-right' });

        if (onCompletion) {
            onCompletion({
                id: Date.now(),
                title: formData.certificateName || file.name.split('.')[0] || 'Uploaded Document',
                expiry: formData.validTill,
                type: activeTab,
                status: 'Pending Approval',
                statusColor: 'bg-yellow-500',
                image: URL.createObjectURL(selectedFile)
            });
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setFormData(prev => ({ ...prev, certificateName: file.name.split('.')[0] }));
            if (isOcrRequired) simulateOCR(file);
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
            setFormData(prev => ({ ...prev, certificateName: file.name.split('.')[0] }));
            if (isOcrRequired) simulateOCR(file);
        }
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
                <h1 className="text-3xl font-semibold text-gray-800">Upload Document</h1>
                <p className="text-gray-500 mt-1 text-lg">Upload new documents to keep your profile updated</p>
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
                    {/* Certificate Name (Always visible) */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Document Name</label>
                        <input
                            type="text"
                            name="certificateName"
                            value={formData.certificateName}
                            onChange={handleInputChange}
                            placeholder="Enter certificate name"
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-600"
                        />
                    </div>

                    {isOcrRequired && (
                        <>
                            {/* Certificate Number */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Certificate Number</label>
                                <input
                                    type="text"
                                    name="certificateNumber"
                                    value={formData.certificateNumber}
                                    onChange={handleInputChange}
                                    placeholder="Enter certificate number"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-600"
                                />
                            </div>

                            {/* Issuing Country */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Issuing Country</label>
                                <input
                                    type="text"
                                    name="issuingCountry"
                                    value={formData.issuingCountry}
                                    onChange={handleInputChange}
                                    placeholder="Enter country name"
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
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-600"
                                        onClick={(e) => e.target.showPicker()}
                                    />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Valid Till</label>
                                    <input
                                        type="date"
                                        name="validTill"
                                        value={formData.validTill}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-600"
                                        onClick={(e) => e.target.showPicker()}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-4">
                        <button
                            onClick={handleUploadClick}
                            className="w-full bg-[#003366] text-white py-3 rounded-lg font-medium hover:bg-blue-900 transition-colors"
                        >
                            Upload Document
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
                            {ocrState === 'scanning' ? (
                                <>
                                    <div className="text-[#003971] mb-4 animate-pulse">
                                        <Scan size={40} />
                                    </div>
                                    <h3 className="text-xl font-medium text-gray-800 mb-6">OCR in Progress</h3>
                                </>
                            ) : (
                                <>
                                    <div className="text-[#003366] mb-4">
                                        <CheckCircle size={40} fill="#003366" className="text-white" />
                                    </div>
                                    <h3 className="text-xl font-medium text-gray-800 mb-6">OCR Completed</h3>
                                </>
                            )}

                            {/* Skeleton Lines */}
                            <div className="w-full space-y-3">
                                <div className="h-4 bg-gray-100 rounded-full w-full animate-pulse delay-75"></div>
                                <div className="h-4 bg-gray-100 rounded-full w-3/4 animate-pulse delay-100"></div>
                                <div className="h-4 bg-gray-100 rounded-full w-5/6 animate-pulse delay-150"></div>
                                <div className="h-4 bg-gray-100 rounded-full w-full animate-pulse delay-200"></div>
                                <div className="h-4 bg-gray-100 rounded-full w-4/5 animate-pulse delay-300"></div>
                                <div className="h-4 bg-gray-100 rounded-full w-5/6 animate-pulse delay-500"></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadDocument;

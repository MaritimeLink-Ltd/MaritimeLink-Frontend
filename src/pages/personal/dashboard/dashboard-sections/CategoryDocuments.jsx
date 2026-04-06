import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, Eye, Edit2, RotateCcw, Download, CheckCircle, Trash2, Loader2, AlertTriangle, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import DocumentDetail from './DocumentDetail';
import EditDocument from './EditDocument';
import documentService from '../../../../services/documentService';

const CategoryDocuments = ({ category, onBack, onUploadClick }) => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [view, setView] = useState('list'); // 'list', 'detail', 'edit'
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [replaceDocId, setReplaceDocId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTargetDoc, setDeleteTargetDoc] = useState(null);

    const filters = [
        'All',
        'Compliance Ready',
        'Pending Approval',
        'Expiring Soon',
        'Expired'
    ];

    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    // Map frontend IDs to backend ENUM strings if needed
    const categoryMap = {
        'licenses': 'LICENSES_ENDORSEMENTS',
        'stcw': 'LICENSES_ENDORSEMENTS',
        'medical': 'MEDICAL_CERTIFICATES',
        'seaman': 'SEAMANS_BOOK',
        'travel': 'TRAVEL_DOCUMENTS',
        'academic': 'ACADEMIC_QUALIFICATIONS',
        'company': 'MISC_COMPANY_LETTERS',
        'appraisals': 'RECENT_APPRAISALS'
    };

    const fetchDocuments = async () => {
        try {
            setIsLoading(true);
            const categoryEnum = categoryMap[category?.id] || '';
            const response = await documentService.getDocuments(categoryEnum);
            
            // Transform backend data to frontend format if necessary
            // Extract documents array from nested backend response
            let docs = [];
            if (response?.data?.documents) {
                docs = response.data.documents;
            } else if (Array.isArray(response?.data)) {
                docs = response.data;
            } else if (Array.isArray(response)) {
                docs = response;
            }

            const formattedDocs = docs.map(doc => ({
                ...doc,
                // fallback properties if backend doesn't provide them yet
                status: { label: 'PENDING', color: 'bg-yellow-500' }, 
                expires: doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : 'N/A',
                type: category?.title || 'Document'
            }));
            
            setDocuments(formattedDocs);
        } catch (error) {
            console.error("Failed to fetch categorized documents", error);
            toast.error("Failed to load documents.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [category]);

    const handleDocumentClick = (doc) => {
        setSelectedDoc(doc);
        setView('detail');
    };

    const handleBackFromDetail = () => {
        setView('list');
        setSelectedDoc(null);
    };

    const handleUploadClick = () => {
        if (onUploadClick) {
            onUploadClick();
        }
    };

    // Handle Edit Document
    const handleEditDocument = (doc) => {
        setSelectedDoc(doc);
        setView('edit');
    };

    // Handle Edit Completion
    const handleEditCompletion = (updatedDoc) => {
        setSuccessMessage(`Document updated successfully!`);
        setShowSuccessModal(true);
        fetchDocuments();
        setTimeout(() => {
            setShowSuccessModal(false);
            setView('list');
            setSelectedDoc(null);
        }, 2000);
    };

    // Handle Back from Edit
    const handleBackFromEdit = () => {
        setView('list');
        setSelectedDoc(null);
    };

    // Handle Replace Document
    const handleReplaceDocument = (doc) => {
        console.log('Replacing document:', doc);
        setReplaceDocId(doc.id);
        // Trigger file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.jpg,.jpeg,.png';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                setSuccessMessage(`"${doc.title}" replaced with "${file.name}"`);
                setShowSuccessModal(true);
                setTimeout(() => {
                    setShowSuccessModal(false);
                    setReplaceDocId(null);
                }, 2000);
            }
        };
        input.click();
    };

    // Handle Download Document
    const handleDownloadDocument = (doc) => {
        if (doc.fileUrl) {
            window.open(doc.fileUrl, '_blank');
        } else {
            toast.error("Document file not available.");
        }
    };

    // Handle Delete Document
    const handleDeleteDocument = (doc) => {
        setDeleteTargetDoc(doc);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTargetDoc) return;
        try {
            setIsDeleting(true);
            await documentService.deleteDocument(deleteTargetDoc.id);
            setShowDeleteModal(false);
            setDeleteTargetDoc(null);
            toast.success('Document deleted successfully');
            fetchDocuments();
        } catch (error) {
            toast.error(error.message || 'Failed to delete document');
        } finally {
            setIsDeleting(false);
        }
    };

    // Filter documents based on active filter
    const getFilteredDocuments = () => {
        if (activeFilter === 'All') {
            return documents;
        }
        
        return documents.filter(doc => {
            switch (activeFilter) {
                case 'Compliance Ready':
                    return doc.status.label === 'VALID';
                case 'Pending Approval':
                    return doc.status.label === 'PENDING';
                case 'Expiring Soon':
                    return doc.status.label === 'EXPIRING';
                case 'Expired':
                    return doc.status.label === 'EXPIRED';
                default:
                    return true;
            }
        });
    };

    const filteredDocuments = getFilteredDocuments();

    // If viewing document detail, show DocumentDetail component
    if (view === 'detail') {
        return <DocumentDetail 
            document={selectedDoc} 
            onBack={handleBackFromDetail}
            onDeleteSuccess={() => { setView('list'); setSelectedDoc(null); fetchDocuments(); }}
        />;
    }

    // If editing document, show EditDocument component
    if (view === 'edit') {
        return <EditDocument document={selectedDoc} onBack={handleBackFromEdit} onCompletion={handleEditCompletion} />;
    }

    return (
        <div className="w-full max-w-7xl mx-auto h-full overflow-hidden relative">
            <Toaster />
            {isDeleting && (
                <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center backdrop-blur-sm">
                    <Loader2 className="w-8 h-8 animate-spin text-[#003366]" />
                </div>
            )}
            {/* Header Section */}
            <div className="bg-white px-4 sm:px-6 pt-4 pb-3">
                {/* Title Row with Back Button */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-3">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        >
                            <ArrowLeft size={20} className="text-gray-700" />
                        </button>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">{category?.title || 'Category Documents'}</h1>
                            <p className="text-gray-500 text-xs sm:text-sm">{filteredDocuments.length} documents found</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleUploadClick}
                        className="flex items-center justify-center gap-2 bg-[#003971]/10 text-[#003971] px-4 py-2 rounded-full text-sm font-medium hover:bg-[#003971]/20 transition-colors min-h-[44px] w-full sm:w-auto"
                    >
                        <Upload size={16} />
                        Upload Document
                    </button>
                </div>

                {/* Filters - Horizontal scroll on mobile */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${activeFilter === filter
                                ? 'bg-[#003971] text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Documents Grid - Single column on mobile */}
            <div className="px-4 sm:px-6 pt-3 pb-4 grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 overflow-y-auto bg-white" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                {isLoading ? (
                    <div className="col-span-full py-12 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366]"></div>
                    </div>
                ) : filteredDocuments.length > 0 ? (
                    filteredDocuments.map((doc) => (
                        <div
                            key={doc.id}
                            onClick={() => handleDocumentClick(doc)}
                            className="bg-white rounded-xl p-4 flex gap-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                        >
                            {/* Document Thumbnail */}
                            <div className="w-28 h-32 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                                {doc.fileUrl ? (
                                    <img 
                                        src={doc.fileUrl} 
                                        alt={doc.name || doc.title} 
                                        className="w-full h-full object-cover" 
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://placehold.co/200x250/f3f4f6/9ca3af?text=Doc";
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                        <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Document Info */}
                            <div className="flex-1 flex flex-col">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-base font-bold text-gray-800">{doc.name || doc.title}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${doc.status?.color || 'bg-blue-500'}`}>
                                        {doc.status?.label || 'PENDING'}
                                    </span>
                                </div>

                                <div className="space-y-1 mb-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span>Expires: <strong>{doc.expires}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span>Type: <strong>{doc.type}</strong></span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4 mt-auto">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDocumentClick(doc); }}
                                        className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#003366] transition-colors"
                                    >
                                        <Eye size={14} />
                                        View
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEditDocument(doc); }}
                                        className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#003366] transition-colors"
                                    >
                                        <Edit2 size={14} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleReplaceDocument(doc); }}
                                        className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#003366] transition-colors"
                                    >
                                        <RotateCcw size={14} />
                                        Replace
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDownloadDocument(doc); }}
                                        className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#003366] transition-colors"
                                    >
                                        <Download size={14} />
                                        Download
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc); }}
                                        className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors ml-auto"
                                    >
                                        <Trash2 size={14} />
                                        
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center text-gray-500">
                        <p>No documents found in this category.</p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && deleteTargetDoc && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-end p-3 pb-0">
                            <button
                                onClick={() => { setShowDeleteModal(false); setDeleteTargetDoc(null); }}
                                disabled={isDeleting}
                                className="p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="px-6 pb-6 text-center">
                            <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                                <AlertTriangle size={28} className="text-red-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Document</h3>
                            <p className="text-sm text-gray-500 mb-1">Are you sure you want to delete</p>
                            <p className="text-sm font-semibold text-gray-700 mb-5">
                                "{deleteTargetDoc.name || deleteTargetDoc.title}"?
                            </p>
                            <p className="text-xs text-gray-400 mb-6">This action cannot be undone.</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setShowDeleteModal(false); setDeleteTargetDoc(null); }}
                                    disabled={isDeleting}
                                    className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    disabled={isDeleting}
                                    className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white font-medium text-sm hover:bg-red-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {isDeleting
                                        ? <><Loader2 size={16} className="animate-spin" /> Deleting...</>
                                        : <><Trash2 size={16} /> Delete</>
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
                        <div className="text-center">
                            <div className="mb-4">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                                    <CheckCircle size={32} className="text-green-600" />
                                </div>
                            </div>
                            <p className="text-gray-700 font-medium">
                                {successMessage}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryDocuments;

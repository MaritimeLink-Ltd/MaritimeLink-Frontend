import React, { useState } from 'react';
import { ChevronLeft, Grid, LayoutGrid, Trash2, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import documentService from '../../../../services/documentService';

const DocumentDetail = ({ document, onBack, onDeleteSuccess }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    // Fallback if no document is passed (shouldn't happen in flow but good for safety)
    if (!document) return null;

    return (
        <div className="w-full max-w-7xl mx-auto p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        disabled={isDeleting}
                    >
                        <ChevronLeft size={24} className="text-gray-600" />
                    </button>
                    <h1 className="text-2xl font-semibold text-gray-800">Document Detail</h1>
                </div>
                
                <button
                    onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this document?')) {
                            try {
                                setIsDeleting(true);
                                await documentService.deleteDocument(document.id);
                                toast.success('Document deleted successfully');
                                if (onDeleteSuccess) {
                                    onDeleteSuccess();
                                } else {
                                    onBack();
                                }
                            } catch (error) {
                                toast.error(error.message || 'Failed to delete document');
                            } finally {
                                setIsDeleting(false);
                            }
                        }
                    }}
                    disabled={isDeleting}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
                >
                    {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    Delete Document
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Left Column - Document Preview */}
                <div className="flex-1">
                    <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 flex items-center justify-center min-h-[600px]">
                        <img
                            src={document.fileUrl || document.image || "https://placehold.co/600x800/f3f4f6/9ca3af?text=Document+Preview"}
                            alt={document.title || document.name}
                            className="max-w-full h-auto max-h-[600px] shadow-lg rounded object-contain"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://placehold.co/600x800/f3f4f6/9ca3af?text=Document+Preview";
                            }}
                        />
                    </div>
                </div>

                {/* Right Column - Details */}
                <div className="w-full lg:w-[400px] space-y-8">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">{document.name || document.title}</h2>
                        <span className="inline-block bg-[#003366] text-white text-sm px-4 py-1.5 rounded-full font-medium">
                            {document.type || document.category || "Document"}
                        </span>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <label className="block text-sm text-gray-500 mb-1">Certificate Number</label>
                            <div className="text-gray-900 font-medium">{document.number || document.certificateNumber || "N/A"}</div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl">
                            <label className="block text-sm text-gray-500 mb-1">Issuing Country</label>
                            <div className="text-gray-900 font-medium">{document.issuingCountry || "N/A"}</div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl">
                            <label className="block text-sm text-gray-500 mb-1">Date Of Issue</label>
                            <div className="text-gray-900 font-medium">{document.issueDate ? new Date(document.issueDate).toLocaleDateString() : document.dateOfIssue || "N/A"}</div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl">
                            <label className="block text-sm text-gray-500 mb-1">Valid Till</label>
                            <div className="text-gray-900 font-medium">{document.expiryDate ? new Date(document.expiryDate).toLocaleDateString() : document.expires || document.validTill || "N/A"}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentDetail;

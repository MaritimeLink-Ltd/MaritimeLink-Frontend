import React from 'react';
import { ChevronLeft, Grid, LayoutGrid } from 'lucide-react';

const DocumentDetail = ({ document, onBack }) => {
    // Fallback if no document is passed (shouldn't happen in flow but good for safety)
    if (!document) return null;

    return (
        <div className="w-full max-w-7xl mx-auto p-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ChevronLeft size={24} className="text-gray-600" />
                </button>
                <h1 className="text-2xl font-semibold text-gray-800">Document Detail</h1>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Left Column - Document Preview */}
                <div className="flex-1">
                    <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 flex items-center justify-center min-h-[600px]">
                        <img
                            src={document.image || "https://placehold.co/600x800/png"}
                            alt={document.title}
                            className="max-w-full h-auto shadow-lg rounded"
                        />
                    </div>
                </div>

                {/* Right Column - Details */}
                <div className="w-full lg:w-[400px] space-y-8">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">{document.title}</h2>
                        <span className="inline-block bg-gray-800 text-white text-xs px-3 py-1 rounded-full font-medium">
                            {document.type || "STCW"}
                        </span>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <label className="block text-sm text-gray-500 mb-1">Certificate Number</label>
                            <div className="text-gray-900 font-medium">27384992</div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl">
                            <label className="block text-sm text-gray-500 mb-1">Issuing Country</label>
                            <div className="text-gray-900 font-medium">United Kingdom</div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl">
                            <label className="block text-sm text-gray-500 mb-1">Date Of Issue</label>
                            <div className="text-gray-900 font-medium">20 November 2022</div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl">
                            <label className="block text-sm text-gray-500 mb-1">Valid Till</label>
                            <div className="text-gray-900 font-medium">{document.expiryDate || "20 November 2024"}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentDetail;

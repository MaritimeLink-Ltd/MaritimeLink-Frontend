import React, { useState } from 'react';
import { ArrowLeft, Upload, Eye, Edit2, RotateCcw, Download } from 'lucide-react';
import DocumentDetail from './DocumentDetail';

const CategoryDocuments = ({ category, onBack }) => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [view, setView] = useState('list'); // 'list', 'detail'
    const [selectedDoc, setSelectedDoc] = useState(null);

    const filters = [
        'All',
        'Compliance Ready',
        'Pending Approval',
        'Expiring Soon',
        'Expired'
    ];

    // Mock documents data - in real app, this would come from API based on category
    const documents = [
        {
            id: 1,
            title: 'Licenses Document 1',
            expires: '2026-12-31',
            type: 'PDF',
            status: { label: 'VALID', color: 'bg-emerald-600' },
            thumbnail: '/placeholder-doc.png',
            expiryDate: '31 December 2026'
        },
        {
            id: 2,
            title: 'Licenses Document 2',
            expires: '2026-12-31',
            type: 'PDF',
            status: { label: 'VALID', color: 'bg-emerald-600' },
            thumbnail: '/placeholder-doc.png',
            expiryDate: '31 December 2026'
        },
        {
            id: 3,
            title: 'Licenses Document 3',
            expires: '2026-12-31',
            type: 'PDF',
            status: { label: 'VALID', color: 'bg-emerald-600' },
            thumbnail: '/placeholder-doc.png',
            expiryDate: '31 December 2026'
        },
        {
            id: 4,
            title: 'Licenses Document 4',
            expires: '2026-12-31',
            type: 'PDF',
            status: { label: 'EXPIRING', color: 'bg-orange-500' },
            thumbnail: '/placeholder-doc.png',
            expiryDate: '31 December 2026'
        },
        {
            id: 5,
            title: 'Licenses Document 5',
            expires: '2026-12-31',
            type: 'PDF',
            status: { label: 'EXPIRED', color: 'bg-red-500' },
            thumbnail: '/placeholder-doc.png',
            expiryDate: '31 December 2026'
        },
        {
            id: 6,
            title: 'Licenses Document 6',
            expires: '2026-12-31',
            type: 'PDF',
            status: { label: 'PENDING', color: 'bg-yellow-500' },
            thumbnail: '/placeholder-doc.png',
            expiryDate: '31 December 2026'
        }
    ];

    const handleDocumentClick = (doc) => {
        setSelectedDoc(doc);
        setView('detail');
    };

    const handleBackFromDetail = () => {
        setView('list');
        setSelectedDoc(null);
    };

    // If viewing document detail, show DocumentDetail component
    if (view === 'detail') {
        return <DocumentDetail document={selectedDoc} onBack={handleBackFromDetail} />;
    }

    return (
        <div className="w-full max-w-7xl mx-auto h-full overflow-hidden">
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
                            <p className="text-gray-500 text-xs sm:text-sm">{documents.length} documents found</p>
                        </div>
                    </div>
                    <button className="flex items-center justify-center gap-2 bg-blue-50 text-[#003366] px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors min-h-[44px] w-full sm:w-auto">
                        <Upload size={16} />
                        Upload Document
                    </button>
                </div>

                {/* Filters - Horizontal scroll on mobile */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    <button
                        onClick={() => setActiveFilter('All')}
                        className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors ${activeFilter === 'All'
                            ? 'bg-[#003366] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        All
                    </button>
                    {filters.slice(1).map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeFilter === filter
                                ? 'bg-[#003366] text-white'
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
                {documents.map((doc) => (
                    <div
                        key={doc.id}
                        onClick={() => handleDocumentClick(doc)}
                        className="bg-white rounded-xl p-4 flex gap-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                    >
                        {/* Document Thumbnail */}
                        <div className="w-28 h-32 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>

                        {/* Document Info */}
                        <div className="flex-1 flex flex-col">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="text-base font-bold text-gray-800">{doc.title}</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${doc.status.color}`}>
                                    {doc.status.label}
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
                                    onClick={(e) => { e.stopPropagation(); /* Handle edit */ }}
                                    className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#003366] transition-colors"
                                >
                                    <Edit2 size={14} />
                                    Edit
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); /* Handle replace */ }}
                                    className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#003366] transition-colors"
                                >
                                    <RotateCcw size={14} />
                                    Replace
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); /* Handle download */ }}
                                    className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#003366] transition-colors"
                                >
                                    <Download size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryDocuments;

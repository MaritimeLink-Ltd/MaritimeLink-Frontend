import React, { useState } from 'react';
import {
    Download,
    Share2,
    Upload,
    Edit2,
    Trash2,
    FileText,
    Crown,
    Award,
    Folder
} from 'lucide-react';
import UploadDocument from './UploadDocument';
import DocumentDetail from './DocumentDetail';
import CategoryDocuments from './CategoryDocuments';

const DocumentsWallet = () => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [view, setView] = useState('list'); // 'list', 'upload', 'detail', 'category'
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');

    const filters = [
        'All',
        'Compliance Ready',
        'Pending Approval',
        'Expiring Soon',
        'Expired'
    ];

    // Mock data for categories based on design
    const categories = [
        {
            id: 'licenses',
            title: 'Licenses & Endorsements',
            count: 8,
            icon: FileText, // Using FileText as generic icon, closest to ID card
            iconBg: 'bg-gray-100',
            iconColor: 'text-gray-600',
            status: { label: '1 Expiring soon', color: 'bg-orange-500' }
        },
        {
            id: 'stcw',
            title: 'STCW Certificates',
            count: 12,
            icon: Award, // Closest to Certificate
            iconBg: 'bg-green-50',
            iconColor: 'text-green-600',
            status: { label: '2 Compliance Ready', color: 'bg-emerald-600' }
        },
        {
            id: 'medical',
            title: 'Medical Certificates',
            count: 4,
            icon: Folder, // Placeholder for Med kit
            iconBg: 'bg-red-50',
            iconColor: 'text-red-500',
            status: { label: '1 Pending Approval', color: 'bg-yellow-400' }
        },
        {
            id: 'seaman',
            title: 'Seaman Book data/Stamp pages',
            count: 15,
            icon: FileText, // Book icon preferred if available, using FileText
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-500',
            status: { label: '2 Expiring soon', color: 'bg-orange-500' }
        },
        {
            id: 'travel',
            title: 'Travel Documents',
            count: 3,
            icon: Crown, // Globe icon preferred
            iconBg: 'bg-cyan-50',
            iconColor: 'text-cyan-500',
            status: { label: '3 Expired', color: 'bg-pink-500' }
        },
        {
            id: 'academic',
            title: 'Academic Qualifications',
            count: 7,
            icon: Award, // Cap icon preferred
            iconBg: 'bg-indigo-50',
            iconColor: 'text-indigo-500',
            status: null
        },
        {
            id: 'company',
            title: 'Company Letters / Misc',
            count: 5,
            icon: Folder,
            iconBg: 'bg-cyan-50', // Light blue/cyan
            iconColor: 'text-cyan-500',
            status: null
        },
        {
            id: 'appraisals',
            title: 'Recent Appraisals',
            count: 3,
            icon: FileText, // Clipboard icon preferred
            iconBg: 'bg-orange-50',
            iconColor: 'text-orange-500',
            status: { label: '1 Pending Approval', color: 'bg-yellow-400' }
        }
    ];

    const filteredCategories = categories.filter(category => {
        // Search Filter
        const matchesSearch = category.title.toLowerCase().includes(searchQuery.toLowerCase());

        // Category/Status Filter
        let matchesFilter = true;
        if (activeFilter !== 'All') {
            if (!category.status) {
                matchesFilter = false;
            } else {
                // Check if the status label contains the active filter text
                // Adjusting logic to match typical string containment
                const statusText = category.status.label.toLowerCase();
                const filterText = activeFilter.toLowerCase();

                // Specific mapping or looser check
                if (activeFilter === 'Expiring Soon' && statusText.includes('expiring soon')) matchesFilter = true;
                else if (activeFilter === 'Compliance Ready' && statusText.includes('compliance ready')) matchesFilter = true;
                else if (activeFilter === 'Pending Approval' && statusText.includes('pending approval')) matchesFilter = true;
                else if (activeFilter === 'Expired' && statusText.includes('expired') && !statusText.includes('soon')) matchesFilter = true; // Avoid 'expiring soon' matching 'expired' if simple includes
                else matchesFilter = false;
            }
        }

        return matchesSearch && matchesFilter;
    });

    const handleUploadComplete = (newDoc) => {
        setSelectedDoc(newDoc);
        setView('detail');
    };

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        setView('category');
    };

    if (view === 'upload') {
        return <UploadDocument onBack={() => setView('list')} onCompletion={handleUploadComplete} />;
    }

    if (view === 'detail') {
        return <DocumentDetail document={selectedDoc} onBack={() => { setView('list'); setSelectedDoc(null); }} />;
    }

    if (view === 'category') {
        return <CategoryDocuments category={selectedCategory} onBack={() => { setView('list'); setSelectedCategory(null); }} />;
    }

    return (
        <div className="w-full max-w-7xl mx-auto h-full overflow-hidden">
            {/* Sticky Header Section */}
            <div className="sticky top-0 bg-gray-50 z-10 px-4 sm:px-6 pt-4 pb-2">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 sm:gap-4">
                    <div className="flex-1">
                        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Documents Wallet</h1>
                        <p className="text-gray-500 mt-0.5 text-sm sm:text-base">Manage your uploaded documents</p>
                    </div>

                    {/* Search Bar - Hidden on mobile, shown on tablet+ */}
                    <div className="relative w-full sm:w-56 hidden sm:block">
                        <input
                            type="text"
                            placeholder="Search docs..."
                            className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-blue-500 text-sm bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        </div>
                    </div>

                    {/* Action Buttons - Stack on mobile */}
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <button className="flex items-center justify-center gap-2 bg-[#003366] text-white px-4 py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-blue-900 transition-colors min-h-[44px]">
                            <Crown size={14} />
                            <span className="hidden sm:inline">Export Document Pack</span>
                            <span className="sm:hidden">Export Pack</span>
                        </button>
                        <button className="flex items-center justify-center gap-2 bg-[#003366] text-white px-4 py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-blue-900 transition-colors min-h-[44px]">
                            <Crown size={14} />
                            <span className="hidden sm:inline">Share Secure Link</span>
                            <span className="sm:hidden">Share Link</span>
                        </button>
                    </div>
                </div>

                {/* Filters Row - Horizontal scroll on mobile */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                        <button
                            onClick={() => setActiveFilter('All')}
                            className={`px-4 sm:px-5 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${activeFilter === 'All'
                                ? 'bg-[#003366] text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            All
                        </button>
                        {filters.slice(1).map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-3 sm:px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${activeFilter === filter
                                    ? 'bg-[#003366] text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setView('upload')}
                        className="flex items-center justify-center gap-2 bg-blue-50 text-[#003366] px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors min-h-[44px] flex-shrink-0"
                    >
                        <Upload size={16} />
                        Upload Document
                    </button>
                </div>
            </div>

            {/* Categories Grid - Single column on mobile, 2 on tablet+ */}
            <div className="px-4 sm:px-6 pt-3 pb-4 grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => (
                        <div
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat)}
                            className="bg-white rounded-2xl p-4 flex items-start gap-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                        >
                            {/* Icon Box */}
                            <div className={`w-12 h-12 rounded-xl ${cat.iconBg} flex items-center justify-center shrink-0`}>
                                <cat.icon size={22} className={cat.iconColor} />
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-base font-bold text-gray-800 leading-tight">{cat.title}</h3>
                                        <p className="text-gray-400 text-sm mt-0.5 font-medium">{cat.count} Documents</p>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                {cat.status && (
                                    <div className="mt-2">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${cat.status.color}`}>
                                            {cat.status.label}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center text-gray-500">
                        <Folder className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                        <p>No documents found matching your filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentsWallet;

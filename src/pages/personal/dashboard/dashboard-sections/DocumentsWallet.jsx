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
    Folder,
    CheckCircle,
    Copy,
    Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UploadDocument from './UploadDocument';
import EditDocument from './EditDocument';
import DocumentDetail from './DocumentDetail';
import CategoryDocuments from './CategoryDocuments';

const DocumentsWallet = () => {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState('All');
    const [view, setView] = useState('list'); // 'list', 'upload', 'edit', 'detail', 'category'
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal states for export and share
    const [showExportModal, setShowExportModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [generatedLink, setGeneratedLink] = useState('');
    const [linkCopied, setLinkCopied] = useState(false);

    // Track if user clicked already
    const [exportClickedOnce, setExportClickedOnce] = useState(false);
    const [shareClickedOnce, setShareClickedOnce] = useState(false);

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

    // Handle Export Document Pack
    const handleExportDocumentPack = () => {
        if (!exportClickedOnce) {
            // Show premium modal instead of export modal directly
            setShowPremiumModal(true);
            setExportClickedOnce(true);
            return;
        }

        setShowExportModal(true);

        // Simulate zip file preparation
        setTimeout(() => {
            // Create dummy content for all documents
            const allDocsContent = categories.map(cat =>
                `${cat.title}:\n  Total Documents: ${cat.count}\n  Status: ${cat.status?.label || 'N/A'}\n`
            ).join('\n');

            const zipContent = `Maritime Document Pack\n\nExported on: ${new Date().toLocaleDateString()}\nTotal Categories: ${categories.length}\n\n${allDocsContent}`;

            // Create blob and download
            const blob = new Blob([zipContent], { type: 'application/zip' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'DocumentPack_Maritime.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            // Close modal after 2 seconds
            setTimeout(() => {
                setShowExportModal(false);
            }, 2000);
        }, 1500);
    };

    // Handle Share Secure Link
    const handleShareSecureLink = () => {
        if (!shareClickedOnce) {
            // Show premium modal instead of share modal directly
            setShowPremiumModal(true);
            setShareClickedOnce(true);
            return;
        }

        // Generate a dummy secure link
        const randomId = Math.random().toString(36).substring(2, 15);
        const secureLink = `https://maritimelink.com/shared/documents/${randomId}`;
        setGeneratedLink(secureLink);
        setShowShareModal(true);
        setLinkCopied(false);
    };

    // Copy link to clipboard
    const handleCopyLink = () => {
        navigator.clipboard.writeText(generatedLink);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    if (view === 'upload') {
        return <UploadDocument onBack={() => setView('list')} onCompletion={handleUploadComplete} />;
    }

    if (view === 'edit') {
        return <EditDocument
            document={selectedDoc}
            onBack={() => { setView('list'); setSelectedDoc(null); }}
            onCompletion={(updatedDoc) => {
                setSelectedDoc(updatedDoc);
                setView('detail');
            }}
        />;
    }

    if (view === 'detail') {
        return <DocumentDetail document={selectedDoc} onBack={() => { setView('list'); setSelectedDoc(null); }} />;
    }

    if (view === 'category') {
        return <CategoryDocuments
            category={selectedCategory}
            onBack={() => { setView('list'); setSelectedCategory(null); }}
            onUploadClick={() => setView('upload')}
        />;
    }

    return (
        <div className="w-full max-w-7xl mx-auto min-h-screen pb-10">
            {/* Sticky Header Section */}
            <div className="lg:sticky lg:top-0 bg-gray-50 lg:z-10 px-4 sm:px-6 pt-4 pb-2">
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
                        <button
                            onClick={handleExportDocumentPack}
                            className="flex items-center justify-center gap-2 bg-[#003366] text-white px-4 py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-blue-900 transition-colors min-h-[44px]"
                        >
                            <Crown size={14} />
                            <span className="hidden sm:inline">Export Document Pack</span>
                            <span className="sm:hidden">Export Pack</span>
                        </button>
                        <button
                            onClick={handleShareSecureLink}
                            className="flex items-center justify-center gap-2 bg-[#003366] text-white px-4 py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-blue-900 transition-colors min-h-[44px]"
                        >
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
            <div className="px-4 sm:px-6 pt-3 pb-4 grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
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

            {/* Export Document Pack Modal */}
            {showExportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                        <div className="text-center">
                            <div className="mb-4">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                                    <Download size={32} className="text-[#003366] animate-bounce" />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Preparing Document Pack</h3>
                            <p className="text-gray-500 mb-4">
                                Compressing all your documents into a zip file...
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div className="bg-[#003366] h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                            </div>
                            <p className="text-sm text-gray-400 mt-3">This will take just a moment</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Share Secure Link Modal */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-gray-800">Share Secure Link</h3>
                            <button
                                onClick={() => setShowShareModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <CheckCircle size={20} className="text-green-500" />
                                <p className="text-sm text-gray-600">Secure link generated successfully!</p>
                            </div>
                            <p className="text-sm text-gray-500 mb-4">
                                This link provides access to all your documents. Share it securely with trusted parties only.
                            </p>

                            {/* Generated Link */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 break-all text-sm text-gray-700 mb-4">
                                {generatedLink}
                            </div>

                            {/* Copy Button */}
                            <button
                                onClick={handleCopyLink}
                                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${linkCopied
                                    ? 'bg-green-50 text-green-600 border-2 border-green-500'
                                    : 'bg-[#003366] text-white hover:bg-blue-900'
                                    }`}
                            >
                                {linkCopied ? (
                                    <>
                                        <CheckCircle size={18} />
                                        <span>Link Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy size={18} />
                                        <span>Copy Link</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Document Summary */}
                        <div className="border-t border-gray-200 pt-4">
                            <p className="text-xs text-gray-500 mb-3">Documents included in this link:</p>
                            <div className="grid grid-cols-2 gap-2">
                                {categories.map((cat) => (
                                    <div key={cat.id} className="flex items-center gap-2 text-xs text-gray-600">
                                        <cat.icon size={14} className={cat.iconColor} />
                                        <span>{cat.count} {cat.title.split(' ')[0]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={() => setShowShareModal(false)}
                            className="w-full mt-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Premium Feature Modal */}
            {showPremiumModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="w-16 h-16 bg-[#003366] rounded-full flex items-center justify-center">
                                <Star size={32} className="text-yellow-400 fill-yellow-400" />
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            Premium Feature
                        </h3>

                        <p className="text-gray-500 mb-8 text-sm sm:text-base">
                            Upgrade to Premium to unlock Export Document Pack, Secure Link Sharing, and many other exclusive features to boost your maritime career.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => navigate('/personal/profile/manage-subscription')}
                                className="w-full bg-[#003366] text-white py-3.5 px-4 rounded-xl hover:bg-blue-900 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
                            >
                                <Crown size={20} />
                                Yes, Upgrade Now
                            </button>

                            <button
                                onClick={() => setShowPremiumModal(false)}
                                className="w-full text-gray-500 hover:text-gray-700 py-3.5 px-4 rounded-xl font-medium transition-colors border border-gray-200 hover:bg-gray-50 bg-white"
                            >
                                Not Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentsWallet;

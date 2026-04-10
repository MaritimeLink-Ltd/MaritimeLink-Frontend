import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Search,
    Briefcase,
    MessageSquare,
    UserCircle,
    Menu,
    X,
    Bell,
    ChevronDown,
    LogOut
} from 'lucide-react';

import RecruiterDashboard from './RecruiterDashboard';
import AdminSearch from './search/AdminSearch';
import AdminJobs from './jobs/AdminJobs';
import JobDetail from './jobs/JobDetail';
import JobApplicants from './jobs/JobApplicants';
import CandidateSummary from './candidate/CandidateSummary';
import UploadJob from '../admin-dashboard/UploadJob';
import CVResume from '../../personal/CVResume';
import AdminChats from './chats/AdminChats';
import AdminSettings from './settings/AdminSettings';

const RecruiterDashboardMain = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [viewingJobApplicants, setViewingJobApplicants] = useState(null);
    const [viewingCandidate, setViewingCandidate] = useState(null); // { id, fromJobApplicants }
    const [creatingJob, setCreatingJob] = useState(false);
    const [viewingResume, setViewingResume] = useState(null);
    const [messagingCandidate, setMessagingCandidate] = useState(null); // { id, name }

    const handleLogout = () => {
        // Clear any stored user data
        localStorage.removeItem('userType');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('adminUserType');
        // Navigate to landing page
        navigate('/');
    };

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'search', label: 'Search Candidates', icon: Search },
        { id: 'jobs', label: 'Jobs', icon: Briefcase },
        { id: 'chats', label: 'Chats', icon: MessageSquare },
    ];

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setViewingJobApplicants(null);
        setViewingCandidate(null);
        setCreatingJob(false);
        setViewingResume(null);
        setMessagingCandidate(null);
        setIsMobileMenuOpen(false);
    };

    const handleNavigateToSection = (section) => {
        setActiveTab(section);
        setViewingJobApplicants(null);
        setViewingCandidate(null);
        setCreatingJob(false);
        setViewingResume(null);
        setMessagingCandidate(null);
    };

    const renderContent = () => {
        if (messagingCandidate) {
            return <AdminChats
                candidateId={messagingCandidate.id}
                candidateName={messagingCandidate.name}
                onViewProfile={(candidateId) => setViewingCandidate({ id: candidateId, fromJobApplicants: false })}
            />;
        }

        if (viewingResume) {
            return <CVResume isReadOnly={true} resumeData={viewingResume.resumeData} />;
        }

        if (creatingJob) {
            return <UploadJob onBack={() => setCreatingJob(false)} />;
        }

        if (viewingCandidate) {
            return <CandidateSummary
                candidateId={viewingCandidate.id}
                onBack={() => setViewingCandidate(null)}
                showApplicationStatus={viewingCandidate.fromJobApplicants}
                onViewResume={(candidateId, resumeData) => setViewingResume({ candidateId, resumeData })}
                onMessage={(candidateId, candidateName) => {
                    setMessagingCandidate({ id: candidateId, name: candidateName });
                    setActiveTab('chats');
                }}
            />;
        }

        if (viewingJobApplicants) {
            return <JobDetail
                jobId={viewingJobApplicants}
                onBack={() => setViewingJobApplicants(null)}
            />;
        }

        switch (activeTab) {
            case 'dashboard':
                return <RecruiterDashboard onNavigate={handleNavigateToSection} />;
            case 'search':
                return <AdminSearch onViewCandidate={(candidateId) => setViewingCandidate({ id: candidateId, fromJobApplicants: false })} />;
            case 'jobs':
                return <AdminJobs onViewApplicants={(jobId) => setViewingJobApplicants(jobId)} onCreateJob={() => setCreatingJob(true)} />;
            case 'chats':
                return <AdminChats
                    candidateId={null}
                    candidateName={null}
                    onViewProfile={(candidateId) => setViewingCandidate({ id: candidateId, fromJobApplicants: false })}
                />;
            case 'settings':
                return <AdminSettings />;
            default:
                return <RecruiterDashboard onNavigate={handleNavigateToSection} />;
        }
    };

    return (
        <div className="flex h-screen bg-white">
            {/* Mobile Header with Hamburger */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-white z-40 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <img src="/images/logo.png" alt="Maritime Link Logo" className="w-16 h-16 object-contain" />
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar - Desktop and Mobile Drawer */}
            <>
                {/* Mobile Overlay */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside
                    className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:transform-none overflow-y-auto scrollbar-hide ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                        }`}
                >
                    <div className="h-full flex flex-col">
                        {/* Logo - Desktop Only */}
                        <div className="hidden lg:block p-6">
                            <img
                                src="/images/logo.png"
                                alt="MaritimeLink"
                                className="h-20 w-auto"
                            />
                        </div>

                        {/* Main Menu */}
                        <div className="px-4 py-2 mt-16 lg:mt-0">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
                                MAIN MENU
                            </p>
                            <nav className="space-y-1">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleTabChange(item.id)}
                                        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${activeTab === item.id
                                                ? 'bg-[#EBF3FF] text-[#003971]'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <item.icon
                                            className={`h-5 w-5 mr-3 ${activeTab === item.id ? 'text-[#003971]' : 'text-gray-400'
                                                }`}
                                        />
                                        {item.label}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Settings Section */}
                        <div className="px-4 py-6">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
                                SETTINGS
                            </p>
                            <button
                                onClick={() => handleTabChange('settings')}
                                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${activeTab === 'settings'
                                        ? 'bg-blue-50 text-[#003971]'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <UserCircle
                                    className={`h-5 w-5 mr-3 ${activeTab === 'settings' ? 'text-[#003971]' : 'text-gray-400'
                                        }`}
                                />
                                Profile Settings
                            </button>
                        </div>
                    </div>
                </aside>
            </>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden mt-16 lg:mt-0">
                {/* Header */}
                <header className="hidden lg:block bg-white border-b border-gray-100">
                    <div className="flex items-center justify-end px-8 py-4 space-x-6">
                        {/* Notification */}
                        <button
                            onClick={() => navigate('/recruiter/notifications')}
                            className="p-2.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 relative border border-gray-100 transition-colors"
                        >
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2.5 right-2.5 block h-2 w-2 rounded-full bg-[#003971] ring-2 ring-white" />
                        </button>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center space-x-3 cursor-pointer p-0.5 rounded-full hover:bg-gray-50 transition-colors"
                            >
                                <img
                                    className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
                                    src="/images/login-image.webp"
                                    alt="User avatar"
                                />
                                <span className="text-sm font-bold text-gray-700 mr-2">Musharof</span>
                                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {dropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setDropdownOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <LogOut className="h-4 w-4 mr-3" />
                                            Logout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default RecruiterDashboardMain;

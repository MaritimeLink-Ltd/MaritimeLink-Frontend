import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { KycProvider } from '../../../../context/KycContext';
import {
    Home,
    FileText,
    Folder,
    Briefcase,
    Award,
    MessageCircle,
    User,
    Bell,
    ChevronDown,
    Menu,
    X,
    LogOut,
    AlertTriangle
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import authService from '../../../../services/authService';
import { isPlaceholderProfilePhoto, resolveProfilePhotoUrl } from '../../../../utils/profilePhoto';
import { subscribeProfessionalAlerts } from '../../../../services/socketClient';
import ModalOverlay from '../../../../components/common/ModalOverlay';
import { useAccountReviewGate } from '../../../../hooks/useAccountReviewGate';
import DashboardNavItem from '../../../../components/account/DashboardNavItem';
import {
    STAGE1_PENDING_ALLOWED_PATH_PREFIXES,
    isAccountPendingReview,
    isPathAllowedDuringStage1Pending,
} from '../../../../utils/accountStatus';

function PersonalDashboardLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAccountPending, dashboardPath } = useAccountReviewGate('/personal/dashboard', {
        allowedPathPrefixes: STAGE1_PENDING_ALLOWED_PATH_PREFIXES,
        isPendingCheck: isAccountPendingReview,
    });
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [userData, setUserData] = useState({
        name: 'User Profile',
        email: '',
        photo: null,
    });

    React.useEffect(() => {
        const updateUserData = () => {
            const savedProfile = localStorage.getItem('userProfile');
            const savedPhoto = localStorage.getItem('profileImage');
            const userEmail = localStorage.getItem('userEmail');

            if (savedPhoto && isPlaceholderProfilePhoto(savedPhoto)) {
                localStorage.removeItem('profileImage');
            }

            let profile = {};
            if (savedProfile) {
                try {
                    profile = JSON.parse(savedProfile);
                } catch (e) {
                    console.error('Error parsing userProfile in layout:', e);
                }
            }

            const name = (profile.firstName || profile.lastName)
                ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
                : profile.fullName || profile.fullname || 'User Profile';

            const photo = resolveProfilePhotoUrl({
                profile,
                savedPhoto: localStorage.getItem('profileImage') || '',
            });

            setUserData({
                name,
                email: profile.email || userEmail || '',
                photo,
            });
        };

        const loadAccountPhoto = async () => {
            try {
                const accountResponse = await authService.getMyAccount();
                const professional = accountResponse?.data?.professional;
                if (!professional) return;

                const photo = resolveProfilePhotoUrl({
                    profile: professional,
                    savedPhoto: localStorage.getItem('profileImage') || '',
                });
                const name = professional.fullname
                    || `${professional.firstName || ''} ${professional.lastName || ''}`.trim()
                    || 'User Profile';

                setUserData((prev) => ({
                    ...prev,
                    name: name || prev.name,
                    email: professional.email || prev.email,
                    photo,
                }));
            } catch {
                /* non-blocking */
            }
        };

        updateUserData();
        loadAccountPhoto();
        // Also listen for potential changes (if other components update it)
        window.addEventListener('storage', updateUserData);
        
        // Listen for the custom event from the Profile upload
        const handleCustomPhotoUpdate = (e) => {
            const url = e.detail?.url;
            const resolved = url && !isPlaceholderProfilePhoto(url) ? url : null;
            setUserData(prev => ({ ...prev, photo: resolved }));
        };
        window.addEventListener('profileImageUpdated', handleCustomPhotoUpdate);
        
        return () => {
            window.removeEventListener('storage', updateUserData);
            window.removeEventListener('profileImageUpdated', handleCustomPhotoUpdate);
        };
    }, []);

    React.useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) return undefined;

        return subscribeProfessionalAlerts((alert) => {
            const title = alert.title || 'Notification';
            const message = alert.message || '';
            const text = message ? `${title}: ${message}` : title;

            toast(text, {
                duration: 8000,
                icon: title.toLowerCase().includes('refund') ? '💳' : '🔔',
            });

            window.dispatchEvent(
                new CustomEvent('professionalAlertReceived', { detail: alert })
            );
        });
    }, []);

    const isActive = (path) => location.pathname === path;

    // Full-width pages without sidebar (e.g. focused job lists)
    const isFullScreenPage = location.pathname === '/personal/my-jobs';

    const handleLogout = () => {
        authService.logout();
        navigate('/');
        setShowLogoutModal(false);
    };

    const navItems = [
        { name: 'Dashboard', path: '/personal/dashboard', icon: Home },
        { name: 'Resume', path: '/personal/resume', icon: FileText },
        { name: 'Documents', path: '/personal/documents', icon: Folder },
        { name: 'Jobs', path: '/personal/jobs', icon: Briefcase },
        { name: 'Training', path: '/personal/training', icon: Award },
        { name: 'Chats', path: '/personal/chats', icon: MessageCircle },
        { name: 'Profile', path: '/personal/profile', icon: User },
    ];

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <KycProvider userType="professional" storagePrefix="professional">
        <div className="h-screen bg-white flex overflow-hidden">
            <Toaster position="top-right" />
            {/* Mobile Sidebar Overlay */}
            {!isFullScreenPage && sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Hidden on my-jobs page */}
            {!isFullScreenPage && (
                <aside
                    className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:transform-none overflow-y-auto scrollbar-hide ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                >
                    <div className="h-full flex flex-col">
                        {/* Logo */}
                        <div className="p-6">
                            <img
                                src="/images/logo.png"
                                alt="MaritimeLink"
                                className="h-20 w-auto"
                            />
                        </div>

                        {/* Navigation Menu */}
                        <div className="flex-1 px-4 py-2">
                            <nav className="space-y-1">
                                {navItems.map((item) => (
                                    <DashboardNavItem
                                        key={item.name}
                                        item={item}
                                        isActive={isActive(item.path)}
                                        disabled={
                                            isAccountPending &&
                                            !isPathAllowedDuringStage1Pending(item.path)
                                        }
                                        onNavigate={() => setSidebarOpen(false)}
                                    />
                                ))}
                            </nav>
                        </div>

                        {/* Logout Button */}
                        <div className="p-4 border-t border-gray-200">
                            <button
                                onClick={() => setShowLogoutModal(true)}
                                className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-lg transition-colors duration-150"
                            >
                                <LogOut className="h-5 w-5 mr-3 text-gray-400" />
                                Logout
                            </button>
                        </div>
                    </div>
                </aside>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
                {/* Top Header */}
                <header className="sticky top-0 z-20 bg-white border-b border-gray-100 px-6 py-4">
                    <div className="flex items-center justify-between gap-4">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-gray-600 hover:text-gray-900"
                        >
                            <Menu className="h-6 w-6" />
                        </button>

                        {/* Right Actions */}
                        <div className="flex items-center gap-4 ml-auto">
                            {/* User Profile Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-3 pl-3 pr-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    {userData.photo && !isPlaceholderProfilePhoto(userData.photo) ? (
                                        <img
                                            src={userData.photo}
                                            alt="Profile"
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                            <User className="h-4 w-4 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="hidden sm:flex sm:flex-col sm:items-start sm:justify-center text-left">
                                        <span className="text-sm font-semibold text-gray-900 leading-none mb-1">{userData.name}</span>
                                        {userData.email && (
                                            <span className="text-xs text-gray-500 leading-none">{userData.email}</span>
                                        )}
                                    </div>
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
                                            {(!isAccountPending || isPathAllowedDuringStage1Pending('/personal/profile')) ? (
                                                <Link
                                                    to="/personal/profile"
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    <User className="h-4 w-4 mr-3" />
                                                    Profile
                                                </Link>
                                            ) : null}
                                            <button
                                                onClick={() => {
                                                    setDropdownOpen(false);
                                                    setShowLogoutModal(true);
                                                }}
                                                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <LogOut className="h-4 w-4 mr-3" />
                                                Logout
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 min-h-0 overflow-hidden bg-white">
                    <div className="h-full min-h-0 overflow-y-auto scrollbar-hide">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Logout Confirmation Modal */}
            <ModalOverlay
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                className="max-w-md"
            >
                <div className="bg-white rounded-2xl shadow-2xl w-full p-6">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertTriangle size={32} className="text-orange-600" />
                                </div>
                                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Logout?</h2>
                                <p className="text-gray-600">Are you sure you want to logout from your account?</p>
                            </div>
                            <div className="space-y-3">
                                <button
                                    onClick={handleLogout}
                                    className="w-full py-3 bg-[#003971] text-white rounded-lg font-medium hover:bg-[#003971]/90 transition-colors"
                                >
                                    Yes, Logout
                                </button>
                                <button
                                    onClick={() => setShowLogoutModal(false)}
                                    className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                </div>
            </ModalOverlay>
        </div>
        </KycProvider>
    );
}

export default PersonalDashboardLayout;

import React, { useState, useMemo } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
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

function PersonalDashboardLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [userData, setUserData] = useState({
        name: 'User Profile',
        email: '',
        photo: '/images/login-image.webp'
    });

    React.useEffect(() => {
        const updateUserData = () => {
            const savedProfile = localStorage.getItem('userProfile');
            const savedPhoto = localStorage.getItem('profileImage');
            const userEmail = localStorage.getItem('userEmail');
            
            if (savedProfile) {
                try {
                    const profile = JSON.parse(savedProfile);
                    const name = (profile.firstName || profile.lastName) 
                        ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() 
                        : profile.fullName || 'User Profile';
                    
                    setUserData({
                        name: name,
                        email: profile.email || userEmail || '',
                        photo: savedPhoto || profile.profilePhoto || profile.photo || '/images/login-image.webp'
                    });
                } catch (e) {
                    console.error('Error parsing userProfile in layout:', e);
                }
            } else if (savedPhoto || userEmail) {
                setUserData(prev => ({ 
                    ...prev, 
                    photo: savedPhoto || prev.photo,
                    email: userEmail || prev.email
                }));
            }
        };

        updateUserData();
        // Also listen for potential changes (if other components update it)
        window.addEventListener('storage', updateUserData);
        
        // Listen for the custom event from the Profile upload
        const handleCustomPhotoUpdate = (e) => {
            if (e.detail && e.detail.url) {
                setUserData(prev => ({ ...prev, photo: e.detail.url }));
            }
        };
        window.addEventListener('profileImageUpdated', handleCustomPhotoUpdate);
        
        return () => {
            window.removeEventListener('storage', updateUserData);
            window.removeEventListener('profileImageUpdated', handleCustomPhotoUpdate);
        };
    }, []);

    const isActive = (path) => location.pathname === path;

    // Admin verification state for professionals
    const isVerifiedByAdmin = useMemo(() => {
        // Check the verification status saved from login response
        const verificationStatus = localStorage.getItem('professionalVerificationStatus');
        if (verificationStatus && verificationStatus.toUpperCase() === 'VERIFIED') return true;

        // Primary flag that can be set after backoffice approval
        const adminFlag = localStorage.getItem('adminVerified');
        if (adminFlag === 'true') return true;

        // Backwards compatibility: if you already use kycStatus === 'approved' we also treat as verified
        const kycStatus = localStorage.getItem('kycStatus');
        if (kycStatus && (kycStatus.toLowerCase() === 'approved' || kycStatus.toLowerCase() === 'verified')) {
            return true;
        }

        return false;
    }, []);

    // Check if current page is my-jobs or saved-courses page
    const isFullScreenPage = location.pathname === '/personal/my-jobs' || location.pathname === '/personal/saved-courses';

    // Pages that are always allowed even before admin verification
    const isAlwaysAllowedPath = useMemo(() => {
        const path = location.pathname;
        // KYC dashboard (shows verification dialogs)
        if (path === '/personal/dashboard') return true;
        // Resume view
        if (path === '/personal/resume') return true;
        // Document wallet and nested document views
        if (path === '/personal/documents') return true;
        if (path.startsWith('/personal/documents/')) return true;
        return false;
    }, [location.pathname]);

    // Whether the current route is restricted (not allowed before verification)
    const isRestrictedRoute = !isVerifiedByAdmin && !isAlwaysAllowedPath;

    const handleLogout = () => {
        // Clear any stored user data
        localStorage.removeItem('userType');
        localStorage.removeItem('userEmail');
        // Navigate to landing page
        navigate('/');
        setShowLogoutModal(false);
    };

    const allNavItems = [
        { name: 'Dashboard', path: '/personal/dashboard', icon: Home },
        { name: 'Resume', path: '/personal/resume', icon: FileText },
        { name: 'Documents', path: '/personal/documents', icon: Folder },
        { name: 'Jobs', path: '/personal/jobs', icon: Briefcase },
        { name: 'Training', path: '/personal/training', icon: Award },
        { name: 'Chats', path: '/personal/chats', icon: MessageCircle },
        { name: 'Profile', path: '/personal/profile', icon: User },
    ];

    // If not verified, only show Dashboard, Resume, Documents in sidebar
    const navItems = isVerifiedByAdmin
        ? allNavItems
        : allNavItems.filter(item =>
            ['/personal/dashboard', '/personal/resume', '/personal/documents'].includes(item.path)
        );

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="h-screen bg-white flex overflow-hidden">
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
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${isActive(item.path)
                                            ? 'bg-[#003971]/10 text-[#003971]'
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                            }`}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <item.icon className={`h-5 w-5 mr-3 ${isActive(item.path) ? 'text-[#003971]' : 'text-gray-400'
                                            }`} />
                                        {item.name}
                                    </Link>
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
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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
                                    <img
                                        src={userData.photo}
                                        alt="Profile"
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
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
                                            <Link
                                                to="/personal/profile"
                                                onClick={() => setDropdownOpen(false)}
                                                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <User className="h-4 w-4 mr-3" />
                                                Profile
                                            </Link>
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
                <main className="flex-1 overflow-hidden bg-white">
                    <div className="h-full overflow-y-auto scrollbar-hide">
                        {isRestrictedRoute ? (
                            <div className="h-full flex items-center justify-center p-6">
                                <div className="max-w-lg text-center space-y-4">
                                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                                        <AlertTriangle size={40} className="text-amber-600" />
                                    </div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-[#003971]">
                                        Account Under Review
                                    </h1>
                                    <p className="text-gray-600">
                                        Your account is currently being reviewed by our admin team.
                                    </p>
                                    <p className="text-gray-500 text-sm">
                                        Once your KYC verification is approved, you will have full access to Jobs, Training, Chats, and Profile.
                                        In the meantime, you can update your <strong>Resume</strong> and <strong>Documents</strong>.
                                    </p>
                                    <button
                                        onClick={() => navigate('/personal/dashboard')}
                                        className="mt-4 px-6 py-3 bg-[#003971] text-white rounded-lg font-medium hover:bg-[#002855] transition-colors"
                                    >
                                        Go to Dashboard
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Outlet />
                        )}
                    </div>
                </main>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <>
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowLogoutModal(false)} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
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
                    </div>
                </>
            )}
        </div>
    );
}

export default PersonalDashboardLayout;

import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Search,
    Briefcase,
    MessageSquare,
    UserCircle,
    User,
    Bell,
    ChevronDown,
    Menu,
    X,
    LogOut
} from 'lucide-react';
import authService from '../../../../services/authService';
import recruiterSettingsService from '../../../../services/recruiterSettingsService';
import ModalOverlay from '../../../../components/common/ModalOverlay';
import { connectSocket } from '../../../../services/socketClient';
import {
    playRecruiterDesktopSound,
    shouldNotifyCandidateMessages,
    syncRecruiterNotificationPreferences,
} from '../../../../utils/recruiterNotificationPreferences';
import {
    isPlaceholderProfilePhoto,
    resolveProfilePhotoUrl,
    resolveRecruiterDisplayName,
} from '../../../../utils/profilePhoto';
import { KycProvider } from '../../../../context/KycContext';
import { useAccountReviewGate } from '../../../../hooks/useAccountReviewGate';
import DashboardNavItem from '../../../../components/account/DashboardNavItem';

function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAccountPending, dashboardPath } = useAccountReviewGate('/recruiter-dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [userData, setUserData] = useState({
        name: 'User Profile',
        email: '',
        photo: null,
    });

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const response = await recruiterSettingsService.getSettings();
                if (cancelled) return;

                const notifications = response?.data?.notifications;
                if (notifications) {
                    syncRecruiterNotificationPreferences(notifications);
                }

                const profile = response?.data?.profile;
                if (profile) {
                    const savedPhoto = localStorage.getItem('profileImage');
                    const userEmail = localStorage.getItem('userEmail');
                    const name = resolveRecruiterDisplayName(profile, 'Recruiter');
                    const photo = resolveProfilePhotoUrl({ profile, savedPhoto });

                    setUserData({
                        name,
                        email: profile.email || userEmail || '',
                        photo,
                    });

                    try {
                        const stored = JSON.parse(localStorage.getItem('userProfile') || '{}');
                        localStorage.setItem(
                            'userProfile',
                            JSON.stringify({
                                ...stored,
                                ...profile,
                                firstName: profile.firstName ?? stored.firstName,
                                lastName: profile.lastName ?? stored.lastName,
                                email: profile.email ?? stored.email,
                            }),
                        );
                        if (profile.email) {
                            localStorage.setItem('userEmail', profile.email);
                        }
                    } catch {
                        /* non-blocking */
                    }
                }
            } catch {
                /* non-blocking */
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        const socket = connectSocket();
        const eventNames = [
            'conversation:message',
            'conversation:message:new',
            'message:new',
            'newMessage',
        ];

        const handleIncoming = (payload) => {
            const msg = payload?.message || payload;
            if (!msg?.conversationId) return;
            const senderType = String(msg.senderType || '').toUpperCase();
            if (senderType !== 'PROFESSIONAL') return;
            if (!shouldNotifyCandidateMessages()) return;
            playRecruiterDesktopSound();
        };

        eventNames.forEach((name) => socket.on(name, handleIncoming));

        return () => {
            eventNames.forEach((name) => socket.off(name, handleIncoming));
        };
    }, []);

    useEffect(() => {
        const updateUserData = () => {
            const savedProfile = localStorage.getItem('userProfile');
            const savedPhoto = localStorage.getItem('profileImage');
            const userEmail = localStorage.getItem('userEmail');
            
            if (savedProfile) {
                try {
                    const profile = JSON.parse(savedProfile);
                    setUserData({
                        name: resolveRecruiterDisplayName(profile, 'Recruiter'),
                        email: profile.email || userEmail || '',
                        photo: resolveProfilePhotoUrl({ profile, savedPhoto }),
                    });
                } catch (e) {
                    console.error('Error parsing userProfile in layout:', e);
                }
            } else if (savedPhoto || userEmail) {
                setUserData((prev) => ({
                    ...prev,
                    name: resolveRecruiterDisplayName({ email: userEmail }, 'Recruiter'),
                    photo: resolveProfilePhotoUrl({ savedPhoto: savedPhoto || '' }),
                    email: userEmail || prev.email,
                }));
            }
        };

        updateUserData();
        window.addEventListener('storage', updateUserData);
        window.addEventListener('recruiterProfileUpdated', updateUserData);

        const handleCustomPhotoUpdate = (e) => {
            const url = e.detail?.url;
            setUserData((prev) => ({
                ...prev,
                photo: url && !isPlaceholderProfilePhoto(url) ? url : null,
            }));
        };
        window.addEventListener('profileImageUpdated', handleCustomPhotoUpdate);

        return () => {
            window.removeEventListener('storage', updateUserData);
            window.removeEventListener('recruiterProfileUpdated', updateUserData);
            window.removeEventListener('profileImageUpdated', handleCustomPhotoUpdate);
        };
    }, []);

    const isActive = (path) =>
        location.pathname === path ||
        (path === '/recruiter/search' && location.pathname === '/admin/search') ||
        (path === '/recruiter/jobs' && location.pathname === '/admin/jobs') ||
        (path === '/recruiter/chats' && location.pathname === '/admin/chats');

    const handleLogoutClick = () => {
        setDropdownOpen(false);
        setShowLogoutModal(true);
    };

    const handleLogoutConfirm = () => {
        authService.logout();
        setShowLogoutModal(false);
        navigate('/');
    };

    const handleLogoutCancel = () => {
        setShowLogoutModal(false);
    };

    const navItems = [
        { name: 'Dashboard', path: '/recruiter-dashboard', icon: LayoutDashboard },
        { name: 'Search Candidates', path: '/recruiter/search', icon: Search },
        { name: 'Jobs', path: '/recruiter/jobs', icon: Briefcase },
        { name: 'Chats', path: '/recruiter/chats', icon: MessageSquare },
    ];

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <KycProvider userType="recruiter" storagePrefix="recruiter">
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
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

                    {/* Main Menu */}
                    <div className="px-4 py-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
                            MAIN MENU
                        </p>
                        <nav className="space-y-1">
                            {navItems.map((item) => (
                                <DashboardNavItem
                                    key={item.name}
                                    item={item}
                                    isActive={isActive(item.path)}
                                    disabled={isAccountPending && item.path !== dashboardPath}
                                    activeClassName="bg-blue-50 text-[#003971]"
                                    inactiveClassName="text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                />
                            ))}
                        </nav>
                    </div>

                    {/* Settings Section - Moved under menu */}
                    <div className="px-4 py-6">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
                            SETTINGS
                        </p>
                        <DashboardNavItem
                            item={{
                                name: 'Profile Settings',
                                path: '/recruiter/settings',
                                icon: UserCircle,
                            }}
                            isActive={
                                isActive('/admin/settings') || isActive('/recruiter/settings')
                            }
                            disabled={isAccountPending}
                            activeClassName="bg-blue-50 text-[#003971]"
                            inactiveClassName="text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-gray-100">
                    <div className="flex items-center justify-between px-8 py-4">
                        {/* Mobile Menu Button - Only visible on mobile */}
                        <div className="flex items-center">
                            <button
                                onClick={toggleSidebar}
                                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#003971] mr-4"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Right Section: Notifications, Profile */}
                        <div className="flex items-center space-x-6">

                            {/* Notification */}
                            <button
                                type="button"
                                disabled={isAccountPending}
                                onClick={() => {
                                    if (!isAccountPending) navigate('/recruiter/notifications');
                                }}
                                className={`p-2.5 rounded-full relative border border-gray-100 transition-colors ${
                                    isAccountPending
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-2.5 right-2.5 block h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white" />
                            </button>

                            {/* Profile Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center space-x-3 cursor-pointer p-0.5 rounded-full hover:bg-gray-50 transition-colors"
                                >
                                    {userData.photo && !isPlaceholderProfilePhoto(userData.photo) ? (
                                        <img
                                            className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
                                            src={userData.photo}
                                            alt=""
                                            onError={() =>
                                                setUserData((prev) => ({ ...prev, photo: null }))
                                            }
                                        />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full border-2 border-white shadow-sm bg-gray-100 flex items-center justify-center">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="hidden sm:flex sm:flex-col sm:items-start sm:justify-center text-left">
                                        <span className="text-sm font-bold text-gray-700 leading-none mb-1 mr-2">{userData.name}</span>
                                        {userData.email && (
                                            <span className="text-xs text-gray-500 leading-none">{userData.email}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center">
                                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                                    </div>
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
                                                onClick={handleLogoutClick}
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
                    </div>
                </header>

                {/* Main Page Content */}
                <main className="flex-1 min-h-0 overflow-y-auto bg-gray-50 px-8 py-6">
                    <Outlet />
                </main>
            </div>

            {/* Logout Confirmation Modal */}
            <ModalOverlay
                isOpen={showLogoutModal}
                onClose={handleLogoutCancel}
                className="max-w-md"
            >
                <div className="bg-white rounded-2xl shadow-xl w-full mx-4 p-6">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <LogOut className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Logout Confirmation</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Are you sure you want to logout? You will need to login again to access your dashboard.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleLogoutCancel}
                                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogoutConfirm}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                </div>
            </ModalOverlay>
        </div>
        </KycProvider>
    );
}

export default AdminLayout;

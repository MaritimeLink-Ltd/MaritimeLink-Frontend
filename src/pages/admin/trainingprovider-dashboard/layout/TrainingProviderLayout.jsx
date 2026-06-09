import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutGrid,
    TrendingUp,
    BookOpen,
    Calendar,
    UserCircle,
    User,
    Bell,
    ChevronDown,
    Menu,
    LogOut,
    MessageSquare
} from 'lucide-react';
import authService from '../../../../services/authService';
import trainerSettingsService from '../../../../services/trainerSettingsService';
import { connectSocket } from '../../../../services/socketClient';
import {
    playRecruiterDesktopSound,
    shouldNotifyCandidateMessages,
    syncRecruiterNotificationPreferences,
} from '../../../../utils/recruiterNotificationPreferences';
import { KycProvider } from '../../../../context/KycContext';
import { useAccountReviewGate } from '../../../../hooks/useAccountReviewGate';
import DashboardNavItem from '../../../../components/account/DashboardNavItem';
import {
    isPlaceholderProfilePhoto,
    resolveProfilePhotoUrl,
} from '../../../../utils/profilePhoto';

function TrainingProviderLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAccountPending, dashboardPath } = useAccountReviewGate('/trainingprovider-dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        photo: null,
    });

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const response = await trainerSettingsService.getSettings();
                const notifications = response?.data?.notifications;
                if (!cancelled && notifications) {
                    syncRecruiterNotificationPreferences(notifications);
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
                : profile.fullName || 'Training Provider User';

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

        updateUserData();
        window.addEventListener('storage', updateUserData);
        
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
            window.removeEventListener('profileImageUpdated', handleCustomPhotoUpdate);
        };
    }, []);

    const isActive = (path) => location.pathname === path || (path === '/trainingprovider/demand' && ['/trainingprovider/expiries-overview', '/trainingprovider/expiries'].includes(location.pathname));

    const handleLogoutClick = () => {
        setDropdownOpen(false);
        setShowLogoutModal(true);
    };

    const handleLogoutConfirm = () => {
        authService.logout();
        navigate('/');
        setShowLogoutModal(false);
    };

    const handleLogoutCancel = () => {
        setShowLogoutModal(false);
    };

    const navItems = [
        { name: 'Home', path: '/trainingprovider-dashboard', icon: LayoutGrid },
        { name: 'Demand & Planning', path: '/trainingprovider/demand', icon: TrendingUp },
        { name: 'Course Management', path: '/trainingprovider/courses', icon: BookOpen },
        { name: 'Session Management', path: '/trainingprovider/bookings', icon: Calendar },
        { name: 'Chats', path: '/trainingprovider/chats', icon: MessageSquare },
        { name: 'Profile', path: '/trainingprovider/profile', icon: UserCircle },
    ];

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <KycProvider userType="training-provider" storagePrefix="trainingProvider">
        <div className="h-screen bg-[#F5F7FA] flex overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`flex-shrink-0 fixed lg:static inset-y-0 left-0 z-30 w-64 h-full bg-white border-r border-gray-100 transform transition-transform duration-200 ease-in-out lg:transform-none overflow-y-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="p-6 flex items-center justify-center">
                        <img
                            src="/images/logo.png"
                            alt="MaritimeLink"
                            className="h-16 w-auto"
                        />
                    </div>

                    {/* Main Menu */}
                    <div className="px-4 py-2 flex-1">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
                            MAIN MENU
                        </p>
                        <nav className="space-y-2">
                            {navItems.map((item) => (
                                <DashboardNavItem
                                    key={item.name}
                                    item={item}
                                    isActive={isActive(item.path)}
                                    disabled={isAccountPending && item.path !== dashboardPath}
                                    activeClassName="bg-[#EBF3FF] text-[#003971]"
                                    inactiveClassName="text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                />
                            ))}
                        </nav>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="flex-shrink-0 bg-white border-b border-gray-100 z-20">
                    <div className="flex items-center justify-between px-8 py-4">
                        {/* Mobile Menu Button */}
                        <div className="flex items-center">
                            <button
                                onClick={toggleSidebar}
                                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#003971] mr-4"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Right Section: Notifications, Profile */}
                        <div className="flex items-center space-x-6 ml-auto">
                            {/* Notification */}
                            <button
                                type="button"
                                disabled={isAccountPending}
                                onClick={() => {
                                    if (!isAccountPending) navigate('/trainingprovider/notifications');
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
                                    <div className="hidden sm:flex sm:flex-col sm:items-start sm:justify-center text-left min-w-0">
                                        <span className="text-sm font-bold text-gray-700 leading-none mb-1 mr-2 truncate max-w-[160px]">
                                            {userData.name || 'Training provider'}
                                        </span>
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
                <main className="flex-1 overflow-y-auto bg-[#F5F7FA] p-4 md:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
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
                </div>
            )}
        </div>
        </KycProvider>
    );
}

export default TrainingProviderLayout;

import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Search,
    Briefcase,
    MessageSquare,
    UserCircle,
    Bell,
    ChevronDown,
    Menu,
    X,
    LogOut
} from 'lucide-react';

function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const isActive = (path) => location.pathname === path;

    const handleLogoutClick = () => {
        setDropdownOpen(false);
        setShowLogoutModal(true);
    };

    const handleLogoutConfirm = () => {
        // Clear any stored user data
        localStorage.removeItem('userType');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('adminUserType');
        // Navigate to landing page
        navigate('/');
    };

    const handleLogoutCancel = () => {
        setShowLogoutModal(false);
    };

    const navItems = [
        { name: 'Dashboard', path: '/recruiter-dashboard', icon: LayoutDashboard },
        { name: 'Search Candidates', path: '/admin/search', icon: Search },
        { name: 'Jobs', path: '/admin/jobs', icon: Briefcase },
        { name: 'Chats', path: '/admin/chats', icon: MessageSquare },
    ];

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="min-h-screen bg-gray-50 flex">
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
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${isActive(item.path)
                                        ? 'bg-blue-50 text-[#003971]'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <item.icon className={`h-5 w-5 mr-3 ${isActive(item.path) ? 'text-[#003971]' : 'text-gray-400'
                                        }`} />
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Settings Section - Moved under menu */}
                    <div className="px-4 py-6">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
                            SETTINGS
                        </p>
                        <Link
                            to="/admin/settings"
                            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${isActive('/admin/settings')
                                ? 'bg-blue-50 text-[#003971]'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <UserCircle className={`h-5 w-5 mr-3 ${isActive('/admin/settings') ? 'text-[#003971]' : 'text-gray-400'
                                }`} />
                            Profile Settings
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="bg-white">
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
                                onClick={() => navigate('/recruiter/notifications')}
                                className="p-2.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 relative border border-gray-100 transition-colors"
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
                                    <img
                                        className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
                                        src="/images/login-image.webp"
                                        alt="User avatar"
                                    />
                                    <div className="flex items-center">
                                        <span className="text-sm font-bold text-gray-700 mr-2">Musharof</span>
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
                <main className="flex-1 bg-white px-8 py-6">
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
    );
}

export default AdminLayout;

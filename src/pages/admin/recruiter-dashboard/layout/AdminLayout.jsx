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
    X
} from 'lucide-react';

function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { name: 'Dashboard', path: '/recruiter-dashboard', icon: LayoutDashboard },
        { name: 'Search Candidates', path: '/admin/search', icon: Search },
        { name: 'Jobs', path: '/admin/jobs', icon: Briefcase },
        { name: 'Chats', path: '/admin/chats', icon: MessageSquare },
    ];

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
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
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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

                        {/* Right Section: Search, Notifications, Profile */}
                        <div className="flex items-center space-x-6">
                            {/* Search Bar - Moved to right */}
                            <div className="max-w-xs relative hidden sm:block">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="search"
                                    className="block w-64 pl-9 pr-3 py-2 border border-gray-100 rounded-xl leading-5 bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-100 focus:border-blue-200 text-sm transition-all duration-200"
                                    placeholder="Search..."
                                />
                            </div>

                            {/* Notification */}
                            <button
                                onClick={() => navigate('/recruiter/notifications')}
                                className="p-2.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 relative border border-gray-100 transition-colors"
                            >
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-2.5 right-2.5 block h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white" />
                            </button>

                            {/* Profile Dropdown */}
                            <div className="relative flex items-center">
                                <div className="flex items-center space-x-3 cursor-pointer p-0.5 rounded-full hover:bg-gray-50 transition-colors">
                                    <img
                                        className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
                                        src="/images/login-image.png"
                                        alt="User avatar"
                                    />
                                    <div className="flex items-center">
                                        <span className="text-sm font-bold text-gray-700 mr-2">Musharof</span>
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Page Content */}
                <main className="flex-1 overflow-y-auto bg-white px-8 py-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;

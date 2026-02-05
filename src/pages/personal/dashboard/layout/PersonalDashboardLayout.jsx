import { useState } from 'react';
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
    LogOut
} from 'lucide-react';

function PersonalDashboardLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const isActive = (path) => location.pathname === path;
    
    // Check if current page is my-jobs page
    const isMyJobsPage = location.pathname === '/personal/my-jobs';

    const handleLogout = () => {
        // Clear any stored user data
        localStorage.removeItem('userType');
        localStorage.removeItem('userEmail');
        // Navigate to landing page
        navigate('/');
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
        <div className="h-screen bg-white flex overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {!isMyJobsPage && sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Hidden on my-jobs page */}
            {!isMyJobsPage && (
                <aside
                    className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:transform-none overflow-y-auto scrollbar-hide ${
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
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
                                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
                                        isActive(item.path)
                                            ? 'bg-[#003971]/10 text-[#003971]'
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                    }`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <item.icon className={`h-5 w-5 mr-3 ${
                                        isActive(item.path) ? 'text-[#003971]' : 'text-gray-400'
                                    }`} />
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
                </aside>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-white">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default PersonalDashboardLayout;

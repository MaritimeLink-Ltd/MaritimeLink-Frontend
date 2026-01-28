import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
    LayoutDashboard,
    Users,
    Building,
    FileCheck,
    Store,
    Settings as SettingsIcon,
    User as UserIcon,
    Bell,
    Search,
    Menu,
    X
} from 'lucide-react';

function AdminLayout() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const mainMenuItems = [
        { name: 'Dashboard', path: '/admin-dashboard', icon: LayoutDashboard },
        { name: 'Accounts', path: '/admin/accounts', icon: Users },
        { name: 'Companies', path: '/admin/companies', icon: Building },
        { name: 'Compliance', path: '/admin/compliance', icon: FileCheck },
        { name: 'Marketplace', path: '/admin/marketplace', icon: Store },
        { name: 'Operations', path: '/admin/operations', icon: SettingsIcon }
    ];

    const settingsItems = [
        { name: 'Profile Settings', path: '/admin/profile', icon: UserIcon }
    ];

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Sidebar */}
            <aside className={`fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-100 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <img
                                src="/src/assets/logo.png"
                                alt="MaritimeLink"
                                className="h-16 w-auto"
                            />
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto py-6">
                        {/* Main Menu */}
                        <div className="px-4 mb-8">
                            <h3 className="px-3 mb-3 text-xs font-bold text-gray-400 uppercase tracking-wide">
                                Main Menu
                            </h3>
                            <nav className="space-y-1">
                                {mainMenuItems.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${isActive
                                                ? 'bg-[#1e5a8f] text-white shadow-md'
                                                : 'text-gray-600 hover:bg-gray-50'
                                            }`
                                        }
                                    >
                                        <item.icon className="h-5 w-5" />
                                        <span>{item.name}</span>
                                    </NavLink>
                                ))}
                            </nav>
                        </div>

                        {/* Settings */}
                        <div className="px-4">
                            <h3 className="px-3 mb-3 text-xs font-bold text-gray-400 uppercase tracking-wide">
                                Settings
                            </h3>
                            <nav className="space-y-1">
                                {settingsItems.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${isActive
                                                ? 'bg-[#1e5a8f] text-white shadow-md'
                                                : 'text-gray-600 hover:bg-gray-50'
                                            }`
                                        }
                                    >
                                        <item.icon className="h-5 w-5" />
                                        <span>{item.name}</span>
                                    </NavLink>
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-gray-900/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="lg:pl-64">
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

                        {/* Search Bar */}
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f]"
                                />
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-4">
                            {/* Notification */}
                            <button
                                onClick={() => navigate('/admin/notifications')}
                                className="relative p-2 text-gray-600 hover:text-gray-900"
                            >
                                <Bell className="h-6 w-6" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>

                            {/* User Profile */}
                            <button className="flex items-center gap-3 pl-3 pr-4 py-2 rounded-xl hover:bg-gray-50">
                                <img
                                    src="https://via.placeholder.com/40"
                                    alt="Musharof"
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <span className="text-sm font-semibold text-gray-900">Musharof</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;

import { useNavigate } from 'react-router-dom';


function LandingPage() {
    const navigate = useNavigate();

    const userTypes = [
        {
            id: 'professional',
            name: 'Professional',
            description: 'Seafarers, Officers & Maritime Crew',
            path: '/signin',
            gradient: 'from-blue-500 to-blue-700',
            hoverGradient: 'hover:from-blue-600 hover:to-blue-800'
        },
        {
            id: 'recruiter',
            name: 'Recruiter',
            description: 'Hiring Companies & Agencies',
            path: '/admin/login',
            gradient: 'from-teal-500 to-teal-700',
            hoverGradient: 'hover:from-teal-600 hover:to-teal-800'
        },
        {
            id: 'admin',
            name: 'Admin',
            description: 'Platform Administration',
            path: '/admin-dashboard',
            gradient: 'from-slate-600 to-slate-800',
            hoverGradient: 'hover:from-slate-700 hover:to-slate-900'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex flex-col">
            {/* Header with Logo */}
            <header className="w-full py-6 px-8">
                <div className="max-w-7xl mx-auto flex justify-end">
                    <img
                        src="/images/logo.png"
                        alt="Maritime Link Logo"
                        className="h-16 w-auto object-contain"
                    />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 -mt-16">
                {/* Heading */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4 tracking-tight">
                        Maritime<span className="text-blue-600">Link</span>
                    </h1>
                    <p className="text-xl text-gray-600 font-medium">
                        Your Gateway to Maritime Excellence
                    </p>
                </div>

                {/* User Type Selection Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-3xl">
                    {userTypes.map((type) => (
                        <button
                            key={type.id}
                            onClick={() => navigate(type.path)}
                            className={`
                                group relative w-full sm:w-64 py-6 px-8
                                bg-gradient-to-r ${type.gradient} ${type.hoverGradient}
                                text-white rounded-2xl shadow-lg
                                transform transition-all duration-300
                                hover:scale-105 hover:shadow-xl
                                focus:outline-none focus:ring-4 focus:ring-blue-300
                            `}
                        >
                            <span className="block text-2xl font-bold mb-2">
                                {type.name}
                            </span>
                            <span className="block text-sm opacity-90">
                                {type.description}
                            </span>

                            {/* Hover Arrow */}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Decorative Wave */}
                <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none">
                    <svg viewBox="0 0 1440 120" className="w-full h-24 text-blue-100">
                        <path
                            fill="currentColor"
                            d="M0,64 C480,128 960,0 1440,64 L1440,120 L0,120 Z"
                        />
                    </svg>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 py-4 text-center text-sm text-gray-500">
                © 2026 MaritimeLink. All rights reserved.
            </footer>
        </div>
    );
}

export default LandingPage;

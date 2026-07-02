import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Anchor,
    Ship,
    Compass,
    ShieldCheck,
    FileCheck2,
    Briefcase,
    GraduationCap,
    CreditCard,
    ArrowRight,
    CheckCircle2,
    Sparkles,
    Menu,
    X,
    ChevronDown,
    Play,
    Search,
    Bell,
    Lock,
    Building2,
    BadgeCheck,
    Wallet,
    Network,
    Timer,
    Users,
    Globe,
    Target,
    BarChart3,
    TrendingUp,
    ArrowLeft,
    LayoutDashboard,
    UserPlus,
    MessageCircle,
    ClipboardCheck,
    EyeOff,
    Server,
    Smartphone,
    Linkedin,
    Facebook,
    Instagram,
    Youtube,
    Heart,
} from 'lucide-react';
import Reveal from '../components/common/Reveal';

const ROLES = [
    {
        id: 'professional',
        name: 'Professional',
        tagline: 'Seafarers, Officers & Maritime Crew',
        description:
            'Build a verified maritime resume, manage your certificates in one secure wallet, and get matched with the right vessels and roles.',
        bullets: ['Digital Document Wallet', 'AI-verified certificates', 'Smart job matching'],
        icon: Anchor,
        accent: 'from-blue-500 to-blue-700',
        ring: 'group-hover:ring-blue-200',
        chip: 'bg-blue-50 text-blue-700',
        signIn: '/signin',
        signUp: '/signup',
    },
    {
        id: 'recruiter',
        name: 'Recruiter',
        tagline: 'Hiring Companies & Manning Agencies',
        description:
            'Source pre-verified maritime talent faster, manage applications, and communicate directly with candidates in real time.',
        bullets: ['Verified candidate pool', 'Streamlined hiring pipeline', 'In-app messaging'],
        icon: Briefcase,
        accent: 'from-teal-500 to-teal-700',
        ring: 'group-hover:ring-teal-200',
        chip: 'bg-teal-50 text-teal-700',
        signIn: '/recruiter/login',
        signUp: '/agent/signup',
    },
    {
        id: 'training-provider',
        name: 'Training Provider',
        tagline: 'Training Centers & Institutes',
        description:
            'List your courses and sessions, manage bookings and demand planning, and connect with seafarers who need certification.',
        bullets: ['Course & session management', 'Demand & planning tools', 'Secure online payments'],
        icon: GraduationCap,
        accent: 'from-purple-500 to-purple-700',
        ring: 'group-hover:ring-purple-200',
        chip: 'bg-purple-50 text-purple-700',
        signIn: '/training-provider/login',
        signUp: '/agent/signup',
    },
];

const KEY_PLAYERS = [
    {
        id: 'professional',
        icon: Anchor,
        name: 'For Maritime Professionals',
        tagline: 'Manage your career. Stay compliant. Get discovered by the right opportunities.',
        image: '/images/profession-image.webp',
        imageAlt: 'Maritime professionals on deck',
        accent: 'from-blue-500 to-blue-700',
        checkColor: 'text-blue-600',
        points: [
            'Build a role-aware maritime CV that stands out',
            'Store, manage and share your certificates securely',
            'Track expiries and stay compliant',
            'Apply for jobs and book training courses',
            'Connect and communicate with employers',
            'Boost your visibility and grow your career',
        ],
        signIn: '/signin',
        signUp: '/signup',
    },
    {
        id: 'recruiter',
        icon: Briefcase,
        name: 'For Recruiters & Manning Agents',
        tagline: 'Find verified talent faster. Reduce admin. Make smarter hiring decisions.',
        image: '/images/premium-image.webp',
        imageAlt: 'Maritime officer reviewing candidates',
        accent: 'from-teal-500 to-teal-700',
        checkColor: 'text-teal-600',
        points: [
            'Reduce time-to-hire and improve accuracy',
            'Search verified maritime talent with smart filters',
            'View compliance status at a glance',
            'Manage job posts, applications and pipeline',
            'Communicate with candidates securely',
            'Build and manage long-term talent pools',
        ],
        signIn: '/recruiter/login',
        signUp: '/agent/signup',
    },
    {
        id: 'training-provider',
        icon: GraduationCap,
        name: 'For Training Providers',
        tagline: 'Grow your training business with data-driven insights and smarter planning.',
        image: '/images/login-image.webp',
        imageAlt: 'Maritime training instructor',
        accent: 'from-purple-500 to-purple-700',
        checkColor: 'text-purple-600',
        points: [
            'Analyse demand and plan training with insights',
            'List and promote your training courses',
            'Manage bookings and attendees efficiently',
            'Track course performance and feedback',
            'Communicate updates instantly',
            'Expand your reach and increase enrolments',
        ],
        signIn: '/training-provider/login',
        signUp: '/agent/signup',
    },
];

const AUDIENCE_TRUST = [
    { icon: BadgeCheck, label: 'Verified Identities' },
    { icon: Lock, label: 'Secure Documents' },
    { icon: ShieldCheck, label: 'Trusted by the Industry' },
    { icon: Globe, label: 'Accessible Anywhere' },
];

const AUDIENCE_BENEFITS = [
    { icon: Target, title: 'Purpose-Built Solutions', description: 'Designed specifically for the maritime industry.' },
    { icon: Timer, title: 'Save Time', description: 'Automate tasks and reduce manual work.' },
    { icon: Users, title: 'Stronger Connections', description: 'Connect with the right people, securely.' },
    { icon: BarChart3, title: 'Data-Driven Insights', description: 'Make informed decisions with real-time data.' },
    { icon: TrendingUp, title: 'Grow with Confidence', description: 'Scale your impact with a trusted platform.' },
];

const PREVIEWS = [
    {
        id: 'professional',
        icon: Anchor,
        tab: 'For Professionals',
        tabSub: 'Manage your career',
        activeTab: 'bg-[#003971] text-white shadow-lg',
        badgeChip: 'bg-blue-50 text-blue-700 border-blue-100',
        arrowBtn: 'bg-[#003971] hover:bg-[#002855]',
        dot: 'bg-[#003971]',
        badge: 'Professional Dashboard',
        heading: 'Your complete maritime career at a glance.',
        description:
            'Access everything you need in one place — your profile, certificates, compliance status, job applications and training.',
        points: [
            'Real-time compliance status',
            'Expiry alerts and reminders',
            'Job and training recommendations',
            'Secure messaging',
            'Track applications and bookings',
        ],
        screenshots: [],
    },
    {
        id: 'recruiter',
        icon: Briefcase,
        tab: 'For Recruiters',
        tabSub: 'Find and hire talent',
        activeTab: 'bg-teal-600 text-white shadow-lg',
        badgeChip: 'bg-teal-50 text-teal-700 border-teal-100',
        arrowBtn: 'bg-teal-600 hover:bg-teal-700',
        dot: 'bg-teal-600',
        badge: 'Recruiter Dashboard',
        heading: 'Hire the right maritime talent, faster.',
        description:
            'Search verified professionals, manage jobs and applicants, and communicate securely — all in one powerful platform.',
        points: [
            'Search verified maritime talent',
            'Post jobs and reach the right people',
            'Track applications in real-time',
            'Shortlist and manage candidates',
            'Secure in-app messaging',
            'Manage placements and reports',
        ],
        screenshots: [],
    },
    {
        id: 'training-provider',
        icon: GraduationCap,
        tab: 'For Training Providers',
        tabSub: 'Deliver and grow training',
        activeTab: 'bg-purple-600 text-white shadow-lg',
        badgeChip: 'bg-purple-50 text-purple-700 border-purple-100',
        arrowBtn: 'bg-purple-600 hover:bg-purple-700',
        dot: 'bg-purple-600',
        badge: 'Training Provider Dashboard',
        heading: 'Fill your sessions and grow your training business.',
        description:
            'List courses, manage bookings and understand demand — everything you need to run maritime training at scale.',
        points: [
            'List and promote your courses',
            'Manage sessions and bookings',
            'Track attendance and performance',
            'Understand demand with insights',
            'Communicate with attendees instantly',
        ],
        screenshots: [],
    },
];

const STEPS = [
    {
        icon: UserPlus,
        iconStyle: 'bg-blue-100 text-blue-600',
        badge: 'bg-blue-600',
        title: 'Create Your Account',
        description: 'Sign up and verify your email and phone. Choose your role and complete KYC.',
    },
    {
        icon: FileCheck2,
        iconStyle: 'bg-indigo-100 text-indigo-600',
        badge: 'bg-indigo-600',
        title: 'Build Your Profile',
        description: 'Create your role-aware maritime CV and upload your certificates to your secure wallet.',
    },
    {
        icon: ShieldCheck,
        iconStyle: 'bg-teal-100 text-teal-600',
        badge: 'bg-teal-600',
        title: 'Get Verified',
        description: 'Our team verifies your identity and documents to earn your MaritimeLink Verified badge.',
    },
    {
        icon: Briefcase,
        iconStyle: 'bg-amber-100 text-amber-600',
        badge: 'bg-amber-500',
        title: 'Apply or Post',
        description: 'Apply for jobs, book training, or post jobs and training opportunities easily.',
    },
    {
        icon: MessageCircle,
        iconStyle: 'bg-cyan-100 text-cyan-600',
        badge: 'bg-cyan-600',
        title: 'Connect & Communicate',
        description: 'Chat securely with recruiters, candidates or training providers in real time.',
    },
    {
        icon: TrendingUp,
        iconStyle: 'bg-emerald-100 text-emerald-600',
        badge: 'bg-emerald-600',
        title: 'Grow Your Career/Business',
        description: 'Stay compliant, get found, make better decisions and achieve more with MaritimeLink.',
    },
];

const SECURITY_ITEMS = [
    {
        icon: Lock,
        title: 'Enterprise Security',
        description: 'Encryption in transit and at rest. Built on secure, trusted infrastructure.',
    },
    {
        icon: BadgeCheck,
        title: 'Verified Identities',
        description: 'Multi-step KYC and document verification to ensure a trusted maritime community.',
    },
    {
        icon: EyeOff,
        title: 'Privacy First',
        description: 'You control your data and who sees it. We never share your information.',
    },
    {
        icon: ClipboardCheck,
        title: 'Compliance Focused',
        description: 'Expiry tracking, alerts and compliance tools help you stay audit-ready.',
    },
    {
        icon: Server,
        title: 'Reliable & Resilient',
        description: '99.9% uptime commitment with regular backups and monitoring.',
    },
];

// Footer links: `to` navigates to a route, `anchor` scrolls to a section, `soon` marks pages not built yet.
const FOOTER_COLUMNS = [
    {
        heading: 'For Professionals',
        links: [
            { label: 'Create Profile', to: '/signup' },
            { label: 'Job Search', to: '/signin' },
            { label: 'Training', to: '/signin' },
            { label: 'Document Wallet', to: '/signin' },
            { label: 'Premium', to: '/signin' },
        ],
    },
    {
        heading: 'For Recruiters',
        links: [
            { label: 'Post a Job', to: '/recruiter/login' },
            { label: 'Search Talent', to: '/recruiter/login' },
            { label: 'Get Started', to: '/agent/signup' },
            { label: 'Platform Preview', anchor: 'preview' },
        ],
    },
    {
        heading: 'For Training Providers',
        links: [
            { label: 'List a Course', to: '/training-provider/login' },
            { label: 'Manage Bookings', to: '/training-provider/login' },
            { label: 'Get Started', to: '/agent/signup' },
            { label: 'Platform Preview', anchor: 'preview' },
        ],
    },
    {
        heading: 'Company',
        links: [
            { label: 'About Us', anchor: 'why' },
            { label: 'How It Works', anchor: 'how-it-works' },
            { label: 'Blog', soon: true },
            { label: 'Careers', soon: true },
            { label: 'Contact Us', soon: true },
        ],
    },
    {
        heading: 'Legal',
        links: [
            { label: 'Terms of Service', to: '/terms' },
            { label: 'Privacy Policy', soon: true },
            { label: 'Cookies Policy', soon: true },
        ],
    },
];

// Fill in the hrefs once the official pages exist; empty ones render as "coming soon".
const SOCIAL_LINKS = [
    { icon: Linkedin, label: 'LinkedIn', href: '' },
    { icon: Facebook, label: 'Facebook', href: '' },
    { icon: Instagram, label: 'Instagram', href: '' },
    { icon: Youtube, label: 'YouTube', href: '' },
];

const WHY_POINTS = [
    {
        icon: BadgeCheck,
        title: 'One verified professional identity',
        description: 'Build a trusted profile with verified qualifications, certificates and sea service.',
    },
    {
        icon: Wallet,
        title: 'One secure document wallet',
        description: 'Store, manage and share your maritime documents safely from anywhere in the world.',
    },
    {
        icon: Briefcase,
        title: 'One platform for jobs & training',
        description: 'Find the right jobs, book training courses and stay compliant — all in one place.',
    },
    {
        icon: Network,
        title: 'One connected maritime ecosystem',
        description: 'Streamlined communication and collaboration between professionals, recruiters and training providers.',
    },
    {
        icon: Timer,
        title: 'Less admin. More time at sea.',
        description: 'Automated verification, expiry tracking and smart workflows reduce manual work and errors.',
    },
];

const WHY_AUDIENCES = [
    {
        icon: Anchor,
        accent: 'from-blue-500 to-blue-700',
        name: 'For Professionals',
        description: 'Showcase your verified profile, get discovered by recruiters and access the best career and training opportunities.',
    },
    {
        icon: Briefcase,
        accent: 'from-teal-500 to-teal-700',
        name: 'For Recruiters',
        description: 'Find verified maritime talent faster, reduce administration and make smarter hiring decisions.',
    },
    {
        icon: GraduationCap,
        accent: 'from-purple-500 to-purple-700',
        name: 'For Training Providers',
        description: 'Reach professionals who need your courses, fill your sessions and grow your training business.',
    },
];

const STATS = [
    { icon: Users, value: '1.9M+', label: 'Seafarers globally' },
    { icon: Building2, value: '10K+', label: 'Maritime organisations' },
    { icon: GraduationCap, value: '4K+', label: 'Training providers' },
    { icon: ShieldCheck, value: '100%', label: 'Verified identities' },
    { icon: Globe, value: 'Global', label: 'Accessible anywhere' },
];

const WALLET_DOCS = ['COC (Unlimited)', 'STCW Certificates', 'Medical Certificate', 'Sea Service Letter'];

const PHONE_DOCS = [
    ['COC (Unlimited)', 'Valid until 09 Feb 2027'],
    ['STCW Certificates', 'Valid until 18 Aug 2027'],
    ['Medical Certificate', 'Valid until 04 May 2027'],
    ['Passport', 'Valid until 21 Sep 2028'],
];

function UnionJackFlag() {
    return (
        <svg viewBox="0 0 60 36" className="h-6 w-9 rounded shadow-sm shrink-0" aria-hidden="true">
            <rect width="60" height="36" fill="#012169" />
            <path d="M0,0 L60,36 M60,0 L0,36" stroke="#ffffff" strokeWidth="7" />
            <path d="M0,0 L60,36 M60,0 L0,36" stroke="#C8102E" strokeWidth="3" />
            <path d="M30,0 V36 M0,18 H60" stroke="#ffffff" strokeWidth="12" />
            <path d="M30,0 V36 M0,18 H60" stroke="#C8102E" strokeWidth="7" />
        </svg>
    );
}

function LandingPage() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [signInOpen, setSignInOpen] = useState(false);
    const [previewTab, setPreviewTab] = useState(0);
    const [previewSlide, setPreviewSlide] = useState(0);

    const activePreview = PREVIEWS[previewTab];
    const previewShots = activePreview.screenshots;

    const selectPreviewTab = (idx) => {
        setPreviewTab(idx);
        setPreviewSlide(0);
    };

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const scrollToId = (id) => {
        setMobileOpen(false);
        setSignInOpen(false);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const navLinks = [
        { label: 'Why MaritimeLink', id: 'why' },
        { label: 'Who It’s For', id: 'audience' },
        { label: 'Platform Preview', id: 'preview' },
        { label: 'How It Works', id: 'how-it-works' },
    ];

    return (
        <div className="min-h-screen w-full bg-white text-gray-900 overflow-x-hidden">
            {/* ───────────────────────── Navbar ───────────────────────── */}
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-5'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="flex items-center gap-2"
                    >
                        <img
                            src="/images/logo.png"
                            alt="MaritimeLink"
                            className={`w-auto object-contain transition-all duration-300 ${scrolled ? 'h-12' : 'h-16'}`}
                        />
                        <span className="font-bold text-xl text-gray-900">
                            Maritime<span className="text-blue-600">Link</span>
                        </span>
                    </button>

                    <nav className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <button
                                key={link.id}
                                onClick={() => scrollToId(link.id)}
                                className="relative text-sm font-medium text-gray-700 hover:text-[#003971] transition-colors group"
                            >
                                {link.label}
                                <span className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-[#003971] transition-all duration-300 group-hover:w-full" />
                            </button>
                        ))}
                    </nav>

                    <div className="hidden lg:flex items-center gap-3 relative">
                        <button
                            type="button"
                            onClick={() => setSignInOpen((v) => !v)}
                            className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-[#003971] px-3 py-2 transition-colors"
                        >
                            Sign In
                            <ChevronDown className={`h-4 w-4 transition-transform ${signInOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {signInOpen && (
                            <div className="absolute right-28 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-[fade-in-up_0.2s_ease-out]">
                                {ROLES.map((role) => (
                                    <button
                                        key={role.id}
                                        onClick={() => navigate(role.signIn)}
                                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-between"
                                    >
                                        {role.name}
                                        <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
                                    </button>
                                ))}
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => scrollToId('audience')}
                            className="bg-[#003971] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#002855] hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                            Get Started Free
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => setMobileOpen((v) => !v)}
                        className="lg:hidden text-gray-800"
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {mobileOpen && (
                    <div className="lg:hidden bg-white border-t border-gray-100 mt-3 px-6 py-4 space-y-3 shadow-lg">
                        {navLinks.map((link) => (
                            <button
                                key={link.id}
                                onClick={() => scrollToId(link.id)}
                                className="block w-full text-left text-gray-700 font-medium py-2"
                            >
                                {link.label}
                            </button>
                        ))}
                        <div className="pt-2 border-t border-gray-100 space-y-2">
                            {ROLES.map((role) => (
                                <button
                                    key={role.id}
                                    onClick={() => navigate(role.signIn)}
                                    className="block w-full text-left text-sm text-gray-600 py-1.5"
                                >
                                    Sign in as {role.name}
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={() => scrollToId('audience')}
                            className="w-full bg-[#003971] text-white px-5 py-3 rounded-full text-sm font-semibold mt-2"
                        >
                            Get Started Free
                        </button>
                    </div>
                )}
            </header>

            {/* ───────────────────────── Hero ───────────────────────── */}
            <section className="relative pt-32 lg:pt-40 pb-24 lg:pb-32 px-6 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
                {/* Decorative animated blobs */}
                <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-[blob-drift_14s_ease-in-out_infinite]" />
                <div className="pointer-events-none absolute top-1/3 -right-24 w-[28rem] h-[28rem] bg-cyan-300/30 rounded-full blur-3xl animate-[blob-drift_18s_ease-in-out_infinite_reverse]" />
                <div className="pointer-events-none absolute bottom-0 left-1/3 w-72 h-72 bg-teal-200/40 rounded-full blur-3xl animate-[blob-drift_16s_ease-in-out_infinite]" />

                <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <Reveal direction="up">
                        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm border border-blue-100 mb-6">
                            <Sparkles className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">Trusted by the Maritime Community Worldwide</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-6">
                            One Platform.
                            <span className="block bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent bg-size-200 animate-[gradient-pan_6s_ease_infinite]">
                                Every Maritime Connection.
                            </span>
                        </h1>

                        <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-xl">
                            MaritimeLink brings verified maritime professionals, recruiters, and training
                            providers together in one trusted platform. Through shared digital identities,
                            recruitment, training, and secure credential management, it simplifies how the
                            maritime industry connects and works together.
                        </p>

                        <div className="flex flex-wrap items-center gap-4 mb-10">
                            <button
                                type="button"
                                onClick={() => scrollToId('audience')}
                                className="group inline-flex items-center gap-2 bg-[#003971] text-white px-7 py-3.5 rounded-full font-semibold shadow-lg shadow-blue-900/20 hover:bg-[#002855] hover:shadow-xl transition-all duration-300"
                            >
                                Get Started for Free
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </button>
                            <button
                                type="button"
                                onClick={() => scrollToId('why')}
                                className="group inline-flex items-center gap-2.5 bg-white text-gray-800 px-7 py-3.5 rounded-full font-semibold border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
                            >
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors">
                                    <Play className="h-3 w-3 text-[#003971] fill-[#003971]" />
                                </span>
                                Watch Demo
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-x-8 gap-y-3">
                            {['Verified Identities', 'Secure & Compliant', 'Recruitment Made Easy', 'Training in One Place'].map((item) => (
                                <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                                    <CheckCircle2 className="h-4 w-4 text-teal-600" />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </Reveal>

                    <Reveal direction="left" delay={150}>
                        <div className="relative mx-auto max-w-lg pb-14 pt-8">
                            {/* Laptop — professional dashboard mockup */}
                            <div className="relative animate-[float-y_7s_ease-in-out_infinite]">
                                <div className="rounded-2xl bg-slate-800 p-2.5 shadow-2xl ring-1 ring-black/10">
                                    <div className="rounded-lg bg-white overflow-hidden">
                                        {/* App top bar */}
                                        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                                            <div className="flex items-center gap-1.5">
                                                <img src="/images/logo.png" alt="" className="h-4 w-auto object-contain" />
                                                <span className="text-[10px] font-bold text-gray-900">
                                                    Maritime<span className="text-blue-600">Link</span>
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <Search className="h-3 w-3 text-gray-400" />
                                                <Bell className="h-3 w-3 text-gray-400" />
                                                <div className="h-4 w-4 rounded-full bg-gradient-to-br from-blue-500 to-teal-500" />
                                            </div>
                                        </div>
                                        <div className="flex">
                                            {/* Sidebar */}
                                            <div className="hidden sm:block w-24 shrink-0 bg-[#003971] px-1.5 py-2.5 space-y-0.5">
                                                {['Dashboard', 'Profile', 'Document Wallet', 'Jobs', 'Training', 'Messages', 'Compliance', 'Settings'].map((item, i) => (
                                                    <div
                                                        key={item}
                                                        className={`text-[7px] px-2 py-[5px] rounded ${i === 0 ? 'bg-white/15 text-white font-semibold' : 'text-blue-200/80'}`}
                                                    >
                                                        {item}
                                                    </div>
                                                ))}
                                            </div>
                                            {/* Main panel */}
                                            <div className="flex-1 bg-slate-50 p-2.5 space-y-2">
                                                <p className="text-[9px] font-bold text-gray-900">Dashboard</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="bg-white rounded-md p-2 shadow-sm">
                                                        <p className="text-[7px] text-gray-500 mb-1">Profile Completion</p>
                                                        <p className="text-[11px] font-bold text-gray-900 mb-1">92%</p>
                                                        <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
                                                            <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-blue-500 to-teal-500" />
                                                        </div>
                                                    </div>
                                                    <div className="bg-white rounded-md p-2 shadow-sm">
                                                        <p className="text-[7px] text-gray-500 mb-1">Identity Verified</p>
                                                        <div className="flex items-center gap-1">
                                                            <ShieldCheck className="h-3 w-3 text-teal-600" />
                                                            <p className="text-[8px] font-semibold text-gray-800">KYC Complete</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-white rounded-md p-2 shadow-sm">
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <p className="text-[8px] font-semibold text-gray-800">Document Wallet</p>
                                                        <p className="text-[7px] text-blue-600 font-medium">View all</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        {WALLET_DOCS.map((doc) => (
                                                            <div key={doc} className="flex items-center justify-between">
                                                                <div className="flex items-center gap-1">
                                                                    <FileCheck2 className="h-2.5 w-2.5 text-blue-500" />
                                                                    <p className="text-[7px] text-gray-600">{doc}</p>
                                                                </div>
                                                                <span className="text-[6px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-full">
                                                                    Valid
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="bg-white rounded-md p-2 shadow-sm">
                                                        <p className="text-[7px] text-gray-500">Job Matches</p>
                                                        <p className="text-[9px] font-bold text-gray-900">6 new opportunities</p>
                                                    </div>
                                                    <div className="bg-white rounded-md p-2 shadow-sm">
                                                        <p className="text-[7px] text-gray-500">Training Recommendations</p>
                                                        <p className="text-[9px] font-bold text-gray-900">3 courses for you</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mx-auto h-2.5 w-2/5 rounded-b-2xl bg-slate-700 shadow-lg" />
                            </div>

                            {/* Phone — document wallet mockup */}
                            <div className="absolute -right-2 sm:-right-6 bottom-0 w-28 sm:w-32 rounded-[1.4rem] bg-slate-800 p-1.5 shadow-2xl ring-1 ring-black/10 animate-[float-y_6s_ease-in-out_infinite] [animation-delay:0.8s]">
                                <div className="rounded-[1.1rem] bg-white overflow-hidden">
                                    <div className="bg-[#003971] px-2 py-1.5">
                                        <p className="text-[7px] font-semibold text-white">Document Wallet</p>
                                    </div>
                                    <div className="p-1.5 space-y-1">
                                        {PHONE_DOCS.map(([name, sub]) => (
                                            <div key={name} className="rounded-md border border-gray-100 px-1.5 py-1">
                                                <div className="flex items-center gap-1">
                                                    <CheckCircle2 className="h-2 w-2 text-teal-600 shrink-0" />
                                                    <p className="text-[6.5px] font-semibold text-gray-800">{name}</p>
                                                </div>
                                                <p className="text-[5.5px] text-gray-400 pl-3">{sub}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Floating role cards */}
                            <div className="absolute -top-2 -right-2 sm:right-6 bg-white rounded-2xl shadow-xl px-3.5 py-2.5 flex items-center gap-2.5 animate-[float-y_5s_ease-in-out_infinite]">
                                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                                    <Briefcase className="h-4 w-4 text-teal-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-800">Recruiters</p>
                                    <p className="text-[10px] text-gray-500">Find &amp; hire verified talent</p>
                                </div>
                            </div>

                            <div className="absolute top-1/3 -left-3 sm:-left-8 bg-white rounded-2xl shadow-xl px-3.5 py-2.5 flex items-center gap-2.5 animate-[float-y_5.5s_ease-in-out_infinite] [animation-delay:0.4s]">
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                                    <GraduationCap className="h-4 w-4 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-800">Training Providers</p>
                                    <p className="text-[10px] text-gray-500">Grow your training business</p>
                                </div>
                            </div>

                            <div className="absolute -bottom-2 left-2 sm:left-8 bg-white rounded-2xl shadow-xl px-3.5 py-2.5 flex items-center gap-2.5 animate-[float-y_6s_ease-in-out_infinite] [animation-delay:1s]">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                    <Anchor className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-800">Maritime Professionals</p>
                                    <p className="text-[10px] text-gray-500">Manage. Grow. Succeed.</p>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>

                {/* Trust & compliance bar */}
                <Reveal delay={250} className="relative max-w-7xl mx-auto mt-16 lg:mt-20">
                    <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-blue-100/70 px-6 py-5 flex flex-wrap items-center justify-center xl:justify-between gap-x-8 gap-y-5">
                        <div className="flex items-center gap-3">
                            <UnionJackFlag />
                            <div>
                                <p className="text-xs font-bold text-gray-900">Built in the UK</p>
                                <p className="text-[11px] text-gray-500">Proudly a UK technology company</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                <Building2 className="h-[18px] w-[18px] text-[#003971]" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-900">MaritimeLink Ltd</p>
                                <p className="text-[11px] text-gray-500">Company No. 16976752</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                <Lock className="h-[18px] w-[18px] text-[#003971]" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-900">SSL Secured</p>
                                <p className="text-[11px] text-gray-500">256-bit encryption for your security</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                <ShieldCheck className="h-[18px] w-[18px] text-[#003971]" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-900">GDPR Compliant</p>
                                <p className="text-[11px] text-gray-500">Your data, your control</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                <CreditCard className="h-[18px] w-[18px] text-[#003971]" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-900">Secure Payments</p>
                                <p className="text-[11px] text-gray-500">Powered by Stripe</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <div className="flex items-center gap-2 bg-gray-900 text-white rounded-lg px-3 py-1.5">
                                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
                                    <path d="M4 2.7v18.6c0 .6.7 1 1.2.7l16-9.3c.5-.3.5-1.1 0-1.4l-16-9.3c-.5-.3-1.2.1-1.2.7z" />
                                </svg>
                                <div>
                                    <p className="text-[8px] leading-none text-gray-300">Coming soon on</p>
                                    <p className="text-[11px] font-semibold leading-tight">Google Play</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-900 text-white rounded-lg px-3 py-1.5">
                                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
                                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                                </svg>
                                <div>
                                    <p className="text-[8px] leading-none text-gray-300">Coming soon on</p>
                                    <p className="text-[11px] font-semibold leading-tight">App Store</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Reveal>

                {/* Wave divider */}
                <div className="absolute bottom-0 left-0 right-0 translate-y-1 pointer-events-none">
                    <svg viewBox="0 0 1440 100" className="w-full h-20 text-white">
                        <path fill="currentColor" d="M0,48 C480,112 960,0 1440,48 L1440,100 L0,100 Z" />
                    </svg>
                </div>
            </section>

            {/* ───────────────────────── Why MaritimeLink ───────────────────────── */}
            <section id="why" className="relative py-24 px-6 bg-white overflow-hidden">
                <div className="pointer-events-none absolute -top-24 right-0 w-96 h-96 bg-cyan-100/50 rounded-full blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 -left-24 w-80 h-80 bg-blue-100/50 rounded-full blur-3xl" />

                <div className="relative max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
                        <Reveal direction="up">
                            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5">
                                <Sparkles className="h-3.5 w-3.5" />
                                Why MaritimeLink Exists
                            </div>

                            <h2 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold text-gray-900 leading-tight mb-5">
                                The Maritime Platform{' '}
                                <span className="block bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent bg-size-200 animate-[gradient-pan_6s_ease_infinite]">
                                    Built Around You.
                                </span>
                            </h2>

                            <p className="text-lg text-gray-600 leading-relaxed mb-8">
                                MaritimeLink brings maritime professionals, recruiters and training providers
                                together on one secure platform designed specifically for the maritime industry.
                            </p>

                            <ul className="space-y-5">
                                {WHY_POINTS.map((point) => {
                                    const Icon = point.icon;
                                    return (
                                        <li key={point.title} className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0 mt-0.5">
                                                <Icon className="h-5 w-5 text-teal-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 mb-0.5">{point.title}</p>
                                                <p className="text-sm text-gray-600 leading-relaxed">{point.description}</p>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </Reveal>

                        <Reveal direction="left" delay={150}>
                            <div className="relative mx-auto max-w-md">
                                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-black/5">
                                    <img
                                        src="/images/crew-image.webp"
                                        alt="Verified maritime professional on deck"
                                        className="w-full h-[480px] object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#003971]/60 via-transparent to-transparent" />
                                </div>

                                <div className="absolute -right-5 top-8 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 animate-[float-y_5s_ease-in-out_infinite]">
                                    <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center">
                                        <BadgeCheck className="h-5 w-5 text-teal-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-800">Verified Professional</p>
                                        <p className="text-[11px] text-gray-500">Identity verified. Trust earned.</p>
                                    </div>
                                </div>

                                <div className="absolute -left-5 bottom-10 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 animate-[float-y_5.5s_ease-in-out_infinite] [animation-delay:0.6s]">
                                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                                        <ShieldCheck className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-800">Compliance Health</p>
                                        <p className="text-[11px] text-gray-500">Excellent &mdash; all certificates valid</p>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    </div>

                    {/* Audience snapshot cards */}
                    <div className="grid sm:grid-cols-3 gap-6 mb-14">
                        {WHY_AUDIENCES.map((aud, idx) => {
                            const Icon = aud.icon;
                            return (
                                <Reveal key={aud.name} delay={idx * 100} direction="up">
                                    <div className="group h-full bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col">
                                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${aud.accent} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon className="h-5 w-5 text-white" />
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-2">{aud.name}</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-1">{aud.description}</p>
                                        <button
                                            type="button"
                                            onClick={() => scrollToId('audience')}
                                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#003971] hover:gap-2.5 transition-all"
                                        >
                                            Learn more
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>

                    {/* Stats */}
                    <Reveal delay={100}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
                            {STATS.map((stat) => {
                                const Icon = stat.icon;
                                return (
                                    <div key={stat.label} className="bg-slate-50 rounded-2xl border border-gray-100 px-4 py-4 flex items-center gap-3 hover:shadow-md hover:-translate-y-1 hover:bg-white transition-all duration-300">
                                        <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                                            <Icon className="h-4 w-4 text-[#003971]" />
                                        </div>
                                        <div>
                                            <p className="text-base font-extrabold text-gray-900 leading-tight">{stat.value}</p>
                                            <p className="text-[11px] text-gray-500">{stat.label}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Reveal>

                    {/* Ecosystem banner */}
                    <Reveal delay={150}>
                        <div className="bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 border border-blue-100 rounded-2xl px-6 py-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
                            <div className="w-11 h-11 rounded-full bg-[#003971] flex items-center justify-center shrink-0 shadow-md">
                                <Compass className="h-5 w-5 text-white" />
                            </div>
                            <div className="text-center sm:text-left">
                                <p className="font-bold text-gray-900 mb-0.5">More than a platform. A trusted maritime ecosystem.</p>
                                <p className="text-sm text-gray-600">
                                    MaritimeLink is the digital infrastructure that connects maritime professionals,
                                    recruiters, and training providers through one secure, verified and intelligent platform.
                                </p>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ───────────────────────── Audience — Built for Every Key Player ───────────────────────── */}
            <section id="audience" className="relative py-24 px-6 bg-gradient-to-b from-blue-50/60 via-white to-white overflow-hidden">
                <div className="pointer-events-none absolute -top-20 -right-24 w-96 h-96 bg-cyan-100/50 rounded-full blur-3xl" />
                <div className="relative max-w-7xl mx-auto">
                    <Reveal className="text-center max-w-2xl mx-auto mb-10">
                        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Who MaritimeLink Is For</p>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
                            Built for Every Key Player{' '}
                            <span className="block bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent bg-size-200 animate-[gradient-pan_6s_ease_infinite]">
                                in the Maritime Ecosystem
                            </span>
                        </h2>
                        <p className="text-gray-600 text-lg">
                            MaritimeLink brings professionals, recruiters and training providers together on one
                            platform &mdash; each with the right tools to achieve more.
                        </p>
                    </Reveal>

                    {/* Trust strip */}
                    <Reveal delay={100}>
                        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 mb-14">
                            {AUDIENCE_TRUST.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.label} className="flex items-center gap-2 text-sm text-gray-700">
                                        <Icon className="h-4 w-4 text-teal-600" />
                                        <span className="font-medium">{item.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </Reveal>

                    {/* Key player cards */}
                    <div className="grid md:grid-cols-3 gap-6 mb-14">
                        {KEY_PLAYERS.map((player, idx) => {
                            const Icon = player.icon;
                            return (
                                <Reveal key={player.id} delay={idx * 100} direction="up">
                                    <div className="group h-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden">
                                        <div className="relative h-44 overflow-hidden">
                                            <img
                                                src={player.image}
                                                alt={player.imageAlt}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                                            <div className={`absolute top-4 left-4 w-11 h-11 rounded-xl bg-gradient-to-br ${player.accent} flex items-center justify-center shadow-lg`}>
                                                <Icon className="h-5 w-5 text-white" />
                                            </div>
                                        </div>

                                        <div className="p-6 flex flex-col flex-1">
                                            <h3 className="text-lg font-bold text-gray-900 mb-1.5">{player.name}</h3>
                                            <p className="text-sm text-gray-500 mb-4">{player.tagline}</p>

                                            <ul className="space-y-2 mb-6 flex-1">
                                                {player.points.map((point) => (
                                                    <li key={point} className="flex items-start gap-2 text-sm text-gray-600">
                                                        <CheckCircle2 className={`h-4 w-4 ${player.checkColor} mt-0.5 shrink-0`} />
                                                        {point}
                                                    </li>
                                                ))}
                                            </ul>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(player.signUp)}
                                                    className={`flex-1 bg-gradient-to-r ${player.accent} text-white text-sm font-semibold py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center gap-1.5`}
                                                >
                                                    Get started
                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(player.signIn)}
                                                    className="flex-1 text-sm font-semibold text-gray-700 border border-gray-200 py-2.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
                                                >
                                                    Sign in
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>

                    {/* Benefits strip */}
                    <Reveal delay={100}>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                            {AUDIENCE_BENEFITS.map((benefit) => {
                                const Icon = benefit.icon;
                                return (
                                    <div key={benefit.title} className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                            <Icon className="h-[18px] w-[18px] text-[#003971]" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 leading-tight mb-0.5">{benefit.title}</p>
                                            <p className="text-xs text-gray-500 leading-relaxed">{benefit.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ───────────────────────── Platform Preview ───────────────────────── */}
            <section id="preview" className="relative py-24 px-6 bg-slate-50 overflow-hidden">
                <div className="pointer-events-none absolute top-0 right-0 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl" />
                <div className="relative max-w-7xl mx-auto">
                    <Reveal className="text-center max-w-2xl mx-auto mb-12">
                        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Platform Preview</p>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">See MaritimeLink in Action</h2>
                        <p className="text-gray-600 text-lg">
                            Explore the platform built specifically for maritime professionals, recruiters and
                            training providers.
                        </p>
                    </Reveal>

                    {/* Role tabs */}
                    <Reveal delay={100}>
                        <div className="grid sm:grid-cols-3 gap-3 max-w-3xl mx-auto mb-8">
                            {PREVIEWS.map((preview, idx) => {
                                const Icon = preview.icon;
                                const isActive = idx === previewTab;
                                return (
                                    <button
                                        key={preview.id}
                                        type="button"
                                        onClick={() => selectPreviewTab(idx)}
                                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-300 border ${isActive
                                            ? `${preview.activeTab} border-transparent scale-[1.03]`
                                            : 'bg-white text-gray-700 border-gray-100 hover:border-gray-200 hover:shadow-md hover:-translate-y-0.5'
                                            }`}
                                    >
                                        <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                        <span>
                                            <span className="block text-sm font-bold leading-tight">{preview.tab}</span>
                                            <span className={`block text-[11px] ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                                                {preview.tabSub}
                                            </span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </Reveal>

                    {/* Preview panel */}
                    <Reveal delay={150}>
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8 grid lg:grid-cols-[1fr_320px] gap-8 items-center">
                            {/* Screenshot area */}
                            <div className="relative rounded-2xl bg-slate-100 overflow-hidden min-h-[320px] lg:min-h-[420px] flex items-center justify-center">
                                {previewShots.length > 0 ? (
                                    <img
                                        key={`${activePreview.id}-${previewSlide}`}
                                        src={previewShots[previewSlide]}
                                        alt={`${activePreview.badge} screenshot ${previewSlide + 1}`}
                                        className="w-full h-full object-contain animate-[fade-in-up_0.45s_ease-out]"
                                    />
                                ) : (
                                    <div key={activePreview.id} className="text-center px-8 py-16 animate-[fade-in-up_0.45s_ease-out]">
                                        <div className="w-16 h-16 mx-auto rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-4">
                                            <LayoutDashboard className="h-7 w-7 text-gray-300" />
                                        </div>
                                        <p className="font-semibold text-gray-500 mb-1">{activePreview.badge} preview</p>
                                        <p className="text-sm text-gray-400">Dashboard screenshots coming soon</p>
                                    </div>
                                )}
                            </div>

                            {/* Info panel */}
                            <div key={activePreview.id} className="animate-[fade-in-up_0.45s_ease-out]">
                                <span className={`inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border mb-4 ${activePreview.badgeChip}`}>
                                    {activePreview.badge}
                                </span>
                                <h3 className="text-2xl font-extrabold text-gray-900 leading-snug mb-3">{activePreview.heading}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed mb-5">{activePreview.description}</p>

                                <ul className="space-y-2.5 mb-8">
                                    {activePreview.points.map((point) => (
                                        <li key={point} className="flex items-start gap-2 text-sm text-gray-700">
                                            <CheckCircle2 className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
                                            {point}
                                        </li>
                                    ))}
                                </ul>

                                <div className="flex items-center gap-4">
                                    <button
                                        type="button"
                                        disabled={previewShots.length === 0}
                                        onClick={() => setPreviewSlide((s) => (s - 1 + previewShots.length) % previewShots.length)}
                                        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        aria-label="Previous screenshot"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                    </button>
                                    <span className="text-sm font-bold text-gray-900 tabular-nums">
                                        {String(previewShots.length === 0 ? 1 : previewSlide + 1).padStart(2, '0')}
                                        <span className="text-gray-400 font-medium"> / {String(Math.max(previewShots.length, 1)).padStart(2, '0')}</span>
                                    </span>
                                    <button
                                        type="button"
                                        disabled={previewShots.length === 0}
                                        onClick={() => setPreviewSlide((s) => (s + 1) % previewShots.length)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${activePreview.arrowBtn}`}
                                        aria-label="Next screenshot"
                                    >
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Slide dots */}
                        <div className="flex items-center justify-center gap-2 mt-6">
                            {(previewShots.length > 0 ? previewShots : [0]).map((_, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => previewShots.length > 0 && setPreviewSlide(idx)}
                                    className={`h-2 rounded-full transition-all duration-300 ${idx === previewSlide ? `w-6 ${activePreview.dot}` : 'w-2 bg-gray-300'}`}
                                    aria-label={`Go to screenshot ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ───────────────────────── How it works ───────────────────────── */}
            <section id="how-it-works" className="relative py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <Reveal className="text-center max-w-2xl mx-auto mb-16">
                        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">How It Works</p>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Simple steps. Powerful results.</h2>
                        <p className="text-gray-600 text-lg">
                            MaritimeLink connects maritime professionals, recruiters and training providers
                            through one secure platform.
                        </p>
                    </Reveal>

                    <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5">
                        {STEPS.map((step, idx) => {
                            const Icon = step.icon;
                            return (
                                <Reveal key={step.title} delay={idx * 90} direction="up" className="relative h-full">
                                    <div className="relative h-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 p-5 pt-7 text-center">
                                        <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full ${step.badge} text-white text-xs font-bold flex items-center justify-center shadow-md`}>
                                            {idx + 1}
                                        </div>
                                        <div className={`w-12 h-12 mx-auto rounded-xl ${step.iconStyle} flex items-center justify-center mb-3`}>
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-sm font-bold text-gray-900 mb-2 leading-snug">{step.title}</h3>
                                        <p className="text-xs text-gray-500 leading-relaxed">{step.description}</p>
                                    </div>
                                    {idx < STEPS.length - 1 && (
                                        <ArrowRight className="hidden xl:block absolute top-1/2 -right-[15px] -translate-y-1/2 h-4 w-4 text-gray-300 z-10 animate-pulse" />
                                    )}
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ───────────────────────── Security & Trust ───────────────────────── */}
            <section id="security" className="relative py-24 px-6 bg-slate-50 overflow-hidden">
                <div className="pointer-events-none absolute -bottom-20 -left-20 w-80 h-80 bg-blue-100/60 rounded-full blur-3xl" />
                <div className="relative max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-[1fr_2fr] gap-12 items-start mb-12">
                        <Reveal direction="up">
                            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Security &amp; Trust
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
                                Your data. Your trust.{' '}
                                <span className="block bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent bg-size-200 animate-[gradient-pan_6s_ease_infinite]">
                                    Our responsibility.
                                </span>
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                We use enterprise-grade security and strict verification processes to protect
                                your identity and information.
                            </p>
                        </Reveal>

                        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                            {SECURITY_ITEMS.map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <Reveal key={item.title} delay={idx * 80} direction="up" className="h-full">
                                        <div className="group h-full bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 group-hover:bg-[#003971] flex items-center justify-center mb-3 transition-colors duration-300">
                                                <Icon className="h-5 w-5 text-[#003971] group-hover:text-white transition-colors duration-300" />
                                            </div>
                                            <h3 className="text-sm font-bold text-gray-900 mb-1.5">{item.title}</h3>
                                            <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
                                        </div>
                                    </Reveal>
                                );
                            })}
                        </div>
                    </div>

                    <Reveal delay={150} className="text-center">
                        <div className="inline-flex items-center gap-2 bg-white border border-blue-100 rounded-full px-5 py-2.5 shadow-sm">
                            <ShieldCheck className="h-4 w-4 text-teal-600" />
                            <span className="text-sm font-medium text-gray-700">
                                Trusted by maritime professionals and organisations worldwide
                            </span>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ───────────────────────── Download the App ───────────────────────── */}
            <section id="download" className="relative py-24 px-6 bg-white overflow-hidden">
                <div className="pointer-events-none absolute -top-20 right-0 w-96 h-96 bg-cyan-100/50 rounded-full blur-3xl" />
                <div className="relative max-w-7xl mx-auto grid lg:grid-cols-[1.2fr_auto] gap-12 items-center">
                    <Reveal direction="up">
                        <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5">
                            <Smartphone className="h-3.5 w-3.5" />
                            Download the App
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
                            Access your maritime world{' '}
                            <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent bg-size-200 animate-[gradient-pan_6s_ease_infinite]">
                                anytime, anywhere.
                            </span>
                        </h2>
                        <p className="text-gray-600 text-lg mb-8">Available on Android and iOS. One account. All devices.</p>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2.5 bg-gray-900 text-white rounded-xl px-4 py-2.5 hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-default">
                                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
                                    <path d="M4 2.7v18.6c0 .6.7 1 1.2.7l16-9.3c.5-.3.5-1.1 0-1.4l-16-9.3c-.5-.3-1.2.1-1.2.7z" />
                                </svg>
                                <div>
                                    <p className="text-[9px] leading-none text-gray-300">Coming soon on</p>
                                    <p className="text-sm font-semibold leading-tight">Google Play</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 bg-gray-900 text-white rounded-xl px-4 py-2.5 hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-default">
                                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
                                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                                </svg>
                                <div>
                                    <p className="text-[9px] leading-none text-gray-300">Coming soon on</p>
                                    <p className="text-sm font-semibold leading-tight">App Store</p>
                                </div>
                            </div>
                        </div>
                    </Reveal>

                    <Reveal direction="up" delay={100}>
                        {/* Phone mockup */}
                        <div className="mx-auto w-48 rounded-[2rem] bg-slate-800 p-2 shadow-2xl ring-1 ring-black/10 animate-[float-y_6s_ease-in-out_infinite]">
                            <div className="rounded-[1.6rem] bg-white overflow-hidden">
                                <div className="bg-[#003971] px-3 py-3">
                                    <p className="text-[9px] text-blue-200">Good morning,</p>
                                    <p className="text-xs font-bold text-white">Alex Johnson</p>
                                    <p className="text-[9px] text-blue-200">Chief Officer</p>
                                </div>
                                <div className="p-2.5 space-y-2">
                                    <div className="rounded-lg border border-gray-100 p-2">
                                        <p className="text-[8px] text-gray-500 mb-1">Profile Completion</p>
                                        <div className="flex items-center gap-1.5">
                                            <div className="flex-1 h-1 rounded-full bg-gray-100 overflow-hidden">
                                                <div className="h-full w-[85%] rounded-full bg-gradient-to-r from-blue-500 to-teal-500" />
                                            </div>
                                            <span className="text-[9px] font-bold text-gray-800">85%</span>
                                        </div>
                                    </div>
                                    <div className="rounded-lg border border-gray-100 p-2">
                                        <p className="text-[8px] text-gray-500 mb-0.5">Compliance Status</p>
                                        <div className="flex items-center gap-1">
                                            <ShieldCheck className="h-3 w-3 text-teal-600" />
                                            <p className="text-[9px] font-semibold text-gray-800">Good Standing</p>
                                        </div>
                                    </div>
                                    <div className="rounded-lg border border-gray-100 p-2">
                                        <p className="text-[8px] text-gray-500 mb-0.5">Upcoming Expiry</p>
                                        <p className="text-[9px] font-semibold text-gray-800">Medical Certificate</p>
                                        <p className="text-[8px] text-amber-600">Renew within 60 days</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Reveal>

                </div>
            </section>

            {/* ───────────────────────── Final CTA ───────────────────────── */}
            <section className="relative py-16 px-6 bg-white">
                <Reveal className="max-w-7xl mx-auto">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#003971] via-[#0a4a8f] to-[#0d6e8f] px-8 sm:px-12 py-10 sm:py-12 shadow-2xl">
                        <div className="pointer-events-none absolute -top-16 -left-16 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-[blob-drift_12s_ease-in-out_infinite]" />
                        <div className="pointer-events-none absolute -bottom-16 -right-16 w-72 h-72 bg-cyan-300/10 rounded-full blur-3xl animate-[blob-drift_15s_ease-in-out_infinite_reverse]" />
                        <Ship className="pointer-events-none absolute right-8 bottom-6 h-24 w-24 text-white/10 hidden sm:block" />

                        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                            <div>
                                <div className="inline-flex items-center gap-1.5 bg-teal-400/20 text-teal-200 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-4">
                                    <Sparkles className="h-3 w-3" />
                                    Ready to get started?
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Join MaritimeLink today.</h2>
                                <p className="text-blue-100">Build your profile. Get verified. Discover opportunities.</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => scrollToId('audience')}
                                    className="group inline-flex items-center gap-2 bg-white text-[#003971] px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    Sign Up for Free
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => scrollToId('audience')}
                                    className="group inline-flex items-center gap-2 text-white border border-white/40 px-6 py-3 rounded-full font-semibold hover:bg-white/10 transition-all duration-300"
                                >
                                    Sign In
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </button>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </section>

            {/* ───────────────────────── Footer ───────────────────────── */}
            <footer className="bg-[#02152e] text-slate-300 pt-16 pb-8 px-6">
                <div className="max-w-7xl mx-auto grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[1.6fr_1fr_1fr_1fr_1fr_1fr] mb-12">
                    <div className="sm:col-span-2 lg:col-span-3 xl:col-span-1">
                        <div className="flex items-center gap-2.5 mb-4">
                            <span className="inline-flex items-center justify-center bg-white rounded-2xl p-1 shadow-md">
                                <img src="/images/logo.png" alt="MaritimeLink" className="h-14 w-auto object-contain" />
                            </span>
                            <span className="font-bold text-white text-2xl">
                                Maritime<span className="text-blue-400">Link</span>
                            </span>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed mb-5">
                            The trusted maritime platform connecting professionals, recruiters and training
                            providers worldwide.
                        </p>
                        <div className="flex items-center gap-3">
                            {SOCIAL_LINKS.map((social) => {
                                const Icon = social.icon;
                                return social.href ? (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={social.label}
                                        className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:bg-blue-500 hover:text-white hover:scale-110 transition-all duration-300"
                                    >
                                        <Icon className="h-4 w-4" />
                                    </a>
                                ) : (
                                    <span
                                        key={social.label}
                                        title={`${social.label} — coming soon`}
                                        className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-slate-500 cursor-default"
                                    >
                                        <Icon className="h-4 w-4" />
                                    </span>
                                );
                            })}
                        </div>
                    </div>

                    {FOOTER_COLUMNS.map((column) => (
                        <div key={column.heading}>
                            <h4 className="text-white font-semibold mb-4 text-sm">{column.heading}</h4>
                            <ul className="space-y-2.5 text-sm">
                                {column.links.map((link) => (
                                    <li key={link.label}>
                                        {link.soon ? (
                                            <span
                                                title="Coming soon"
                                                className="text-slate-500 cursor-default"
                                            >
                                                {link.label}
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => (link.to ? navigate(link.to) : scrollToId(link.anchor))}
                                                className="hover:text-white transition-colors"
                                            >
                                                {link.label}
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="max-w-7xl mx-auto border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
                    <span>&copy; {new Date().getFullYear()} MaritimeLink Ltd. All rights reserved.</span>
                    <span className="flex items-center gap-1.5">
                        Built for the maritime community
                        <Heart className="h-3.5 w-3.5 text-teal-400 fill-teal-400" />
                    </span>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;

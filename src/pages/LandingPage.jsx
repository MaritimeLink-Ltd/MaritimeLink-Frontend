import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    UserRound,
    Ship,
    Compass,
    ShieldCheck,
    FileCheck2,
    Briefcase,
    GraduationCap,
    CreditCard,
    Calendar,
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
    UserPlus,
    MessageCircle,
    ClipboardCheck,
    EyeOff,
    Server,
    RefreshCw,
    Download,
    BookOpen,
    DollarSign,
    AlertCircle,
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
        icon: UserRound,
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
        icon: UserRound,
        name: 'For Maritime Professionals',
        tagline: 'Manage your career. Stay compliant. Get discovered by the right opportunities.',
        image: '/images/professional.png',
        imageAlt: 'Maritime professional at the port',
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
        image: '/images/recruiter.png',
        imageAlt: 'Recruiter reviewing maritime candidates',
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
        image: '/images/training_provider.png',
        imageAlt: 'Maritime training instructor presenting STCW course',
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
        icon: UserRound,
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
        ],    },
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
        ],    },
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
        ],    },
];

// Platform Preview mockups modelled on the REAL app screens (layouts, nav labels, page
// titles, card styles all mirror the actual dashboards) — shown until live screenshots
// replace them. Badge tone: 4th row element. Sources:
//   professional → PersonalDashboardLayout / Dashboard / DocumentsWallet / Jobs
//   recruiter    → RecruiterDashboardMain / RecruiterDashboard / AdminSearch / AdminJobs
//   training     → TrainingProviderLayout / TrainingProviderDashboard / Courses / Demand
const BADGE_TEAL = 'bg-teal-50 text-teal-700';
const BADGE_AMBER = 'bg-amber-50 text-amber-700';
const BADGE_BLUE = 'bg-blue-50 text-blue-700';

const PREVIEW_MOCKS = {
    professional: {
        content: 'bg-white',
        nav: ['Dashboard', 'Resume', 'Documents', 'Jobs', 'Training', 'Chats', 'Profile'],
        user: 'Alex Johnson',
        slides: [
            {
                path: 'personal/dashboard',
                navActive: 0,
                pageTitle: 'Dashboard',
                pageSub: 'View everything at a glance',
                widgets: [
                    { type: 'banner', text: 'No certificates expiring in the next 90 days', pill: 'Fully Compliant' },
                    {
                        type: 'quickCards',
                        cards: [
                            ['Resume', '50% complete', 'Go To Resume', 50],
                            ['Document Wallet', 'Fully Compliant', 'Go To Documents'],
                            ['Jobs', '23 available jobs', 'Go To Jobs'],
                            ['Courses', '4 available courses', 'Go To Training'],
                        ],
                    },
                    {
                        type: 'panels',
                        items: [
                            {
                                title: 'Alerts',
                                rows: [
                                    ['KYC verification approved', 'Your identity verification has been approved · Just now'],
                                    ['KYC verification approved', 'You now have full access to platform features · Just now'],
                                ],
                            },
                            {
                                title: 'Recent Activity',
                                rows: [
                                    ['Signed in to MaritimeLink', 'Just now'],
                                    ['Signed in to MaritimeLink', '4m ago'],
                                    ['Register', '1d ago'],
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                path: 'personal/documents',
                navActive: 2,
                pageTitle: 'Documents Wallet',
                pageSub: 'Manage your uploaded documents',
                widgets: [
                    {
                        type: 'toolbar',
                        search: 'Search docs...',
                        buttons: ['Export Document Pack', 'Share Secure Link'],
                    },
                    {
                        type: 'docGrid',
                        items: [
                            ['Licenses & Endorsements', '1 Documents', BADGE_BLUE],
                            ['STCW Certificates', '0 Documents', BADGE_TEAL],
                            ['Medical Certificates', '0 Documents', 'bg-red-50 text-red-700'],
                            ['Seaman Book data/Stamp pages', '0 Documents', BADGE_BLUE],
                            ['Travel Documents', '0 Documents', 'bg-cyan-50 text-cyan-700'],
                            ['Academic Qualifications', '0 Documents', 'bg-indigo-50 text-indigo-700'],
                            ['Company Letters / Misc', '0 Documents', BADGE_BLUE],
                            ['Recent Appraisals', '0 Documents', BADGE_AMBER],
                        ],
                    },
                ],
            },
            {
                path: 'personal/training',
                navActive: 4,
                pageTitle: 'Training Courses',
                pageSub: 'Find and book maritime training',
                widgets: [
                    {
                        type: 'toolbar',
                        search: 'Search courses or providers...',
                        buttons: ['Saved Courses', 'Filter'],
                    },
                    {
                        type: 'courseList',
                        emptyText: 'Select a course to view details',
                        courses: [
                            ['Bridge Resource Management', 'Meta Training Center', 'GBP 234'],
                            ['STCW Basic Safety Training', 'Meta Training Center', 'GBP 500'],
                            ['Medical First Aid', 'Maritime Academy', 'GBP 7,500'],
                        ],
                    },
                ],
            },
        ],
    },
    recruiter: {
        content: 'bg-gray-50',
        nav: ['Dashboard', 'Search Candidates', 'Jobs', 'Chats'],
        user: 'Sarah Mitchell',
        slides: [
            {
                path: 'recruiter-dashboard',
                navActive: 0,
                pageTitle: 'Dashboard',
                pageSub: 'Welcome back, Sarah Mitchell · Meridian Shipping',
                widgets: [
                    { type: 'dateTabs', active: 'Today', tabs: ['Today', '7 Days', '1 Month', 'Custom'] },
                    {
                        type: 'gradientStats',
                        items: [
                            ['Active Jobs', '8', 'from-[#1e4c7a] via-[#2563a8] to-[#4a7ab8]', Briefcase],
                            ['Applications', '126', 'from-[#059669] via-[#10b981] to-[#34d399]', CheckCircle2],
                            ['Matched Professionals', '54', 'from-[#d97706] via-[#f59e0b] to-[#fbbf24]', BadgeCheck],
                            ['Jobs Needing Attention', '2', 'from-[#dc2626] via-[#ef4444] to-[#f87171]', Calendar],
                        ],
                    },
                    { type: 'noticePanel', title: 'Action Required', text: '2 jobs closing this week — review applicants before Friday.' },
                    {
                        type: 'tableGlance',
                        title: 'Your Jobs at a Glance',
                        link: 'View All Jobs',
                        columns: ['Job Title', 'Status / Applicants', 'Matches'],
                        rows: [
                            ['Chief Officer — LNG Carrier', '42 applicants · Open', '6 new'],
                            ['Marine Engineer — Offshore', '28 applicants · Open', '3 new'],
                        ],
                    },
                ],
            },
            {
                path: 'recruiter/search',
                navActive: 1,
                pageTitle: 'Search Candidates',
                pageSub: 'Find qualified maritime professionals for your vessels',
                widgets: [
                    { type: 'search', placeholder: 'Search by rank, name, certification...' },
                    {
                        type: 'candidateSearch',
                        resultsLabel: 'Showing 6 candidates',
                        sort: 'Experience (High to Low)',
                        candidates: [
                            ['Daniel Kim', 'Master Mariner', '12 yrs · United Kingdom', '98% match'],
                            ['Elena Petrova', 'Chief Officer', '9 yrs · Poland', '95% match'],
                            ['Ahmed Hassan', '2nd Engineer', '7 yrs · Pakistan', '91% match'],
                        ],
                        filters: ['Master', 'Chief Officer', 'Chief Engineer', '2nd Engineer'],
                    },
                ],
            },
            {
                path: 'recruiter/jobs',
                navActive: 2,
                pageTitle: 'Jobs',
                pageSub: 'Manage your job listings and applications',
                widgets: [
                    { type: 'dateTabs', active: '7 Days', tabs: ['Today', '7 Days', '30 Days'], action: 'Create Job' },
                    {
                        type: 'miniStats',
                        items: [
                            ['Active Jobs', '8', 'Currently open', 'bg-blue-50', 'text-blue-600', Briefcase],
                            ['Closed Jobs', '3', 'Closed jobs', 'bg-red-50', 'text-red-600', CheckCircle2],
                            ['Total Applications', '126', 'Total applications', 'bg-green-50', 'text-green-600', Users],
                        ],
                    },
                    { type: 'filtersToolbar', search: 'Search jobs...', chips: ['Status', 'Job Type', 'Vessel'], action: 'Export CSV' },
                    {
                        type: 'jobsTable',
                        columns: ['Job Title', 'Applicants', 'Status'],
                        rows: [
                            ['Chief Officer — LNG Carrier', '42', 'Open', BADGE_TEAL],
                            ['Marine Engineer — Offshore', '28', 'Open', BADGE_TEAL],
                            ['Master — Container Fleet', '12', 'Closing soon', BADGE_AMBER],
                        ],
                    },
                ],
            },
        ],
    },
    'training-provider': {
        content: 'bg-[#F5F7FA]',
        nav: ['Home', 'Demand & Planning', 'Course Management', 'Session Management', 'Chats', 'Profile'],
        user: 'Ocean Maritime Academy',
        slides: [
            {
                path: 'trainingprovider-dashboard',
                navActive: 0,
                pageTitle: 'Welcome back, Ocean Maritime Academy',
                pageSub: 'Your training operations at a glance',
                widgets: [
                    { type: 'dateTabs', active: '30 Days', tabs: ['Today', '7 Days', '30 Days', 'All'] },
                    {
                        type: 'gradientStats',
                        items: [
                            ['Active Courses', '12', 'from-[#1E4976] to-[#2E6BA8]', BookOpen],
                            ['New Bookings', '48', 'from-[#0FA968] to-[#1BC47D]', Calendar],
                            ['Demand Signals', '7', 'from-[#E86C5F] to-[#F28B7D]', TrendingUp],
                        ],
                    },
                    { type: 'noticePanel', title: 'Action Required', text: 'Session nearly full — STCW Basic Safety Training 18 / 20 booked.' },
                    {
                        type: 'tableGlance',
                        title: 'Quick Overview',
                        link: 'View All Courses',
                        columns: ['Course', 'Status', 'Bookings'],
                        rows: [
                            ['STCW Basic Safety Training', 'Published', '96'],
                            ['GMDSS General Operator', 'Published', '54'],
                        ],
                    },
                ],
            },
            {
                path: 'trainingprovider/courses',
                navActive: 2,
                pageTitle: 'Course Management',
                pageSub: 'Manage your maritime training offerings at a glance',
                widgets: [
                    { type: 'dateTabs', tabs: [], secondaryAction: 'Export CSV', action: 'Create Course' },
                    {
                        type: 'miniStats',
                        items: [
                            ['Course Management', '12', 'Active courses', 'bg-blue-50', 'text-blue-600', BookOpen],
                            ['Total Sessions', '34', 'This term', 'bg-amber-50', 'text-amber-600', Calendar],
                            ['Bookings', '312', 'This quarter', 'bg-emerald-50', 'text-emerald-600', Users],
                            ['Revenue', '£18,240', 'This quarter', 'bg-emerald-50', 'text-emerald-600', DollarSign],
                        ],
                    },
                    { type: 'search', placeholder: 'Search courses...' },
                    {
                        type: 'jobsTable',
                        columns: ['Course Name', 'Bookings', 'Status'],
                        rows: [
                            ['STCW Basic Safety Training', '96 bookings', 'Published', BADGE_TEAL],
                            ['GMDSS General Operator', '54 bookings', 'Published', BADGE_TEAL],
                            ['Medical First Aid', '12 bookings', 'Draft', BADGE_AMBER],
                        ],
                    },
                ],
            },
            {
                path: 'trainingprovider/demand',
                navActive: 1,
                pageTitle: 'Demand & Planning',
                pageSub: 'Monitor training demand, watch capacity, and plan renewal demand.',
                widgets: [
                    { type: 'search', placeholder: 'Search courses, enquiries...' },
                    {
                        type: 'miniStats',
                        items: [
                            ['Certs Expiring', '128', 'Next 12 months', 'bg-rose-50', 'text-rose-600', AlertCircle],
                            ['Search Demand', '342', 'Unique professionals', 'bg-blue-50', 'text-blue-600', TrendingUp],
                            ['Active Enquiries', '27', 'Pending bookings', 'bg-emerald-50', 'text-emerald-600', MessageCircle],
                        ],
                    },
                    {
                        type: 'areaChart',
                        title: 'Demand Forecast — Expires by Course',
                        series: [
                            { name: 'STCW', color: '#1e40af', values: [20, 35, 30, 45, 40, 55, 50] },
                            { name: 'Firefighting', color: '#fb923c', values: [10, 15, 20, 18, 25, 22, 28] },
                        ],
                    },
                    {
                        type: 'capacity',
                        title: 'Capacity',
                        sub: 'Total seats available on your posted courses',
                        pct: 74,
                        filled: 312,
                        total: 420,
                    },
                ],
            },
        ],
    },
};

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
            { label: 'About Us', anchor: 'about' },
            { label: 'How It Works', anchor: 'how-it-works' },
            { label: 'Blog', soon: true },
            { label: 'Careers', soon: true },
            { label: 'Contact Us', soon: true },
        ],
    },
];

// Rendered as a single horizontal strip above the copyright bar so all legal links sit on one line.
const LEGAL_LINKS = [
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms & Conditions', to: '/terms' },
    { label: 'Cookie Policy', to: '/cookie-policy' },
    { label: 'Acceptable Use Policy', to: '/acceptable-use-policy' },
    { label: 'Recruiter Terms', to: '/recruiter-terms-of-service' },
    { label: 'Training Provider Terms', to: '/training-provider-terms-of-service' },
    { label: 'Professional User Terms', to: '/professional-user-terms-of-service' },
    { label: 'Data Retention & Deletion', to: '/data-retention-secure-deletion-policy' },
    { label: 'Security & Vulnerability Disclosure', to: '/information-security-vulnerability-disclosure-policy' },
];

// Fill in the hrefs once the official pages exist; empty ones render as "coming soon".
const SOCIAL_LINKS = [
    { icon: Linkedin, label: 'LinkedIn', href: '' },
    { icon: Facebook, label: 'Facebook', href: '' },
    { icon: Instagram, label: 'Instagram', href: '' },
    { icon: Youtube, label: 'YouTube', href: '' },
];

// Ordered per client priority: professional-focused points first, platform-wide points after.
const WHY_POINTS = [
    {
        icon: BadgeCheck,
        title: 'One verified professional identity',
        description: 'Build a trusted profile with verified qualifications, certificates and sea service.',
    },
    {
        icon: Timer,
        title: 'Less admin. More time at sea.',
        description: 'Automated verification, expiry tracking and smart workflows reduce manual work and errors.',
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
];

const WHY_AUDIENCES = [
    {
        icon: UserRound,
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

// Stats stay designed but hidden until real platform numbers are wired from the backend —
// flip to true once live figures exist (client wants no placeholder numbers in production).
const SHOW_STATS = false;

const STATS = [
    { icon: Users, value: '1.9M+', label: 'Seafarers globally' },
    { icon: Building2, value: '10K+', label: 'Maritime organisations' },
    { icon: GraduationCap, value: '4K+', label: 'Training providers' },
    { icon: ShieldCheck, value: '100%', label: 'Verified identities' },
    { icon: Globe, value: 'Global', label: 'Accessible anywhere' },
];

// Mini dashboards rendered side-by-side inside the hero laptop — one panel per user type,
// so the hero visual represents all three audiences instead of professionals only.
const HERO_PANELS = [
    {
        id: 'professional',
        icon: UserRound,
        label: 'Professional',
        header: 'bg-[#003971]',
        stats: [
            ['Profile Completion', '92%'],
            ['Documents Valid', '4 / 4'],
            ['Job Matches', '6 new'],
        ],
    },
    {
        id: 'recruiter',
        icon: Briefcase,
        label: 'Recruiter',
        header: 'bg-teal-600',
        stats: [
            ['Active Job Posts', '8'],
            ['Applicants', '126'],
            ['Shortlisted', '12'],
        ],
    },
    {
        id: 'training-provider',
        icon: GraduationCap,
        label: 'Training Provider',
        header: 'bg-purple-600',
        stats: [
            ['Live Courses', '12'],
            ['Bookings', '48'],
            ['Sessions This Week', '5'],
        ],
    },
];

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

// Renders one Platform Preview slide as an in-browser mockup that mirrors the real app UI:
// white sidebar with logo + MAIN MENU, #EBF3FF active nav, top bar with bell/avatar, and
// page bodies copied from the actual dashboard screens.
function DashboardMockup({ mock, slide }) {
    return (
        <div className="w-full h-full flex flex-col bg-white text-left">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 border-b border-gray-200 shrink-0">
                <span className="flex gap-1.5 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </span>
                <span className="flex-1 max-w-xs mx-auto bg-white rounded-md px-3 py-1 text-[10px] text-gray-400 truncate text-center">
                    app.maritimelink.com/{slide.path}
                </span>
                <span className="w-11 shrink-0" />
            </div>

            <div className="flex flex-1 min-h-0">
                {/* Sidebar — white with MAIN MENU caption, like the real layouts */}
                <div className="hidden sm:flex w-40 shrink-0 flex-col bg-white border-r border-gray-200 px-2.5 py-3">
                    <img src="/images/logo.png" alt="" className="h-10 w-auto object-contain self-start ml-1 mb-2" />
                    <p className="text-[8px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-1.5">Main Menu</p>
                    <div className="space-y-0.5">
                        {mock.nav.map((item, i) => (
                            <div
                                key={item}
                                className={`text-[10px] px-2.5 py-1.5 rounded-lg ${i === slide.navActive ? 'bg-[#EBF3FF] text-[#003971] font-semibold' : 'text-gray-600'}`}
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`flex-1 min-w-0 flex flex-col ${mock.content}`}>
                    {/* Top header bar */}
                    <div className="flex items-center justify-end gap-2.5 px-4 py-2 bg-white border-b border-gray-100 shrink-0">
                        <span className="relative">
                            <Bell className="h-3.5 w-3.5 text-gray-400" />
                            <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-[#003971]" />
                        </span>
                        <div className="h-5 w-5 rounded-full bg-gradient-to-br from-blue-500 to-teal-500" />
                        <span className="text-[9px] font-bold text-gray-700">{mock.user}</span>
                        <ChevronDown className="h-2.5 w-2.5 text-gray-400" />
                    </div>

                    {/* Page content */}
                    <div className="flex-1 min-h-0 p-3 sm:p-4 space-y-2.5 overflow-hidden">
                        <div>
                            <p className="text-sm font-bold text-gray-900">{slide.pageTitle}</p>
                            {slide.pageSub && <p className="text-[9px] text-gray-500">{slide.pageSub}</p>}
                        </div>

                        {slide.widgets.map((widget, wIdx) => {
                            if (widget.type === 'banner') {
                                return (
                                    <div key={wIdx} className="flex items-center justify-between gap-2 bg-slate-50 rounded-xl px-2.5 py-2">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                                                <Calendar className="h-3 w-3 text-slate-600" />
                                            </span>
                                            <p className="text-[9px] font-medium text-gray-800 truncate">{widget.text}</p>
                                        </div>
                                        <span className="flex items-center gap-1 text-[8px] font-semibold text-white bg-[#587B42] px-2 py-1 rounded-full shrink-0">
                                            <CheckCircle2 className="h-2.5 w-2.5" />
                                            {widget.pill}
                                        </span>
                                    </div>
                                );
                            }
                            if (widget.type === 'quickCards') {
                                return (
                                    <div key={wIdx} className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                        {widget.cards.map(([title, status, button, pct]) => (
                                            <div key={title} className="bg-[#F3FAFF] rounded-xl p-2 flex flex-col">
                                                <p className="text-[9px] font-semibold text-gray-800 mb-1.5 truncate">{title}</p>
                                                {pct != null && (
                                                    <div className="h-1 rounded-full bg-gray-200 overflow-hidden mb-1">
                                                        <div className="h-full rounded-full bg-[#003971]" style={{ width: `${pct}%` }} />
                                                    </div>
                                                )}
                                                <p className="text-[8px] text-gray-600 mb-2 truncate">{status}</p>
                                                <div className="mt-auto bg-[#003971] text-white text-[8px] font-medium rounded-full py-1 text-center truncate">
                                                    {button}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            }
                            if (widget.type === 'gradientStats') {
                                return (
                                    <div key={wIdx} className={`grid gap-2 ${widget.items.length === 3 ? 'grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'}`}>
                                        {widget.items.map(([title, value, gradient, Icon]) => (
                                            <div key={title} className={`bg-gradient-to-br ${gradient} rounded-xl p-2.5 text-white`}>
                                                {Icon && (
                                                    <span className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center mb-1.5">
                                                        <Icon className="h-2.5 w-2.5 text-white" />
                                                    </span>
                                                )}
                                                <p className="text-lg font-bold leading-none mb-1">{value}</p>
                                                <p className="text-[8px] font-medium text-white/95 leading-tight">{title}</p>
                                                <p className="text-[7px] text-white/70">Today</p>
                                            </div>
                                        ))}
                                    </div>
                                );
                            }
                            if (widget.type === 'search') {
                                return (
                                    <div key={wIdx} className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 max-w-[220px]">
                                        <Search className="h-3 w-3 text-gray-400 shrink-0" />
                                        <span className="text-[9px] text-gray-400 truncate">{widget.placeholder}</span>
                                    </div>
                                );
                            }
                            if (widget.type === 'dateTabs') {
                                const hasTabs = widget.tabs && widget.tabs.length > 0;
                                return (
                                    <div key={wIdx} className="flex items-center justify-end gap-1.5">
                                        {hasTabs && (
                                            <div className="flex items-center gap-0.5 bg-white border border-gray-100 rounded-full p-0.5 shadow-sm">
                                                {widget.tabs.map((tab) => (
                                                    <span
                                                        key={tab}
                                                        className={`text-[7.5px] font-semibold px-2 py-1 rounded-full whitespace-nowrap ${tab === widget.active ? 'bg-[#003971] text-white' : 'text-gray-500'}`}
                                                    >
                                                        {tab}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {widget.secondaryAction && (
                                            <span className="text-[7.5px] font-semibold px-2.5 py-1.5 rounded-full border border-gray-200 text-gray-600 whitespace-nowrap">
                                                {widget.secondaryAction}
                                            </span>
                                        )}
                                        {widget.action ? (
                                            <span className="text-[7.5px] font-semibold px-2.5 py-1.5 rounded-full bg-[#003971] text-white whitespace-nowrap">
                                                + {widget.action}
                                            </span>
                                        ) : hasTabs ? (
                                            <RefreshCw className="h-3 w-3 text-gray-400 shrink-0" />
                                        ) : null}
                                    </div>
                                );
                            }
                            if (widget.type === 'noticePanel') {
                                return (
                                    <div key={wIdx}>
                                        <p className="text-[10px] font-bold text-gray-900 mb-1.5">{widget.title}</p>
                                        <div className="bg-white border border-gray-100 rounded-xl shadow-sm px-2.5 py-3 text-center">
                                            <p className="text-[9px] text-gray-500">{widget.text}</p>
                                        </div>
                                    </div>
                                );
                            }
                            if (widget.type === 'tableGlance') {
                                return (
                                    <div key={wIdx} className="bg-white border border-gray-100 rounded-xl shadow-sm p-2.5">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-[10px] font-bold text-gray-900">{widget.title}</p>
                                            <p className="text-[8px] font-semibold text-blue-600">{widget.link} &gt;</p>
                                        </div>
                                        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-gray-100">
                                            {widget.columns.map((col) => (
                                                <p key={col} className="text-[7px] font-bold text-gray-400 uppercase tracking-wide">{col}</p>
                                            ))}
                                        </div>
                                        <div className="space-y-1.5">
                                            {widget.rows.map(([title, sub, matches]) => (
                                                <div key={title} className="flex items-center justify-between gap-2">
                                                    <p className="text-[9px] font-semibold text-gray-800 truncate">{title}</p>
                                                    <p className="text-[8px] text-gray-400 truncate shrink-0">{sub}</p>
                                                    <p className="text-[8px] font-semibold text-teal-600 shrink-0">{matches}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }
                            if (widget.type === 'miniStats') {
                                return (
                                    <div key={wIdx} className={`grid gap-2 ${widget.items.length === 4 ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-3'}`}>
                                        {widget.items.map(([title, value, sub, bg, textColor, Icon]) => (
                                            <div key={title} className={`rounded-xl p-2.5 ${bg}`}>
                                                <div className="flex items-center gap-1 mb-1">
                                                    <Icon className={`h-2.5 w-2.5 ${textColor}`} />
                                                    <p className={`text-[8px] font-bold ${textColor}`}>{title}</p>
                                                </div>
                                                <p className="text-sm font-extrabold text-gray-900 leading-none mb-0.5">{value}</p>
                                                <p className="text-[7px] text-gray-400">{sub}</p>
                                            </div>
                                        ))}
                                    </div>
                                );
                            }
                            if (widget.type === 'filtersToolbar') {
                                return (
                                    <div key={wIdx} className="flex flex-wrap items-center gap-1.5">
                                        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 flex-1 min-w-[80px]">
                                            <Search className="h-3 w-3 text-gray-400 shrink-0" />
                                            <span className="text-[9px] text-gray-400 truncate">{widget.search}</span>
                                        </div>
                                        {widget.chips.map((chip) => (
                                            <span key={chip} className="flex items-center gap-0.5 text-[7.5px] font-medium text-gray-600 bg-white border border-gray-200 rounded-lg px-2 py-1.5 whitespace-nowrap">
                                                {chip}
                                                <ChevronDown className="h-2 w-2 text-gray-400" />
                                            </span>
                                        ))}
                                        <span className="flex items-center gap-1 text-[7.5px] font-semibold text-white bg-[#003971] rounded-lg px-2 py-1.5 whitespace-nowrap">
                                            <Download className="h-2.5 w-2.5" />
                                            {widget.action}
                                        </span>
                                    </div>
                                );
                            }
                            if (widget.type === 'areaChart') {
                                const w = 140;
                                const h = 44;
                                const maxVal = Math.max(...widget.series.flatMap((s) => s.values));
                                const toPoints = (values) =>
                                    values.map((v, i) => `${(i / (values.length - 1)) * w},${h - (v / maxVal) * h}`).join(' ');
                                return (
                                    <div key={wIdx} className="bg-white border border-gray-100 rounded-xl shadow-sm p-2.5">
                                        <div className="flex items-center justify-between mb-1.5 gap-2">
                                            <p className="text-[9px] font-bold text-gray-800 truncate">{widget.title}</p>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {widget.series.map((s) => (
                                                    <span key={s.name} className="flex items-center gap-1 text-[7px] text-gray-500 whitespace-nowrap">
                                                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                                                        {s.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16" preserveAspectRatio="none">
                                            {widget.series.map((s) => (
                                                <polyline key={s.name} fill="none" stroke={s.color} strokeWidth="1.5" points={toPoints(s.values)} />
                                            ))}
                                        </svg>
                                    </div>
                                );
                            }
                            if (widget.type === 'capacity') {
                                return (
                                    <div key={wIdx} className="bg-white border border-gray-100 rounded-xl shadow-sm p-2.5">
                                        <p className="text-[9px] font-bold text-gray-800">{widget.title}</p>
                                        <p className="text-[7.5px] text-gray-400 mb-2">{widget.sub}</p>
                                        <div className="flex items-baseline justify-between mb-1">
                                            <span className="text-sm font-extrabold text-gray-900">{widget.pct}%</span>
                                            <span className="text-[7.5px] text-gray-500">{widget.filled} / {widget.total} seats filled</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                            <div className="h-full rounded-full bg-gradient-to-r from-[#003971] to-[#0EA5E9]" style={{ width: `${widget.pct}%` }} />
                                        </div>
                                    </div>
                                );
                            }
                            if (widget.type === 'jobsTable') {
                                return (
                                    <div key={wIdx} className="bg-white border border-gray-100 rounded-xl shadow-sm p-2.5">
                                        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-gray-100">
                                            {widget.columns.map((col) => (
                                                <p key={col} className="text-[7px] font-bold text-gray-400 uppercase tracking-wide">{col}</p>
                                            ))}
                                        </div>
                                        <div className="space-y-1.5">
                                            {widget.rows.map(([title, applicants, status, badgeClass]) => (
                                                <div key={title} className="flex items-center justify-between gap-2">
                                                    <p className="text-[9px] font-semibold text-gray-800 truncate">{title}</p>
                                                    <p className="text-[8px] text-gray-500 shrink-0">{applicants}</p>
                                                    <span className={`text-[7.5px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap shrink-0 ${badgeClass}`}>
                                                        {status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }
                            if (widget.type === 'candidateSearch') {
                                return (
                                    <div key={wIdx} className="grid grid-cols-[1.3fr_1fr] gap-2">
                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <p className="text-[8px] font-semibold text-gray-700">{widget.resultsLabel}</p>
                                                <p className="text-[7.5px] text-gray-400">Sort: {widget.sort}</p>
                                            </div>
                                            <div className="space-y-1.5">
                                                {widget.candidates.map(([name, rank, meta, match]) => (
                                                    <div key={name} className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-lg shadow-sm px-2 py-1.5">
                                                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 shrink-0" />
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-1">
                                                                <p className="text-[8.5px] font-bold text-gray-800 truncate">{name}</p>
                                                                <span className="text-[6px] font-semibold text-blue-600 bg-blue-50 px-1 py-0.5 rounded-full shrink-0">Verified</span>
                                                            </div>
                                                            <p className="text-[7.5px] text-gray-400 truncate">{rank} · {meta}</p>
                                                        </div>
                                                        <span className="text-[7px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-full shrink-0">{match}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="hidden sm:block bg-white border border-gray-100 rounded-lg shadow-sm p-2">
                                            <p className="text-[8px] font-bold text-gray-800 mb-1.5">Filters</p>
                                            <div className="space-y-1">
                                                {widget.filters.map((f) => (
                                                    <div key={f} className="flex items-center gap-1">
                                                        <span className="w-2 h-2 rounded-sm border border-gray-300 shrink-0" />
                                                        <p className="text-[7.5px] text-gray-500 truncate">{f}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                            if (widget.type === 'toolbar') {
                                return (
                                    <div key={wIdx} className="flex flex-wrap items-center gap-1.5">
                                        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 flex-1 min-w-[100px]">
                                            <Search className="h-3 w-3 text-gray-400 shrink-0" />
                                            <span className="text-[9px] text-gray-400 truncate">{widget.search}</span>
                                        </div>
                                        {widget.buttons.map((label, i) => (
                                            <span
                                                key={label}
                                                className={`text-[8px] font-semibold px-2 py-1.5 rounded-full whitespace-nowrap ${i === 0 ? 'bg-[#003971] text-white' : 'bg-[#EBF3FF] text-[#003971]'}`}
                                            >
                                                {label}
                                            </span>
                                        ))}
                                    </div>
                                );
                            }
                            if (widget.type === 'docGrid') {
                                return (
                                    <div key={wIdx} className="grid grid-cols-2 gap-1.5">
                                        {widget.items.map(([title, count, badgeClass]) => (
                                            <div key={title} className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-lg shadow-sm px-2 py-1.5 min-w-0">
                                                <span className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${badgeClass}`}>
                                                    <FileCheck2 className="h-2.5 w-2.5" />
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="text-[8.5px] font-semibold text-gray-800 truncate leading-tight">{title}</p>
                                                    <p className="text-[7.5px] text-gray-400 truncate">{count}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            }
                            if (widget.type === 'courseList') {
                                return (
                                    <div key={wIdx} className="grid grid-cols-[1.1fr_1fr] gap-2">
                                        <div className="space-y-1.5">
                                            {widget.courses.map(([title, provider, price]) => (
                                                <div key={title} className="bg-white border border-gray-100 rounded-lg shadow-sm px-2 py-1.5 min-w-0">
                                                    <p className="text-[9px] font-bold text-gray-800 truncate">{title}</p>
                                                    <p className="text-[8px] text-gray-400 truncate">{provider}</p>
                                                    <p className="text-[8px] font-semibold text-gray-600">{price}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="hidden sm:flex flex-col items-center justify-center bg-white border border-gray-100 rounded-lg shadow-sm px-2 py-4 text-center">
                                            <span className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center mb-1.5">
                                                <GraduationCap className="h-3.5 w-3.5 text-gray-300" />
                                            </span>
                                            <p className="text-[8px] text-gray-400">{widget.emptyText}</p>
                                        </div>
                                    </div>
                                );
                            }
                            if (widget.type === 'panels') {
                                return (
                                    <div key={wIdx} className="grid grid-cols-2 gap-2">
                                        {widget.items.map((panel) => (
                                            <div key={panel.title} className="bg-white border border-gray-100 rounded-xl p-2.5 shadow-sm min-w-0">
                                                <p className="text-[9px] font-bold text-gray-900 mb-1.5">{panel.title}</p>
                                                <div className="space-y-1.5">
                                                    {panel.rows.map(([title, sub]) => (
                                                        <div key={title} className="min-w-0">
                                                            <p className="text-[9px] font-semibold text-gray-800 truncate">{title}</p>
                                                            <p className="text-[8px] text-gray-400 truncate">{sub}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            }
                            // list
                            return (
                                <div key={wIdx} className="space-y-1.5">
                                    {widget.rows.map(([title, sub, badge, badgeClass]) => (
                                        <div key={title} className="flex items-center justify-between gap-2 bg-white rounded-xl border border-gray-100 shadow-sm px-2.5 py-2">
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-semibold text-gray-800 truncate">{title}</p>
                                                <p className="text-[9px] text-gray-400 truncate">{sub}</p>
                                            </div>
                                            <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap shrink-0 ${badgeClass}`}>
                                                {badge}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
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
    const activeMock = PREVIEW_MOCKS[activePreview.id];
    const previewShots = activeMock.slides;

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

    // Order mirrors the page flow: About → Why → Who It's For → How It Works → Platform Preview.
    // Pricing gets added here once the pricing section is ready.
    const navLinks = [
        { label: 'About MaritimeLink', id: 'about' },
        { label: 'Why MaritimeLink', id: 'why' },
        { label: 'Who It’s For', id: 'audience' },
        { label: 'How It Works', id: 'how-it-works' },
        { label: 'Platform Preview', id: 'preview' },
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
                            className={`w-auto object-contain transition-all duration-300 ${scrolled ? 'h-14' : 'h-20'}`}
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
            <section className="relative pt-32 lg:pt-40 pb-16 lg:pb-20 px-6 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
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
                                onClick={() => scrollToId('about')}
                                className="group inline-flex items-center gap-2.5 bg-white text-gray-800 px-7 py-3.5 rounded-full font-semibold border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
                            >
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors">
                                    <Play className="h-3 w-3 text-[#003971] fill-[#003971]" />
                                </span>
                                Watch Demo
                            </button>
                        </div>

                        <div className="flex flex-wrap lg:flex-nowrap gap-x-6 gap-y-3">
                            {['Verified Identities', 'Secure & Compliant', 'Recruitment Made Easy', 'Training in One Place'].map((item) => (
                                <div key={item} className="flex items-center gap-1.5 text-sm text-gray-600 whitespace-nowrap">
                                    <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </Reveal>

                    <Reveal direction="left" delay={150}>
                        <div className="relative mx-auto max-w-xl pb-14 pt-8">
                            {/* Laptop — screen split into the three user dashboards */}
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
                                        {/* One panel per user type — professional, recruiter, training provider */}
                                        <div className="grid grid-cols-3 divide-x divide-gray-100">
                                            {HERO_PANELS.map((panel) => {
                                                const Icon = panel.icon;
                                                return (
                                                    <div key={panel.id} className="bg-slate-50">
                                                        <div className={`${panel.header} px-2 py-1.5 flex items-center gap-1`}>
                                                            <Icon className="h-2.5 w-2.5 text-white shrink-0" />
                                                            <p className="text-[7.5px] font-bold text-white truncate">{panel.label}</p>
                                                        </div>
                                                        <div className="p-1.5 space-y-1.5">
                                                            {panel.stats.map(([label, value]) => (
                                                                <div key={label} className="bg-white rounded-md p-1.5 shadow-sm">
                                                                    <p className="text-[6.5px] text-gray-500 mb-0.5">{label}</p>
                                                                    <p className="text-[9px] font-bold text-gray-900">{value}</p>
                                                                </div>
                                                            ))}
                                                            <div className="flex items-center gap-1 pt-0.5 pl-0.5">
                                                                <ShieldCheck className="h-2.5 w-2.5 text-teal-600 shrink-0" />
                                                                <p className="text-[6px] font-semibold text-gray-600">Verified &amp; Secure</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
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
                                    <UserRound className="h-4 w-4 text-blue-600" />
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
                <Reveal delay={250} className="relative max-w-7xl mx-auto mt-10 lg:mt-12">
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

            {/* ───────────────────────── About MaritimeLink ───────────────────────── */}
            <section id="about" className="relative py-14 px-6 bg-white overflow-hidden">
                <div className="pointer-events-none absolute -top-20 -left-24 w-80 h-80 bg-blue-100/50 rounded-full blur-3xl" />
                <div className="relative max-w-4xl mx-auto text-center">
                    <Reveal direction="up">
                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5">
                            <Compass className="h-3.5 w-3.5" />
                            About MaritimeLink
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-5">
                            The Digital Home of the{' '}
                            <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent bg-size-200 animate-[gradient-pan_6s_ease_infinite]">
                                Maritime Industry
                            </span>
                        </h2>
                        <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto mb-10">
                            MaritimeLink is a UK-built platform where verified maritime professionals showcase
                            their careers, recruiters hire with confidence, and training providers grow their
                            reach &mdash; all in one secure, connected place.
                        </p>
                    </Reveal>

                    {/* Demo video placeholder — swap for the real video embed once the client provides it */}
                    <Reveal delay={100}>
                        <div className="relative mx-auto max-w-3xl rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5 bg-gradient-to-br from-[#003971] via-[#0a4a8f] to-[#0d6e8f] aspect-video flex flex-col items-center justify-center">
                            <div className="pointer-events-none absolute -top-16 -left-16 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-[blob-drift_12s_ease-in-out_infinite]" />
                            <div className="pointer-events-none absolute -bottom-16 -right-16 w-72 h-72 bg-cyan-300/10 rounded-full blur-3xl animate-[blob-drift_15s_ease-in-out_infinite_reverse]" />
                            <Ship className="pointer-events-none absolute right-8 bottom-6 h-24 w-24 text-white/10 hidden sm:block" />
                            <div className="relative w-20 h-20 rounded-full bg-white/15 backdrop-blur flex items-center justify-center mb-5 ring-1 ring-white/30">
                                <Play className="h-8 w-8 text-white fill-white ml-1" />
                            </div>
                            <p className="relative text-white font-bold text-lg mb-1">See MaritimeLink in 90 seconds</p>
                            <p className="relative text-blue-100 text-sm">Demo video coming soon</p>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ───────────────────────── Why MaritimeLink ───────────────────────── */}
            <section id="why" className="relative py-14 px-6 bg-white overflow-hidden">
                <div className="pointer-events-none absolute -top-24 right-0 w-96 h-96 bg-cyan-100/50 rounded-full blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 -left-24 w-80 h-80 bg-blue-100/50 rounded-full blur-3xl" />

                <div className="relative max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center mb-14">
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
                                One secure platform designed specifically for the maritime industry.
                            </p>

                            <ul className="space-y-5">
                                {WHY_POINTS.map((point) => {
                                    const Icon = point.icon;
                                    return (
                                        <li key={point.title} className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center shrink-0 mt-0.5">
                                                <Icon className="h-6 w-6 text-teal-700" />
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
                            {/* Connection visual — MaritimeLink hub linking all three user types */}
                            <div className="relative mx-auto max-w-md h-[540px]">
                                {/* Connector lines from the hub to each user card */}
                                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 448 540" fill="none" aria-hidden="true">
                                    <line x1="224" y1="270" x2="96" y2="120" stroke="#0d9488" strokeWidth="2" strokeDasharray="6 6" className="animate-pulse" />
                                    <line x1="224" y1="270" x2="352" y2="120" stroke="#0d9488" strokeWidth="2" strokeDasharray="6 6" className="animate-pulse" />
                                    <line x1="224" y1="270" x2="224" y2="440" stroke="#0d9488" strokeWidth="2" strokeDasharray="6 6" className="animate-pulse" />
                                </svg>

                                {/* Hub */}
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-2xl ring-4 ring-blue-100 p-3 animate-[float-y_6s_ease-in-out_infinite]">
                                    <img src="/images/logo.png" alt="MaritimeLink" className="h-16 w-16 object-contain" />
                                </div>

                                {[
                                    {
                                        label: 'Professionals',
                                        icon: UserRound,
                                        image: '/images/professional.png',
                                        alt: 'Maritime professional at the port',
                                        chip: 'bg-blue-600',
                                        pos: 'top-0 left-0',
                                    },
                                    {
                                        label: 'Recruiters',
                                        icon: Briefcase,
                                        image: '/images/recruiter.png',
                                        alt: 'Recruiter reviewing maritime candidates',
                                        chip: 'bg-teal-600',
                                        pos: 'top-0 right-0',
                                    },
                                    {
                                        label: 'Training Providers',
                                        icon: GraduationCap,
                                        image: '/images/training_provider.png',
                                        alt: 'Maritime training instructor presenting STCW course',
                                        chip: 'bg-purple-600',
                                        pos: 'bottom-0 left-1/2 -translate-x-1/2',
                                    },
                                ].map((card, idx) => {
                                    const Icon = card.icon;
                                    return (
                                        <div
                                            key={card.label}
                                            className={`absolute ${card.pos} w-40 rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5 bg-white animate-[float-y_5.5s_ease-in-out_infinite]`}
                                            style={{ animationDelay: `${idx * 0.5}s` }}
                                        >
                                            <div className="relative h-32">
                                                <img src={card.image} alt={card.alt} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                            </div>
                                            <div className="flex items-center gap-1.5 px-3 py-2">
                                                <span className={`w-6 h-6 rounded-full ${card.chip} flex items-center justify-center shrink-0`}>
                                                    <Icon className="h-3.5 w-3.5 text-white" />
                                                </span>
                                                <p className="text-xs font-bold text-gray-800 leading-tight">{card.label}</p>
                                            </div>
                                        </div>
                                    );
                                })}

                                <div className="absolute -right-2 bottom-16 z-10 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 animate-[float-y_5s_ease-in-out_infinite]">
                                    <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center">
                                        <BadgeCheck className="h-5 w-5 text-teal-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-800">Verified Professional</p>
                                        <p className="text-[11px] text-gray-500">Identity verified. Trust earned.</p>
                                    </div>
                                </div>

                                <div className="absolute -left-2 bottom-16 z-10 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 animate-[float-y_5.5s_ease-in-out_infinite] [animation-delay:0.6s]">
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

                    {/* Stats — hidden until real platform figures are connected (see SHOW_STATS) */}
                    {SHOW_STATS && (
                        <Reveal delay={100}>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
                                {STATS.map((stat) => {
                                    const Icon = stat.icon;
                                    return (
                                        <div key={stat.label} className="bg-slate-50 rounded-2xl border border-gray-100 px-4 py-4 flex items-center gap-3 hover:shadow-md hover:-translate-y-1 hover:bg-white transition-all duration-300">
                                            <div className="w-11 h-11 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                                                <Icon className="h-[22px] w-[22px] text-[#003971]" />
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
                    )}

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
            <section id="audience" className="relative py-14 px-6 bg-gradient-to-b from-blue-50/60 via-white to-white overflow-hidden">
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
                            Helping each sector achieve more with the right tools.
                        </p>
                    </Reveal>

                    {/* Trust strip */}
                    <Reveal delay={100}>
                        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 mb-14">
                            {AUDIENCE_TRUST.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.label} className="flex items-center gap-2 text-sm text-gray-700 whitespace-nowrap">
                                        <Icon className="h-5 w-5 text-teal-700 shrink-0" />
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
                                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                            <Icon className="h-6 w-6 text-[#003971]" />
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

            {/* ───────────────────────── How it works ───────────────────────── */}
            <section id="how-it-works" className="relative py-14 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <Reveal className="text-center max-w-2xl mx-auto mb-16">
                        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">How It Works</p>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Simple steps. Powerful results.</h2>
                        <p className="text-gray-600 text-lg">
                            Six simple steps to get set up, get verified and start achieving more.
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

            {/* ───────────────────────── Platform Preview ───────────────────────── */}
            <section id="preview" className="relative py-14 px-6 bg-slate-50 overflow-hidden">
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
                            {/* Dashboard mockup area — swap DashboardMockup for real screenshots once live data exists */}
                            <div className="relative rounded-2xl bg-slate-100 overflow-hidden min-h-[380px] lg:min-h-[460px] ring-1 ring-black/5">
                                <div
                                    key={`${activePreview.id}-${previewSlide}`}
                                    className="absolute inset-0 animate-[fade-in-up_0.45s_ease-out]"
                                >
                                    <DashboardMockup mock={activeMock} slide={previewShots[previewSlide]} />
                                </div>
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

            {/* ───────────────────────── Security & Trust ───────────────────────── */}
            <section id="security" className="relative py-14 px-6 bg-white overflow-hidden">
                <div className="pointer-events-none absolute -bottom-20 -left-20 w-80 h-80 bg-blue-100/60 rounded-full blur-3xl" />
                <div className="relative max-w-7xl mx-auto">
                    <Reveal className="text-center max-w-2xl mx-auto mb-14">
                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Security &amp; Trust
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
                            Your data. Your trust.{' '}
                            <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent bg-size-200 animate-[gradient-pan_6s_ease_infinite]">
                                Our responsibility.
                            </span>
                        </h2>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            We use enterprise-grade security and strict verification processes to protect
                            your identity and information.
                        </p>
                    </Reveal>

                    {/* All five cards on a single row on large screens */}
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mb-12">
                            {SECURITY_ITEMS.map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <Reveal key={item.title} delay={idx * 80} direction="up" className="h-full">
                                        <div className="group h-full bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
                                            <div className="w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-[#003971] flex items-center justify-center mb-3 transition-colors duration-300">
                                                <Icon className="h-6 w-6 text-[#003971] group-hover:text-white transition-colors duration-300" />
                                            </div>
                                            <h3 className="text-sm font-bold text-gray-900 mb-1.5">{item.title}</h3>
                                            <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
                                        </div>
                                    </Reveal>
                                );
                            })}
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

            {/*
              Download-the-App section removed per client feedback — the hero trust bar already
              shows Google Play / App Store availability. The Pricing section will live here
              once pricing is finalised.
            */}

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
                <div className="max-w-7xl mx-auto grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[1.6fr_1fr_1fr_1fr_1fr] mb-12">
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

                {/* Legal strip — all legal links on one line, wrapping only when the screen is too narrow */}
                <div className="max-w-7xl mx-auto border-t border-white/10 pt-6 pb-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5">
                    {LEGAL_LINKS.map((link) => (
                        <button
                            key={link.label}
                            type="button"
                            onClick={() => navigate(link.to)}
                            className="text-[13px] text-slate-400 hover:text-teal-300 whitespace-nowrap transition-colors"
                        >
                            {link.label}
                        </button>
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

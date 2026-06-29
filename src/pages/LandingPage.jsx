import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Anchor,
    Ship,
    Compass,
    ShieldCheck,
    FileCheck2,
    ScanLine,
    Briefcase,
    MessageSquare,
    GraduationCap,
    CreditCard,
    ArrowRight,
    CheckCircle2,
    Sparkles,
    Menu,
    X,
    ChevronDown,
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
    {
        id: 'admin',
        name: 'Admin',
        tagline: 'Platform Administration',
        description:
            'Oversee verification, compliance, and the health of the entire MaritimeLink ecosystem from a single control center.',
        bullets: ['KYC & compliance review', 'Platform-wide oversight', 'Approvals & moderation'],
        icon: ShieldCheck,
        accent: 'from-slate-600 to-slate-800',
        ring: 'group-hover:ring-slate-300',
        chip: 'bg-slate-100 text-slate-700',
        signIn: '/admin/login',
        signUp: null,
    },
];

const FEATURES = [
    {
        icon: FileCheck2,
        title: 'Digital Document Wallet',
        description: 'Store licenses, endorsements and certificates in one secure, organized wallet.',
    },
    {
        icon: ScanLine,
        title: 'AI-Powered Verification',
        description: 'Documents are scanned and cross-checked automatically, cutting manual review time.',
    },
    {
        icon: ShieldCheck,
        title: 'KYC Identity Verification',
        description: 'Every account is identity-verified, building trust across the entire platform.',
    },
    {
        icon: Briefcase,
        title: 'Smart Job Matching',
        description: 'Professionals are matched to roles based on rank, certification and sea service.',
    },
    {
        icon: MessageSquare,
        title: 'Real-Time Messaging',
        description: 'Chat directly with recruiters or candidates without leaving the platform.',
    },
    {
        icon: Compass,
        title: 'Sea Service Tracking',
        description: 'Log sea time, vessels and roles to keep an always up-to-date career record.',
    },
    {
        icon: GraduationCap,
        title: 'Training & Courses',
        description: 'Training providers manage sessions, bookings and certifications in one place.',
    },
    {
        icon: CreditCard,
        title: 'Secure Payments',
        description: 'Stripe-powered billing keeps subscriptions and course payments safe and simple.',
    },
];

const STEPS = [
    {
        title: 'Create Your Profile',
        description: 'Sign up as a Professional, Recruiter, or Training Provider in just a few minutes.',
    },
    {
        title: 'Get Verified',
        description: 'Complete KYC and let our AI verify your documents and certificates automatically.',
    },
    {
        title: 'Build Your Presence',
        description: 'Professionals build a resume and document wallet; agencies build their hiring pipeline.',
    },
    {
        title: 'Connect & Grow',
        description: 'Apply, hire, train or manage your maritime career — all from one trusted platform.',
    },
];

function LandingPage() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [signInOpen, setSignInOpen] = useState(false);

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
        { label: 'Features', id: 'features' },
        { label: 'How It Works', id: 'how-it-works' },
        { label: 'Who It’s For', id: 'audience' },
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
                        <img src="/images/logo.png" alt="MaritimeLink" className="h-10 w-auto object-contain" />
                        <span className={`font-bold text-lg ${scrolled ? 'text-gray-900' : 'text-gray-900'}`}>
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
                            className="bg-[#003971] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#002855] transition-colors shadow-sm hover:shadow-md"
                        >
                            Get Started
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
                            Get Started
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
                            <span className="text-sm font-medium text-gray-700">The maritime ecosystem, fully connected</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-6">
                            Where Maritime
                            <span className="block bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent bg-size-200 animate-[gradient-pan_6s_ease_infinite]">
                                Careers Set Sail
                            </span>
                        </h1>

                        <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-xl">
                            MaritimeLink brings seafarers, recruiters, and training providers together on one
                            verified platform &mdash; built for faster hiring, trusted credentials, and stronger
                            maritime careers.
                        </p>

                        <div className="flex flex-wrap items-center gap-4 mb-10">
                            <button
                                type="button"
                                onClick={() => scrollToId('audience')}
                                className="group inline-flex items-center gap-2 bg-[#003971] text-white px-7 py-3.5 rounded-full font-semibold shadow-lg shadow-blue-900/20 hover:bg-[#002855] hover:shadow-xl transition-all duration-300"
                            >
                                Get Started
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </button>
                            <button
                                type="button"
                                onClick={() => scrollToId('features')}
                                className="inline-flex items-center gap-2 bg-white text-gray-800 px-7 py-3.5 rounded-full font-semibold border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
                            >
                                Explore Features
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-x-8 gap-y-3">
                            {['Verified Credentials', 'Secure & Compliant', 'Built for Seafarers'].map((item) => (
                                <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                                    <CheckCircle2 className="h-4 w-4 text-teal-600" />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </Reveal>

                    <Reveal direction="left" delay={150}>
                        <div className="relative mx-auto max-w-md">
                            <div className="absolute inset-0 rounded-[2rem] border-2 border-blue-300/40 animate-[hero-ring_3.5s_ease-out_infinite]" />
                            <div className="absolute inset-0 rounded-[2rem] border-2 border-cyan-300/30 animate-[hero-ring_3.5s_ease-out_infinite] [animation-delay:1.2s]" />

                            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-black/5 animate-[float-y_6s_ease-in-out_infinite]">
                                <img
                                    src="/images/crew-image.webp"
                                    alt="Maritime crew member"
                                    className="w-full h-[460px] object-cover"
                                />
                            </div>

                            <div className="absolute -left-6 top-10 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 animate-[float-y_5s_ease-in-out_infinite]">
                                <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center">
                                    <ShieldCheck className="h-5 w-5 text-teal-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-800">Identity Verified</p>
                                    <p className="text-[11px] text-gray-500">KYC complete</p>
                                </div>
                            </div>

                            <div className="absolute -right-6 bottom-12 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 animate-[float-y_5.5s_ease-in-out_infinite] [animation-delay:0.6s]">
                                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                                    <FileCheck2 className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-800">Certificate Synced</p>
                                    <p className="text-[11px] text-gray-500">Document wallet</p>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>

                {/* Wave divider */}
                <div className="absolute bottom-0 left-0 right-0 translate-y-1 pointer-events-none">
                    <svg viewBox="0 0 1440 100" className="w-full h-20 text-white">
                        <path fill="currentColor" d="M0,48 C480,112 960,0 1440,48 L1440,100 L0,100 Z" />
                    </svg>
                </div>
            </section>

            {/* ───────────────────────── Audience ───────────────────────── */}
            <section id="audience" className="relative py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <Reveal className="text-center max-w-2xl mx-auto mb-16">
                        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Built for the industry</p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Who is MaritimeLink for?</h2>
                        <p className="text-gray-600 text-lg">
                            One platform, four roles &mdash; every part of the maritime hiring journey, connected.
                        </p>
                    </Reveal>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {ROLES.map((role, idx) => {
                            const Icon = role.icon;
                            return (
                                <Reveal key={role.id} delay={idx * 100} direction="up">
                                    <div
                                        className={`group relative h-full bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ring-0 ring-offset-2 ${role.ring} hover:ring-2 flex flex-col`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.accent} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon className="h-6 w-6 text-white" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">{role.name}</h3>
                                        <p className="text-xs font-medium text-gray-500 mb-3">{role.tagline}</p>
                                        <p className="text-sm text-gray-600 mb-4 flex-1">{role.description}</p>

                                        <ul className="space-y-1.5 mb-5">
                                            {role.bullets.map((b) => (
                                                <li key={b} className="flex items-start gap-2 text-xs text-gray-600">
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 mt-0.5 shrink-0" />
                                                    {b}
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="flex flex-col gap-2">
                                            <button
                                                type="button"
                                                onClick={() => navigate(role.signIn)}
                                                className={`w-full bg-gradient-to-r ${role.accent} text-white text-sm font-semibold py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2`}
                                            >
                                                Sign In
                                                <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all duration-300" />
                                            </button>
                                            {role.signUp && (
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(role.signUp)}
                                                    className="w-full text-xs font-semibold text-gray-500 hover:text-gray-800 py-1 transition-colors"
                                                >
                                                    New here? Create an account
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ───────────────────────── Features ───────────────────────── */}
            <section id="features" className="relative py-24 px-6 bg-slate-50 overflow-hidden">
                <div className="pointer-events-none absolute top-0 right-0 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl" />
                <div className="relative max-w-7xl mx-auto">
                    <Reveal className="text-center max-w-2xl mx-auto mb-16">
                        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Platform features</p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Everything you need, in one place</h2>
                        <p className="text-gray-600 text-lg">
                            From verification to hiring, MaritimeLink streamlines every step of the maritime career journey.
                        </p>
                    </Reveal>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {FEATURES.map((feature, idx) => {
                            const Icon = feature.icon;
                            return (
                                <Reveal key={feature.title} delay={(idx % 4) * 80} direction="up">
                                    <div className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 h-full">
                                        <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-[#003971] transition-colors duration-300">
                                            <Icon className="h-5 w-5 text-[#003971] group-hover:text-white transition-colors duration-300" />
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ───────────────────────── How it works ───────────────────────── */}
            <section id="how-it-works" className="relative py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <Reveal className="text-center max-w-2xl mx-auto mb-20">
                        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Simple onboarding</p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How MaritimeLink works</h2>
                        <p className="text-gray-600 text-lg">From sign-up to verified profile in four simple steps.</p>
                    </Reveal>

                    <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
                        <div className="hidden lg:block absolute top-7 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-blue-200 via-teal-200 to-blue-200" />
                        {STEPS.map((step, idx) => (
                            <Reveal key={step.title} delay={idx * 120} direction="up" className="relative text-center">
                                <div className="relative z-10 w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-[#003971] to-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-lg mb-5">
                                    {idx + 1}
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed px-2">{step.description}</p>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ───────────────────────── Final CTA ───────────────────────── */}
            <section className="relative py-24 px-6 overflow-hidden bg-gradient-to-br from-[#003971] via-[#0a4a8f] to-[#0d6e8f]">
                <div className="pointer-events-none absolute -top-16 -left-16 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-[blob-drift_12s_ease-in-out_infinite]" />
                <div className="pointer-events-none absolute -bottom-16 -right-16 w-96 h-96 bg-cyan-300/10 rounded-full blur-3xl animate-[blob-drift_15s_ease-in-out_infinite_reverse]" />

                <Reveal className="relative max-w-3xl mx-auto text-center">
                    <Ship className="h-10 w-10 text-cyan-300 mx-auto mb-6" />
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to set sail with MaritimeLink?</h2>
                    <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
                        Join professionals, recruiters, and training providers building the future of maritime careers.
                    </p>
                    <button
                        type="button"
                        onClick={() => scrollToId('audience')}
                        className="group inline-flex items-center gap-2 bg-white text-[#003971] px-8 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                    >
                        Get Started Now
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                </Reveal>
            </section>

            {/* ───────────────────────── Footer ───────────────────────── */}
            <footer className="bg-slate-900 text-slate-300 py-14 px-6">
                <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <img src="/images/logo.png" alt="MaritimeLink" className="h-9 w-auto object-contain" />
                            <span className="font-bold text-white text-lg">
                                Maritime<span className="text-blue-400">Link</span>
                            </span>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Your gateway to maritime excellence &mdash; connecting seafarers, recruiters, and training
                            providers on one trusted platform.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4 text-sm">Platform</h4>
                        <ul className="space-y-2.5 text-sm">
                            <li>
                                <button onClick={() => scrollToId('features')} className="hover:text-white transition-colors">
                                    Features
                                </button>
                            </li>
                            <li>
                                <button onClick={() => scrollToId('how-it-works')} className="hover:text-white transition-colors">
                                    How It Works
                                </button>
                            </li>
                            <li>
                                <button onClick={() => scrollToId('audience')} className="hover:text-white transition-colors">
                                    Who It&rsquo;s For
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4 text-sm">Sign In</h4>
                        <ul className="space-y-2.5 text-sm">
                            {ROLES.map((role) => (
                                <li key={role.id}>
                                    <button onClick={() => navigate(role.signIn)} className="hover:text-white transition-colors">
                                        {role.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4 text-sm">Legal</h4>
                        <ul className="space-y-2.5 text-sm">
                            <li>
                                <button onClick={() => navigate('/terms')} className="hover:text-white transition-colors">
                                    Terms of Service
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
                    &copy; {new Date().getFullYear()} MaritimeLink. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;

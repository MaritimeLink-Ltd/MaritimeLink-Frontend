import { useState } from 'react';
import {
    Clock,
    BarChart3,
    List,
    Users,
    Activity,
    MapPin,
    BookOpen,
    Eye,
    ChevronDown,
    Search
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

function DemandPlanning() {
    const navigate = useNavigate();
    const [selectedRegion, setSelectedRegion] = useState('My Region');
    const [selectedCity, setSelectedCity] = useState('My City');
    const [selectedNearbyCities, setSelectedNearbyCities] = useState('Nearby Cities');
    const [showRegionDropdown, setShowRegionDropdown] = useState(false);
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [showNearbyCitiesDropdown, setShowNearbyCitiesDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const regions = ['My Region', 'North Sea', 'Atlantic', 'Mediterranean', 'Pacific'];
    const cities = ['My City', 'Aberdeen', 'London', 'Liverpool', 'Glasgow', 'Southampton'];
    const nearbyCities = ['Nearby Cities', 'Edinburgh', 'Dundee', 'Inverness', 'Perth'];

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const statsCards = [
        {
            id: 1,
            icon: Clock,
            iconColor: 'text-orange-600',
            iconBg: 'bg-orange-50',
            value: '284',
            title: 'Certificates Expiring Soon',
            subtitle: '420 total renewals expected',
            bgColor: 'bg-orange-50'
        },
        {
            id: 2,
            icon: BarChart3,
            iconColor: 'text-blue-600',
            iconBg: 'bg-blue-50',
            value: '623',
            title: 'Course Views Last 30 Days',
            subtitle: '980 courses viewed',
            bgColor: 'bg-blue-50'
        },
        {
            id: 3,
            icon: List,
            iconColor: 'text-green-600',
            iconBg: 'bg-green-50',
            value: '28',
            title: 'Active Enquiries',
            subtitle: '23 professionals interested',
            bgColor: 'bg-green-50'
        }
    ];

    const renewalInsights = [
        {
            id: 1,
            icon: Users,
            iconColor: 'text-orange-600',
            iconBg: 'bg-orange-50',
            title: 'STCW Basic Safety',
            subtitle: '108 expiring soon• 128 expiring in 30 days',
            searchTerms: 'stcw basic safety'
        },
        {
            id: 2,
            icon: Activity,
            iconColor: 'text-blue-600',
            iconBg: 'bg-blue-50',
            title: 'Advanced Firefighting',
            subtitle: '96 views in 30 days• 10 enquiries',
            searchTerms: 'advanced firefighting'
        },
        {
            id: 3,
            icon: BookOpen,
            iconColor: 'text-purple-600',
            iconBg: 'bg-purple-50',
            title: 'Confined Space Awareness',
            subtitle: '144 views in 30 days• No scheduled sessions',
            searchTerms: 'confined space awareness'
        },
        {
            id: 4,
            icon: MapPin,
            iconColor: 'text-teal-600',
            iconBg: 'bg-teal-50',
            title: 'Medical Care Onboard',
            subtitle: 'High demand in Aberdeen• 50+ expires next month',
            searchTerms: 'medical care onboard'
        }
    ];

    const capacityWatch = [
        {
            id: 1,
            icon: Activity,
            iconColor: 'text-blue-600',
            iconBg: 'bg-blue-50',
            title: 'STCW Basic Safety',
            subtitle: 'Renewals needed soon',
            buttonText: 'Create Course',
            buttonStyle: 'bg-[#003971] text-white hover:bg-[#002455]',
            searchTerms: 'stcw basic safety renewals'
        },
        {
            id: 2,
            icon: Eye,
            iconColor: 'text-pink-600',
            iconBg: 'bg-pink-50',
            title: 'Advanced Firefighting',
            subtitle: '520 views in 30 days• Moderate capacity',
            buttonText: 'Create Course',
            buttonStyle: 'bg-[#003971] text-white hover:bg-[#002455]',
            searchTerms: 'advanced firefighting'
        },
        {
            id: 3,
            icon: Clock,
            iconColor: 'text-yellow-600',
            iconBg: 'bg-yellow-50',
            title: 'Energy Efficiency Program',
            subtitle: '117 views in 30 days• Low capacity',
            buttonText: 'Check Schedule',
            buttonStyle: 'bg-white text-[#003971] border-2 border-blue-200 hover:bg-blue-50',
            searchTerms: 'energy efficiency'
        },
        {
            id: 4,
            icon: MapPin,
            iconColor: 'text-teal-600',
            iconBg: 'bg-teal-50',
            title: 'Confined Space Awareness',
            subtitle: 'Interest in Aberdeen',
            buttonText: 'Create Course',
            buttonStyle: 'bg-[#003971] text-white hover:bg-[#002455]',
            searchTerms: 'confined space aberdeen'
        }
    ];

    // Filter items based on search query
    const filteredRenewalInsights = renewalInsights.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.searchTerms.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredCapacityWatch = capacityWatch.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.searchTerms.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateCourse = () => {
        navigate('/trainingprovider/courses/create');
    };

    const handleCheckSchedule = () => {
        navigate('/trainingprovider/courses');
    };

    const handleViewExpiries = () => {
        navigate('/trainingprovider/courses');
    };

    return (
        <div className="min-h-screen">
            {/* Header Section */}
            <div className="mb-6">
                <h1 className="text-[28px] font-bold text-gray-900 mb-1">Demand & Planning</h1>
                <p className="text-gray-500 text-sm mb-6">Identify trends and gaps in maritime training demand</p>

                {/* Filters and Search */}
                <div className="flex items-center gap-4 mb-6">
                    {/* Filter Dropdowns */}
                    <div className="flex items-center gap-3">
                        {/* My Region Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowRegionDropdown(!showRegionDropdown);
                                    setShowCityDropdown(false);
                                    setShowNearbyCitiesDropdown(false);
                                }}
                                className="px-4 py-2 bg-[#003971] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#002455] transition-colors"
                            >
                                {selectedRegion}
                                <ChevronDown className={`h-4 w-4 transition-transform ${showRegionDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            {showRegionDropdown && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowRegionDropdown(false)} />
                                    <div className="absolute z-20 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1">
                                        {regions.map((region) => (
                                            <button
                                                key={region}
                                                onClick={() => {
                                                    setSelectedRegion(region);
                                                    setShowRegionDropdown(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedRegion === region ? 'text-[#003971] font-semibold' : 'text-gray-700'}`}
                                            >
                                                {region}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* My City Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowCityDropdown(!showCityDropdown);
                                    setShowRegionDropdown(false);
                                    setShowNearbyCitiesDropdown(false);
                                }}
                                className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors"
                            >
                                {selectedCity}
                                <ChevronDown className={`h-4 w-4 transition-transform ${showCityDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            {showCityDropdown && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowCityDropdown(false)} />
                                    <div className="absolute z-20 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1">
                                        {cities.map((city) => (
                                            <button
                                                key={city}
                                                onClick={() => {
                                                    setSelectedCity(city);
                                                    setShowCityDropdown(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedCity === city ? 'text-[#003971] font-semibold' : 'text-gray-700'}`}
                                            >
                                                {city}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Nearby Cities Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowNearbyCitiesDropdown(!showNearbyCitiesDropdown);
                                    setShowRegionDropdown(false);
                                    setShowCityDropdown(false);
                                }}
                                className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors"
                            >
                                {selectedNearbyCities}
                                <ChevronDown className={`h-4 w-4 transition-transform ${showNearbyCitiesDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            {showNearbyCitiesDropdown && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowNearbyCitiesDropdown(false)} />
                                    <div className="absolute z-20 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1">
                                        {nearbyCities.map((city) => (
                                            <button
                                                key={city}
                                                onClick={() => {
                                                    setSelectedNearbyCities(city);
                                                    setShowNearbyCitiesDropdown(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedNearbyCities === city ? 'text-[#003971] font-semibold' : 'text-gray-700'}`}
                                            >
                                                {city}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="ml-auto relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search trends..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200 w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                {statsCards.map((card) => (
                    <div
                        key={card.id}
                        className={`${card.bgColor} rounded-xl p-6 border border-gray-100`}
                    >
                        <div className="flex items-start gap-4">
                            <div className={`${card.iconBg} p-3 rounded-lg`}>
                                <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-[32px] font-bold text-gray-900 leading-none mb-2">
                                    {card.value}
                                </h3>
                                <p className="text-sm font-bold text-gray-900 mb-1">{card.title}</p>
                                <p className="text-xs text-gray-600">{card.subtitle}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Demand Forecast Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900">Demand Forecast (Expiries)</h2>
                    <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">
                        Today's Expiries: 16
                    </span>
                </div>

                {/* Chart Placeholder */}
                <div className="h-64 bg-gradient-to-br from-blue-50 via-blue-25 to-transparent rounded-lg relative overflow-hidden">
                    {/* Simple line chart visualization */}
                    <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
                            </linearGradient>
                        </defs>
                        <path
                            d="M 0 120 Q 100 110, 150 115 T 250 95 T 350 100 T 450 80 T 550 70 T 650 60 T 800 50"
                            stroke="#2563EB"
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                        />
                        <path
                            d="M 0 120 Q 100 110, 150 115 T 250 95 T 350 100 T 450 80 T 550 70 T 650 60 T 800 50 L 800 200 L 0 200 Z"
                            fill="url(#chartGradient)"
                        />
                    </svg>

                    {/* X-axis labels */}
                    <div className="absolute bottom-2 left-0 right-0 flex justify-between px-4 text-xs text-gray-400">
                        <span>20 Days</span>
                        <span>10 Days</span>
                        <span>Today</span>
                        <span>Apr 20</span>
                        <span>May 10</span>
                        <span>Jun 15</span>
                        <span>90 Days</span>
                    </div>
                </div>
            </div>

            {/* Upcoming Renewal Insight and Capacity Watch */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Renewal Insight */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-bold text-gray-900">Upcoming Renewal Insight</h2>
                        <button
                            onClick={handleViewExpiries}
                            className="text-sm font-bold text-[#003971] hover:text-[#002455] transition-colors"
                        >
                            View All Expiries
                        </button>
                    </div>

                    <div className="space-y-3">
                        {filteredRenewalInsights.length > 0 ? (
                            filteredRenewalInsights.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-start gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className={`${item.iconBg} p-2.5 rounded-lg flex-shrink-0`}>
                                        <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-bold text-gray-900 mb-1">
                                            {item.title}
                                        </h3>
                                        <p className="text-xs text-gray-500">{item.subtitle}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p className="text-sm">No renewal insights found matching your search.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Capacity Watch & Suggestions */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="mb-5">
                        <h2 className="text-lg font-bold text-gray-900 mb-1">Capacity Watch & Suggestions</h2>
                        <p className="text-xs text-gray-500">Quickly create courses to meet demand</p>
                    </div>

                    <div className="space-y-3">
                        {filteredCapacityWatch.length > 0 ? (
                            filteredCapacityWatch.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-start justify-between gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className={`${item.iconBg} p-2.5 rounded-lg flex-shrink-0`}>
                                            <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-bold text-gray-900 mb-1">
                                                {item.title}
                                            </h3>
                                            <p className="text-xs text-gray-500">{item.subtitle}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={item.buttonText === 'Create Course' ? handleCreateCourse : handleCheckSchedule}
                                        className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${item.buttonStyle}`}
                                    >
                                        {item.buttonText}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p className="text-sm">No capacity watch items found matching your search.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DemandPlanning;

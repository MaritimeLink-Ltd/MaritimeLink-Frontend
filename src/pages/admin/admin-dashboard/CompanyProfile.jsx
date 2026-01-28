import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Edit, MoreVertical, Trash2, Users as UsersIcon } from 'lucide-react';

function CompanyProfile() {
    const navigate = useNavigate();

    // Sample team members data
    const teamMembers = [
        {
            name: 'David Turner',
            email: 'david.t@oceanhire.com',
            role: 'Admin',
            status: 'Active',
            statusColor: 'text-green-600',
            statusBg: 'bg-green-50',
            joined: 'Oct 24, 2023'
        },
        {
            name: 'Sarah Miller',
            email: 'sarah.m@oceanhire.com',
            role: 'Recruiter',
            status: 'Active',
            statusColor: 'text-green-600',
            statusBg: 'bg-green-50',
            joined: 'Nov 01, 2023'
        },
        {
            name: 'James Wilson',
            email: 'james.w@oceanhire.com',
            role: 'Viewer',
            status: 'Pending',
            statusColor: 'text-orange-600',
            statusBg: 'bg-orange-50',
            joined: 'Yesterday'
        }
    ];

    // Recent activity data
    const activities = [
        {
            title: 'Company Claimed',
            description: 'Verified by Admin User',
            time: '2 hours ago',
            color: 'bg-green-500'
        },
        {
            title: 'New Member Added',
            description: 'Sarah Miller joined as Recruiter',
            time: 'Yesterday',
            color: 'bg-blue-500'
        },
        {
            title: 'Profile Created',
            description: 'Auto-created via domain match',
            time: 'Oct 24, 2023',
            color: 'bg-gray-400'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold"
            >
                <ArrowLeft className="h-5 w-5" />
                Back to Companies
            </button>

            {/* Company Header */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">OceanhHire Agency</h1>
                        <a
                            href="https://oceanhire.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-sm text-[#1e5a8f] hover:underline"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                            oceanhire.com
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreVertical className="h-5 w-5" />
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                            <Edit className="h-4 w-4" />
                            Edit
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#1e5a8f] text-white rounded-lg text-sm font-semibold hover:bg-[#164773] transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            Merge Profile
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - 2/3 width */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Company Information */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-base font-bold text-gray-900">Company Information</h3>
                            <span className="text-xs text-gray-500">Auto-fetched from Companies House</span>
                        </div>

                        <div className="space-y-5">
                            {/* Legal Name and Organization Type */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Legal Name
                                    </label>
                                    <div className="text-sm font-semibold text-gray-900">OceanhHire Agency</div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        Organization Type
                                    </label>
                                    <span className="inline-flex px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-md">
                                        Recruiter
                                    </span>
                                </div>
                            </div>

                            {/* Headquarters Address */}
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Headquarters Address
                                </label>
                                <div className="text-sm font-semibold text-gray-900">
                                    71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, United Kingdom
                                </div>
                            </div>

                            {/* Profile Created and Last Updated */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Profile Created
                                    </label>
                                    <div className="text-sm font-semibold text-gray-900">Oct 24, 2023</div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Last Updated
                                    </label>
                                    <div className="text-sm font-semibold text-gray-900">15 mins ago</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Team Members */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                Team Members
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-md">
                                    {teamMembers.length}
                                </span>
                            </h3>
                            <button className="text-sm font-bold text-[#1e5a8f] hover:underline">
                                + Add Member
                            </button>
                        </div>

                        {/* Team Members Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Joined
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {teamMembers.map((member, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                        <span className="text-xs font-bold text-gray-600">
                                                            {member.name.split(' ').map(n => n[0]).join('')}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900">{member.name}</div>
                                                        <div className="text-xs text-gray-500">{member.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-700">{member.role}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${member.statusBg} ${member.statusColor}`}>
                                                    {member.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-600">{member.joined}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column - 1/3 width */}
                <div className="space-y-6">
                    {/* Potential Duplicate Detected */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                                <UsersIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-gray-900 mb-2">Potential Duplicate Detected</h3>
                                <p className="text-sm text-gray-600 mb-3">
                                    We found another company profile <span className="font-semibold">"Ocean Hire Ltd"</span> that shares a similar domain.
                                </p>
                                <button className="text-sm font-bold text-[#1e5a8f] hover:underline">
                                    Review & Merge
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Recent Activity</h3>

                        <div className="space-y-4">
                            {activities.map((activity, index) => (
                                <div key={index} className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-2 h-2 ${activity.color} rounded-full`}></div>
                                        {index < activities.length - 1 && (
                                            <div className="w-0.5 h-full bg-gray-200 mt-1"></div>
                                        )}
                                    </div>
                                    <div className="flex-1 pb-4">
                                        <div className="text-sm font-semibold text-gray-900 mb-0.5">{activity.title}</div>
                                        <div className="text-xs text-gray-500 mb-1">{activity.description}</div>
                                        <div className="text-xs text-gray-400">{activity.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CompanyProfile;

import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Shield, AlertTriangle, FileText, CheckCircle, Clock, ChevronRight } from 'lucide-react';

function ManualActionReview() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Sample data based on design
    const actionData = {
        id: 'act-1',
        type: 'Password Reset',
        target: 'user_882910',
        status: 'Completed',
        riskLevel: 'Low Risk',
        reason: 'User request via support ticket',
        initiatedBy: 'System Admin',
        impacts: [
            'This action will immediately invalidate the user\'s current session tokens.',
            'User will be required to perform 2FA verification upon next login.',
            'Audit log entry will be created automatically.'
        ],
        history: [
            { stage: 'Request Created', time: 'Today, 10:42 AM', active: true },
            { stage: 'Pending Review', time: 'Current Stage', active: false }
        ],
        policies: [
            { name: 'Security Protocol A-12', link: '#' },
            { name: 'User Account Mgmt', link: '#' }
        ]
    };

    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 mb-8 pt-2">
                <div className="flex items-center gap-2 mb-1">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Review Action</h1>
                </div>
                <div className="pl-9 text-sm text-gray-400 font-medium">ID: {actionData.id}</div>
            </div>

            {/* Content Grid */}
            <div className="flex-1 flex gap-6 overflow-hidden pb-4">
                {/* Left Column - Main Info */}
                <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                    {/* Action Details Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-1">{actionData.type}</h2>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-gray-400 font-medium">Target:</span>
                                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">{actionData.target}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
                                    <Shield className="h-3 w-3" />
                                    {actionData.riskLevel}
                                </span>
                                <div className="flex items-center gap-1 text-sm">
                                    <span className="text-gray-400 font-medium">Status:</span>
                                    <span className="text-green-600 font-bold">{actionData.status}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100">
                                <div className="flex items-center gap-2 mb-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    <FileText className="h-3.5 w-3.5" />
                                    Reason for Action
                                </div>
                                <p className="text-lg text-gray-800 italic font-medium">"{actionData.reason}"</p>
                            </div>

                            <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 inline-block pr-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                        <User className="h-4 w-4 text-gray-500" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400 font-medium">Initiated by</div>
                                        <div className="text-sm font-bold text-gray-900">{actionData.initiatedBy}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Impact Analysis Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            <h3 className="text-lg font-bold text-gray-900">Potential Impact</h3>
                        </div>

                        <ul className="space-y-4">
                            {actionData.impacts.map((impact, index) => (
                                <li key={index} className="flex items-start gap-3 text-sm text-gray-600">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                                    <span className="leading-relaxed">{impact}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Right Column - Sidebar */}
                <div className="w-[360px] flex-shrink-0 flex flex-col gap-6">
                    {/* History Sidebar */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-6">History</h3>
                        <div className="relative pl-2">
                            {/* Vertical Line */}
                            <div className="absolute top-2 bottom-2 left-[7px] w-0.5 bg-gray-100" />

                            <div className="space-y-8 relative">
                                {actionData.history.map((item, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className={`w-4 h-4 rounded-full border-2 z-10 bg-white flex-shrink-0 ${item.active ? 'border-blue-500' : 'border-gray-200'
                                            } mt-0.5`}>
                                            {item.active && <div className="w-2 h-2 bg-blue-500 rounded-full m-0.5" />}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900">{item.stage}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{item.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Related Policies */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-6">Related Policies</h3>
                        <div className="space-y-3">
                            {actionData.policies.map((policy, index) => (
                                <a
                                    key={index}
                                    href={policy.link}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-blue-600 transition-colors group"
                                >
                                    <FileText className="h-4 w-4" />
                                    <span className="text-sm font-medium group-hover:underline">{policy.name}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ManualActionReview;

import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Database, RefreshCw, PauseCircle, Clock, AlertTriangle, Layers, Terminal, Settings, ChevronRight } from 'lucide-react';

function SystemJobDetail() {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('Configuration');

    // Sample job data
    const jobData = {
        id: 'JOB-9021',
        name: 'Daily Database Backup',
        type: 'Database Job',
        lastRun: 'Today, 10:00:00',
        status: 'Running',
        progress: 45,
        stats: {
            processed: '14,050',
            errors: '0',
            duration: 'In Progress'
        },
        history: {
            avgDuration: '4m 12s',
            lastFailure: '2 days ago',
            successRate: '98.5%'
        },
        description: 'This system job performs routine database maintenance, including index rebuilding and vacuuming, to ensure optimal query performance.',
        configuration: {
            schedule: 'Every day at 10:00 AM UTC',
            retryPolicy: 'Max 3 attempts, exponential backoff',
            timeout: '3600 seconds',
            concurrency: 'Single instance'
        }
    };

    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 mb-8 pt-2">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Link
                                to="/admin/operations"
                                className="p-2 -ml-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900">{jobData.name}</h1>
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-500">
                                {jobData.id}
                            </span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <Database className="h-4 w-4" />
                                <span>{jobData.type}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-gray-300 rounded-full" />
                                <span>Last run: {jobData.lastRun}</span>
                            </div>
                        </div>
                    </div>

                    <button className="flex items-center gap-2 px-5 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors">
                        <PauseCircle className="h-4 w-4 rotate-90" />
                        Stop Job
                    </button>
                </div>
            </div>

            {/* Main Content Content Grid */}
            <div className="flex-1 flex gap-6 overflow-hidden pb-4">
                {/* Left Column - Main Status & Config */}
                <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                    {/* Status Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-gray-900">Current Execution Status</h3>
                            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                <span>Running</span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-8">
                            <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
                                <span>Progress</span>
                                <span className="text-gray-900 font-bold">{jobData.progress}%</span>
                            </div>
                            <div className="h-3 bg-gray-50 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                                    style={{ width: `${jobData.progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-gray-50/50 rounded-xl p-5 border border-gray-100">
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Processed</div>
                                <div className="text-2xl font-bold text-gray-900">{jobData.stats.processed}</div>
                            </div>
                            <div className="bg-gray-50/50 rounded-xl p-5 border border-gray-100">
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Errors</div>
                                <div className="text-2xl font-bold text-gray-900">{jobData.stats.errors}</div>
                            </div>
                            <div className="bg-gray-50/50 rounded-xl p-5 border border-gray-100">
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Duration</div>
                                <div className="text-2xl font-bold text-gray-900">{jobData.stats.duration}</div>
                            </div>
                        </div>
                    </div>

                    {/* Details Tabs Section */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex-1 flex flex-col min-h-[400px]">
                        <div className="flex items-center gap-8 px-6 border-b border-gray-100">
                            {['Execution Logs', 'Configuration'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-4 text-sm font-bold transition-all relative ${activeTab === tab
                                        ? 'text-gray-900'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="p-8">
                            {activeTab === 'Configuration' ? (
                                <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Schedule</h4>
                                        <p className="text-sm font-bold text-gray-900">{jobData.configuration.schedule}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Retry Policy</h4>
                                        <p className="text-sm font-bold text-gray-900">{jobData.configuration.retryPolicy}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Timeout</h4>
                                        <p className="text-sm font-bold text-gray-900">{jobData.configuration.timeout}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Concurrency</h4>
                                        <p className="text-sm font-bold text-gray-900">{jobData.configuration.concurrency}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full bg-gray-900 rounded-xl p-4 font-mono text-sm">
                                    <div className="flex items-center gap-2 text-gray-500 mb-2 pb-2 border-b border-gray-800">
                                        <Terminal className="h-4 w-4" />
                                        <span>stdout</span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-gray-400"><span className="text-gray-600">[10:00:01]</span> Job started</p>
                                        <p className="text-gray-400"><span className="text-gray-600">[10:00:02]</span> Connecting to database...</p>
                                        <p className="text-emerald-400"><span className="text-gray-600">[10:00:03]</span> Connection established</p>
                                        <p className="text-gray-400"><span className="text-gray-600">[10:00:05]</span> Starting VACUUM...</p>
                                        <p className="text-blue-400"><span className="text-gray-600">[10:02:15]</span> Processing batch 1 of 50...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Side Info */}
                <div className="w-[320px] flex-shrink-0 flex flex-col gap-6">
                    {/* History Stats */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-6">History Stats</h3>
                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-500">Avg Duration</span>
                                <span className="text-sm font-bold text-gray-900">{jobData.history.avgDuration}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-500">Last Failure</span>
                                <span className="text-sm font-bold text-gray-900">{jobData.history.lastFailure}</span>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <span className="text-sm font-medium text-gray-500">Success Rate</span>
                                <span className="text-sm font-bold text-green-500">{jobData.history.successRate}</span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-blue-50/50 rounded-2xl border border-blue-100 p-6">
                        <h3 className="text-sm font-bold text-[#003971] mb-3">Job Description</h3>
                        <p className="text-sm text-blue-800/80 leading-relaxed">
                            {jobData.description}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SystemJobDetail;

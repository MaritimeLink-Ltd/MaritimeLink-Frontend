import { useState } from 'react';
import {
    FileText,
    Wallet,
    MessageSquare,
    Ship,
    Clock,
    Briefcase,
    Headphones,
    Check,
    ChevronLeft,
    Star,
    X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function CandidateSummary({ candidateId, onBack, showApplicationStatus = false, onViewResume, onMessage }) {
    const navigate = useNavigate();
    const [applicationStage, setApplicationStage] = useState('offer-sent');
    const [showRejectModal, setShowRejectModal] = useState(false);

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    };

    const candidate = {
        name: "Ali Shahzaib",
        rank: "Deck Officer",
        image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&fit=crop",
        vesselTypes: ["LNG Tanker", "Offshore Support Vessel"],
        seaTime: "8 years 9 months sea time",
        compliant: true,
        experience: [
            "8 years 9 months total sea service",
            "8 years 9 months on LNG Tankers",
            "5 years 9 months on Offshore Support tankers",
            "Rank Progression: Second Engineer to Chief Engineer"
        ],
        skills: [
            { name: "Man B&W Engines", rating: 5 },
            { name: "Seamanship", rating: 5 },
            { name: "Navigation", rating: 4 },
            { name: "Safety Management", rating: 5 }
        ]
    };

    const stages = [
        { id: 'shortlisted', label: 'Shortlisted', completed: true },
        { id: 'interviewing', label: 'Interviewing', completed: true },
        { id: 'offer-sent', label: 'Offer Sent', completed: false },
        { id: 'hired', label: 'Hired', completed: false }
    ];

    const currentStageIndex = stages.findIndex(s => s.id === applicationStage);

    const moveToHired = () => {
        setApplicationStage('hired');
    };

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
            >
                <ChevronLeft className="h-5 w-5" />
                Back to Search
            </button>

            {/* Header Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-6">
                        {/* Profile Image */}
                        <img
                            src={candidate.image}
                            alt={candidate.name}
                            className="w-40 h-40 rounded-2xl object-cover border-2 border-gray-100"
                        />

                        {/* Info */}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-1">{candidate.name}</h1>
                            <p className="text-lg text-gray-600 font-medium mb-3">{candidate.rank}</p>

                            <div className="space-y-2">
                                {candidate.vesselTypes.map((vessel, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-gray-700">
                                        <Ship className="h-4 w-4 text-[#003971]" />
                                        <span className="font-medium">{vessel}</span>
                                    </div>
                                ))}
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Clock className="h-4 w-4 text-[#003971]" />
                                    <span className="font-medium">{candidate.seaTime}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Compliance Badge */}
                    {candidate.compliant && (
                        <div className="bg-green-600 text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2">
                            <Check className="h-4 w-4" />
                            Fully Compliant
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => onViewResume ? onViewResume(candidateId) : navigate('/cv-resume')}
                        className="bg-[#003971] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#002855] transition-colors"
                    >
                        <FileText className="h-5 w-5" />
                        View Resume
                    </button>
                    <button className="bg-[#003971] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#002855] transition-colors">
                        <Wallet className="h-5 w-5" />
                        View Document Wallet
                    </button>
                    <button 
                        onClick={() => onMessage && onMessage(candidateId, candidate.name)}
                        className="border-2 border-[#003971] text-[#003971] px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#003971] hover:text-white transition-colors"
                    >
                        <MessageSquare className="h-5 w-5" />
                        Message {candidate.name}
                    </button>
                </div>
            </div>

            {/* Experience Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                <div className="flex items-center gap-2 mb-5">
                    <Briefcase className="h-5 w-5 text-[#003971]" />
                    <h2 className="text-lg font-bold text-[#003971]">Experience Summary</h2>
                </div>

                <div className="space-y-3">
                    {candidate.experience.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 bg-gray-50 p-3.5 rounded-xl">
                            <div className="h-2 w-2 rounded-full bg-[#003971] mt-2 flex-shrink-0"></div>
                            <p className="text-gray-700 font-medium">{item}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Key Skills & Competencies */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                <div className="flex items-center gap-2 mb-5">
                    <Headphones className="h-5 w-5 text-[#003971]" />
                    <h2 className="text-lg font-bold text-[#003971]">Key Skills & Competencies</h2>
                </div>

                <div className="space-y-4">
                    {candidate.skills.map((skill, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                            <span className="text-gray-900 font-medium">{skill.name}</span>
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-5 w-5 ${i < skill.rating
                                            ? 'fill-[#003971] text-[#003971]'
                                            : 'fill-gray-200 text-gray-200'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Application Status */}
            {showApplicationStatus && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-[#003971]">Application Status</h2>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowRejectModal(true)}
                            className="text-red-600 font-bold hover:text-red-700 transition-colors"
                        >
                            Reject Candidate
                        </button>
                        <button
                            onClick={moveToHired}
                            className="bg-[#003971] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#002855] transition-colors"
                            disabled={applicationStage === 'hired'}
                        >
                            Move To Hired
                        </button>
                    </div>
                </div>

                {/* Progress Tracker */}
                <div className="relative">
                    <div className="flex items-center justify-between">
                        {stages.map((stage, idx) => {
                            const isCompleted = idx < currentStageIndex || (idx === currentStageIndex && stage.completed);
                            const isCurrent = idx === currentStageIndex;
                            const isHired = stage.id === 'hired' && applicationStage === 'hired';

                            return (
                                <div key={stage.id} className="flex flex-col items-center flex-1">
                                    {/* Circle */}
                                    <div className="relative z-10 mb-3">
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all ${isCompleted || isHired
                                            ? 'bg-[#003971] border-[#003971]'
                                            : isCurrent
                                                ? 'bg-white border-[#003971]'
                                                : 'bg-gray-100 border-gray-300'
                                            }`}>
                                            {(isCompleted || isHired) ? (
                                                <Check className="h-6 w-6 text-white" />
                                            ) : isCurrent ? (
                                                <div className="w-3 h-3 rounded-full bg-[#003971]"></div>
                                            ) : (
                                                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                                            )}
                                        </div>
                                    </div>
                                    {/* Label */}
                                    <p className={`text-sm font-medium ${isCompleted || isCurrent || isHired ? 'text-gray-900' : 'text-gray-400'
                                        }`}>
                                        {stage.label}
                                    </p>

                                    {/* Connecting Line */}
                                    {idx < stages.length - 1 && (
                                        <div className={`absolute left-0 right-0 h-1 top-7 -z-0 ${idx < currentStageIndex ? 'bg-[#003971]' : 'bg-gray-200'
                                            }`}
                                            style={{
                                                left: `calc(${(idx / (stages.length - 1)) * 100}% + ${(100 / (stages.length - 1) / 2)}%)`,
                                                right: `calc(${100 - ((idx + 1) / (stages.length - 1)) * 100}% + ${(100 / (stages.length - 1) / 2)}%)`
                                            }}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            )}

            {/* Reject Candidate Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full relative">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowRejectModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Reject Candidate?</h3>

                        {/* Message */}
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to reject this candidate? This action cannot be undone.
                        </p>

                        {/* Buttons */}
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="px-5 py-2.5 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    navigate(-1);
                                }}
                                className="px-5 py-2.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-colors"
                            >
                                Reject Candidate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CandidateSummary;

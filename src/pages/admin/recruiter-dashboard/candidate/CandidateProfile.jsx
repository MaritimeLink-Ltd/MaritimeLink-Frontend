import React from 'react';
import { ArrowLeft, CheckCircle, FileText, Folder, MessageCircle, Ship, Anchor, Clock, Star } from 'lucide-react';

const CandidateProfile = ({ candidate, onBack, onViewResume, onViewDocuments, onMessage }) => {
    // Mock candidate data if not provided
    const candidateData = candidate || {
        name: 'Ali Shahzaib',
        position: 'Deck Officer',
        email: 'www.alishahzaib23@gmail.com',
        profileImage: 'https://placehold.co/200x200/e5e7eb/6b7280?text=AS',
        isCompliant: true,
        vesselTypes: ['LNG Tanker', 'OffShore Support Vessel'],
        seaTime: '8 years 9 months sea time',
        experience: [
            '8 years 9 months total sea service',
            '8 years 9 months on LNG Tankers',
            '5 years 9 months on Offshore Support tankers',
            'Rank Progression: Second Engineer to Chief Engineer'
        ],
        skills: [
            { name: 'Man B&W Engines', rating: 5 },
            { name: 'Seamanship', rating: 5 }
        ]
    };

    return (
        <div className="w-full h-full bg-gray-50 overflow-y-auto">
            <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header with Back Button */}
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-[#003971] mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">Back to Search</span>
                </button>

                {/* Main Content Card */}
                <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-6">
                    {/* Top Section - Profile Info */}
                    <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
                        {/* Profile Image */}
                        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden bg-gray-200 flex-shrink-0">
                            <img
                                src={candidateData.profileImage}
                                alt={candidateData.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Profile Details */}
                        <div className="flex-1 w-full">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-2">
                                        {candidateData.name}
                                    </h1>
                                    <p className="text-lg text-gray-600 mb-4">{candidateData.position}</p>
                                </div>
                                {candidateData.isCompliant && (
                                    <div className="flex items-center gap-2 bg-[#587B42] text-white px-4 py-2 rounded-full text-sm font-medium">
                                        <CheckCircle size={16} />
                                        Fully Compliant
                                    </div>
                                )}
                            </div>

                            {/* Vessel Types and Sea Time */}
                            <div className="space-y-3 mb-6">
                                {candidateData.vesselTypes.map((vessel, index) => (
                                    <div key={index} className="flex items-center gap-2 text-gray-700">
                                        <Ship size={18} className="text-[#003971]" />
                                        <span>{vessel}</span>
                                    </div>
                                ))}
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Clock size={18} className="text-[#003971]" />
                                    <span>{candidateData.seaTime}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={onViewResume}
                                    className="flex items-center gap-2 bg-[#003971] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-[#003971]/90 transition-colors"
                                >
                                    <FileText size={18} />
                                    View Resume
                                </button>
                                <button
                                    onClick={onViewDocuments}
                                    className="flex items-center gap-2 bg-[#003971] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-[#003971]/90 transition-colors"
                                >
                                    <Folder size={18} />
                                    View Document Wallet
                                </button>
                                <button
                                    onClick={onMessage}
                                    className="flex items-center gap-2 border-2 border-[#003971] text-[#003971] px-6 py-3 rounded-full text-sm font-medium hover:bg-[#003971]/5 transition-colors"
                                >
                                    <MessageCircle size={18} />
                                    Message {candidateData.name.split(' ')[0]}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Experience Summary Section */}
                <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Anchor size={20} className="text-[#003971]" />
                        <h2 className="text-xl font-semibold text-gray-800">Experience Summary</h2>
                    </div>
                    <div className="space-y-3">
                        {candidateData.experience.map((item, index) => (
                            <div key={index} className="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
                                <div className="w-2 h-2 rounded-full bg-[#003971] mt-2 flex-shrink-0"></div>
                                <p className="text-gray-700">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Key Skills & Competencies Section */}
                <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
                    <div className="flex items-center gap-2 mb-6">
                        <Star size={20} className="text-[#003971]" />
                        <h2 className="text-xl font-semibold text-gray-800">Key Skills & Competencies</h2>
                    </div>
                    <div className="space-y-4">
                        {candidateData.skills.map((skill, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <span className="text-gray-700 font-medium">{skill.name}</span>
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={20}
                                            className={i < skill.rating ? 'text-[#003971] fill-[#003971]' : 'text-gray-300'}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateProfile;

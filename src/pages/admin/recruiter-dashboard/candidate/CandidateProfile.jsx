import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, FileText, Folder, MessageCircle, Anchor, Clock, Star } from 'lucide-react';
import httpClient from '../../../../utils/httpClient';
import { API_ENDPOINTS } from '../../../../config/api.config';
import {
    buildSeaServiceExperience,
    formatTotalSeaTimeLabel,
} from '../../../../utils/seaServiceExperience';

const normalizeCandidateProfile = (candidate = {}) => ({
    ...candidate,
    name:
        candidate?.name ||
        candidate?.fullname ||
        [candidate?.firstName, candidate?.lastName].filter(Boolean).join(' ') ||
        'Unknown candidate',
    position:
        candidate?.position ||
        candidate?.rank ||
        candidate?.profession ||
        candidate?.subcategory ||
        candidate?.resumeCategory ||
        'N/A',
    image: candidate?.profileImage || candidate?.image || candidate?.avatarUrl || candidate?.profilePhotoUrl || '',
    vesselTypes: Array.isArray(candidate?.vesselTypes) ? candidate.vesselTypes : [],
    seaTime: candidate?.seaTime || candidate?.experience || 'No sea time recorded',
    experience: Array.isArray(candidate?.experience) ? candidate.experience : [],
    skills: Array.isArray(candidate?.skills) ? candidate.skills : [],
});

const CandidateProfile = ({ candidate, onBack, onViewResume, onViewDocuments, onMessage }) => {
    const [candidateData, setCandidateData] = useState(candidate ? normalizeCandidateProfile(candidate) : null);
    const [isLoading, setIsLoading] = useState(!candidate);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        let mounted = true;
        const candidateId = candidate?.id || candidate?.professionalId || candidate?.candidateId;
        const currentUserType = typeof window !== 'undefined'
            ? (localStorage.getItem('userType') || localStorage.getItem('adminUserType'))
            : null;

        if (candidate) {
            setCandidateData(normalizeCandidateProfile(candidate));
            setIsLoading(false);
            return () => {
                mounted = false;
            };
        }

        if (!candidateId) {
            setIsLoading(false);
            setLoadError('No candidate data available.');
            return () => {
                mounted = false;
            };
        }

        const loadCandidate = async () => {
            try {
                setIsLoading(true);
                const profilePath = currentUserType === 'admin'
                    ? API_ENDPOINTS.ADMIN.PROFESSIONAL_DETAIL(candidateId)
                    : API_ENDPOINTS.RECRUITER.PROFESSIONAL_DETAIL(candidateId);
                const response = await httpClient.get(profilePath);
                const responseData = response?.data?.data || response?.data;
                const professional = responseData?.professional || responseData;
                const resume = professional?.resume || responseData?.resume || {};
                const seaService = Array.isArray(resume?.seaService) ? resume.seaService : [];
                const seaExperience = buildSeaServiceExperience(seaService);

                const skills = Array.isArray(resume?.skills)
                    ? resume.skills.map((s) => ({ name: s.skillName || s.name || 'Unnamed skill', rating: Number(s.rating) || 0 }))
                    : [];

                if (!mounted) return;
                setCandidateData({
                    name: professional?.fullname || 'Unknown candidate',
                    position: professional?.profession || professional?.subcategory || resume?.subcategory || 'N/A',
                    email: professional?.email || '',
                    profileImage: professional?.profilePhotoUrl || professional?.avatarUrl || '',
                    isCompliant: professional?.isVerified || false,
                    seaTime: formatTotalSeaTimeLabel(seaService),
                    experience: seaExperience.experienceLines.length > 0
                        ? seaExperience.experienceLines
                        : ['No experience summary available'],
                    skills,
                });
                setLoadError('');
            } catch (error) {
                if (!mounted) return;
                setLoadError(error?.message || 'Failed to load candidate profile.');
                setCandidateData(null);
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        void loadCandidate();

        return () => {
            mounted = false;
        };
    }, [candidate]);

    if (isLoading) {
        return (
            <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                <div className="text-center text-gray-600 font-medium">Loading candidate profile...</div>
            </div>
        );
    }

    if (!candidateData) {
        return (
            <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md px-6">
                    <p className="text-lg font-semibold text-gray-800">Candidate profile unavailable</p>
                    <p className="text-sm text-gray-500 mt-2">{loadError || 'Please try again or open the profile from a live candidate record.'}</p>
                    <button onClick={onBack} className="mt-4 px-4 py-2 rounded-lg bg-[#003971] text-white">
                        Back
                    </button>
                </div>
            </div>
        );
    }

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
                                src={candidateData.profileImage || candidateData.image}
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

                            {/* Sea Time */}
                            <div className="space-y-3 mb-6">
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

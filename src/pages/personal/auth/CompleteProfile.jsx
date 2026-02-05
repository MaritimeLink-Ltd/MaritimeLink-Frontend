import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../../services/authService';

function CompleteProfile() {
    const [formData, setFormData] = useState({
        jobExpertise: '',
        bio: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Get stored professionalId
    const professionalId = authService.getProfessionalId();

    // Get profession type from sessionStorage
    const professionType = sessionStorage.getItem('professionType') || '';

    useEffect(() => {
        if (!professionalId) {
            setError('Professional ID not found. Please complete the registration process.');
        }
    }, [professionalId]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.jobExpertise.trim()) {
            setError('Please enter your job expertise');
            return;
        }

        if (!formData.bio.trim()) {
            setError('Please enter your bio');
            return;
        }

        if (formData.bio.length < 20) {
            setError('Bio must be at least 20 characters long');
            return;
        }

        if (!professionalId) {
            setError('Professional ID not found. Please register again.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await authService.completeProfile({
                professionalId,
                jobExpertise: formData.jobExpertise,
                bio: formData.bio,
            });

            console.log('Profile completed successfully:', response);

            // Navigate based on profession type (To Dashboard)
            if (professionType === 'officer') {
                navigate('/officer-dashboard', { replace: true });
            } else if (professionType === 'ratings') {
                navigate('/ratings-dashboard', { replace: true });
            } else if (professionType === 'catering') {
                navigate('/catering-medical-dashboard', { replace: true });
            } else {
                // Default fallback
                navigate('/personal/dashboard', { replace: true });
            }
        } catch (err) {
            console.error('Complete profile error:', err);
            setError(err.data?.message || err.message || 'Failed to complete profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex overflow-hidden">
            {/* Left Side - Form */}
            <div className="w-full lg:w-2/5 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-24 bg-white overflow-y-auto">
                <div className="max-w-md w-full mx-auto lg:mx-0">
                    {/* Logo */}
                    <div className="mb-4 -ml-2">
                        <img
                            src="/images/logo.png"
                            alt="MaritimeLink Logo"
                            className="w-28 h-auto"
                        />
                    </div>

                    {/* Welcome Text */}
                    <p className="text-sm text-[#003971] mb-1">Welcome to MaritimeLink</p>

                    {/* Complete Profile Heading */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Profile</h1>

                    {/* Subtitle */}
                    <p className="text-sm text-gray-500 mb-6">Tell us about your expertise</p>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600 flex items-center gap-2">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Job Expertise Field */}
                        <div>
                            <label htmlFor="jobExpertise" className="block text-sm font-medium text-gray-700 mb-1">
                                Job Expertise
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input
                                    id="jobExpertise"
                                    name="jobExpertise"
                                    type="text"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#003971] focus:border-[#003971] text-sm"
                                    placeholder="e.g., Deck Officer, Chef, Medical Officer"
                                    value={formData.jobExpertise}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Bio Field */}
                        <div>
                            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                                Bio
                            </label>
                            <textarea
                                id="bio"
                                name="bio"
                                rows="5"
                                required
                                className="block w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#003971] focus:border-[#003971] text-sm resize-none"
                                placeholder="Tell us about your experience, skills, and professional background..."
                                value={formData.bio}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Minimum 20 characters ({formData.bio.length}/20)
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !professionalId}
                            className="w-full bg-[#003971] text-white py-3 px-4 rounded-md hover:bg-[#002855] transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center  gap-2 mt-6"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Completing Profile...
                                </>
                            ) : (
                                'Complete Profile'
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Right Side - Image */}
            <div className="hidden lg:block lg:w-3/5 relative py-8 lg:py-12 xl:py-16 pl-4 lg:pl-6 xl:pl-8 pr-8 lg:pr-12 xl:pr-16">
                <img
                    src="/images/profession-image.png"
                    alt="Maritime Professionals"
                    className="w-full h-full object-cover rounded-2xl"
                />
            </div>
        </div>
    );
}

export default CompleteProfile;

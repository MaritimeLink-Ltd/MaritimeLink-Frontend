import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { countryCodes } from '../../../utils/countryCodes';
import authService from '../../../services/authService';

function RecruiterProfileCompletion() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        phoneNumber: '',
        countryCode: '+44',
        role: '',
        otherRole: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [userType, setUserType] = useState('recruiter');

    useEffect(() => {
        const storedUserType = localStorage.getItem('adminUserType');
        if (storedUserType) {
            setUserType(storedUserType);
        }
    }, []);

    const roleOptions = userType === 'training-provider' ? [
        'Operations & training manager',
        'Head of training',
        'Course director',
        'Learning and development officer'
    ] : [
        'Crewing Coordinator',
        'Manning Agent',
        'HR Manager',
        'Fleet Manager'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        if (error) setError('');
    };

    const handleRoleSelect = (role) => {
        setFormData({
            ...formData,
            role: role,
            otherRole: '' // Clear other role when selecting predefined role
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.firstName.trim()) {
            setError('Please enter your first name');
            return;
        }

        if (!formData.lastName.trim()) {
            setError('Please enter your last name');
            return;
        }

        if (!formData.phoneNumber.trim()) {
            setError('Please enter your phone number');
            return;
        }

        if (!formData.role && !formData.otherRole.trim()) {
            setError('Please select or enter your role');
            return;
        }

        setLoading(true);

        try {
            const recruiterId = localStorage.getItem('recruiterId');
            if (!recruiterId) {
                setError('Session expired. Please register again.');
                setLoading(false);
                return;
            }

            const finalRole = formData.role || formData.otherRole;
            
            await authService.setRecruiterPersonalInfo({
                recruiterId,
                firstName: formData.firstName.trim(),
                middleName: formData.middleName.trim(),
                lastName: formData.lastName.trim(),
                phoneCode: formData.countryCode,
                phoneNumber: formData.phoneNumber.trim(),
                personalRole: finalRole
            });

            // Navigate to phone verification
            navigate('/agent/phone-verification', {
                state: { phoneNumber: `${formData.countryCode}${formData.phoneNumber.trim()}` }
            });
        } catch (err) {
            console.error('Profile completion error:', err);
            setError(err.data?.message || err.message || 'Failed to complete profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex overflow-hidden">
            {/* Left Side - Form */}
            <div className="w-full lg:w-2/5 flex flex-col px-6 sm:px-12 lg:px-16 xl:px-24 bg-white overflow-y-auto">
                <div className="max-w-md w-full mx-auto lg:mx-0 py-10 lg:py-16">
                    {/* Logo */}
                    <div className="mb-4 sm:mb-6 -ml-2">
                        <img
                            src="/images/logo.png"
                            alt="MaritimeLink Logo"
                            className="w-24 sm:w-28 h-auto"
                        />
                    </div>

                    {/* Welcome Text */}
                    <p className="text-sm text-[#003971] mb-2">Welcome to MaritimeLink</p>

                    {/* Heading */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Tell Us About Yourself</h1>

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
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* First Name Field */}
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-900 mb-2">
                                First Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#003971] focus:border-[#003971] text-sm min-h-[44px]"
                                    placeholder="Enter your first name"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Middle Name Field */}
                        <div>
                            <label htmlFor="middleName" className="block text-sm font-medium text-gray-900 mb-2">
                                Middle Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input
                                    id="middleName"
                                    name="middleName"
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#003971] focus:border-[#003971] text-sm min-h-[44px]"
                                    placeholder="Enter your middle name (optional)"
                                    value={formData.middleName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Last Name Field */}
                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-900 mb-2">
                                Last Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#003971] focus:border-[#003971] text-sm min-h-[44px]"
                                    placeholder="Enter your last name"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Phone Number Field */}
                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-900 mb-2">
                                Phone Number
                            </label>
                            <div className="relative flex gap-2">
                                {/* Country Code Dropdown */}
                                <div className="relative w-32">
                                    <select
                                        name="countryCode"
                                        value={formData.countryCode}
                                        onChange={handleChange}
                                        className="block w-full pl-3 pr-8 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#003971] focus:border-[#003971] text-sm appearance-none min-h-[44px]"
                                    >
                                        {countryCodes.map((country) => (
                                            <option key={country.code + country.country} value={country.code}>
                                                {country.flag} {country.code}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Phone Number Input */}
                                <input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    type="tel"
                                    required
                                    className="block flex-1 pl-3 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#003971] focus:border-[#003971] text-sm min-h-[44px]"
                                    placeholder="Enter your phone number"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Your Role */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-3">
                                Your Role
                            </label>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                {roleOptions.map((role) => (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => handleRoleSelect(role)}
                                        className={`py-3 px-4 rounded-full font-medium transition-all duration-200 min-h-[44px] text-sm ${formData.role === role
                                            ? 'bg-[#003971] text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>

                            {/* Other Role */}
                            <div>
                                <label htmlFor="otherRole" className="block text-sm font-medium text-gray-900 mb-2">
                                    Other
                                </label>
                                <input
                                    id="otherRole"
                                    name="otherRole"
                                    type="text"
                                    className="block w-full pl-3 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#003971] focus:border-[#003971] text-sm min-h-[44px]"
                                    placeholder="Write your role"
                                    value={formData.otherRole}
                                    onChange={(e) => {
                                        handleChange(e);
                                        // Clear predefined role when typing in Other
                                        if (e.target.value) {
                                            setFormData(prev => ({ ...prev, role: '' }));
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#003971] text-white py-3 px-4 rounded-md hover:bg-[#002855] transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px] mt-6"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Submitting...
                                </>
                            ) : (
                                'Next'
                            )}
                        </button>
                    </form>
                </div>
            </div >

            {/* Right Side - Image */}
            < div className="hidden lg:flex lg:w-3/5 relative py-8 lg:py-12 xl:py-16 pl-4 lg:pl-6 xl:pl-8 pr-8 lg:pr-12 xl:pr-16 items-start justify-center bg-gray-50" >
                <img
                    src="/images/signup-image.webp"
                    alt="Maritime Professional"
                    className="w-[735px] max-h-full object-cover rounded-[15px]"
                />
            </div >
        </div >
    );
}

export default RecruiterProfileCompletion;

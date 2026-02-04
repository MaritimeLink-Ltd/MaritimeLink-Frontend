import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function RecruiterCompanyDetails() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        companyName: '',
        address: '',
        city: '',
        stateProvince: '',
        postcode: '',
        country: '',
        website: '',
        linkedIn: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.companyName.trim()) {
            setError('Please enter your company name');
            return;
        }

        setLoading(true);

        try {
            // TODO: Implement company details API call
            console.log('Company details submitted:', formData);

            // Navigate to company verification
            navigate('/agent/company-verification');
        } catch (err) {
            console.error('Company details error:', err);
            setError(err.message || 'Failed to save company details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex overflow-hidden">
            {/* Left Side - Form */}
            <div className="w-full lg:w-2/5 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 bg-white overflow-y-auto">
                <div className="max-w-md w-full mx-auto lg:mx-0">
                    {/* Logo */}
                    <div className="mb-3 -ml-2">
                        <img
                            src="/images/logo.png"
                            alt="MaritimeLink Logo"
                            className="w-20 sm:w-24 h-auto"
                        />
                    </div>

                    {/* Welcome Text */}
                    <p className="text-xs text-gray-700 mb-1">Welcome to MaritimeLink</p>

                    {/* Heading */}
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Company Details</h1>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-xs text-red-600 flex items-center gap-2">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-3">
                        {/* Company Name */}
                        <div>
                            <label htmlFor="companyName" className="block text-xs font-medium text-gray-900 mb-1">
                                Company Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <input
                                    id="companyName"
                                    name="companyName"
                                    type="text"
                                    required
                                    className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#003971] focus:border-[#003971] text-sm"
                                    placeholder="Enter your name"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Company Address */}
                        <div>
                            <label htmlFor="address" className="block text-xs font-medium text-gray-900 mb-1">
                                Company Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <input
                                    id="address"
                                    name="address"
                                    type="text"
                                    className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#003971] focus:border-[#003971] text-sm"
                                    placeholder="Enter your address"
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* City, State, Postcode */}
                        <div className="grid grid-cols-3 gap-2">
                            <input
                                name="city"
                                type="text"
                                placeholder="City"
                                className="block w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#003971] focus:border-[#003971] text-sm"
                                value={formData.city}
                                onChange={handleChange}
                            />
                            <input
                                name="stateProvince"
                                type="text"
                                placeholder="State / Province"
                                className="block w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#003971] focus:border-[#003971] text-sm"
                                value={formData.stateProvince}
                                onChange={handleChange}
                            />
                            <input
                                name="postcode"
                                type="text"
                                placeholder="Postcode"
                                className="block w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#003971] focus:border-[#003971] text-sm"
                                value={formData.postcode}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Country */}
                        <div>
                            <input
                                name="country"
                                type="text"
                                placeholder="Country"
                                className="block w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#003971] focus:border-[#003971] text-sm"
                                value={formData.country}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Organisation Website */}
                        <div>
                            <label htmlFor="website" className="block text-xs font-medium text-gray-900 mb-1">
                                Organisation Website
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                    </svg>
                                </div>
                                <input
                                    id="website"
                                    name="website"
                                    type="url"
                                    className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#003971] focus:border-[#003971] text-sm"
                                    placeholder="Enter your website"
                                    value={formData.website}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Company LinkedIn */}
                        <div>
                            <label htmlFor="linkedIn" className="block text-xs font-medium text-gray-900 mb-1">
                                Company LinkedIn
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                    </svg>
                                </div>
                                <input
                                    id="linkedIn"
                                    name="linkedIn"
                                    type="url"
                                    className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#003971] focus:border-[#003971] text-sm"
                                    placeholder="Enter your LinkedIn url"
                                    value={formData.linkedIn}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#003971] text-white py-2.5 px-4 rounded-md hover:bg-[#002855] transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
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
            </div>

            {/* Right Side - Image */}
            <div className="hidden lg:block lg:w-3/5 relative py-8 lg:py-12 xl:py-16 pl-4 lg:pl-6 xl:pl-8 pr-8 lg:pr-12 xl:pr-16">
                <img
                    src="/images/signup-image.png"
                    alt="Maritime Professional"
                    className="w-full h-full object-cover rounded-2xl"
                />
            </div>
        </div>
    );
}

export default RecruiterCompanyDetails;

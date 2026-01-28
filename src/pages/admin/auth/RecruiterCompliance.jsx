import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function RecruiterCompliance() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        authorizedToRecruit: false,
        agreeToTerms: false,
        hearAboutUs: ''
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

    const hearOptions = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData({
            ...formData,
            [name]: checked
        });
        if (error) setError('');
    };

    const handleOptionSelect = (option) => {
        setFormData({
            ...formData,
            hearAboutUs: option
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.authorizedToRecruit) {
            setError('You must confirm you are authorized to recruit');
            return;
        }

        if (!formData.agreeToTerms) {
            setError('You must agree to terms and code of conduct');
            return;
        }

        if (!formData.hearAboutUs) {
            setError('Please select how you heard about us');
            return;
        }

        setLoading(true);

        try {
            // TODO: Implement compliance submission API call
            console.log('Compliance submitted:', formData);

            // Navigate to appropriate dashboard based on user type
            if (userType === 'training-provider') {
                navigate('/trainingprovider-dashboard');
            } else {
                navigate('/recruiter-dashboard');
            }
        } catch (err) {
            console.error('Compliance submission error:', err);
            setError(err.message || 'Failed to submit compliance. Please try again.');
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
                    <div className="mb-4 sm:mb-6 -ml-2">
                        <img
                            src="/src/assets/logo.png"
                            alt="MaritimeLink Logo"
                            className="w-20 sm:w-24 h-auto"
                        />
                    </div>

                    {/* Welcome Text */}
                    <p className="text-sm text-gray-700 mb-2">Welcome to MaritimeLink</p>

                    {/* Heading */}
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Compliance & Trust Declaration</h1>

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
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Checkboxes */}
                        <div className="space-y-4">
                            {/* Authorization Checkbox */}
                            <div className="flex items-start">
                                <input
                                    id="authorizedToRecruit"
                                    name="authorizedToRecruit"
                                    type="checkbox"
                                    checked={formData.authorizedToRecruit}
                                    onChange={handleCheckboxChange}
                                    className="h-5 w-5 mt-0.5 text-[#003971] focus:ring-[#003971] border-gray-300 rounded"
                                />
                                <label htmlFor="authorizedToRecruit" className="ml-3 text-sm text-gray-900">
                                    I confirm I am authorized to recruit on behalf of this Organisation
                                </label>
                            </div>

                            {/* Terms Checkbox */}
                            <div className="flex items-start">
                                <input
                                    id="agreeToTerms"
                                    name="agreeToTerms"
                                    type="checkbox"
                                    checked={formData.agreeToTerms}
                                    onChange={handleCheckboxChange}
                                    className="h-5 w-5 mt-0.5 text-[#003971] focus:ring-[#003971] border-gray-300 rounded"
                                />
                                <label htmlFor="agreeToTerms" className="ml-3 text-sm text-gray-900">
                                    I agree to MaritimeLink's terms and code of conduct
                                </label>
                            </div>
                        </div>

                        {/* How do you hear about us */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-3">
                                How do you hear about us
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {hearOptions.map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => handleOptionSelect(option)}
                                        className={`py-3 px-4 rounded-full font-medium transition-all duration-200 min-h-[44px] text-sm ${formData.hearAboutUs === option
                                                ? 'bg-[#003971] text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#003971] text-white py-3 px-4 rounded-md hover:bg-[#002855] transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px] mt-8"
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
                    src="/src/assets/signup-image.png"
                    alt="Maritime Professional"
                    className="w-full h-full object-cover rounded-2xl"
                />
            </div>
        </div>
    );
}

export default RecruiterCompliance;

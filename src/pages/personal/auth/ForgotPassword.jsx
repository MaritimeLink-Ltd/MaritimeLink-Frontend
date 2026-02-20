import { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../../services/authService';


function ForgotPassword({ userType }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Determine heading and back link based on userType
    let heading = 'Forgot Password';
    let backLink = '/signin';
    let backText = 'Back to Login';
    if (userType === 'recruiter') {
        heading = 'Recruiter Forgot Password';
        backLink = '/recruiter/login';
        backText = 'Back to Recruiter Login';
    } else if (userType === 'training-provider') {
        heading = 'Training Provider Forgot Password';
        backLink = '/training-provider/login';
        backText = 'Back to Training Provider Login';
    }

    const handleChange = (e) => {
        setEmail(e.target.value);
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            await authService.forgotPassword(email);
            setSuccess(true);
        } catch (err) {
            if (err.status === 404) {
                setError('No account found with this email address.');
            } else {
                setError(err.data?.message || err.message || 'Failed to send reset link. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex overflow-hidden w-full max-w-full min-w-0">
            <div className="w-full min-w-0 lg:w-2/5 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-5 bg-white overflow-y-auto">
                <div className="max-w-md w-full mx-auto lg:mx-0">
                    {/* Logo */}
                    <div className="mb-2 sm:mb-3 -ml-2">
                        <img
                            src="/images/logo.png"
                            alt="MaritimeLink Logo"
                            className="w-24 sm:w-28 h-auto"
                        />
                    </div>

                    {/* Welcome Text */}
                    <p className="text-sm text-[#003971] mb-2">Welcome to MaritimeLink</p>

                    {/* Forgot Password Heading */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{heading}</h1>

                    {/* Subtitle */}
                    <p className="text-sm text-gray-600 mb-5">
                        Enter your email address and we'll send you a link to reset your password
                    </p>

                    {success ? (
                        /* Success Message */
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                            <div className="flex items-start gap-3">
                                <svg className="h-6 w-6 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <h3 className="text-sm font-medium text-green-800">Reset link sent!</h3>
                                    <p className="mt-1 text-sm text-green-700">
                                        We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
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
                                {/* Email Field */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#003971] focus:border-[#003971] text-sm min-h-[44px]"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#003971] text-white py-3 px-4 rounded-md hover:bg-[#002855] transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px]"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Sending Reset Link...
                                        </>
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </button>
                            </form>
                        </>
                    )}

                    {/* Back to Login Link */}
                    <div className="mt-8 text-center">
                        <Link to={backLink} className="text-sm text-[#003971] hover:underline inline-flex items-center gap-1">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            {backText}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Side - Image */}
            <div className="hidden lg:block lg:w-3/5 min-w-0 relative py-5 pl-4 lg:pl-6 xl:pl-8 pr-8 lg:pr-12 xl:pr-16 flex items-center justify-center">
                <img
                    src="/images/login-image.png"
                    alt="Maritime Professional"
                    className="w-full max-h-full object-contain rounded-2xl"
                />
            </div>
        </div>
    );
}

export default ForgotPassword;

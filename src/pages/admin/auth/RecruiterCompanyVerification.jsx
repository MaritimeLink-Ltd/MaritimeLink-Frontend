import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function RecruiterCompanyVerification() {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);

    // Get company details from navigation state (would come from API in real app)
    const companyData = location.state?.companyData || {
        logo: '',
        name: 'Zyntrify',
        website: 'www.zyntrify.com'
    };

    const handleConfirm = async () => {
        setLoading(true);

        try {
            // TODO: Implement company confirmation API call
            console.log('Company confirmed:', companyData);

            // Navigate to compliance declaration
            navigate('/agent/compliance-declaration');
        } catch (err) {
            console.error('Company confirmation error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDecline = () => {
        // Navigate to compliance declaration using manual details
        navigate('/agent/compliance-declaration', {
            state: { useManualDetails: true, companyData: location.state?.formData || companyData }
        });
    };

    return (
        <div className="h-screen flex overflow-hidden">
            {/* Left Side - Verification */}
            <div className="w-full lg:w-2/5 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 bg-white overflow-y-auto">
                <div className="max-w-md w-full mx-auto lg:mx-0">
                    {/* Logo */}
                    <div className="mb-4 sm:mb-6 -ml-2">
                        <img
                            src="/images/logo.png"
                            alt="MaritimeLink Logo"
                            className="w-20 sm:w-24 h-auto"
                        />
                    </div>

                    {/* Welcome Text */}
                    <p className="text-sm text-gray-700 mb-1">Welcome to MaritimeLink</p>

                    {/* Heading */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Company Details</h1>

                    {/* Company Info Card */}
                    <div className="bg-gray-50 rounded-2xl p-8 mb-6 flex flex-col items-center">
                        {/* Company Logo */}
                        {companyData.logo && (
                            <img
                                src={companyData.logo}
                                alt={`${companyData.name || 'Company'} logo`}
                                className="w-32 h-32 object-contain mb-4"
                            />
                        )}

                        {/* Company Name */}
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">{companyData.name}</h2>

                        {/* Company Website */}
                        <p className="text-sm text-gray-600">{companyData.website}</p>
                    </div>

                    {/* Confirm Button */}
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="w-full bg-[#003971] text-white py-3 px-4 rounded-md hover:bg-[#002855] transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px] mb-4"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Confirming...
                            </>
                        ) : (
                            'Yes, this is my organization'
                        )}
                    </button>

                    {/* Decline Button */}
                    <button
                        onClick={handleDecline}
                        disabled={loading}
                        className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                    >
                        NO this is not my organization use my manual details
                    </button>
                </div>
            </div>

            {/* Right Side - Image */}
            <div className="hidden lg:flex lg:w-3/5 relative py-8 lg:py-12 xl:py-16 pl-4 lg:pl-6 xl:pl-8 pr-8 lg:pr-12 xl:pr-16 items-start justify-center bg-gray-50">
                <img
                    src="/images/signup-image.webp"
                    alt="Maritime Professional"
                    className="w-[735px] max-h-full object-cover rounded-[15px]"
                />
            </div>
        </div>
    );
}

export default RecruiterCompanyVerification;

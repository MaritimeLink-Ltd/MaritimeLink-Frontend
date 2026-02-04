import { useNavigate } from 'react-router-dom';

function RecruiterUnderReview() {
    const navigate = useNavigate();

    const handleDone = () => {
        // Get user type from localStorage and navigate to appropriate dashboard
        const userType = localStorage.getItem('adminUserType');
        
        if (userType === 'training-provider') {
            navigate('/trainingprovider-dashboard');
        } else {
            navigate('/recruiter-dashboard');
        }
    };

    return (
        <div className="h-screen flex overflow-hidden">
            {/* Left Side - Status Message */}
            <div className="w-full lg:w-2/5 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 bg-white overflow-y-auto">
                <div className="max-w-md w-full mx-auto lg:mx-0">
                    {/* Logo */}
                    <div className="mb-6 -ml-2">
                        <img
                            src="/images/logo.png"
                            alt="MaritimeLink Logo"
                            className="w-20 sm:w-24 h-auto"
                        />
                    </div>

                    {/* Welcome Text */}
                    <p className="text-sm text-gray-700 mb-3">Welcome to MaritimeLink</p>

                    {/* Heading */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Under Review</h1>

                    {/* Status Message */}
                    <div className="space-y-3 mb-8">
                        <p className="text-sm text-gray-700">
                            Your information is currently under review byour team.
                        </p>
                        <p className="text-sm text-gray-700">
                            This usually takes a short time.
                        </p>
                        <p className="text-sm text-gray-700">
                            We will notify you by email as soon as approval is completed.
                        </p>
                    </div>

                    {/* Done Button */}
                    <button
                        onClick={handleDone}
                        className="w-full bg-[#003971] text-white py-3 px-4 rounded-md hover:bg-[#002855] transition-colors duration-200 font-medium min-h-[44px]"
                    >
                        Done
                    </button>
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

export default RecruiterUnderReview;

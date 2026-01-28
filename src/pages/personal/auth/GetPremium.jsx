import { useNavigate } from 'react-router-dom';

function GetPremium() {
  const navigate = useNavigate();

  const features = [
    {
      id: 1,
      title: 'Priority Recruiter Visibility',
      description: 'Your profile appears higher when recruiters initiate chats',
    },
    {
      id: 2,
      title: 'Priority Recruiter Visibility',
      description: 'Your profile appears higher when recruiters initiate chats',
    },
    {
      id: 3,
      title: 'Priority Recruiter Visibility',
      description: 'Your profile appears higher when recruiters initiate chats',
    },
    {
      id: 4,
      title: 'Priority Recruiter Visibility',
      description: 'Your profile appears higher when recruiters initiate chats',
    },
  ];

  const handleNavigation = () => {
    const professionType = sessionStorage.getItem('professionType');
    if (professionType === 'officer') {
      navigate('/officer-category');
    } else if (professionType === 'ratings') {
      navigate('/ratings-category');
    } else if (professionType === 'catering') {
      navigate('/catering-medical-category');
    } else {
      navigate('/officer-category');
    }
  };

  const handleGetPremium = () => {
    console.log('Get Premium clicked');
    handleNavigation();
  };

  const handleNotYet = () => {
    console.log('Not Yet clicked');
    handleNavigation();
  };

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      {/* Left Side - Content */}
      <div className="w-full lg:w-2/5 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 overflow-y-auto py-8 sm:py-0">
        <div className="max-w-md w-full mx-auto lg:mx-0">
          {/* Premium Icon */}
          <div className="mb-6">
            <div className="w-14 h-14 bg-[#003971] rounded-full flex items-center justify-center">
              <svg
                className="w-7 h-7 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Get Maritime Premium
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-gray-500 mb-8">Unlock the full experience</p>

          {/* What Premium Gives You */}
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            What Premium Gives You
          </h2>

          {/* Features List */}
          <div className="space-y-3 mb-8">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="p-4 border border-gray-200 rounded-lg bg-white"
              >
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Get Premium Button */}
          <button
            onClick={handleGetPremium}
            className="w-full bg-[#003971] text-white py-3 px-4 rounded-md hover:bg-[#002855] transition-colors duration-200 font-medium flex items-center justify-center gap-2 mb-4 min-h-[44px]"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" />
            </svg>
            Get Premium
          </button>

          {/* Not Yet Link */}
          <button
            onClick={handleNotYet}
            className="w-full text-gray-500 hover:text-gray-700 text-sm font-medium py-2 transition-colors"
          >
            Not Yet
          </button>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-3/5 relative py-8 lg:py-12 xl:py-16 pl-4 lg:pl-6 xl:pl-8 pr-8 lg:pr-12 xl:pr-16">
        <img
          src="/src/assets/premium-image.png"
          alt="Maritime Premium"
          className="w-full h-full object-cover rounded-2xl"
        />
      </div>
    </div>
  );
}

export default GetPremium;

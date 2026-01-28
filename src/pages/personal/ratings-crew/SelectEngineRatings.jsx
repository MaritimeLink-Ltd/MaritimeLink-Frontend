import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SelectEngineRatings = () => {
  const navigate = useNavigate();
  const [selectedRating, setSelectedRating] = useState('Motorman / Oiler');
  const [otherRole, setOtherRole] = useState('');

  const ratings = [
    'Motorman / Oiler',
    'Wiper',
    'Engine Fitter',
    'Welder',
    'Plumber',
    'Hydraulic Technician'
  ];

  const handleNext = () => {
    if (selectedRating) {
      console.log('Selected rating:', selectedRating);
      navigate('/complete-profile', { replace: true });
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-24 bg-white overflow-y-auto">
        <div className="max-w-md w-full mx-auto lg:mx-0">
          {/* Logo */}
          <div className="mb-4 -ml-2">
            <img
              src="/src/assets/logo.png"
              alt="MaritimeLink Logo"
              className="w-28 h-auto"
            />
          </div>

          {/* Content */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Select Engine Ratings
            </h1>
            <p className="text-gray-500 mb-6">Choose Your Engine Ratings Category</p>

            {/* Ratings Options - Pill Style */}
            <div className="flex flex-wrap gap-3 mb-6">
              {ratings.map((rating) => (
                <button
                  key={rating}
                  onClick={() => setSelectedRating(rating)}
                  className={`px-6 py-2.5 rounded-full font-medium transition-all ${selectedRating === rating
                    ? 'bg-[#003971] text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                    }`}
                >
                  {rating}
                </button>
              ))}
            </div>

            {/* Other Option */}
            <div className="mb-8">
              <label className="block text-gray-700 font-medium mb-2">
                Other
              </label>
              <input
                type="text"
                placeholder="Write your role"
                value={otherRole}
                onChange={(e) => setOtherRole(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#003971] focus:border-[#003971]"
              />
            </div>

            {/* Buttons */}
            <button
              onClick={handleNext}
              className="w-full bg-[#003971] text-white py-3 px-4 rounded-md hover:bg-[#002855] transition-colors duration-200 font-medium"
            >
              Next
            </button>

            <button
              onClick={handleGoBack}
              className="w-full text-gray-400 py-3 rounded-md font-medium hover:text-gray-600 transition-colors mt-3"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>

      {/* Right Section - Image */}
      <div className="hidden lg:block lg:w-1/2 relative py-8 lg:py-12 xl:py-16 pr-8 lg:pr-12 xl:pr-16 pl-4 lg:pl-6 xl:pl-8">
        <img
          src="/src/assets/crew-image.png"
          alt="Maritime Engine Ratings"
          className="w-full h-full object-cover rounded-2xl"
        />
      </div>
    </div>
  );
};

export default SelectEngineRatings;

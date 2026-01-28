import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SelectEngineOfficer = () => {
  const navigate = useNavigate();
  const [selectedOfficer, setSelectedOfficer] = useState('Chief Engineer');

  const officers = [
    'Chief Engineer',
    'First Engineer',
    'Second Engineer',
    'Third Engineer',
    'Fourth Engineer',
    'Cargo Engineer',
    'Gas Engineer',
    'Engine Cadet',
    'Electro Technical Officer (ETO)'
  ];

  const handleNext = () => {
    if (selectedOfficer) {
      console.log('Selected officer:', selectedOfficer);
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
              Select Engine Officer
            </h1>
            <p className="text-gray-500 mb-6">Choose Your Engine Officer Category</p>

            {/* Officer Options - Pill Style */}
            <div className="flex flex-wrap gap-3 mb-8">
              {officers.map((officer) => (
                <button
                  key={officer}
                  onClick={() => setSelectedOfficer(officer)}
                  className={`px-6 py-2.5 rounded-full font-medium transition-all ${selectedOfficer === officer
                    ? 'bg-[#003971] text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                    }`}
                >
                  {officer}
                </button>
              ))}
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
          src="/src/assets/category-image.png"
          alt="Maritime Officers"
          className="w-full h-full object-cover rounded-2xl"
        />
      </div>
    </div>
  );
};

export default SelectEngineOfficer;

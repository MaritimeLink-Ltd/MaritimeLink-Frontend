import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SelectProfession() {
  const [selectedProfession, setSelectedProfession] = useState('officer');
  const navigate = useNavigate();

  const professions = [
    {
      id: 'officer',
      title: 'Officer',
      subtitle: 'Deck & Engine Officers',
    },
    {
      id: 'ratings',
      title: 'Ratings and Crew',
      subtitle: 'Ratings & Utility',
    },
    {
      id: 'catering',
      title: 'Catering and Medical',
      subtitle: 'Cooks & Doctors',
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Selected Profession:', selectedProfession);
    sessionStorage.setItem('professionType', selectedProfession);

    // Navigate to ID Upload page for all professions (Changed flow)
    navigate('/id-upload');

    /* Original flow commented out 
    switch (selectedProfession) {
      case 'officer':
        navigate('/officer-category');
        break;
      case 'ratings':
        navigate('/ratings-category');
        break;
      case 'catering':
        navigate('/catering-medical-category');
        break;
      default:
        navigate('/officer-category');
    }
    */
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
              className="w-24 sm:w-28 h-auto"
            />
          </div>

          {/* Welcome Text */}
          <p className="text-sm text-[#003971] mb-1">Welcome to MaritimeLink</p>

          {/* Select Profession Heading */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Profession</h1>

          {/* Subtitle */}
          <p className="text-sm text-gray-500 mb-6">Choose Your Profession Category</p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Profession Options */}
            <div className="space-y-3">
              {professions.map((profession) => (
                <div
                  key={profession.id}
                  onClick={() => setSelectedProfession(profession.id)}
                  className={`relative flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all min-h-[44px] ${selectedProfession === profession.id
                    ? 'border-[#003971] bg-blue-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                >
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900">
                      {profession.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {profession.subtitle}
                    </p>
                  </div>
                  <div className="ml-4">
                    <div
                      className={`w-5 h-5 rounded ${selectedProfession === profession.id
                        ? 'bg-[#003971] flex items-center justify-center'
                        : 'border-2 border-gray-300'
                        }`}
                    >
                      {selectedProfession === profession.id && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Next Button */}
            <button
              type="submit"
              className="w-full bg-[#003971] text-white py-3 px-4 rounded-md hover:bg-[#002855] transition-colors duration-200 font-medium mt-8 min-h-[44px]"
            >
              Next
            </button>
          </form>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-3/5 relative py-8 lg:py-12 xl:py-16 pl-4 lg:pl-6 xl:pl-8 pr-8 lg:pr-12 xl:pr-16">
        <img
          src="/src/assets/profession-image.png"
          alt="Maritime Professionals"
          className="w-full h-full object-cover rounded-2xl"
        />
      </div>
    </div>
  );
}

export default SelectProfession;

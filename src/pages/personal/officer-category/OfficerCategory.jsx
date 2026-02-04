import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OfficerCategory = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Deck Officer');

  const categories = ['Deck Officer', 'Engine Officer'];

  const handleNext = () => {
    if (selectedCategory) {
      console.log('Selected category:', selectedCategory);
      if (selectedCategory === 'Deck Officer') {
        navigate('/select-deck-officer');
      } else if (selectedCategory === 'Engine Officer') {
        navigate('/select-engine-officer');
      }
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Section */}
      <div className="w-full lg:w-2/5 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 bg-white overflow-y-auto py-8 sm:py-0">
        <div className="max-w-md w-full mx-auto lg:mx-0">
          {/* Logo */}
          <div className="mb-4 sm:mb-6 -ml-2">
            <img
              src="/images/logo.png"
              alt="MaritimeLink Logo"
              className="w-24 sm:w-28 h-auto"
            />
          </div>

          {/* Content */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Select Category
            </h1>
            <p className="text-gray-500 mb-6">Choose Your Category</p>

            {/* Category Options */}
            <div className="space-y-4 mb-6">
              {categories.map((category) => (
                <div
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all min-h-[44px] ${selectedCategory === category
                    ? 'border-blue-900 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <span className="text-gray-700 font-medium">{category}</span>
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center ${selectedCategory === category
                      ? 'bg-blue-900'
                      : 'border-2 border-gray-300'
                      }`}
                  >
                    {selectedCategory === category && (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <button
              onClick={handleNext}
              className="w-full bg-[#003971] text-white py-3 px-4 rounded-md hover:bg-[#002855] transition-colors duration-200 font-medium mt-6 min-h-[44px]"
            >
              Next
            </button>

            <button
              onClick={handleCancel}
              className="w-full text-gray-400 py-3 rounded-md font-medium hover:text-gray-600 transition-colors mt-3"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Right Section - Image */}
      <div className="hidden lg:block lg:w-3/5 relative py-8 lg:py-12 xl:py-16 pl-4 lg:pl-6 xl:pl-8 pr-8 lg:pr-12 xl:pr-16">
        <img
          src="/images/category-image.png"
          alt="Maritime Officers"
          className="w-full h-full object-cover rounded-2xl"
        />
      </div>
    </div>
  );
};

export default OfficerCategory;

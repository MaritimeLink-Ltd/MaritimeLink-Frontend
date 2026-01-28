import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CateringMedicalCategory = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Catering');

  const categories = ['Catering', 'Medical'];

  const handleNext = () => {
    if (selectedCategory) {
      console.log('Selected category:', selectedCategory);
      if (selectedCategory === 'Catering') {
        navigate('/select-catering');
      } else if (selectedCategory === 'Medical') {
        navigate('/select-medical');
      }
    }
  };

  const handleCancel = () => {
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
              Select Category
            </h1>
            <p className="text-gray-500 mb-6">Choose Your Category</p>

            {/* Category Options */}
            <div className="space-y-4 mb-6">
              {categories.map((category) => (
                <div
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedCategory === category
                      ? 'border-[#003971] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-gray-700 font-medium">{category}</span>
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center ${
                      selectedCategory === category
                        ? 'bg-[#003971]'
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
              className="w-full bg-[#003971] text-white py-3 px-4 rounded-md hover:bg-[#002855] transition-colors duration-200 font-medium mt-6"
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
      <div className="hidden lg:block lg:w-1/2 relative py-8 lg:py-12 xl:py-16 pr-8 lg:pr-12 xl:pr-16 pl-4 lg:pl-6 xl:pl-8">
        <img
          src="/src/assets/medical-catering.png"
          alt="Maritime Catering and Medical"
          className="w-full h-full object-cover rounded-2xl"
        />
      </div>
    </div>
  );
};

export default CateringMedicalCategory;

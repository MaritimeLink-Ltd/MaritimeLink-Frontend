import { useState } from 'react';

const ProfessionalSummary = ({ onNext, onBack, initialData = {} }) => {
  const [formData, setFormData] = useState({
    professionalSummary: initialData.professionalSummary || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNext = () => {
    onNext(formData);
  };

  return (
    <form className="flex flex-col h-full justify-between">
      <div className="space-y-4">
        {/* Professional Summary */}
        <div>
          <label htmlFor="professionalSummary" className="block text-gray-700 font-medium mb-1 text-sm">
            Professional Summary
          </label>
          <textarea
            id="professionalSummary"
            name="professionalSummary"
            placeholder="Write brief professional summary"
            value={formData.professionalSummary}
            onChange={handleChange}
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm resize-none bg-white transition-colors"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="text-gray-400 py-2 px-8 rounded-lg font-medium hover:text-gray-600 transition-colors text-sm"
        >
          Go Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="bg-[#003971] text-white py-2 px-10 rounded-lg font-medium hover:bg-[#002855] transition-colors text-sm"
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default ProfessionalSummary;

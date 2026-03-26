import { useState, useEffect } from 'react';

const KeySkills = ({ onNext, onBack, initialData = {}, isLoading = false, apiError = null }) => {
  const [skills, setSkills] = useState(initialData.skills || []);
  const [currentSkill, setCurrentSkill] = useState({ name: '', level: 0 });

  useEffect(() => {
    if (initialData && Array.isArray(initialData.skills)) {
      setSkills(initialData.skills);
    }
  }, [initialData]);

  const validateSkill = (entry) => {
    if (!entry.name || entry.level === 0) {
      return 'Please enter a skill name and select a star rating.';
    }
    return null;
  };

  const handleAddSkill = () => {
    const errorMsg = validateSkill(currentSkill);
    if (errorMsg) {
      alert(errorMsg);
      return;
    }
    setSkills([...skills, { ...currentSkill, id: Date.now() }]);
    setCurrentSkill({ name: '', level: 0 });
  };

  const handleRemoveSkill = (id) => {
    setSkills(skills.filter(skill => skill.id !== id));
  };

  const handleStarClick = (level) => {
    setCurrentSkill({ ...currentSkill, level });
  };

  const handleNext = () => {
    let finalSkills = [...skills];
    const isPartial = currentSkill.name !== '' || currentSkill.level > 0;
    if (isPartial) {
      const errorMsg = validateSkill(currentSkill);
      if (errorMsg) {
        alert("Please complete or clear active Skill entry: " + errorMsg);
        return;
      }
      finalSkills.push({ ...currentSkill, id: Date.now() });
    }
    onNext({ skills: finalSkills });
  };

  return (
    <form className="flex flex-col h-full">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 relative z-0">
        {/* Added Skills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="bg-gray-100 rounded-lg px-3 py-2 flex items-center space-x-2"
              >
                <div>
                  <p className="text-xs font-medium text-gray-700">{skill.name}</p>
                  <div className="flex space-x-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-3 h-3 ${star <= skill.level ? 'text-[#003971]' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Skills Input and Star Rating */}
        <div className="grid grid-cols-2 gap-4">
          {/* Skills Input */}
          <div>
            <label className="block text-gray-700 font-medium mb-1 text-sm">
              Skills
            </label>
            <input
              type="text"
              placeholder="Enter skill name"
              value={currentSkill.name}
              onChange={(e) => setCurrentSkill({ ...currentSkill, name: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
            />
          </div>

          {/* Skill Level */}
          <div>
            <label className="block text-gray-700 font-medium mb-1 text-sm">
              Select Skill Level
            </label>
            <div className="flex space-x-2 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  className="focus:outline-none"
                >
                  <svg
                    className={`w-8 h-8 ${star <= currentSkill.level ? 'text-[#003971]' : 'text-gray-300'} hover:text-[#003971] transition-colors`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="flex flex-col pt-4 mt-auto border-t border-gray-100">
        {apiError && (
          <div className="w-full bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm border border-red-100 mb-4 text-right">
            {apiError}
          </div>
        )}
        <div className="flex justify-between items-center w-full">
          <button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            className="text-gray-400 py-2 px-8 rounded-lg font-medium hover:text-gray-600 transition-colors text-sm disabled:opacity-50"
          >
            Go Back
          </button>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleAddSkill}
              disabled={isLoading}
              className="text-[#003971] py-2 px-6 rounded-lg font-medium hover:bg-blue-50 transition-colors text-sm disabled:opacity-50"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={isLoading}
              className="bg-[#003971] text-white py-2 px-10 rounded-lg font-medium hover:bg-[#002855] transition-colors text-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Next'
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default KeySkills;

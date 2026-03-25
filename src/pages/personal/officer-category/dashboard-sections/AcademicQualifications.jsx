import { useState, useEffect } from 'react';

const AcademicQualifications = ({ onNext, onBack, initialData = {}, activeTab: academicTab, setActiveTab: setAcademicTab, isLoading = false, apiError = null }) => {
  const [academicQualifications, setAcademicQualifications] = useState(initialData.academicQualifications || []);

  useEffect(() => {
    if (initialData && Array.isArray(initialData.academicQualifications) && initialData.academicQualifications.length > 0) {
      setAcademicQualifications(initialData.academicQualifications);
    }
    if (initialData && Array.isArray(initialData.stcwCertificates) && initialData.stcwCertificates.length > 0) {
      setStcwCertificates(initialData.stcwCertificates);
    }
  }, [initialData]);
  const [currentAcademic, setCurrentAcademic] = useState({
    qualificationName: '',
    institution: '',
    city: '',
    institutionCountry: '',
    grade: '',
    startDate: '',
    endDate: ''
  });
  const [stcwCertificates, setStcwCertificates] = useState(initialData.stcwCertificates || []);
  const [currentStcw, setCurrentStcw] = useState({
    qualificationName: '',
    certificateNumber: '',
    issuingCountry: '',
    dateOfIssue: '',
    validTill: ''
  });

  const handleAcademicChange = (e) => {
    setCurrentAcademic({
      ...currentAcademic,
      [e.target.name]: e.target.value
    });
  };

  const handleStcwChange = (e) => {
    setCurrentStcw({
      ...currentStcw,
      [e.target.name]: e.target.value
    });
  };

  const validateAcademic = (entry) => {
    if (!entry.qualificationName || !entry.institution || !entry.city || !entry.institutionCountry || !entry.grade || !entry.startDate || !entry.endDate) {
      return 'Please fill in all mandatory Academic fields before adding.';
    }
    if (new Date(entry.startDate) >= new Date(entry.endDate)) {
      return 'Start Date must be before End Date.';
    }
    return null;
  };

  const validateStcw = (entry) => {
    if (!entry.qualificationName || !entry.certificateNumber || !entry.issuingCountry || !entry.dateOfIssue || !entry.validTill) {
      return 'Please fill in all mandatory STCW fields before adding.';
    }
    if (new Date(entry.dateOfIssue) >= new Date(entry.validTill)) {
      return 'Date of Issue must be before Valid Till date.';
    }
    return null;
  };

  const handleAddAcademic = () => {
    const errorMsg = validateAcademic(currentAcademic);
    if (errorMsg) {
      alert(errorMsg);
      return;
    }

    setAcademicQualifications([...academicQualifications, { ...currentAcademic, id: Date.now() }]);
    setCurrentAcademic({
      qualificationName: '',
      institution: '',
      city: '',
      institutionCountry: '',
      grade: '',
      startDate: '',
      endDate: ''
    });
  };

  const handleRemoveAcademic = (id) => {
    setAcademicQualifications(academicQualifications.filter(academic => academic.id !== id));
  };

  const handleAddStcw = () => {
    const errorMsg = validateStcw(currentStcw);
    if (errorMsg) {
      alert(errorMsg);
      return;
    }

    setStcwCertificates([...stcwCertificates, { ...currentStcw, id: Date.now() }]);
    setCurrentStcw({
      qualificationName: '',
      certificateNumber: '',
      issuingCountry: '',
      dateOfIssue: '',
      validTill: ''
    });
  };

  const handleRemoveStcw = (id) => {
    setStcwCertificates(stcwCertificates.filter(stcw => stcw.id !== id));
  };

  const handleNext = () => {
    let finalAcademic = [...academicQualifications];
    let finalStcw = [...stcwCertificates];

    const isPartialAcademic = Object.values(currentAcademic).some(val => val !== '');
    if (isPartialAcademic) {
      const errorMsg = validateAcademic(currentAcademic);
      if (errorMsg) {
        alert("Please complete or clear the active Academic entry before continuing: " + errorMsg);
        return;
      }
      finalAcademic.push({ ...currentAcademic, id: Date.now() });
    }

    const isPartialStcw = Object.values(currentStcw).some(val => val !== '');
    if (isPartialStcw) {
      const errorMsg = validateStcw(currentStcw);
      if (errorMsg) {
        alert("Please complete or clear the active STCW entry before continuing: " + errorMsg);
        return;
      }
      finalStcw.push({ ...currentStcw, id: Date.now() + 1 });
    }

    onNext({ academicQualifications: finalAcademic, stcwCertificates: finalStcw });
  };

  return (
    <form className="flex flex-col h-full">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 relative z-0">
        {/* Tab Buttons */}
        <div className="flex space-x-2 mb-6">
          <button
            type="button"
            onClick={() => setAcademicTab('academic')}
            className={`px-6 py-2 rounded-full font-medium transition-colors text-sm ${academicTab === 'academic'
              ? 'bg-[#003971] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            Academic Qualifications
          </button>
          <button
            type="button"
            onClick={() => setAcademicTab('stcw')}
            className={`px-6 py-2 rounded-full font-medium transition-colors text-sm ${academicTab === 'stcw'
              ? 'bg-[#003971] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            STCW Certificate
          </button>
        </div>

        {/* Academic Qualifications Tab Content */}
        {academicTab === 'academic' && (
          <>
            {/* Added Academic Qualifications */}
            {academicQualifications.length > 0 && (
              <div className="space-y-3 mb-4">
                {academicQualifications.map((academic) => (
                  <div
                    key={academic.id}
                    className="bg-gray-50 rounded-lg p-3 relative"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveAcademic(academic.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <p className="text-sm font-semibold text-gray-800">{academic.qualificationName}</p>
                    <p className="text-xs text-gray-600">
                      {academic.institution}
                      {academic.city ? `, ${academic.city}` : ''}
                      {academic.institutionCountry ? ` - ${academic.institutionCountry}` : ''}
                    </p>
                    <p className="text-xs text-gray-500">
                      {academic.startDate && academic.endDate ?
                        `${new Date(academic.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} to ${new Date(academic.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                        : 'Dates not specified'}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Academic Qualification Form */}
            <div className="space-y-4">
              <div>
                <label htmlFor="qualificationName" className="block text-gray-700 font-medium mb-1 text-sm">
                  Qualification Name
                </label>
                <input
                  type="text"
                  id="qualificationName"
                  name="qualificationName"
                  placeholder="Enter program/class name"
                  value={currentAcademic.qualificationName}
                  onChange={handleAcademicChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                />
              </div>

              <div>
                <label htmlFor="institution" className="block text-gray-700 font-medium mb-1 text-sm">
                  Institution
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                  <input
                    type="text"
                    id="institution"
                    name="institution"
                    placeholder="Enter your institute name"
                    value={currentAcademic.institution}
                    onChange={handleAcademicChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                  />
                  <input
                    type="text"
                    id="institutionCity"
                    name="city"
                    placeholder="City"
                    value={currentAcademic.city}
                    onChange={handleAcademicChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                  />
                  <input
                    type="text"
                    id="institutionCountry"
                    name="institutionCountry"
                    placeholder="Institution Country"
                    value={currentAcademic.institutionCountry}
                    onChange={handleAcademicChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="grade" className="block text-gray-700 font-medium mb-1 text-sm">
                  Grade
                </label>
                <input
                  type="text"
                  id="grade"
                  name="grade"
                  placeholder="Enter your grade"
                  value={currentAcademic.grade}
                  onChange={handleAcademicChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-gray-700 font-medium mb-1 text-sm">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    placeholder="dd/mm/yyyy"
                    value={currentAcademic.startDate}
                    onChange={handleAcademicChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-gray-700 font-medium mb-1 text-sm">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    placeholder="dd/mm/yyyy"
                    value={currentAcademic.endDate}
                    onChange={handleAcademicChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* STCW Certificate Tab Content */}
        {academicTab === 'stcw' && (
          <>
            {/* Added STCW Certificates */}
            {stcwCertificates.length > 0 && (
              <div className="space-y-3 mb-4">
                {stcwCertificates.map((stcw) => (
                  <div
                    key={stcw.id}
                    className="bg-gray-50 rounded-lg p-3 relative"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveStcw(stcw.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <p className="text-sm font-semibold text-gray-800">{stcw.qualificationName}</p>
                    <p className="text-xs text-gray-600">{stcw.issuingCountry}</p>
                    <p className="text-xs text-gray-500">
                      {stcw.dateOfIssue && stcw.validTill ?
                        `${new Date(stcw.dateOfIssue).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} to ${new Date(stcw.validTill).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                        : 'Dates not specified'}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* STCW Certificate Form */}
            <div className="space-y-4">
              <div>
                <label htmlFor="stcwQualification" className="block text-gray-700 font-medium mb-1 text-sm">
                  STCW Qualification
                </label>
                <input
                  type="text"
                  id="stcwQualification"
                  name="qualificationName"
                  placeholder="Enter qualification name"
                  value={currentStcw.qualificationName}
                  onChange={handleStcwChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                />
              </div>

              <div>
                <label htmlFor="certificateNumber" className="block text-gray-700 font-medium mb-1 text-sm">
                  Certificate Number
                </label>
                <input
                  type="text"
                  id="certificateNumber"
                  name="certificateNumber"
                  placeholder="Enter certificate number"
                  value={currentStcw.certificateNumber}
                  onChange={handleStcwChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                />
              </div>

              <div>
                <label htmlFor="stcwIssuingCountry" className="block text-gray-700 font-medium mb-1 text-sm">
                  Issuing Country
                </label>
                <input
                  type="text"
                  id="stcwIssuingCountry"
                  name="issuingCountry"
                  placeholder="Enter country name"
                  value={currentStcw.issuingCountry}
                  onChange={handleStcwChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="stcwDateOfIssue" className="block text-gray-700 font-medium mb-1 text-sm">
                    Date Of Issue
                  </label>
                  <input
                    type="date"
                    id="stcwDateOfIssue"
                    name="dateOfIssue"
                    placeholder="dd/mm/yyyy"
                    value={currentStcw.dateOfIssue}
                    onChange={handleStcwChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="stcwValidTill" className="block text-gray-700 font-medium mb-1 text-sm">
                    Valid Till
                  </label>
                  <input
                    type="date"
                    id="stcwValidTill"
                    name="validTill"
                    placeholder="dd/mm/yyyy"
                    value={currentStcw.validTill}
                    onChange={handleStcwChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="flex flex-col pt-6 mt-auto border-t border-gray-100">
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
              onClick={academicTab === 'academic' ? handleAddAcademic : handleAddStcw}
              disabled={isLoading}
              className="text-[#003971] py-2 px-6 rounded-lg font-medium hover:bg-blue-50 transition-colors text-sm disabled:opacity-50"
            >
              Save & Add Another
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

export default AcademicQualifications;

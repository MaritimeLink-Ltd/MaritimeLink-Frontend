import { useState } from 'react';

const AcademicQualifications = ({ onNext, onBack, initialData = {}, activeTab: academicTab, setActiveTab: setAcademicTab }) => {
  const [academicQualifications, setAcademicQualifications] = useState(initialData.academicQualifications || []);
  const [currentAcademic, setCurrentAcademic] = useState({
    qualificationName: '',
    institution: '',
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

  const handleAddAcademic = () => {
    if (currentAcademic.qualificationName && currentAcademic.institution) {
      // Validate dates if both are provided
      if (currentAcademic.startDate && currentAcademic.endDate) {
        const start = new Date(currentAcademic.startDate);
        const end = new Date(currentAcademic.endDate);
        if (start >= end) {
          alert('Start Date must be before End Date');
          return;
        }
      }
      setAcademicQualifications([...academicQualifications, { ...currentAcademic, id: Date.now() }]);
      setCurrentAcademic({
        qualificationName: '',
        institution: '',
        grade: '',
        startDate: '',
        endDate: ''
      });
    }
  };

  const handleRemoveAcademic = (id) => {
    setAcademicQualifications(academicQualifications.filter(academic => academic.id !== id));
  };

  const handleAddStcw = () => {
    if (currentStcw.qualificationName && currentStcw.certificateNumber) {
      // Validate dates if both are provided
      if (currentStcw.dateOfIssue && currentStcw.validTill) {
        const issueDate = new Date(currentStcw.dateOfIssue);
        const validDate = new Date(currentStcw.validTill);
        if (issueDate >= validDate) {
          alert('Date of Issue must be before Valid Till date');
          return;
        }
      }
      setStcwCertificates([...stcwCertificates, { ...currentStcw, id: Date.now() }]);
      setCurrentStcw({
        qualificationName: '',
        certificateNumber: '',
        issuingCountry: '',
        dateOfIssue: '',
        validTill: ''
      });
    }
  };

  const handleRemoveStcw = (id) => {
    setStcwCertificates(stcwCertificates.filter(stcw => stcw.id !== id));
  };

  const handleNext = () => {
    let finalAcademic = [...academicQualifications];
    let finalStcw = [...stcwCertificates];

    if (currentAcademic.qualificationName && currentAcademic.institution) {
      if (!currentAcademic.startDate || !currentAcademic.endDate || new Date(currentAcademic.startDate) < new Date(currentAcademic.endDate)) {
        finalAcademic.push({ ...currentAcademic, id: Date.now() });
      }
    }

    if (currentStcw.qualificationName && currentStcw.certificateNumber) {
      if (!currentStcw.dateOfIssue || !currentStcw.validTill || new Date(currentStcw.dateOfIssue) < new Date(currentStcw.validTill)) {
        finalStcw.push({ ...currentStcw, id: Date.now() + 1 });
      }
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
                    <p className="text-xs text-gray-600">{academic.institution}</p>
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
                <input
                  type="text"
                  id="institution"
                  name="institution"
                  placeholder="Enter your institute name"
                  value={currentAcademic.institution}
                  onChange={handleAcademicChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                />
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
      <div className="flex justify-between items-center pt-6 mt-auto border-t border-gray-100">
        <button
          type="button"
          onClick={onBack}
          className="text-gray-400 py-2 px-8 rounded-lg font-medium hover:text-gray-600 transition-colors text-sm"
        >
          Go Back
        </button>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={academicTab === 'academic' ? handleAddAcademic : handleAddStcw}
            className="text-[#003971] py-2 px-6 rounded-lg font-medium hover:bg-blue-50 transition-colors text-sm"
          >
            Save & Add Another
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="bg-[#003971] text-white py-2 px-10 rounded-lg font-medium hover:bg-[#002855] transition-colors text-sm"
          >
            Next
          </button>
        </div>
      </div>
    </form>
  );
};

export default AcademicQualifications;

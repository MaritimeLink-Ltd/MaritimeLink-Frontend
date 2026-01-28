import { useState } from 'react';

const MedicalTravelDocs = ({ onNext, onBack, initialData = {} }) => {
  const [medicalTab, setMedicalTab] = useState('medical');
  const [medicalDocuments, setMedicalDocuments] = useState(initialData.medicalDocuments || []);
  const [currentMedical, setCurrentMedical] = useState({
    certificateName: '',
    certificateNumber: '',
    issuingCountry: '',
    dateOfIssue: '',
    validTill: ''
  });
  const [travelDocuments, setTravelDocuments] = useState(initialData.travelDocuments || []);
  const [currentTravel, setCurrentTravel] = useState({
    documentName: '',
    documentNumber: '',
    issuingCountry: '',
    dateOfIssue: '',
    validTill: ''
  });

  const handleMedicalChange = (e) => {
    setCurrentMedical({
      ...currentMedical,
      [e.target.name]: e.target.value
    });
  };

  const handleTravelChange = (e) => {
    setCurrentTravel({
      ...currentTravel,
      [e.target.name]: e.target.value
    });
  };

  const handleAddMedical = () => {
    if (currentMedical.certificateName && currentMedical.certificateNumber) {
      setMedicalDocuments([...medicalDocuments, { ...currentMedical, id: Date.now() }]);
      setCurrentMedical({
        certificateName: '',
        certificateNumber: '',
        issuingCountry: '',
        dateOfIssue: '',
        validTill: ''
      });
    }
  };

  const handleRemoveMedical = (id) => {
    setMedicalDocuments(medicalDocuments.filter(doc => doc.id !== id));
  };

  const handleAddTravel = () => {
    if (currentTravel.documentName && currentTravel.documentNumber) {
      setTravelDocuments([...travelDocuments, { ...currentTravel, id: Date.now() }]);
      setCurrentTravel({
        documentName: '',
        documentNumber: '',
        issuingCountry: '',
        dateOfIssue: '',
        validTill: ''
      });
    }
  };

  const handleRemoveTravel = (id) => {
    setTravelDocuments(travelDocuments.filter(doc => doc.id !== id));
  };

  const handleNext = () => {
    onNext({ medicalDocuments, travelDocuments });
  };

  return (
    <form className="flex flex-col h-full">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {/* Tab Buttons */}
        <div className="flex space-x-2 mb-6">
          <button
            type="button"
            onClick={() => setMedicalTab('medical')}
            className={`px-6 py-2 rounded-full font-medium transition-colors text-sm ${medicalTab === 'medical'
                ? 'bg-[#003971] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            Medical Document
          </button>
          <button
            type="button"
            onClick={() => setMedicalTab('travel')}
            className={`px-6 py-2 rounded-full font-medium transition-colors text-sm ${medicalTab === 'travel'
                ? 'bg-[#003971] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            Travel Document
          </button>
        </div>

        {/* Medical Document Tab Content */}
        {medicalTab === 'medical' && (
          <>
            {/* Added Medical Documents */}
            {medicalDocuments.length > 0 && (
              <div className="space-y-3 mb-4">
                {medicalDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-gray-50 rounded-lg p-3 relative"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveMedical(doc.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <p className="text-sm font-semibold text-gray-800">{doc.certificateName}</p>
                    <p className="text-xs text-gray-600">{doc.issuingCountry}</p>
                    <p className="text-xs text-gray-500">
                      {doc.dateOfIssue && doc.validTill ?
                        `${new Date(doc.dateOfIssue).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} to ${new Date(doc.validTill).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                        : 'Dates not specified'}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Medical Document Form */}
            <div className="space-y-4">
              <div>
                <label htmlFor="certificateName" className="block text-gray-700 font-medium mb-1 text-sm">
                  Certificate Name
                </label>
                <input
                  type="text"
                  id="certificateName"
                  name="certificateName"
                  placeholder="Enter certificate name"
                  value={currentMedical.certificateName}
                  onChange={handleMedicalChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label htmlFor="medicalCertificateNumber" className="block text-gray-700 font-medium mb-1 text-sm">
                  Certificate Number
                </label>
                <input
                  type="text"
                  id="medicalCertificateNumber"
                  name="certificateNumber"
                  placeholder="Enter certificate number"
                  value={currentMedical.certificateNumber}
                  onChange={handleMedicalChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label htmlFor="medicalIssuingCountry" className="block text-gray-700 font-medium mb-1 text-sm">
                  Issuing Country
                </label>
                <input
                  type="text"
                  id="medicalIssuingCountry"
                  name="issuingCountry"
                  placeholder="Enter country name"
                  value={currentMedical.issuingCountry}
                  onChange={handleMedicalChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="medicalDateOfIssue" className="block text-gray-700 font-medium mb-1 text-sm">
                    Date Of Issue
                  </label>
                  <input
                    type="date"
                    id="medicalDateOfIssue"
                    name="dateOfIssue"
                    placeholder="dd/mm/yyyy"
                    value={currentMedical.dateOfIssue}
                    onChange={handleMedicalChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="medicalValidTill" className="block text-gray-700 font-medium mb-1 text-sm">
                    Valid Till
                  </label>
                  <input
                    type="date"
                    id="medicalValidTill"
                    name="validTill"
                    placeholder="dd/mm/yyyy"
                    value={currentMedical.validTill}
                    onChange={handleMedicalChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Travel Document Tab Content */}
        {medicalTab === 'travel' && (
          <>
            {/* Added Travel Documents */}
            {travelDocuments.length > 0 && (
              <div className="space-y-3 mb-4">
                {travelDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-gray-50 rounded-lg p-3 relative"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveTravel(doc.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <p className="text-sm font-semibold text-gray-800">{doc.documentName}</p>
                    <p className="text-xs text-gray-600">{doc.issuingCountry}</p>
                    <p className="text-xs text-gray-500">
                      {doc.dateOfIssue && doc.validTill ?
                        `${new Date(doc.dateOfIssue).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} to ${new Date(doc.validTill).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                        : 'Dates not specified'}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Travel Document Form */}
            <div className="space-y-4">
              <div>
                <label htmlFor="documentName" className="block text-gray-700 font-medium mb-1 text-sm">
                  Document Name
                </label>
                <input
                  type="text"
                  id="documentName"
                  name="documentName"
                  placeholder="Enter document name"
                  value={currentTravel.documentName}
                  onChange={handleTravelChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label htmlFor="travelDocumentNumber" className="block text-gray-700 font-medium mb-1 text-sm">
                  Document Number
                </label>
                <input
                  type="text"
                  id="travelDocumentNumber"
                  name="documentNumber"
                  placeholder="Enter document number"
                  value={currentTravel.documentNumber}
                  onChange={handleTravelChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label htmlFor="travelIssuingCountry" className="block text-gray-700 font-medium mb-1 text-sm">
                  Issuing Country
                </label>
                <input
                  type="text"
                  id="travelIssuingCountry"
                  name="issuingCountry"
                  placeholder="Enter country name"
                  value={currentTravel.issuingCountry}
                  onChange={handleTravelChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="travelDateOfIssue" className="block text-gray-700 font-medium mb-1 text-sm">
                    Date Of Issue
                  </label>
                  <input
                    type="date"
                    id="travelDateOfIssue"
                    name="dateOfIssue"
                    placeholder="dd/mm/yyyy"
                    value={currentTravel.dateOfIssue}
                    onChange={handleTravelChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="travelValidTill" className="block text-gray-700 font-medium mb-1 text-sm">
                    Valid Till
                  </label>
                  <input
                    type="date"
                    id="travelValidTill"
                    name="validTill"
                    placeholder="dd/mm/yyyy"
                    value={currentTravel.validTill}
                    onChange={handleTravelChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
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
            onClick={medicalTab === 'medical' ? handleAddMedical : handleAddTravel}
            className="text-[#003971] py-2 px-6 rounded-lg font-medium hover:bg-blue-50 transition-colors text-sm"
          >
            + Add Another
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

export default MedicalTravelDocs;

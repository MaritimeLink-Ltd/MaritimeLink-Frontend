import { useState, useEffect } from 'react';

const ProfessionalLicensesCertificates = ({ onNext, onBack, initialData = {}, activeTab, setActiveTab, isLoading = false, apiError = null }) => {
  const [licenses, setLicenses] = useState(initialData.licenses || []);

  useEffect(() => {
    if (initialData && Array.isArray(initialData.licenses)) {
      setLicenses(initialData.licenses);
    }
    if (initialData && Array.isArray(initialData.certificates)) {
      setCertificates(initialData.certificates);
    }
  }, [initialData]);
  const [currentLicense, setCurrentLicense] = useState({
    licenseName: '',
    licenseNumber: '',
    issuingCountry: '',
    dateOfIssue: '',
    validTill: ''
  });
  const [certificates, setCertificates] = useState(initialData.certificates || []);
  const [currentCertificate, setCurrentCertificate] = useState({
    licenseName: '',
    licenseNumber: '',
    issuingCountry: '',
    dateOfIssue: '',
    validTill: ''
  });
  const [licenseDateError, setLicenseDateError] = useState('');
  const [certificateDateError, setCertificateDateError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleLicenseChange = (e) => {
    setCurrentLicense({
      ...currentLicense,
      [e.target.name]: e.target.value
    });
    if (e.target.name === 'dateOfIssue') {
      setLicenseDateError('');
    }
  };

  const handleCertificateChange = (e) => {
    setCurrentCertificate({
      ...currentCertificate,
      [e.target.name]: e.target.value
    });
    if (e.target.name === 'dateOfIssue') {
      setCertificateDateError('');
    }
  };

  const validateLicense = (entry) => {
    if (!entry.licenseName || !entry.licenseNumber || !entry.issuingCountry || !entry.dateOfIssue || !entry.validTill) {
      return 'Please fill in all mandatory License fields before adding.';
    }
    const issueDate = new Date(entry.dateOfIssue);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (issueDate > today) return 'Please enter valid issue date.';
    if (issueDate >= new Date(entry.validTill)) return 'Date of Issue must be before Valid Till date.';
    return null;
  };

  const validateCertificate = (entry) => {
    if (!entry.licenseName || !entry.licenseNumber || !entry.issuingCountry || !entry.dateOfIssue || !entry.validTill) {
      return 'Please fill in all mandatory Certificate fields before adding.';
    }
    const issueDate = new Date(entry.dateOfIssue);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (issueDate > today) return 'Please enter valid issue date.';
    if (issueDate >= new Date(entry.validTill)) return 'Date of Issue must be before Valid Till date.';
    return null;
  };

  const handleAddLicense = () => {
    const errorMsg = validateLicense(currentLicense);
    if (errorMsg) {
      setLicenseDateError(errorMsg);
      return;
    }
    setLicenseDateError('');
    setLicenses([...licenses, { ...currentLicense, id: Date.now() }]);
    setCurrentLicense({
      licenseName: '',
      licenseNumber: '',
      issuingCountry: '',
      dateOfIssue: '',
      validTill: ''
    });
  };

  const handleRemoveLicense = (id) => {
    setLicenses(licenses.filter(license => license.id !== id));
  };

  const handleAddCertificate = () => {
    const errorMsg = validateCertificate(currentCertificate);
    if (errorMsg) {
      setCertificateDateError(errorMsg);
      return;
    }
    setCertificateDateError('');
    setCertificates([...certificates, { ...currentCertificate, id: Date.now() }]);
    setCurrentCertificate({
      licenseName: '',
      licenseNumber: '',
      issuingCountry: '',
      dateOfIssue: '',
      validTill: ''
    });
  };

  const handleRemoveCertificate = (id) => {
    setCertificates(certificates.filter(cert => cert.id !== id));
  };

  const handleNext = () => {
    let finalLicenses = [...licenses];
    let finalCertificates = [...certificates];

    const isPartialLicense = Object.values(currentLicense).some(val => val !== '');
    if (isPartialLicense) {
      const errorMsg = validateLicense(currentLicense);
      if (errorMsg) {
        setLicenseDateError("Please complete or clear active License entry: " + errorMsg);
        return;
      }
      finalLicenses.push({ ...currentLicense, id: Date.now() });
    }

    const isPartialCertificate = Object.values(currentCertificate).some(val => val !== '');
    if (isPartialCertificate) {
      const errorMsg = validateCertificate(currentCertificate);
      if (errorMsg) {
        setCertificateDateError("Please complete or clear active Certificate entry: " + errorMsg);
        return;
      }
      finalCertificates.push({ ...currentCertificate, id: Date.now() + 1 });
    }

    onNext({ licenses: finalLicenses, certificates: finalCertificates });
  };

  return (
    <form className="flex flex-col h-full">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {/* Tab Buttons */}
        <div className="flex space-x-2 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('licenses')}
            className={`px-6 py-2 rounded-full font-medium transition-colors text-sm ${activeTab === 'licenses'
              ? 'bg-[#003971] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            Professional Licenses
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('certificates')}
            className={`px-6 py-2 rounded-full font-medium transition-colors text-sm ${activeTab === 'certificates'
              ? 'bg-[#003971] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            Certificates
          </button>
        </div>

        {/* Licenses Tab Content */}
        {activeTab === 'licenses' && (
          <>
            {/* Added Licenses */}
            {licenses.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {licenses.map((license) => (
                  <div
                    key={license.id}
                    className="bg-gray-50 rounded-lg p-3 relative"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveLicense(license.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <p className="text-sm font-semibold text-gray-800">{license.licenseName}</p>
                    <p className="text-xs text-gray-600">{license.issuingCountry}</p>
                    <p className="text-xs text-gray-500">
                      {license.dateOfIssue && license.validTill ?
                        `${new Date(license.dateOfIssue).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} to ${new Date(license.validTill).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                        : 'Dates not specified'}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* License Form */}
            <div className="space-y-4">
              <div>
                <label htmlFor="licenseName" className="block text-gray-700 font-medium mb-1 text-sm">
                  License Name
                </label>
                <input
                  type="text"
                  id="licenseName"
                  name="licenseName"
                  placeholder="Enter your license name"
                  value={currentLicense.licenseName}
                  onChange={handleLicenseChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                />
              </div>

              <div>
                <label htmlFor="licenseNumber" className="block text-gray-700 font-medium mb-1 text-sm">
                  License Number
                </label>
                <input
                  type="text"
                  id="licenseNumber"
                  name="licenseNumber"
                  placeholder="Enter license number"
                  value={currentLicense.licenseNumber}
                  onChange={handleLicenseChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                />
              </div>

              <div>
                <label htmlFor="issuingCountry" className="block text-gray-700 font-medium mb-1 text-sm">
                  Issuing Country
                </label>
                <input
                  type="text"
                  id="issuingCountry"
                  name="issuingCountry"
                  placeholder="Enter issuing authority name"
                  value={currentLicense.issuingCountry}
                  onChange={handleLicenseChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dateOfIssue" className="block text-gray-700 font-medium mb-1 text-sm">
                    Date Of Issue
                  </label>
                  <input
                    type="date"
                    id="dateOfIssue"
                    name="dateOfIssue"
                    placeholder="dd/mm/yyyy"
                    value={currentLicense.dateOfIssue}
                    onChange={handleLicenseChange}
                    max={today}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                  />
                  {licenseDateError && (
                    <p className="text-red-500 text-xs mt-1">{licenseDateError}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="validTill" className="block text-gray-700 font-medium mb-1 text-sm">
                    Valid Till
                  </label>
                  <input
                    type="date"
                    id="validTill"
                    name="validTill"
                    placeholder="dd/mm/yyyy"
                    value={currentLicense.validTill}
                    onChange={handleLicenseChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Certificates Tab Content */}
        {activeTab === 'certificates' && (
          <>
            {/* Added Certificates */}
            {certificates.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="bg-gray-50 rounded-lg p-3 relative"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveCertificate(cert.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <p className="text-sm font-semibold text-gray-800">{cert.licenseName}</p>
                    <p className="text-xs text-gray-600">{cert.issuingCountry}</p>
                    <p className="text-xs text-gray-500">
                      {cert.dateOfIssue && cert.validTill ?
                        `${new Date(cert.dateOfIssue).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} to ${new Date(cert.validTill).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                        : 'Dates not specified'}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Certificate Form */}
            <div className="space-y-4">
              <div>
                <label htmlFor="certificateName" className="block text-gray-700 font-medium mb-1 text-sm">
                  License Name
                </label>
                <input
                  type="text"
                  id="certificateName"
                  name="licenseName"
                  placeholder="Enter your license name"
                  value={currentCertificate.licenseName}
                  onChange={handleCertificateChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                />
              </div>

              <div>
                <label htmlFor="certificateNumber" className="block text-gray-700 font-medium mb-1 text-sm">
                  License Number
                </label>
                <input
                  type="text"
                  id="certificateNumber"
                  name="licenseNumber"
                  placeholder="Enter license number"
                  value={currentCertificate.licenseNumber}
                  onChange={handleCertificateChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                />
              </div>

              <div>
                <label htmlFor="certificateCountry" className="block text-gray-700 font-medium mb-1 text-sm">
                  Issuing Country
                </label>
                <input
                  type="text"
                  id="certificateCountry"
                  name="issuingCountry"
                  placeholder="Enter issuing authority name"
                  value={currentCertificate.issuingCountry}
                  onChange={handleCertificateChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="certificateDateOfIssue" className="block text-gray-700 font-medium mb-1 text-sm">
                    Date Of Issue
                  </label>
                  <input
                    type="date"
                    id="certificateDateOfIssue"
                    name="dateOfIssue"
                    placeholder="dd/mm/yyyy"
                    value={currentCertificate.dateOfIssue}
                    onChange={handleCertificateChange}
                    max={today}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                  />
                  {certificateDateError && (
                    <p className="text-red-500 text-xs mt-1">{certificateDateError}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="certificateValidTill" className="block text-gray-700 font-medium mb-1 text-sm">
                    Valid Till
                  </label>
                  <input
                    type="date"
                    id="certificateValidTill"
                    name="validTill"
                    placeholder="dd/mm/yyyy"
                    value={currentCertificate.validTill}
                    onChange={handleCertificateChange}
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
              onClick={activeTab === 'licenses' ? handleAddLicense : handleAddCertificate}
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
    </form >
  );
};

export default ProfessionalLicensesCertificates;

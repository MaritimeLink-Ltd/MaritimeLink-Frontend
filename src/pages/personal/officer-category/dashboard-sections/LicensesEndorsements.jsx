import { useState, useEffect } from 'react';
import CountrySelect from '../../../../components/common/CountrySelect';
import CountryDisplay from '../../../../components/common/CountryDisplay';
import resumeService from '../../../../services/resumeService';
import { getApiErrorMessage } from '../../../../utils/apiError';
import { markEdited } from '../../../../utils/resumeStepSync';
import { sortLicenses } from '../../../../utils/resumeEntryOrder';

const EMPTY_LICENSE = {
  licenseName: '',
  licenseNumber: '',
  issuingCountry: '',
  dateOfIssue: '',
  validTill: ''
};

/** Fold a correction into its entry, flagging saved ones for a PUT. */
const applyEdit = (list, id, fields) =>
  list.map((item) =>
    item.id === id
      ? (item._persisted ? markEdited({ ...item, ...fields }) : { ...item, ...fields })
      : item
  );

const LicensesEndorsements = ({ onNext, onBack, initialData = {}, activeTab, setActiveTab, isLoading = false, apiError = null, onLocalChange }) => {
  const [licenses, setLicenses] = useState(initialData.licenses || []);

  useEffect(() => {
    if (initialData && Array.isArray(initialData.licenses)) {
      setLicenses(initialData.licenses);
    }
    if (initialData && Array.isArray(initialData.endorsements)) {
      setEndorsements(initialData.endorsements);
    }
  }, [initialData]);
  const [currentLicense, setCurrentLicense] = useState(EMPTY_LICENSE);
  const [endorsements, setEndorsements] = useState(initialData.endorsements || []);
  const [currentEndorsement, setCurrentEndorsement] = useState(EMPTY_LICENSE);
  // id of the entry being corrected in each tab, or null while adding
  const [editingLicenseId, setEditingLicenseId] = useState(null);
  const [editingEndorsementId, setEditingEndorsementId] = useState(null);

  // Newest first, so a current licence sits above one issued years ago.
  const orderedLicenses = sortLicenses(licenses);
  const orderedEndorsements = sortLicenses(endorsements);

  const handleLicenseChange = (e) => {
    setCurrentLicense({
      ...currentLicense,
      [e.target.name]: e.target.value
    });
  };

  const handleEndorsementChange = (e) => {
    setCurrentEndorsement({
      ...currentEndorsement,
      [e.target.name]: e.target.value
    });
  };

  const validateLicense = (entry) => {
    if (!entry.licenseName || !entry.licenseNumber || !entry.issuingCountry || !entry.dateOfIssue) {
      return 'Please fill in all mandatory License fields before adding.';
    }
    if (entry.validTill && new Date(entry.dateOfIssue) >= new Date(entry.validTill)) {
      return 'Date of Issue must be before Valid Till date.';
    }
    return null;
  };

  const validateEndorsement = (entry) => {
    if (!entry.licenseName || !entry.licenseNumber || !entry.issuingCountry || !entry.dateOfIssue) {
      return 'Please fill in all mandatory Endorsement fields before adding.';
    }
    if (entry.validTill && new Date(entry.dateOfIssue) >= new Date(entry.validTill)) {
      return 'Date of Issue must be before Valid Till date.';
    }
    return null;
  };

  // Report this step's state up to the dashboard on every change, not just on
  // "Next" — "Save & Continue Later" serializes the dashboard's snapshot, so
  // without this it can undo a removal or drop an entry. The trailing form
  // entries are reported too (once they validate), since the user may fill one
  // in and save from the sidebar without pressing this step's Save button.
  useEffect(() => {
    const licenseValid = validateLicense(currentLicense) === null;
    const endorsementValid = validateEndorsement(currentEndorsement) === null;
    onLocalChange?.({
      licenses,
      endorsements,
      __drafts: {
        licenses: editingLicenseId === null && licenseValid ? currentLicense : null,
        endorsements: editingEndorsementId === null && endorsementValid ? currentEndorsement : null,
      },
      // In-flight corrections replace their entry rather than adding one.
      __edits: {
        licenses: editingLicenseId !== null && licenseValid
          ? { id: editingLicenseId, fields: currentLicense } : null,
        endorsements: editingEndorsementId !== null && endorsementValid
          ? { id: editingEndorsementId, fields: currentEndorsement } : null,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [licenses, endorsements, currentLicense, currentEndorsement, editingLicenseId, editingEndorsementId]);

  const handleAddLicense = () => {
    const errorMsg = validateLicense(currentLicense);
    if (errorMsg) {
      alert(errorMsg);
      return;
    }
    if (editingLicenseId !== null) {
      setLicenses(applyEdit(licenses, editingLicenseId, currentLicense));
      setEditingLicenseId(null);
    } else {
      setLicenses([...licenses, { ...currentLicense, id: Date.now() }]);
    }
    setCurrentLicense(EMPTY_LICENSE);
  };

  const handleEditLicense = (license) => {
    const { id, _persisted, _dirty, ...fields } = license;
    setCurrentLicense({ ...EMPTY_LICENSE, ...fields });
    setEditingLicenseId(id);
  };

  const handleCancelLicenseEdit = () => {
    setEditingLicenseId(null);
    setCurrentLicense(EMPTY_LICENSE);
  };

  const handleRemoveLicense = async (license) => {
    if (license._persisted) {
      try {
        await resumeService.deleteLicense(license.id);
      } catch (error) {
        alert(getApiErrorMessage(error, 'Failed to delete license. Please try again.'));
        return;
      }
    }
    if (editingLicenseId === license.id) handleCancelLicenseEdit();
    setLicenses(licenses.filter(l => l.id !== license.id));
  };

  const handleAddEndorsement = () => {
    const errorMsg = validateEndorsement(currentEndorsement);
    if (errorMsg) {
      alert(errorMsg);
      return;
    }
    if (editingEndorsementId !== null) {
      setEndorsements(applyEdit(endorsements, editingEndorsementId, currentEndorsement));
      setEditingEndorsementId(null);
    } else {
      setEndorsements([...endorsements, { ...currentEndorsement, id: Date.now() }]);
    }
    setCurrentEndorsement(EMPTY_LICENSE);
  };

  const handleEditEndorsement = (endorsement) => {
    const { id, _persisted, _dirty, ...fields } = endorsement;
    setCurrentEndorsement({ ...EMPTY_LICENSE, ...fields });
    setEditingEndorsementId(id);
  };

  const handleCancelEndorsementEdit = () => {
    setEditingEndorsementId(null);
    setCurrentEndorsement(EMPTY_LICENSE);
  };

  const handleRemoveEndorsement = async (endorsement) => {
    if (endorsement._persisted) {
      try {
        await resumeService.deleteLicense(endorsement.id);
      } catch (error) {
        alert(getApiErrorMessage(error, 'Failed to delete endorsement. Please try again.'));
        return;
      }
    }
    if (editingEndorsementId === endorsement.id) handleCancelEndorsementEdit();
    setEndorsements(endorsements.filter(e => e.id !== endorsement.id));
  };

  const handleNext = () => {
    let finalLicenses = [...licenses];
    let finalEndorsements = [...endorsements];

    const isPartialLicense = Object.values(currentLicense).some(val => val !== '');
    if (isPartialLicense) {
      const errorMsg = validateLicense(currentLicense);
      if (errorMsg) {
        alert(
          (editingLicenseId !== null
            ? 'Please finish or cancel the License you are editing: '
            : 'Please complete or clear the active License entry before continuing: ') + errorMsg
        );
        return;
      }
      finalLicenses = editingLicenseId !== null
        ? applyEdit(finalLicenses, editingLicenseId, currentLicense)
        : [...finalLicenses, { ...currentLicense, id: Date.now() }];
    }

    const isPartialEndorsement = Object.values(currentEndorsement).some(val => val !== '');
    if (isPartialEndorsement) {
      const errorMsg = validateEndorsement(currentEndorsement);
      if (errorMsg) {
        alert(
          (editingEndorsementId !== null
            ? 'Please finish or cancel the Endorsement you are editing: '
            : 'Please complete or clear the active Endorsement entry before continuing: ') + errorMsg
        );
        return;
      }
      finalEndorsements = editingEndorsementId !== null
        ? applyEdit(finalEndorsements, editingEndorsementId, currentEndorsement)
        : [...finalEndorsements, { ...currentEndorsement, id: Date.now() + 1 }];
    }

    onNext({ licenses: finalLicenses, endorsements: finalEndorsements });
  };

  return (
    <form className="flex flex-col h-full">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 relative z-0">
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
            Licenses
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('endorsements')}
            className={`px-6 py-2 rounded-full font-medium transition-colors text-sm ${activeTab === 'endorsements'
              ? 'bg-[#003971] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            Endorsements
          </button>
        </div>

        {/* Licenses Tab Content */}
        {activeTab === 'licenses' && (
          <>
            {/* Added Licenses — newest first */}
            {orderedLicenses.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {orderedLicenses.map((license) => (
                  <div
                    key={license.id}
                    className={`bg-gray-50 rounded-lg p-3 relative ${editingLicenseId === license.id ? 'ring-2 ring-[#003971]' : ''}`}
                  >
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleEditLicense(license)}
                        className="text-gray-400 hover:text-[#003971]"
                        aria-label={`Edit ${license.licenseName || 'license'}`}
                        title="Edit"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveLicense(license)}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label={`Remove ${license.licenseName || 'license'}`}
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{license.licenseName}</p>
                    <p className="text-xs text-gray-600"><CountryDisplay name={license.issuingCountry} /></p>
                    <p className="text-xs text-gray-500">
                      {license.dateOfIssue ?
                        `${new Date(license.dateOfIssue).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} to ${license.validTill ? new Date(license.validTill).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Present'}`
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
                <CountrySelect
                  id="issuingCountry"
                  name="issuingCountry"
                  placeholder="Select issuing country"
                  value={currentLicense.issuingCountry}
                  onChange={handleLicenseChange}
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
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="validTill" className="block text-gray-700 font-medium mb-1 text-sm">
                    Valid Till <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="date"
                    id="validTill"
                    name="validTill"
                    placeholder="dd/mm/yyyy"
                    value={currentLicense.validTill}
                    onChange={handleLicenseChange}
                    min={currentLicense.dateOfIssue || new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Endorsements Tab Content */}
        {activeTab === 'endorsements' && (
          <>
            {/* Added Endorsements — newest first */}
            {orderedEndorsements.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {orderedEndorsements.map((endorsement) => (
                  <div
                    key={endorsement.id}
                    className={`bg-gray-50 rounded-lg p-3 relative ${editingEndorsementId === endorsement.id ? 'ring-2 ring-[#003971]' : ''}`}
                  >
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleEditEndorsement(endorsement)}
                        className="text-gray-400 hover:text-[#003971]"
                        aria-label={`Edit ${endorsement.licenseName || 'endorsement'}`}
                        title="Edit"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveEndorsement(endorsement)}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label={`Remove ${endorsement.licenseName || 'endorsement'}`}
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{endorsement.licenseName}</p>
                    <p className="text-xs text-gray-600"><CountryDisplay name={endorsement.issuingCountry} /></p>
                    <p className="text-xs text-gray-500">
                      {endorsement.dateOfIssue ?
                        `${new Date(endorsement.dateOfIssue).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} to ${endorsement.validTill ? new Date(endorsement.validTill).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Present'}`
                        : 'Dates not specified'}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Endorsement Form */}
            <div className="space-y-4">
              <div>
                <label htmlFor="endorsementName" className="block text-gray-700 font-medium mb-1 text-sm">
                  Endorsement Name
                </label>
                <input
                  type="text"
                  id="endorsementName"
                  name="licenseName"
                  placeholder="Enter your endorsement name"
                  value={currentEndorsement.licenseName}
                  onChange={handleEndorsementChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                />
              </div>

              <div>
                <label htmlFor="endorsementNumber" className="block text-gray-700 font-medium mb-1 text-sm">
                  Endorsement Number
                </label>
                <input
                  type="text"
                  id="endorsementNumber"
                  name="licenseNumber"
                  placeholder="Enter endorsement number"
                  value={currentEndorsement.licenseNumber}
                  onChange={handleEndorsementChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                />
              </div>

              <div>
                <label htmlFor="endorsementCountry" className="block text-gray-700 font-medium mb-1 text-sm">
                  Issuing Country
                </label>
                <CountrySelect
                  id="endorsementCountry"
                  name="issuingCountry"
                  placeholder="Select issuing country"
                  value={currentEndorsement.issuingCountry}
                  onChange={handleEndorsementChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="endorsementDateOfIssue" className="block text-gray-700 font-medium mb-1 text-sm">
                    Date Of Issue
                  </label>
                  <input
                    type="date"
                    id="endorsementDateOfIssue"
                    name="dateOfIssue"
                    placeholder="dd/mm/yyyy"
                    value={currentEndorsement.dateOfIssue}
                    onChange={handleEndorsementChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="endorsementValidTill" className="block text-gray-700 font-medium mb-1 text-sm">
                    Valid Till <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="date"
                    id="endorsementValidTill"
                    name="validTill"
                    placeholder="dd/mm/yyyy"
                    value={currentEndorsement.validTill}
                    onChange={handleEndorsementChange}
                    min={currentEndorsement.dateOfIssue || new Date().toISOString().split('T')[0]}
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
            {(activeTab === 'licenses' ? editingLicenseId : editingEndorsementId) !== null && (
              <button
                type="button"
                onClick={activeTab === 'licenses' ? handleCancelLicenseEdit : handleCancelEndorsementEdit}
                disabled={isLoading}
                className="text-gray-400 py-2 px-4 rounded-lg font-medium hover:text-gray-600 transition-colors text-sm disabled:opacity-50"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={activeTab === 'licenses' ? handleAddLicense : handleAddEndorsement}
              disabled={isLoading}
              className="text-[#003971] py-2 px-6 rounded-lg font-medium hover:bg-blue-50 transition-colors text-sm disabled:opacity-50"
            >
              {(activeTab === 'licenses' ? editingLicenseId : editingEndorsementId) !== null ? 'Update' : 'Save'}
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

export default LicensesEndorsements;

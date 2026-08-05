import { useState, useEffect } from 'react';
import CountrySelect from '../../../../components/common/CountrySelect';
import CountryDisplay from '../../../../components/common/CountryDisplay';
import resumeService from '../../../../services/resumeService';
import { getApiErrorMessage } from '../../../../utils/apiError';
import { markEdited } from '../../../../utils/resumeStepSync';
import { sortDocuments } from '../../../../utils/resumeEntryOrder';

const EMPTY_MEDICAL = {
  certificateName: '',
  certificateNumber: '',
  issuingCountry: '',
  city: '',
  dateOfIssue: '',
  validTill: ''
};

const EMPTY_TRAVEL = {
  documentName: '',
  documentNumber: '',
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

const MedicalTravelDocs = ({ onNext, onBack, initialData = {}, activeTab: medicalTab, setActiveTab: setMedicalTab, isLoading = false, apiError = null, onLocalChange }) => {
  const [medicalDocuments, setMedicalDocuments] = useState(initialData.medicalDocuments || []);

  useEffect(() => {
    if (initialData && Array.isArray(initialData.medicalDocuments)) {
      setMedicalDocuments(initialData.medicalDocuments);
    }
    if (initialData && Array.isArray(initialData.travelDocuments)) {
      setTravelDocuments(initialData.travelDocuments);
    }
  }, [initialData]);
  const [currentMedical, setCurrentMedical] = useState(EMPTY_MEDICAL);
  const [travelDocuments, setTravelDocuments] = useState(initialData.travelDocuments || []);
  const [currentTravel, setCurrentTravel] = useState(EMPTY_TRAVEL);
  // id of the entry being corrected in each tab, or null while adding
  const [editingMedicalId, setEditingMedicalId] = useState(null);
  const [editingTravelId, setEditingTravelId] = useState(null);

  // Most recently issued document first.
  const orderedMedical = sortDocuments(medicalDocuments);
  const orderedTravel = sortDocuments(travelDocuments);
  const [medicalDateError, setMedicalDateError] = useState('');
  const [travelDateError, setTravelDateError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleMedicalChange = (e) => {
    setCurrentMedical({
      ...currentMedical,
      [e.target.name]: e.target.value
    });
    if (e.target.name === 'dateOfIssue') {
      setMedicalDateError('');
    }
  };

  const handleTravelChange = (e) => {
    setCurrentTravel({
      ...currentTravel,
      [e.target.name]: e.target.value
    });
    if (e.target.name === 'dateOfIssue') {
      setTravelDateError('');
    }
  };

  const validateMedical = (entry) => {
    if (!entry.certificateName || !entry.certificateNumber || !entry.issuingCountry || !entry.dateOfIssue) {
      return 'Please fill in all mandatory Medical fields before adding.';
    }
    const issueDate = new Date(entry.dateOfIssue);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (issueDate > today) return 'Please enter valid issue date.';
    if (entry.validTill && issueDate >= new Date(entry.validTill)) return 'Date of Issue must be before Valid Till date.';
    return null;
  };

  const validateTravel = (entry) => {
    if (!entry.documentName || !entry.documentNumber || !entry.issuingCountry || !entry.dateOfIssue) {
      return 'Please fill in all mandatory Travel fields before adding.';
    }
    const issueDate = new Date(entry.dateOfIssue);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (issueDate > today) return 'Please enter valid issue date.';
    if (entry.validTill && issueDate >= new Date(entry.validTill)) return 'Date of Issue must be before Valid Till date.';
    return null;
  };

  // Report this step's state up to the dashboard on every change, not just on
  // "Next" — "Save & Continue Later" serializes the dashboard's snapshot, so
  // without this it can undo a removal or drop an entry. The trailing form
  // entries are reported too (once they validate), since the user may fill one
  // in and save from the sidebar without pressing this step's Save button.
  useEffect(() => {
    const medicalValid = validateMedical(currentMedical) === null;
    const travelValid = validateTravel(currentTravel) === null;
    onLocalChange?.({
      medicalDocuments,
      travelDocuments,
      __drafts: {
        medicalDocuments: editingMedicalId === null && medicalValid ? currentMedical : null,
        travelDocuments: editingTravelId === null && travelValid ? currentTravel : null,
      },
      // In-flight corrections replace their entry rather than adding one.
      __edits: {
        medicalDocuments: editingMedicalId !== null && medicalValid
          ? { id: editingMedicalId, fields: currentMedical } : null,
        travelDocuments: editingTravelId !== null && travelValid
          ? { id: editingTravelId, fields: currentTravel } : null,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medicalDocuments, travelDocuments, currentMedical, currentTravel, editingMedicalId, editingTravelId]);

  const handleAddMedical = () => {
    const errorMsg = validateMedical(currentMedical);
    if (errorMsg) {
      setMedicalDateError(errorMsg);
      return;
    }
    setMedicalDateError('');
    if (editingMedicalId !== null) {
      setMedicalDocuments(applyEdit(medicalDocuments, editingMedicalId, currentMedical));
      setEditingMedicalId(null);
    } else {
      setMedicalDocuments([...medicalDocuments, { ...currentMedical, id: Date.now() }]);
    }
    setCurrentMedical(EMPTY_MEDICAL);
  };

  const handleEditMedical = (doc) => {
    const { id, _persisted, _dirty, ...fields } = doc;
    setCurrentMedical({ ...EMPTY_MEDICAL, ...fields });
    setEditingMedicalId(id);
    setMedicalDateError('');
  };

  const handleCancelMedicalEdit = () => {
    setEditingMedicalId(null);
    setCurrentMedical(EMPTY_MEDICAL);
    setMedicalDateError('');
  };

  const handleRemoveMedical = async (doc) => {
    if (doc._persisted) {
      try {
        await resumeService.deleteMedicalTravelDocument(doc.id);
      } catch (error) {
        alert(getApiErrorMessage(error, 'Failed to delete medical document. Please try again.'));
        return;
      }
    }
    if (editingMedicalId === doc.id) handleCancelMedicalEdit();
    setMedicalDocuments(medicalDocuments.filter(d => d.id !== doc.id));
  };

  const handleAddTravel = () => {
    const errorMsg = validateTravel(currentTravel);
    if (errorMsg) {
      setTravelDateError(errorMsg);
      return;
    }
    setTravelDateError('');
    if (editingTravelId !== null) {
      setTravelDocuments(applyEdit(travelDocuments, editingTravelId, currentTravel));
      setEditingTravelId(null);
    } else {
      setTravelDocuments([...travelDocuments, { ...currentTravel, id: Date.now() }]);
    }
    setCurrentTravel(EMPTY_TRAVEL);
  };

  const handleEditTravel = (doc) => {
    const { id, _persisted, _dirty, ...fields } = doc;
    setCurrentTravel({ ...EMPTY_TRAVEL, ...fields });
    setEditingTravelId(id);
    setTravelDateError('');
  };

  const handleCancelTravelEdit = () => {
    setEditingTravelId(null);
    setCurrentTravel(EMPTY_TRAVEL);
    setTravelDateError('');
  };

  const handleRemoveTravel = async (doc) => {
    if (doc._persisted) {
      try {
        await resumeService.deleteMedicalTravelDocument(doc.id);
      } catch (error) {
        alert(getApiErrorMessage(error, 'Failed to delete travel document. Please try again.'));
        return;
      }
    }
    if (editingTravelId === doc.id) handleCancelTravelEdit();
    setTravelDocuments(travelDocuments.filter(d => d.id !== doc.id));
  };

  const handleNext = () => {
    let finalMedical = [...medicalDocuments];
    let finalTravel = [...travelDocuments];

    const isPartialMedical = Object.values(currentMedical).some(val => val !== '');
    if (isPartialMedical) {
      const errorMsg = validateMedical(currentMedical);
      if (errorMsg) {
        setMedicalDateError("Please complete or clear active Medical entry: " + errorMsg);
        return;
      }
      finalMedical = editingMedicalId !== null
        ? applyEdit(finalMedical, editingMedicalId, currentMedical)
        : [...finalMedical, { ...currentMedical, id: Date.now() }];
    }

    const isPartialTravel = Object.values(currentTravel).some(val => val !== '');
    if (isPartialTravel) {
      const errorMsg = validateTravel(currentTravel);
      if (errorMsg) {
        setTravelDateError("Please complete or clear active Travel entry: " + errorMsg);
        return;
      }
      finalTravel = editingTravelId !== null
        ? applyEdit(finalTravel, editingTravelId, currentTravel)
        : [...finalTravel, { ...currentTravel, id: Date.now() + 1 }];
    }

    onNext({ medicalDocuments: finalMedical, travelDocuments: finalTravel });
  };

  return (
    <form className="flex flex-col h-full">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 relative z-0">
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
            {/* Added Medical Documents — most recently issued first */}
            {orderedMedical.length > 0 && (
              <div className="space-y-3 mb-4">
                {orderedMedical.map((doc) => (
                  <div
                    key={doc.id}
                    className={`bg-gray-50 rounded-lg p-3 relative ${editingMedicalId === doc.id ? 'ring-2 ring-[#003971]' : ''}`}
                  >
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleEditMedical(doc)}
                        className="text-gray-400 hover:text-[#003971]"
                        aria-label={`Edit ${doc.certificateName || 'document'}`}
                        title="Edit"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveMedical(doc)}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label={`Remove ${doc.certificateName || 'document'}`}
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{doc.certificateName}</p>
                    <p className="text-xs text-gray-600">
                      <CountryDisplay name={doc.issuingCountry} />
                      {doc.city ? `, ${doc.city}` : ''}
                    </p>
                    <p className="text-xs text-gray-500">
                      {doc.dateOfIssue ?
                        `${new Date(doc.dateOfIssue).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} to ${doc.validTill ? new Date(doc.validTill).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Present'}`
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="medicalIssuingCountry" className="block text-gray-700 font-medium mb-1 text-sm">
                    Issuing Country
                  </label>
                  <CountrySelect
                    id="medicalIssuingCountry"
                    name="issuingCountry"
                    placeholder="Select issuing country"
                    value={currentMedical.issuingCountry}
                    onChange={handleMedicalChange}
                  />
                </div>
                <div>
                  <label htmlFor="medicalInstitutionCity" className="block text-gray-700 font-medium mb-1 text-sm">
                    City
                  </label>
                  <input
                    type="text"
                    id="medicalInstitutionCity"
                    name="city"
                    placeholder="Enter city"
                    value={currentMedical.city}
                    onChange={handleMedicalChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                  />
                </div>
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
                    max={today}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                  />
                  {medicalDateError && (
                    <p className="text-red-500 text-xs mt-1">{medicalDateError}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="medicalValidTill" className="block text-gray-700 font-medium mb-1 text-sm">
                    Valid Till <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="date"
                    id="medicalValidTill"
                    name="validTill"
                    placeholder="dd/mm/yyyy"
                    value={currentMedical.validTill}
                    onChange={handleMedicalChange}
                    min={currentMedical.dateOfIssue || new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Travel Document Tab Content */}
        {medicalTab === 'travel' && (
          <>
            {/* Added Travel Documents — most recently issued first */}
            {orderedTravel.length > 0 && (
              <div className="space-y-3 mb-4">
                {orderedTravel.map((doc) => (
                  <div
                    key={doc.id}
                    className={`bg-gray-50 rounded-lg p-3 relative ${editingTravelId === doc.id ? 'ring-2 ring-[#003971]' : ''}`}
                  >
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleEditTravel(doc)}
                        className="text-gray-400 hover:text-[#003971]"
                        aria-label={`Edit ${doc.documentName || 'document'}`}
                        title="Edit"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveTravel(doc)}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label={`Remove ${doc.documentName || 'document'}`}
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{doc.documentName}</p>
                    <p className="text-xs text-gray-600"><CountryDisplay name={doc.issuingCountry} /></p>
                    <p className="text-xs text-gray-500">
                      {doc.dateOfIssue ?
                        `${new Date(doc.dateOfIssue).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} to ${doc.validTill ? new Date(doc.validTill).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Present'}`
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                />
              </div>

              <div>
                <label htmlFor="travelIssuingCountry" className="block text-gray-700 font-medium mb-1 text-sm">
                  Issuing Country
                </label>
                <CountrySelect
                  id="travelIssuingCountry"
                  name="issuingCountry"
                  placeholder="Select issuing country"
                  value={currentTravel.issuingCountry}
                  onChange={handleTravelChange}
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
                    max={today}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                  />
                  {travelDateError && (
                    <p className="text-red-500 text-xs mt-1">{travelDateError}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="travelValidTill" className="block text-gray-700 font-medium mb-1 text-sm">
                    Valid Till <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="date"
                    id="travelValidTill"
                    name="validTill"
                    placeholder="dd/mm/yyyy"
                    value={currentTravel.validTill}
                    onChange={handleTravelChange}
                    min={currentTravel.dateOfIssue || new Date().toISOString().split('T')[0]}
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
            {(medicalTab === 'medical' ? editingMedicalId : editingTravelId) !== null && (
              <button
                type="button"
                onClick={medicalTab === 'medical' ? handleCancelMedicalEdit : handleCancelTravelEdit}
                disabled={isLoading}
                className="text-gray-400 py-2 px-4 rounded-lg font-medium hover:text-gray-600 transition-colors text-sm disabled:opacity-50"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={medicalTab === 'medical' ? handleAddMedical : handleAddTravel}
              disabled={isLoading}
              className="text-[#003971] py-2 px-6 rounded-lg font-medium hover:bg-blue-50 transition-colors text-sm disabled:opacity-50"
            >
              {(medicalTab === 'medical' ? editingMedicalId : editingTravelId) !== null ? 'Update' : 'Save'}
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

export default MedicalTravelDocs;

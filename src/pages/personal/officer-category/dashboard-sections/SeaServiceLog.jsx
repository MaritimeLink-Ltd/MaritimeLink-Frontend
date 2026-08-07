import { useState, useEffect } from 'react';
import CountrySelect from '../../../../components/common/CountrySelect';
import resumeService from '../../../../services/resumeService';
import { getApiErrorMessage } from '../../../../utils/apiError';
import { markEdited } from '../../../../utils/resumeStepSync';
import { sortSeaService } from '../../../../utils/resumeEntryOrder';

const EMPTY_SEA_SERVICE = {
  companyName: '',
  role: '',
  vesselName: '',
  imoNo: '',
  flag: '',
  type: '',
  dwt: '',
  meType: '',
  kwt: '',
  joiningDate: '',
  till: ''
};

/**
 * A seafarer who has not signed off yet has no end date to give. That is
 * recorded as an empty `till` — deliberately chosen with the "still on this
 * vessel" tick rather than left blank by accident — so an absent end date
 * reads unambiguously as "this posting is still running".
 */
const isOngoing = (entry) => !entry?.till;

const formatEntryDate = (value) =>
  new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const SeaServiceLog = ({ onNext, onBack, initialData = {}, isLoading = false, apiError = null, onLocalChange }) => {
  const [seaServiceEntries, setSeaServiceEntries] = useState(initialData.seaServiceEntries || []);
  // id of the entry being corrected, or null while adding a new one
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (initialData && Array.isArray(initialData.seaServiceEntries)) {
      setSeaServiceEntries(initialData.seaServiceEntries);
    }
  }, [initialData]);
  const [currentSeaService, setCurrentSeaService] = useState(EMPTY_SEA_SERVICE);
  // Kept outside the entry itself: the saved record carries only an empty
  // `till`, so an entry loaded back from the API needs no extra field to
  // round-trip correctly.
  const [stillOnVessel, setStillOnVessel] = useState(false);

  // Newest posting first, so a current role sits above one from years ago
  // regardless of the order entries happened to be typed in.
  const orderedEntries = sortSeaService(seaServiceEntries);

  const handleSeaServiceChange = (e) => {
    setCurrentSeaService({
      ...currentSeaService,
      [e.target.name]: e.target.value
    });
  };

  /**
   * @param {Object} entry
   * @param {boolean} [ongoing] - the posting is still running, so it has no
   *   end date to validate. Defaults to the form's current tick.
   */
  const validateForm = (entry, ongoing = stillOnVessel) => {
    const requiredFields = [
      { key: 'companyName', label: 'Company Name' },
      { key: 'role', label: 'Role' },
      { key: 'vesselName', label: 'Vessel Name' },
      { key: 'imoNo', label: 'IMO No.' },
      { key: 'flag', label: 'Flag' },
      { key: 'type', label: 'Type' },
      { key: 'joiningDate', label: 'Joining Date' },
      // Only demanded once the professional has signed off.
      ...(ongoing ? [] : [{ key: 'till', label: 'Till' }]),
    ];

    const missingFields = requiredFields
      .filter(({ key }) => !String(entry[key] ?? '').trim())
      .map(({ label }) => label);

    if (missingFields.length > 0) {
      return `Please complete these mandatory fields: ${missingFields.join(', ')}.`;
    }

    const joiningDate = new Date(entry.joiningDate);

    if (Number.isNaN(joiningDate.getTime())) {
      return 'Please enter a valid Joining Date.';
    }

    if (ongoing) return null;

    const tillDate = new Date(entry.till);

    if (Number.isNaN(tillDate.getTime())) {
      return 'Please enter a valid Till date.';
    }

    if (joiningDate > tillDate) {
      return 'Till date must be after or equal to Joining date.';
    }
    return null;
  };

  /** The entry as it should be stored: an ongoing posting carries no end date. */
  const toEntry = (form, ongoing = stillOnVessel) => ({
    ...form,
    till: ongoing ? '' : form.till,
  });

  // Report this step's state up to the dashboard on every change, not just on
  // "Next" — "Save & Continue Later" serializes the dashboard's snapshot, so
  // without this it can undo a removal or drop an entry. The trailing form
  // entry is reported too (once it validates), since the user may fill it in
  // and save from the sidebar without pressing this step's Save button.
  useEffect(() => {
    const isValid = validateForm(currentSeaService) === null;
    const entry = toEntry(currentSeaService);
    onLocalChange?.({
      seaServiceEntries,
      __drafts: {
        seaServiceEntries: editingId === null && isValid ? entry : null,
      },
      // An in-flight correction replaces its entry rather than adding one.
      __edits: {
        seaServiceEntries:
          editingId !== null && isValid ? { id: editingId, fields: entry } : null,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seaServiceEntries, currentSeaService, editingId, stillOnVessel]);

  const handleAddSeaService = () => {
    const errorMsg = validateForm(currentSeaService);
    if (errorMsg) {
      alert(errorMsg);
      return;
    }

    const entry = toEntry(currentSeaService);

    if (editingId !== null) {
      // Correcting an existing entry. An already-saved entry is flagged so the
      // dashboard PUTs it on the way out instead of POSTing a second copy.
      setSeaServiceEntries(seaServiceEntries.map((existing) =>
        existing.id === editingId
          ? (existing._persisted
            ? markEdited({ ...existing, ...entry })
            : { ...existing, ...entry })
          : existing
      ));
      setEditingId(null);
    } else {
      setSeaServiceEntries([...seaServiceEntries, { ...entry, id: Date.now() }]);
    }

    setCurrentSeaService(EMPTY_SEA_SERVICE);
    setStillOnVessel(false);
  };

  const handleEditSeaService = (entry) => {
    // Only the editable fields — id/_persisted/_dirty stay on the stored entry.
    const { id, _persisted, _dirty, ...fields } = entry;
    setCurrentSeaService({ ...EMPTY_SEA_SERVICE, ...fields });
    // No end date on the stored entry means it was saved as still running.
    setStillOnVessel(isOngoing(entry));
    setEditingId(id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setCurrentSeaService(EMPTY_SEA_SERVICE);
    setStillOnVessel(false);
  };

  /** Ticking the box drops any end date already typed; unticking asks for one. */
  const handleStillOnVesselToggle = (e) => {
    const checked = e.target.checked;
    setStillOnVessel(checked);
    if (checked) {
      setCurrentSeaService((prev) => ({ ...prev, till: '' }));
    }
  };

  const handleRemoveSeaService = async (entry) => {
    if (entry._persisted) {
      try {
        await resumeService.deleteSeaServiceEntry(entry.id);
      } catch (error) {
        alert(getApiErrorMessage(error, 'Failed to delete sea service entry. Please try again.'));
        return;
      }
    }
    // Deleting the entry being corrected leaves the form editing nothing.
    if (editingId === entry.id) handleCancelEdit();
    setSeaServiceEntries(seaServiceEntries.filter(e => e.id !== entry.id));
  };

  const handleNext = () => {
    let finalEntries = [...seaServiceEntries];
    // Only attempt adding the trailing form if ANY partial string exists to protect user error
    const isPartial = Object.values(currentSeaService).some(val => val !== '');

    if (isPartial) {
      const errorMsg = validateForm(currentSeaService);
      if (errorMsg) {
        alert(
          (editingId !== null
            ? 'Please finish or cancel the entry you are editing before continuing: '
            : 'Please complete or clear the active entry before continuing: ') + errorMsg
        );
        return; // Halt
      }

      const entry = toEntry(currentSeaService);

      if (editingId !== null) {
        // Fold the correction into its entry — never add it as a new one.
        finalEntries = finalEntries.map((existing) =>
          existing.id === editingId
            ? (existing._persisted
              ? markEdited({ ...existing, ...entry })
              : { ...existing, ...entry })
            : existing
        );
      } else {
        finalEntries.push({ ...entry, id: Date.now() });
      }
    }

    onNext({ seaServiceEntries: finalEntries });
  };

  return (
    <form className="flex flex-col h-full">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {/* Added Sea Service Entries — newest posting first */}
        {orderedEntries.length > 0 && (
          <div className="space-y-3 mb-4">
            {orderedEntries.map((entry) => (
              <div
                key={entry.id}
                className={`bg-gray-50 rounded-lg p-4 relative ${editingId === entry.id ? 'ring-2 ring-[#003971]' : ''}`}
              >
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditSeaService(entry)}
                    className="text-gray-400 hover:text-[#003971]"
                    aria-label={`Edit ${entry.vesselName || 'entry'}`}
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveSeaService(entry)}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label={`Remove ${entry.vesselName || 'entry'}`}
                    title="Remove"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mb-2">
                  <div className="flex items-center gap-2 pr-14">
                    <p className="text-sm font-semibold text-gray-800">{entry.vesselName}</p>
                    {entry.joiningDate && isOngoing(entry) && (
                      <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-700">
                        On board
                      </span>
                    )}
                  </div>
                  {entry.type ? (
                    <p className="text-xs text-gray-600">{entry.type}</p>
                  ) : null}
                  <p className="text-xs text-gray-500">{entry.role}</p>
                  <p className="text-xs text-gray-500">
                    {entry.joiningDate
                      ? `${formatEntryDate(entry.joiningDate)} to ${isOngoing(entry) ? 'Present' : formatEntryDate(entry.till)}`
                      : 'Dates not specified'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sea Service Form */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="companyName" className="block text-gray-700 font-medium mb-1 text-sm">
              Company Name
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              placeholder="Enter company name"
              value={currentSeaService.companyName}
              onChange={handleSeaServiceChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-gray-700 font-medium mb-1 text-sm">
              Role
            </label>
            <input
              type="text"
              id="role"
              name="role"
              placeholder="Enter your role"
              value={currentSeaService.role}
              onChange={handleSeaServiceChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
            />
          </div>

          <div>
            <label htmlFor="vesselName" className="block text-gray-700 font-medium mb-1 text-sm">
              Vessel Name
            </label>
            <input
              type="text"
              id="vesselName"
              name="vesselName"
              placeholder="Enter vessel name"
              value={currentSeaService.vesselName}
              onChange={handleSeaServiceChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
            />
          </div>

          <div>
            <label htmlFor="imoNo" className="block text-gray-700 font-medium mb-1 text-sm">
              IMO No.
            </label>
            <input
              type="text"
              id="imoNo"
              name="imoNo"
              placeholder="Enter vessel IMO number"
              value={currentSeaService.imoNo}
              onChange={handleSeaServiceChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
            />
          </div>

          <div>
            <label htmlFor="flag" className="block text-gray-700 font-medium mb-1 text-sm">
              Flag
            </label>
            <CountrySelect
              id="flag"
              name="flag"
              placeholder="Select flag country"
              value={currentSeaService.flag}
              onChange={handleSeaServiceChange}
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-gray-700 font-medium mb-1 text-sm">
              Vessel Type
            </label>
            <input
              type="text"
              id="type"
              name="type"
              placeholder="Enter vessel type (e.g. LNG Tanker)"
              value={currentSeaService.type}
              onChange={handleSeaServiceChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
            />
          </div>

          <div>
            <label htmlFor="dwt" className="block text-gray-700 font-medium mb-1 text-sm">
              DWT
            </label>
            <input
              type="text"
              id="dwt"
              name="dwt"
              placeholder="Enter vessel DWT"
              value={currentSeaService.dwt}
              onChange={handleSeaServiceChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
            />
          </div>

          <div>
            <label htmlFor="meType" className="block text-gray-700 font-medium mb-1 text-sm">
              ME type
            </label>
            <input
              type="text"
              id="meType"
              name="meType"
              placeholder="Enter vessel ME type"
              value={currentSeaService.meType}
              onChange={handleSeaServiceChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
            />
          </div>

          <div className="col-span-2">
            <label htmlFor="kwt" className="block text-gray-700 font-medium mb-1 text-sm">
              KWT
            </label>
            <input
              type="text"
              id="kwt"
              name="kwt"
              placeholder="Enter vessel KWT"
              value={currentSeaService.kwt}
              onChange={handleSeaServiceChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
            />
          </div>

          <div>
            <label htmlFor="joiningDate" className="block text-gray-700 font-medium mb-1 text-sm">
              Joining Date
            </label>
            <input
              type="date"
              id="joiningDate"
              name="joiningDate"
              placeholder="dd/mm/yyyy"
              value={currentSeaService.joiningDate}
              onChange={handleSeaServiceChange}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
            />
          </div>

          <div>
            <label htmlFor="till" className="block text-gray-700 font-medium mb-1 text-sm">
              Till
            </label>
            {stillOnVessel ? (
              // Standing in for the date input rather than showing a disabled,
              // empty one makes it obvious the end date is intentionally absent.
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-500">
                Present
              </div>
            ) : (
              <input
                type="date"
                id="till"
                name="till"
                placeholder="dd/mm/yyyy"
                value={currentSeaService.till}
                onChange={handleSeaServiceChange}
                min={currentSeaService.joiningDate || undefined}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
              />
            )}
            <label className="mt-2 flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={stillOnVessel}
                onChange={handleStillOnVesselToggle}
                className="h-4 w-4 rounded border-gray-300 text-[#003971] focus:ring-[#003971] cursor-pointer"
              />
              I am still on this vessel
            </label>
          </div>
        </div>
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
            {editingId !== null && (
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isLoading}
                className="text-gray-400 py-2 px-4 rounded-lg font-medium hover:text-gray-600 transition-colors text-sm disabled:opacity-50"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={handleAddSeaService}
              disabled={isLoading}
              className="text-[#003971] py-2 px-6 rounded-lg font-medium hover:bg-blue-50 transition-colors text-sm disabled:opacity-50"
            >
              {editingId !== null ? 'Update' : 'Save'}
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

export default SeaServiceLog;

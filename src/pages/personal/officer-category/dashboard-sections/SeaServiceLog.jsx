import { useState, useEffect } from 'react';

const SeaServiceLog = ({ onNext, onBack, initialData = {}, isLoading = false, apiError = null }) => {
  const [seaServiceEntries, setSeaServiceEntries] = useState(initialData.seaServiceEntries || []);

  useEffect(() => {
    if (initialData && Array.isArray(initialData.seaServiceEntries) && initialData.seaServiceEntries.length > 0) {
      setSeaServiceEntries(initialData.seaServiceEntries);
    }
  }, [initialData]);
  const [currentSeaService, setCurrentSeaService] = useState({
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
  });

  const handleSeaServiceChange = (e) => {
    setCurrentSeaService({
      ...currentSeaService,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = (entry) => {
    if (!entry.companyName || !entry.vesselName || !entry.role || !entry.imoNo || !entry.flag || !entry.type || !entry.joiningDate || !entry.till) {
      return 'Please fill in all mandatory fields before adding.';
    }
    if (new Date(entry.joiningDate) > new Date(entry.till)) {
      return 'Till date must be after or equal to Joining date.';
    }
    return null;
  };

  const handleAddSeaService = () => {
    const errorMsg = validateForm(currentSeaService);
    if (errorMsg) {
      alert(errorMsg);
      return;
    }

    setSeaServiceEntries([...seaServiceEntries, { ...currentSeaService, id: Date.now() }]);
    setCurrentSeaService({
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
    });
  };

  const handleRemoveSeaService = (id) => {
    setSeaServiceEntries(seaServiceEntries.filter(entry => entry.id !== id));
  };

  const handleNext = () => {
    let finalEntries = [...seaServiceEntries];
    // Only attempt adding the trailing form if ANY partial string exists to protect user error
    const isPartial = Object.values(currentSeaService).some(val => val !== '');
    
    if (isPartial) {
      const errorMsg = validateForm(currentSeaService);
      if (errorMsg) {
        alert("Please complete or clear the active entry before continuing: " + errorMsg);
        return; // Halt 
      }
      finalEntries.push({ ...currentSeaService, id: Date.now() });
    }

    onNext({ seaServiceEntries: finalEntries });
  };

  return (
    <form className="flex flex-col h-full">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {/* Added Sea Service Entries */}
        {seaServiceEntries.length > 0 && (
          <div className="space-y-3 mb-4">
            {seaServiceEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-gray-50 rounded-lg p-4 relative"
              >
                <button
                  type="button"
                  onClick={() => handleRemoveSeaService(entry.id)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="mb-2">
                  <p className="text-sm font-semibold text-gray-800">{entry.vesselName}</p>
                  <p className="text-xs text-gray-500">{entry.role}</p>
                  <p className="text-xs text-gray-500">
                    {entry.joiningDate && entry.till ?
                      `${new Date(entry.joiningDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} to ${new Date(entry.till).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
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
            <input
              type="text"
              id="flag"
              name="flag"
              placeholder="Enter country name"
              value={currentSeaService.flag}
              onChange={handleSeaServiceChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-gray-700 font-medium mb-1 text-sm">
              Type
            </label>
            <input
              type="text"
              id="type"
              name="type"
              placeholder="Enter vessel type"
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
            <button
              type="button"
              onClick={handleAddSeaService}
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

export default SeaServiceLog;

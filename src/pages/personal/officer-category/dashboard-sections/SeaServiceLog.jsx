import { useState } from 'react';

const SeaServiceLog = ({ onNext, onBack, initialData = {} }) => {
  const [seaServiceEntries, setSeaServiceEntries] = useState(initialData.seaServiceEntries || []);
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

  const handleAddSeaService = () => {
    if (currentSeaService.companyName && currentSeaService.vesselName) {
      // Validate dates
      if (currentSeaService.joiningDate && currentSeaService.till) {
        if (new Date(currentSeaService.joiningDate) > new Date(currentSeaService.till)) {
          alert('Till date must be after or equal to Joining date');
          return;
        }
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
    }
  };

  const handleRemoveSeaService = (id) => {
    setSeaServiceEntries(seaServiceEntries.filter(entry => entry.id !== id));
  };

  const handleNext = () => {
    let finalEntries = [...seaServiceEntries];
    if (currentSeaService.companyName && currentSeaService.vesselName) {
      if (!currentSeaService.joiningDate || !currentSeaService.till || new Date(currentSeaService.joiningDate) <= new Date(currentSeaService.till)) {
        finalEntries.push({ ...currentSeaService, id: Date.now() });
      }
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
            onClick={handleAddSeaService}
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

export default SeaServiceLog;

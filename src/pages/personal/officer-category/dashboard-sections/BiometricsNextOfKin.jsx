import { useState } from 'react';
import { countryCodes } from '../../../../utils/countryCodes';

const BiometricsNextOfKin = ({ onNext, onBack, initialData = {}, activeTab: biometricTab, setActiveTab: setBiometricTab }) => {
  const [biometricData, setBiometricData] = useState(initialData.biometricData || {
    gender: 'Male',
    height: '',
    weight: '',
    eyeColor: '',
    overallSize: '',
    shoeSize: ''
  });
  const [nextOfKinList, setNextOfKinList] = useState(initialData.nextOfKinList || []);
  const [currentNextOfKin, setCurrentNextOfKin] = useState({
    name: '',
    relationship: '',
    countryCode: '+44',
    phone: '',
    email: ''
  });
  const [refereesList, setRefereesList] = useState(initialData.refereesList || []);
  const [currentReferee, setCurrentReferee] = useState({
    name: '',
    position: '',
    countryCode: '+44',
    phone: '',
    email: ''
  });

  const handleBiometricChange = (e) => {
    setBiometricData({
      ...biometricData,
      [e.target.name]: e.target.value
    });
  };

  const handleNextOfKinChange = (e) => {
    const { name, value } = e.target;

    // Auto-detect country code when typing in phone number
    if (name === 'phone') {
      const matchedCode = countryCodes.find(country =>
        value.startsWith(country.code)
      );
      if (matchedCode && value.startsWith('+')) {
        setCurrentNextOfKin({
          ...currentNextOfKin,
          countryCode: matchedCode.code,
          phone: value.slice(matchedCode.code.length)
        });
        return;
      }
    }

    setCurrentNextOfKin({
      ...currentNextOfKin,
      [name]: value
    });
  };

  const handleRefereeChange = (e) => {
    const { name, value } = e.target;

    // Auto-detect country code when typing in phone number
    if (name === 'phone') {
      const matchedCode = countryCodes.find(country =>
        value.startsWith(country.code)
      );
      if (matchedCode && value.startsWith('+')) {
        setCurrentReferee({
          ...currentReferee,
          countryCode: matchedCode.code,
          phone: value.slice(matchedCode.code.length)
        });
        return;
      }
    }

    setCurrentReferee({
      ...currentReferee,
      [name]: value
    });
  };

  const handleAddNextOfKin = () => {
    if (currentNextOfKin.name && currentNextOfKin.relationship) {
      setNextOfKinList([...nextOfKinList, { ...currentNextOfKin, id: Date.now() }]);
      setCurrentNextOfKin({
        name: '',
        relationship: '',
        countryCode: '+44',
        phone: '',
        email: ''
      });
    }
  };

  const handleRemoveNextOfKin = (id) => {
    setNextOfKinList(nextOfKinList.filter(kin => kin.id !== id));
  };

  const handleAddReferee = () => {
    if (currentReferee.name && currentReferee.email) {
      setRefereesList([...refereesList, { ...currentReferee, id: Date.now() }]);
      setCurrentReferee({
        name: '',
        position: '',
        countryCode: '+44',
        phone: '',
        email: ''
      });
    }
  };

  const handleRemoveReferee = (id) => {
    setRefereesList(refereesList.filter(referee => referee.id !== id));
  };

  const handleCompleteResume = () => {
    let finalKin = [...nextOfKinList];
    let finalReferees = [...refereesList];

    if (currentNextOfKin.name && currentNextOfKin.relationship) {
      finalKin.push({ ...currentNextOfKin, id: Date.now() });
    }

    if (currentReferee.name && currentReferee.email) {
      finalReferees.push({ ...currentReferee, id: Date.now() + 1 });
    }

    onNext({ biometricData, nextOfKinList: finalKin, refereesList: finalReferees });
  };

  return (
    <form className="flex flex-col h-full">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 relative z-0">
        {/* Tab Buttons */}
        <div className="flex space-x-2 mb-6">
          <button
            type="button"
            onClick={() => setBiometricTab('biometric')}
            className={`px-6 py-2 rounded-full font-medium transition-colors text-sm ${biometricTab === 'biometric'
              ? 'bg-[#003971] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            Biometric
          </button>
          <button
            type="button"
            onClick={() => setBiometricTab('nextOfKin')}
            className={`px-6 py-2 rounded-full font-medium transition-colors text-sm ${biometricTab === 'nextOfKin'
              ? 'bg-[#003971] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            Next Of Kin
          </button>
          <button
            type="button"
            onClick={() => setBiometricTab('referees')}
            className={`px-6 py-2 rounded-full font-medium transition-colors text-sm ${biometricTab === 'referees'
              ? 'bg-[#003971] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            Referees
          </button>
        </div>

        {/* Biometric Tab Content */}
        {biometricTab === 'biometric' && (
          <>
            {/* Gender Selection */}
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">
                Gender
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setBiometricData({ ...biometricData, gender: 'Male' })}
                  className={`px-6 py-2 rounded-full font-medium transition-colors text-sm ${biometricData.gender === 'Male'
                    ? 'bg-[#003971] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setBiometricData({ ...biometricData, gender: 'Female' })}
                  className={`px-6 py-2 rounded-full font-medium transition-colors text-sm ${biometricData.gender === 'Female'
                    ? 'bg-[#003971] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  Female
                </button>
              </div>
            </div>

            {/* Height and Weight */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="height" className="block text-gray-700 font-medium mb-1 text-sm">
                  Height
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="height"
                    name="height"
                    placeholder="Enter height"
                    value={biometricData.height}
                    onChange={handleBiometricChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm pr-10 bg-white transition-colors"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                    cm
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="weight" className="block text-gray-700 font-medium mb-1 text-sm">
                  Weight
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="weight"
                    name="weight"
                    placeholder="Enter weight"
                    value={biometricData.weight}
                    onChange={handleBiometricChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm pr-10 bg-white transition-colors"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                    kg
                  </span>
                </div>
              </div>
            </div>

            {/* Eye Color */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="eyeColor" className="block text-gray-700 font-medium mb-1 text-sm">
                  Eye Color
                </label>
                <input
                  type="text"
                  id="eyeColor"
                  name="eyeColor"
                  placeholder="Enter enter color"
                  value={biometricData.eyeColor}
                  onChange={handleBiometricChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                />
              </div>
            </div>

            {/* Overall Size and Shoe Size */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="overallSize" className="block text-gray-700 font-medium mb-1 text-sm">
                  Overall Size
                </label>
                <input
                  type="text"
                  id="overallSize"
                  name="overallSize"
                  placeholder="Enter overall size"
                  value={biometricData.overallSize}
                  onChange={handleBiometricChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                />
              </div>

              <div>
                <label htmlFor="shoeSize" className="block text-gray-700 font-medium mb-1 text-sm">
                  Shoe Size
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="shoeSize"
                    name="shoeSize"
                    placeholder="Enter shoe size"
                    value={biometricData.shoeSize}
                    onChange={handleBiometricChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm pr-10 bg-white transition-colors"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                    uk
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Next Of Kin Tab Content */}
        {biometricTab === 'nextOfKin' && (
          <>
            {/* Added Next Of Kin */}
            {nextOfKinList.length > 0 && (
              <div className="space-y-3 mb-4">
                {nextOfKinList.map((kin) => (
                  <div
                    key={kin.id}
                    className="bg-gray-50 rounded-lg p-3 relative"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveNextOfKin(kin.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <p className="text-sm font-semibold text-gray-800">{kin.name}</p>
                    <p className="text-xs text-gray-600">{kin.email}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Next Of Kin Form */}
            <div className="space-y-4">
              <div>
                <label htmlFor="kinName" className="block text-gray-700 font-medium mb-1 text-sm">
                  Name
                </label>
                <input
                  type="text"
                  id="kinName"
                  name="name"
                  placeholder="Enter referee name"
                  value={currentNextOfKin.name}
                  onChange={handleNextOfKinChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                />
              </div>

              <div>
                <label htmlFor="relationship" className="block text-gray-700 font-medium mb-1 text-sm">
                  Relationship
                </label>
                <input
                  type="text"
                  id="relationship"
                  name="relationship"
                  placeholder="Enter your relationship"
                  value={currentNextOfKin.relationship}
                  onChange={handleNextOfKinChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                />
              </div>

              <div>
                <label htmlFor="kinPhone" className="block text-gray-700 font-medium mb-1 text-sm">
                  Phone
                </label>
                <div className="flex space-x-2">
                  <select
                    name="countryCode"
                    value={currentNextOfKin.countryCode}
                    onChange={handleNextOfKinChange}
                    className="w-32 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                  >
                    {countryCodes.map((country) => (
                      <option key={country.code + country.country} value={country.code}>
                        {country.flag} {country.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    id="kinPhone"
                    name="phone"
                    placeholder="Enter your contact number"
                    value={currentNextOfKin.phone}
                    onChange={handleNextOfKinChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="kinEmail" className="block text-gray-700 font-medium mb-1 text-sm">
                  Email
                </label>
                <input
                  type="email"
                  id="kinEmail"
                  name="email"
                  placeholder="Enter email"
                  value={currentNextOfKin.email}
                  onChange={handleNextOfKinChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                />
              </div>
            </div>
          </>
        )}

        {/* Referees Tab Content */}
        {biometricTab === 'referees' && (
          <>
            {/* Added Referees */}
            {refereesList.length > 0 && (
              <div className="space-y-3 mb-4">
                {refereesList.map((referee) => (
                  <div
                    key={referee.id}
                    className="bg-gray-50 rounded-lg p-3 relative"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveReferee(referee.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <p className="text-sm font-semibold text-gray-800">{referee.name}</p>
                    <p className="text-xs text-gray-600">{referee.email}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Referee Form */}
            <div className="space-y-4">
              <div>
                <label htmlFor="refereeName" className="block text-gray-700 font-medium mb-1 text-sm">
                  Name
                </label>
                <input
                  type="text"
                  id="refereeName"
                  name="name"
                  placeholder="Enter referee name"
                  value={currentReferee.name}
                  onChange={handleRefereeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                />
              </div>

              <div>
                <label htmlFor="position" className="block text-gray-700 font-medium mb-1 text-sm">
                  Position
                </label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  placeholder="Enter referee position"
                  value={currentReferee.position}
                  onChange={handleRefereeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                />
              </div>

              <div>
                <label htmlFor="refereePhone" className="block text-gray-700 font-medium mb-1 text-sm">
                  Phone
                </label>
                <div className="flex space-x-2">
                  <select
                    name="countryCode"
                    value={currentReferee.countryCode}
                    onChange={handleRefereeChange}
                    className="w-32 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                  >
                    {countryCodes.map((country) => (
                      <option key={country.code + country.country} value={country.code}>
                        {country.flag} {country.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    id="refereePhone"
                    name="phone"
                    placeholder="Enter your contact number"
                    value={currentReferee.phone}
                    onChange={handleRefereeChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="refereeEmail" className="block text-gray-700 font-medium mb-1 text-sm">
                  Email
                </label>
                <input
                  type="email"
                  id="refereeEmail"
                  name="email"
                  placeholder="Enter referee email"
                  value={currentReferee.email}
                  onChange={handleRefereeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                />
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
          {biometricTab !== 'biometric' && (
            <button
              type="button"
              onClick={biometricTab === 'nextOfKin' ? handleAddNextOfKin : handleAddReferee}
              className="text-[#003971] py-2 px-6 rounded-lg font-medium hover:bg-blue-50 transition-colors text-sm"
            >
              Save & Add Another
            </button>
          )}
          <button
            type="button"
            onClick={handleCompleteResume}
            className="bg-[#003971] text-white py-2 px-10 rounded-lg font-medium hover:bg-[#002855] transition-colors text-sm"
          >
            {biometricTab === 'referees' ? 'Review Resume' : 'Next'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default BiometricsNextOfKin;

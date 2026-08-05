import { useState, useEffect } from 'react';
import { countryCodes } from '../../../../utils/countryCodes';
import resumeService from '../../../../services/resumeService';
import { getApiErrorMessage } from '../../../../utils/apiError';
import { markEdited } from '../../../../utils/resumeStepSync';

const EMPTY_KIN = { name: '', relationship: '', countryCode: '+44', phone: '', email: '' };
const EMPTY_REFEREE = { name: '', position: '', company: '', countryCode: '+44', phone: '', email: '' };

/** Fold a correction into its entry, flagging saved ones for a PUT. */
const applyEdit = (list, id, fields) =>
  list.map((item) =>
    item.id === id
      ? (item._persisted ? markEdited({ ...item, ...fields }) : { ...item, ...fields })
      : item
  );

const BiometricsNextOfKin = ({ onNext, onBack, initialData = {}, activeTab: biometricTab, setActiveTab: setBiometricTab, isLoading = false, apiError = null, onLocalChange }) => {
  const [biometricData, setBiometricData] = useState(initialData.biometricData || {
    gender: '',
    height: '',
    weight: '',
    bmi: '',
    eyeColor: '',
    overallSize: '',
    shoeSize: ''
  });

  useEffect(() => {
    if (initialData && initialData.biometricData) {
      setBiometricData(initialData.biometricData);
    }
    if (initialData && Array.isArray(initialData.nextOfKinList)) {
      setNextOfKinList(initialData.nextOfKinList);
    }
    if (initialData && Array.isArray(initialData.refereesList)) {
      setRefereesList(initialData.refereesList);
    }
  }, [initialData]);
  const [nextOfKinList, setNextOfKinList] = useState(initialData.nextOfKinList || []);
  const [currentNextOfKin, setCurrentNextOfKin] = useState(EMPTY_KIN);
  const [refereesList, setRefereesList] = useState(initialData.refereesList || []);
  const [currentReferee, setCurrentReferee] = useState(EMPTY_REFEREE);
  // id of the entry being corrected in each tab, or null while adding
  const [editingKinId, setEditingKinId] = useState(null);
  const [editingRefereeId, setEditingRefereeId] = useState(null);

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

  const validateNextOfKin = (entry) => {
    if (!entry.name || !entry.relationship || !entry.phone) {
      return 'Please fill in all mandatory Next of Kin fields (Name, Relationship, Phone) before adding.';
    }
    return null;
  };

  const validateReferee = (entry) => {
    if (!entry.name || !entry.phone || !entry.position || !entry.company) {
      return 'Please fill in all mandatory Referee fields (Name, Position, Company, Phone) before adding.';
    }
    return null;
  };

  const validateBiometrics = (data) => {
    if (!data.gender) {
      return 'Please select a Gender.';
    }
    if (!data.height || Number(data.height) <= 0) {
      return 'Please enter a valid Height.';
    }
    if (!data.weight || Number(data.weight) <= 0) {
      return 'Please enter a valid Weight.';
    }
    return null;
  };

  // Report this step's state up to the dashboard on every change, not just on
  // "Next" — "Save & Continue Later" serializes the dashboard's snapshot, so
  // without this it can undo a removal or drop an entry. The trailing form
  // entries are reported too (once they validate), since the user may fill one
  // in and save from the sidebar without pressing this step's Save button.
  useEffect(() => {
    const kinValid = validateNextOfKin(currentNextOfKin) === null;
    const refereeValid = validateReferee(currentReferee) === null;
    onLocalChange?.({
      biometricData,
      nextOfKinList,
      refereesList,
      __drafts: {
        nextOfKinList: editingKinId === null && kinValid ? currentNextOfKin : null,
        refereesList: editingRefereeId === null && refereeValid ? currentReferee : null,
      },
      // In-flight corrections replace their entry rather than adding one.
      __edits: {
        nextOfKinList: editingKinId !== null && kinValid
          ? { id: editingKinId, fields: currentNextOfKin } : null,
        refereesList: editingRefereeId !== null && refereeValid
          ? { id: editingRefereeId, fields: currentReferee } : null,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [biometricData, nextOfKinList, refereesList, currentNextOfKin, currentReferee, editingKinId, editingRefereeId]);

  const handleAddNextOfKin = () => {
    const errorMsg = validateNextOfKin(currentNextOfKin);
    if (errorMsg) {
      alert(errorMsg);
      return;
    }
    if (editingKinId !== null) {
      setNextOfKinList(applyEdit(nextOfKinList, editingKinId, currentNextOfKin));
      setEditingKinId(null);
    } else {
      setNextOfKinList([...nextOfKinList, { ...currentNextOfKin, id: Date.now() }]);
    }
    setCurrentNextOfKin(EMPTY_KIN);
  };

  const handleEditNextOfKin = (kin) => {
    const { id, _persisted, _dirty, ...fields } = kin;
    setCurrentNextOfKin({ ...EMPTY_KIN, ...fields });
    setEditingKinId(id);
  };

  const handleCancelKinEdit = () => {
    setEditingKinId(null);
    setCurrentNextOfKin(EMPTY_KIN);
  };

  const handleRemoveNextOfKin = async (kin) => {
    if (kin._persisted) {
      try {
        await resumeService.deleteNextOfKin(kin.id);
      } catch (error) {
        alert(getApiErrorMessage(error, 'Failed to delete next of kin. Please try again.'));
        return;
      }
    }
    if (editingKinId === kin.id) handleCancelKinEdit();
    setNextOfKinList(nextOfKinList.filter(k => k.id !== kin.id));
  };

  const handleAddReferee = () => {
    const errorMsg = validateReferee(currentReferee);
    if (errorMsg) {
      alert(errorMsg);
      return;
    }
    if (editingRefereeId !== null) {
      setRefereesList(applyEdit(refereesList, editingRefereeId, currentReferee));
      setEditingRefereeId(null);
    } else {
      setRefereesList([...refereesList, { ...currentReferee, id: Date.now() }]);
    }
    setCurrentReferee(EMPTY_REFEREE);
  };

  const handleEditReferee = (referee) => {
    const { id, _persisted, _dirty, ...fields } = referee;
    setCurrentReferee({ ...EMPTY_REFEREE, ...fields });
    setEditingRefereeId(id);
  };

  const handleCancelRefereeEdit = () => {
    setEditingRefereeId(null);
    setCurrentReferee(EMPTY_REFEREE);
  };

  const handleRemoveReferee = async (referee) => {
    if (referee._persisted) {
      try {
        await resumeService.deleteReferee(referee.id);
      } catch (error) {
        alert(getApiErrorMessage(error, 'Failed to delete referee. Please try again.'));
        return;
      }
    }
    if (editingRefereeId === referee.id) handleCancelRefereeEdit();
    setRefereesList(refereesList.filter(r => r.id !== referee.id));
  };

  const handleCompleteResume = () => {
    // Biometrics is only actually submitted once the user reaches the last
    // tab (referees) and clicks through — validate here so a missing
    // gender/height/weight surfaces as a clear message instead of a failed
    // API call.
    if (biometricTab === 'referees') {
      const bioError = validateBiometrics(biometricData);
      if (bioError) {
        alert(bioError);
        return;
      }
    }

    let finalKin = [...nextOfKinList];
    let finalReferees = [...refereesList];

    const isPartialKin = Object.values(currentNextOfKin).some(val => val !== '' && val !== '+44');
    if (isPartialKin) {
      const errorMsg = validateNextOfKin(currentNextOfKin);
      if (errorMsg) {
        alert("Please complete or clear active Next of Kin entry: " + errorMsg);
        return;
      }
      finalKin = editingKinId !== null
        ? applyEdit(finalKin, editingKinId, currentNextOfKin)
        : [...finalKin, { ...currentNextOfKin, id: Date.now() }];
    }

    const isPartialReferee = Object.values(currentReferee).some(val => val !== '' && val !== '+44');
    if (isPartialReferee) {
      const errorMsg = validateReferee(currentReferee);
      if (errorMsg) {
        alert("Please complete or clear active Referee entry: " + errorMsg);
        return;
      }
      finalReferees = editingRefereeId !== null
        ? applyEdit(finalReferees, editingRefereeId, currentReferee)
        : [...finalReferees, { ...currentReferee, id: Date.now() + 1 }];
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
                  onClick={() => setBiometricData({ ...biometricData, gender: biometricData.gender === 'Male' ? '' : 'Male' })}
                  className={`px-6 py-2 rounded-full font-medium transition-colors text-sm ${biometricData.gender === 'Male'
                    ? 'bg-[#003971] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setBiometricData({ ...biometricData, gender: biometricData.gender === 'Female' ? '' : 'Female' })}
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

            {/* BMI and Eye Color */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="bmi" className="block text-gray-700 font-medium mb-1 text-sm">
                  BMI
                </label>
                <input
                  type="text"
                  id="bmi"
                  name="bmi"
                  placeholder="Enter BMI"
                  value={biometricData.bmi}
                  onChange={handleBiometricChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
                />
              </div>

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
                    className={`bg-gray-50 rounded-lg p-3 relative ${editingKinId === kin.id ? 'ring-2 ring-[#003971]' : ''}`}
                  >
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleEditNextOfKin(kin)}
                        className="text-gray-400 hover:text-[#003971]"
                        aria-label={`Edit ${kin.name || 'next of kin'}`}
                        title="Edit"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveNextOfKin(kin)}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label={`Remove ${kin.name || 'next of kin'}`}
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
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
                    className={`bg-gray-50 rounded-lg p-3 relative ${editingRefereeId === referee.id ? 'ring-2 ring-[#003971]' : ''}`}
                  >
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleEditReferee(referee)}
                        className="text-gray-400 hover:text-[#003971]"
                        aria-label={`Edit ${referee.name || 'referee'}`}
                        title="Edit"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveReferee(referee)}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label={`Remove ${referee.name || 'referee'}`}
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{referee.name}</p>
                    {(referee.position || referee.company) && (
                      <p className="text-xs font-medium text-gray-700">
                        {referee.position}{referee.position && referee.company ? ' at ' : ''}{referee.company}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">{referee.email}</p>
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
                <label htmlFor="refereeCompany" className="block text-gray-700 font-medium mb-1 text-sm">
                  Company Name
                </label>
                <input
                  type="text"
                  id="refereeCompany"
                  name="company"
                  placeholder="Enter company name"
                  value={currentReferee.company}
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
            {biometricTab !== 'biometric' &&
              (biometricTab === 'nextOfKin' ? editingKinId : editingRefereeId) !== null && (
                <button
                  type="button"
                  onClick={biometricTab === 'nextOfKin' ? handleCancelKinEdit : handleCancelRefereeEdit}
                  disabled={isLoading}
                  className="text-gray-400 py-2 px-4 rounded-lg font-medium hover:text-gray-600 transition-colors text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
            {biometricTab !== 'biometric' && (
              <button
                type="button"
                onClick={biometricTab === 'nextOfKin' ? handleAddNextOfKin : handleAddReferee}
                disabled={isLoading}
                className="text-[#003971] py-2 px-6 rounded-lg font-medium hover:bg-blue-50 transition-colors text-sm disabled:opacity-50"
              >
                {(biometricTab === 'nextOfKin' ? editingKinId : editingRefereeId) !== null ? 'Update' : 'Save'}
              </button>
            )}
            <button
              type="button"
              onClick={handleCompleteResume}
              disabled={isLoading}
              className="bg-[#003971] text-white py-2 px-10 rounded-lg font-medium hover:bg-[#002855] transition-colors text-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isLoading ? (biometricTab === 'referees' ? 'Finishing...' : 'Saving...') : (biometricTab === 'referees' ? 'Review Resume' : 'Next')}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default BiometricsNextOfKin;

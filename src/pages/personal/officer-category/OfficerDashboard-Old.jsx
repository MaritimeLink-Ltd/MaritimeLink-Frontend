import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { countryCodes } from '../../../utils/countryCodes';

const OfficerDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    address: '',
    countryCode: '+92',
    contactNumber: '',
    email: '',
    professionalSummary: ''
  });

  const [skills, setSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState({ name: '', level: 0 });

  const [seaServiceEntries, setSeaServiceEntries] = useState([]);
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

  const [activeTab, setActiveTab] = useState('licenses'); // 'licenses' or 'endorsements'
  const [licenses, setLicenses] = useState([]);
  const [currentLicense, setCurrentLicense] = useState({
    licenseName: '',
    licenseNumber: '',
    issuingCountry: '',
    dateOfIssue: '',
    validTill: ''
  });
  const [endorsements, setEndorsements] = useState([]);
  const [currentEndorsement, setCurrentEndorsement] = useState({
    licenseName: '',
    licenseNumber: '',
    issuingCountry: '',
    dateOfIssue: '',
    validTill: ''
  });

  const [academicTab, setAcademicTab] = useState('academic'); // 'academic' or 'stcw'
  const [academicQualifications, setAcademicQualifications] = useState([]);
  const [currentAcademic, setCurrentAcademic] = useState({
    qualificationName: '',
    institution: '',
    grade: '',
    startDate: '',
    endDate: ''
  });
  const [stcwCertificates, setStcwCertificates] = useState([]);
  const [currentStcw, setCurrentStcw] = useState({
    qualificationName: '',
    certificateNumber: '',
    issuingCountry: '',
    dateOfIssue: '',
    validTill: ''
  });

  const [medicalTab, setMedicalTab] = useState('medical'); // 'medical' or 'travel'
  const [medicalDocuments, setMedicalDocuments] = useState([]);
  const [currentMedical, setCurrentMedical] = useState({
    certificateName: '',
    certificateNumber: '',
    issuingCountry: '',
    dateOfIssue: '',
    validTill: ''
  });
  const [travelDocuments, setTravelDocuments] = useState([]);
  const [currentTravel, setCurrentTravel] = useState({
    documentName: '',
    documentNumber: '',
    issuingCountry: '',
    dateOfIssue: '',
    validTill: ''
  });

  const [biometricTab, setBiometricTab] = useState('biometric'); // 'biometric', 'nextOfKin', or 'referees'
  const [biometricData, setBiometricData] = useState({
    gender: 'Male',
    height: '',
    weight: '',
    bmi: '',
    eyeColor: '',
    overallSize: '',
    shoeSize: ''
  });
  const [nextOfKinList, setNextOfKinList] = useState([]);
  const [currentNextOfKin, setCurrentNextOfKin] = useState({
    name: '',
    relationship: '',
    countryCode: '+92',
    phone: '',
    email: ''
  });
  const [refereesList, setRefereesList] = useState([]);
  const [currentReferee, setCurrentReferee] = useState({
    name: '',
    position: '',
    countryCode: '+92',
    phone: '',
    email: ''
  });

  const sections = [
    { id: 1, title: 'Personal Information' },
    { id: 2, title: 'Professional Summary' },
    { id: 3, title: 'Key Skills' },
    { id: 4, title: 'Licenses & Endorsement' },
    { id: 5, title: 'Sea Service Log' },
    { id: 6, title: 'Academic Qualifications & STCW Certificates' },
    { id: 7, title: 'Medical & Travel Documents' },
    { id: 8, title: 'Biometrics, Next Of Kin & Referees' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSeaServiceChange = (e) => {
    setCurrentSeaService({
      ...currentSeaService,
      [e.target.name]: e.target.value
    });
  };

  const handleNext = () => {
    console.log('Form data:', formData);
    if (activeSection < sections.length) {
      setActiveSection(activeSection + 1);
    }
  };

  const handleGoBack = () => {
    if (activeSection > 1) {
      setActiveSection(activeSection - 1);
    }
  };

  const handleAddSkill = () => {
    if (currentSkill.name && currentSkill.level > 0) {
      setSkills([...skills, { ...currentSkill, id: Date.now() }]);
      setCurrentSkill({ name: '', level: 0 });
    }
  };

  const handleRemoveSkill = (id) => {
    setSkills(skills.filter(skill => skill.id !== id));
  };

  const handleStarClick = (level) => {
    setCurrentSkill({ ...currentSkill, level });
  };

  const handleAddSeaService = () => {
    if (currentSeaService.companyName && currentSeaService.vesselName) {
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

  const handleAddLicense = () => {
    if (currentLicense.licenseName && currentLicense.licenseNumber) {
      setLicenses([...licenses, { ...currentLicense, id: Date.now() }]);
      setCurrentLicense({
        licenseName: '',
        licenseNumber: '',
        issuingCountry: '',
        dateOfIssue: '',
        validTill: ''
      });
    }
  };

  const handleRemoveLicense = (id) => {
    setLicenses(licenses.filter(license => license.id !== id));
  };

  const handleAddEndorsement = () => {
    if (currentEndorsement.licenseName && currentEndorsement.licenseNumber) {
      setEndorsements([...endorsements, { ...currentEndorsement, id: Date.now() }]);
      setCurrentEndorsement({
        licenseName: '',
        licenseNumber: '',
        issuingCountry: '',
        dateOfIssue: '',
        validTill: ''
      });
    }
  };

  const handleRemoveEndorsement = (id) => {
    setEndorsements(endorsements.filter(endorsement => endorsement.id !== id));
  };

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

  const handleBiometricChange = (e) => {
    setBiometricData({
      ...biometricData,
      [e.target.name]: e.target.value
    });
  };

  const handleNextOfKinChange = (e) => {
    setCurrentNextOfKin({
      ...currentNextOfKin,
      [e.target.name]: e.target.value
    });
  };

  const handleRefereeChange = (e) => {
    setCurrentReferee({
      ...currentReferee,
      [e.target.name]: e.target.value
    });
  };

  const handleAddNextOfKin = () => {
    if (currentNextOfKin.name && currentNextOfKin.relationship) {
      setNextOfKinList([...nextOfKinList, { ...currentNextOfKin, id: Date.now() }]);
      setCurrentNextOfKin({
        name: '',
        relationship: '',
        countryCode: '+92',
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
        countryCode: '+92',
        phone: '',
        email: ''
      });
    }
  };

  const handleRemoveReferee = (id) => {
    setRefereesList(refereesList.filter(referee => referee.id !== id));
  };

  const handleCompleteResume = () => {
    console.log('Resume completed!');
    // Add your completion logic here
  };

  const handleSaveAndContinue = () => {
    console.log('Saving and continuing later...');
    // navigate('/dashboard');
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out z-50 flex flex-col h-screen`}>
        {/* Logo and Menu */}
        <div className="p-3 flex items-center justify-between">
          <img 
            src="/images/logo.png" 
            alt="MaritimeLink Logo" 
            className="w-20 h-auto"
          />
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 px-3 py-2 overflow-hidden">
          {sections.map((section) => (
            <div
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center space-x-2.5 p-2 mb-1 rounded-lg cursor-pointer transition-colors ${
                activeSection === section.id
                  ? 'bg-[#003971] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                activeSection === section.id
                  ? 'bg-white text-[#003971]'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {section.id}
              </div>
              <span className="text-xs font-medium leading-tight">{section.title}</span>
            </div>
          ))}
        </div>

        {/* Resume Section */}
        <div className="p-3 border-t">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-4 h-4 text-[#003971]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
              <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
            <span className="font-medium text-gray-700 text-xs">Resume</span>
          </div>
          <div className="mb-1.5">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-[#003971] h-1.5 rounded-full" style={{ width: '90%' }}></div>
            </div>
          </div>
          <p className="text-xs text-gray-600 mb-2">90% complete</p>
          <button
            onClick={handleSaveAndContinue}
            className="w-full bg-[#003971] text-white py-1.5 px-3 rounded-full font-medium hover:bg-[#002855] transition-colors text-xs"
          >
            Save & Continue Later
          </button>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 bg-white p-2 rounded-lg shadow-md"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center overflow-auto h-screen py-8">
        <div className="w-full max-w-2xl px-6">
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {activeSection === 1 ? 'Personal Info' : 
               activeSection === 2 ? 'Professional Summary' : 
               activeSection === 3 ? 'Key Skills' :
               activeSection === 4 ? 'Licences & Endorsements' :
               activeSection === 5 ? 'Sea Service Log' :
               activeSection === 6 ? 'Academic Qualifications & STCW Certificates' :
               activeSection === 7 ? 'Medical & Travel Documents' :
               activeSection === 8 ? 'Biometric, Next Of Kin & Referees' :
               'Section ' + activeSection}
            </h1>
            <p className="text-gray-500 text-sm">
              {activeSection === 1 ? 'Fill out to get started' : 
               activeSection === 2 ? 'Enter your professional summary' : 
               activeSection === 3 ? 'Add your skills' :
               activeSection === 4 ? 'Add your licenses & endorsements' :
               activeSection === 5 ? 'Add your sea service details' :
               activeSection === 6 ? 'Add your academic and certificate details' :
               activeSection === 7 ? 'Add your medical and travel documents' :
               activeSection === 8 ? 'Fill out to get started' :
               'Complete this section'}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-lg p-5">
            {activeSection === 1 && (
              <form className="space-y-3">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-gray-700 font-medium mb-1 text-sm">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label htmlFor="dateOfBirth" className="block text-gray-700 font-medium mb-1 text-sm">
                    Date Of Birth
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      placeholder="Enter your date of birth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      max={new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-gray-700 font-medium mb-1 text-sm">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    placeholder="Enter your address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                  />
                </div>

                {/* Contact Number */}
                <div>
                  <label htmlFor="contactNumber" className="block text-gray-700 font-medium mb-1 text-sm">
                    Contact Number
                  </label>
                  <div className="flex space-x-2">
                    <select
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleChange}
                      className="w-32 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                    >
                      {countryCodes.map((country) => (
                        <option key={country.code + country.country} value={country.code}>
                          {country.flag} {country.code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      id="contactNumber"
                      name="contactNumber"
                      placeholder="Enter your contact number"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-1 text-sm">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                  />
                </div>

                {/* Next Button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="bg-[#003971] text-white py-2 px-10 rounded-lg font-medium hover:bg-[#002855] transition-colors text-sm"
                  >
                    Next
                  </button>
                </div>
              </form>
            )}

            {activeSection === 2 && (
              <form className="space-y-4">
                {/* Professional Summary */}
                <div>
                  <label htmlFor="professionalSummary" className="block text-gray-700 font-medium mb-1 text-sm">
                    Professional Summary
                  </label>
                  <textarea
                    id="professionalSummary"
                    name="professionalSummary"
                    placeholder="Write brief professional summary"
                    value={formData.professionalSummary}
                    onChange={handleChange}
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm resize-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleGoBack}
                    className="text-gray-400 py-2 px-8 rounded-lg font-medium hover:text-gray-600 transition-colors text-sm"
                  >
                    Go Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="bg-[#003971] text-white py-2 px-10 rounded-lg font-medium hover:bg-[#002855] transition-colors text-sm"
                  >
                    Next
                  </button>
                </div>
              </form>
            )}

            {activeSection === 3 && (
              <form className="space-y-4">
                {/* Added Skills */}
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {skills.map((skill) => (
                      <div
                        key={skill.id}
                        className="bg-gray-100 rounded-lg px-3 py-2 flex items-center space-x-2"
                      >
                        <div>
                          <p className="text-xs font-medium text-gray-700">{skill.name}</p>
                          <div className="flex space-x-0.5 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-3 h-3 ${star <= skill.level ? 'text-[#003971]' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Skills Input and Star Rating */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Skills Input */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-1 text-sm">
                      Skills
                    </label>
                    <input
                      type="text"
                      placeholder="Enter skill name"
                      value={currentSkill.name}
                      onChange={(e) => setCurrentSkill({ ...currentSkill, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                    />
                  </div>

                  {/* Skill Level */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-1 text-sm">
                      Select Skill Level
                    </label>
                    <div className="flex space-x-2 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleStarClick(star)}
                          className="focus:outline-none"
                        >
                          <svg
                            className={`w-8 h-8 ${star <= currentSkill.level ? 'text-[#003971]' : 'text-gray-300'} hover:text-[#003971] transition-colors`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-between items-center pt-6">
                  <button
                    type="button"
                    onClick={handleGoBack}
                    className="text-gray-400 py-2 px-8 rounded-lg font-medium hover:text-gray-600 transition-colors text-sm"
                  >
                    Go Back
                  </button>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={handleAddSkill}
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
            )}

            {activeSection === 4 && (
              <form className="space-y-4">
                {/* Tab Buttons */}
                <div className="flex space-x-2 mb-6">
                  <button
                    type="button"
                    onClick={() => setActiveTab('licenses')}
                    className={`px-6 py-2 rounded-full font-medium transition-colors text-sm ${
                      activeTab === 'licenses'
                        ? 'bg-[#003971] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Licenses
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('endorsements')}
                    className={`px-6 py-2 rounded-full font-medium transition-colors text-sm ${
                      activeTab === 'endorsements'
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
                      {/* License Name */}
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                        />
                      </div>

                      {/* License Number */}
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                        />
                      </div>

                      {/* Issuing Country */}
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                        />
                      </div>

                      {/* Date Of Issue and Valid Till */}
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                          />
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Endorsements Tab Content */}
                {activeTab === 'endorsements' && (
                  <>
                    {/* Added Endorsements */}
                    {endorsements.length > 0 && (
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {endorsements.map((endorsement) => (
                          <div
                            key={endorsement.id}
                            className="bg-gray-50 rounded-lg p-3 relative"
                          >
                            <button
                              type="button"
                              onClick={() => handleRemoveEndorsement(endorsement.id)}
                              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                            <p className="text-sm font-semibold text-gray-800">{endorsement.licenseName}</p>
                            <p className="text-xs text-gray-600">{endorsement.issuingCountry}</p>
                            <p className="text-xs text-gray-500">
                              {endorsement.dateOfIssue && endorsement.validTill ? 
                                `${new Date(endorsement.dateOfIssue).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} to ${new Date(endorsement.validTill).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` 
                                : 'Dates not specified'}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Endorsement Form */}
                    <div className="space-y-4">
                      {/* License Name */}
                      <div>
                        <label htmlFor="endorsementName" className="block text-gray-700 font-medium mb-1 text-sm">
                          License Name
                        </label>
                        <input
                          type="text"
                          id="endorsementName"
                          name="licenseName"
                          placeholder="Enter your license name"
                          value={currentEndorsement.licenseName}
                          onChange={handleEndorsementChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                        />
                      </div>

                      {/* License Number */}
                      <div>
                        <label htmlFor="endorsementNumber" className="block text-gray-700 font-medium mb-1 text-sm">
                          License Number
                        </label>
                        <input
                          type="text"
                          id="endorsementNumber"
                          name="licenseNumber"
                          placeholder="Enter license number"
                          value={currentEndorsement.licenseNumber}
                          onChange={handleEndorsementChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                        />
                      </div>

                      {/* Issuing Country */}
                      <div>
                        <label htmlFor="endorsementCountry" className="block text-gray-700 font-medium mb-1 text-sm">
                          Issuing Country
                        </label>
                        <input
                          type="text"
                          id="endorsementCountry"
                          name="issuingCountry"
                          placeholder="Enter issuing authority name"
                          value={currentEndorsement.issuingCountry}
                          onChange={handleEndorsementChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                        />
                      </div>

                      {/* Date Of Issue and Valid Till */}
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                          />
                        </div>

                        <div>
                          <label htmlFor="endorsementValidTill" className="block text-gray-700 font-medium mb-1 text-sm">
                            Valid Till
                          </label>
                          <input
                            type="date"
                            id="endorsementValidTill"
                            name="validTill"
                            placeholder="dd/mm/yyyy"
                            value={currentEndorsement.validTill}
                            onChange={handleEndorsementChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Buttons */}
                <div className="flex justify-between items-center pt-6">
                  <button
                    type="button"
                    onClick={handleGoBack}
                    className="text-gray-400 py-2 px-8 rounded-lg font-medium hover:text-gray-600 transition-colors text-sm"
                  >
                    Go Back
                  </button>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={activeTab === 'licenses' ? handleAddLicense : handleAddEndorsement}
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
            )}

            {activeSection === 5 && (
              <form className="space-y-4">
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
                  {/* Company Name */}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                    />
                  </div>

                  {/* Role */}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                    />
                  </div>

                  {/* Vessel Name */}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                    />
                  </div>

                  {/* IMO No. */}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                    />
                  </div>

                  {/* Flag */}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                    />
                  </div>

                  {/* Type */}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                    />
                  </div>

                  {/* DWT */}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                    />
                  </div>

                  {/* ME type */}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                    />
                  </div>

                  {/* KWT */}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                    />
                  </div>

                  {/* Joining Date */}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                    />
                  </div>

                  {/* Till */}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-between items-center pt-6">
                  <button
                    type="button"
                    onClick={handleGoBack}
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
            )}

            {activeSection === 6 && (
              <form className="space-y-4">
                {/* Tab Buttons */}
                <div className="flex space-x-2 mb-6">
                  <button
                    type="button"
                    onClick={() => setAcademicTab('academic')}
                    className={`px-6 py-2 rounded-full font-medium transition-colors text-sm ${
                      academicTab === 'academic'
                        ? 'bg-[#003971] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Academic Qualifications
                  </button>
                  <button
                    type="button"
                    onClick={() => setAcademicTab('stcw')}
                    className={`px-6 py-2 rounded-full font-medium transition-colors text-sm ${
                      academicTab === 'stcw'
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
                      {/* Qualification Name */}
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                        />
                      </div>

                      {/* Institution */}
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                        />
                      </div>

                      {/* Grade */}
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                        />
                      </div>

                      {/* Start Date and End Date */}
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
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
                      {/* STCW Qualification */}
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                        />
                      </div>

                      {/* Certificate Number */}
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                        />
                      </div>

                      {/* Issuing Country */}
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                        />
                      </div>

                      {/* Date Of Issue and Valid Till */}
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Buttons */}
                <div className="flex justify-between items-center pt-6">
                  <button
                    type="button"
                    onClick={handleGoBack}
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
            )}

            {activeSection === 7 && (
              <form className="space-y-4">
                {/* Tab Buttons */}
                <div className="flex space-x-2 mb-6">
                  <button
                    type="button"
                    onClick={() => setMedicalTab('medical')}
                    className={`px-6 py-2 rounded-full font-medium transition-colors text-sm ${
                      medicalTab === 'medical'
                        ? 'bg-[#003971] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Medical Document
                  </button>
                  <button
                    type="button"
                    onClick={() => setMedicalTab('travel')}
                    className={`px-6 py-2 rounded-full font-medium transition-colors text-sm ${
                      medicalTab === 'travel'
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
                      {/* Certificate Name */}
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

                      {/* Certificate Number */}
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

                      {/* Issuing Country */}
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

                      {/* Date Of Issue and Valid Till */}
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
                      {/* Document Name */}
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

                      {/* Document Number */}
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

                      {/* Issuing Country */}
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

                      {/* Date Of Issue and Valid Till */}
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

                {/* Buttons */}
                <div className="flex justify-between items-center pt-6">
                  <button
                    type="button"
                    onClick={handleGoBack}
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
            )}

            {activeSection === 8 && (
              <form className="space-y-4">
                {/* Tab Buttons */}
                <div className="flex space-x-2 mb-6">
                  <button
                    type="button"
                    onClick={() => setBiometricTab('biometric')}
                    className={`px-6 py-2 rounded-full font-medium transition-colors text-sm ${
                      biometricTab === 'biometric'
                        ? 'bg-[#003971] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Biometric
                  </button>
                  <button
                    type="button"
                    onClick={() => setBiometricTab('nextOfKin')}
                    className={`px-6 py-2 rounded-full font-medium transition-colors text-sm ${
                      biometricTab === 'nextOfKin'
                        ? 'bg-[#003971] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Next Of Kin
                  </button>
                  <button
                    type="button"
                    onClick={() => setBiometricTab('referees')}
                    className={`px-6 py-2 rounded-full font-medium transition-colors text-sm ${
                      biometricTab === 'referees'
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
                          className={`px-6 py-2 rounded-full font-medium transition-colors text-sm ${
                            biometricData.gender === 'Male'
                              ? 'bg-[#003971] text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Male
                        </button>
                        <button
                          type="button"
                          onClick={() => setBiometricData({ ...biometricData, gender: 'Female' })}
                          className={`px-6 py-2 rounded-full font-medium transition-colors text-sm ${
                            biometricData.gender === 'Female'
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm pr-10"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm pr-10"
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
                        <div className="relative">
                          <input
                            type="text"
                            id="bmi"
                            name="bmi"
                            placeholder="Enter BMI"
                            value={biometricData.bmi}
                            onChange={handleBiometricChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm pr-10"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                            kg
                          </span>
                        </div>
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm pr-10"
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
                      {/* Name */}
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                        />
                      </div>

                      {/* Relationship */}
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label htmlFor="kinPhone" className="block text-gray-700 font-medium mb-1 text-sm">
                          Phone
                        </label>
                        <div className="flex space-x-2">
                          <select
                            name="countryCode"
                            value={currentNextOfKin.countryCode}
                            onChange={handleNextOfKinChange}
                            className="w-32 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
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
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                          />
                        </div>
                      </div>

                      {/* Email */}
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
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
                      {/* Name */}
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                        />
                      </div>

                      {/* Position */}
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label htmlFor="refereePhone" className="block text-gray-700 font-medium mb-1 text-sm">
                          Phone
                        </label>
                        <div className="flex space-x-2">
                          <select
                            name="countryCode"
                            value={currentReferee.countryCode}
                            onChange={handleRefereeChange}
                            className="w-32 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
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
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                          />
                        </div>
                      </div>

                      {/* Email */}
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Buttons */}
                <div className="flex justify-between items-center pt-6">
                  <button
                    type="button"
                    onClick={handleGoBack}
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
                      Complete Resume
                    </button>
                  </div>
                </div>
              </form>
            )}

            {activeSection > 8 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Section {activeSection} content coming soon...</p>
                <div className="flex justify-between pt-8">
                  <button
                    type="button"
                    onClick={handleGoBack}
                    className="text-gray-400 py-2 px-8 rounded-lg font-medium hover:text-gray-600 transition-colors text-sm"
                  >
                    Go Back
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;

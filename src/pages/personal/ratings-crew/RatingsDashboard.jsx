import { useState, useEffect, useMemo } from 'react';
import resumeService from '../../../services/resumeService';
import { getApiErrorMessage } from '../../../utils/apiError';
import { calculateResumeCompletion, saveResumeProgress } from '../../../utils/resumeProgress';
import { markPersisted, getUnpersisted, withCreatedIds, mergePendingDrafts } from '../../../utils/resumeStepSync';
import { useNavigate } from 'react-router-dom';
import PersonalInfo from './dashboard-sections/PersonalInfo';
import ProfessionalSummary from './dashboard-sections/ProfessionalSummary';
import KeySkills from '../officer-category/dashboard-sections/KeySkills';
import SeaServiceLog from '../officer-category/dashboard-sections/SeaServiceLog';
import AcademicQualifications from '../officer-category/dashboard-sections/AcademicQualifications';
import MedicalTravelDocs from '../officer-category/dashboard-sections/MedicalTravelDocs';
import BiometricsNextOfKin from '../officer-category/dashboard-sections/BiometricsNextOfKin';
import Resume from '../dashboard/dashboard-sections/Resume';

const RatingsDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Centralized data storage
  const [allData, setAllData] = useState({
    personalInfo: {},
    professionalSummary: {},
    skills: {},
    seaServiceLog: {},
    academicQualifications: {},
    medicalTravelDocs: {},
    biometricsNextOfKin: {}
  });

  // Fetch existing resume data on mount
  useEffect(() => {
    const fetchResume = async () => {
      try {
        setIsLoading(true);
        const apiData = await resumeService.getResume();
        if (apiData) {
          const mapped = resumeService.mapApiToRatingsData(apiData);
          setAllData(mapped);
        }
      } catch (error) {
        console.log('No existing resume found or error fetching:', error?.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResume();
  }, []);
  const sectionTabs = {
    5: ['academic', 'stcw'],
    6: ['medical', 'travel'],
    7: ['biometric', 'nextOfKin', 'referees'],
  };
  // Track the active sub-tab per section
  const [activeSubTab, setActiveSubTab] = useState({});

  // Helper: get active tab for current section (defaults to first)
  const getCurrentTab = () => {
    const tabs = sectionTabs[activeSection];
    if (!tabs) return null;
    return activeSubTab[activeSection] || tabs[0];
  };

  const setCurrentTab = (tab) => {
    setActiveSubTab(prev => ({ ...prev, [activeSection]: tab }));
  };

  const sections = [
    { id: 1, title: 'Personal Information' },
    { id: 2, title: 'Professional Summary' },
    { id: 3, title: 'Key Skills' },
    { id: 4, title: 'Sea Service Log' },
    { id: 5, title: 'Academic Qualifications & STCW Certificates' },
    { id: 6, title: 'Medical & Travel Documents' },
    { id: 7, title: 'Biometrics, Next Of Kin & Referees' }
  ];

  // Progress is measured from the data entered, not the step reached, so the
  // resume dashboard reports the same figure as this sidebar.
  const completionPercent = useMemo(
    () => calculateResumeCompletion(allData, 'ratings'),
    [allData],
  );
  const isReviewStep = activeSection > sections.length;

  const handleNext = async (sectionData) => {
    const tabs = sectionTabs[activeSection];
    const currentTab = getCurrentTab();

    if (tabs && currentTab !== tabs[tabs.length - 1]) {
      // Still more sub-tabs — advance the sub-tab
      const nextTabIndex = tabs.indexOf(currentTab) + 1;
      setCurrentTab(tabs[nextTabIndex]);
      return;
    }

    setApiError(null);
    let dataToStore = sectionData;

    // Section 1: Personal Info — call API
    if (activeSection === 1) {
      setIsLoading(true);
      try {
        await resumeService.updatePersonalInfo(sectionData);
      } catch (error) {
        setApiError(getApiErrorMessage(error, 'Failed to save personal info. Please try again.'));
        setIsLoading(false);
        return; // Do not advance on error
      }
      setIsLoading(false);
    }

    // Section 2: Professional Summary — call API
    if (activeSection === 2) {
      setIsLoading(true);
      try {
        await resumeService.updateSummary(sectionData);
      } catch (error) {
        setApiError(getApiErrorMessage(error, 'Failed to save professional summary. Please try again.'));
        setIsLoading(false);
        return; // Do not advance on error
      }
      setIsLoading(false);
    }

    // Section 3: Key Skills — call API
    if (activeSection === 3) {
      const newSkills = getUnpersisted(sectionData.skills);
      if (newSkills.length > 0) {
        setIsLoading(true);
        let results;
        try {
          results = await Promise.all(
            newSkills.map((skill) => resumeService.addSkill({ skillName: skill.name, rating: skill.level }))
          );
        } catch (error) {
          setApiError(getApiErrorMessage(error, 'Failed to save skills. Please try again.'));
          setIsLoading(false);
          return; // Do not advance on error
        }
        setIsLoading(false);
        dataToStore = { ...dataToStore, skills: markPersisted(withCreatedIds(sectionData.skills, newSkills, results)) };
      } else {
        dataToStore = { ...dataToStore, skills: markPersisted(sectionData.skills) };
      }
    }

    // Section 4: Sea Service Log — call API
    if (activeSection === 4) {
      const newEntries = getUnpersisted(sectionData.seaServiceEntries);
      let mergedEntries = sectionData.seaServiceEntries;
      if (newEntries.length > 0) {
        setIsLoading(true);
        try {
          const results = await Promise.all(newEntries.map((entry) => resumeService.addSeaServiceEntry(entry)));
          mergedEntries = withCreatedIds(sectionData.seaServiceEntries, newEntries, results);
        } catch (error) {
          setApiError(getApiErrorMessage(error, 'Failed to save sea service entries. Please try again.'));
          setIsLoading(false);
          return; // Do not advance on error
        }
        setIsLoading(false);
      }
      dataToStore = { ...dataToStore, seaServiceEntries: markPersisted(mergedEntries) };
    }

    // Section 5: Academic Qualifications — call API
    if (activeSection === 5) {
      const newAcademic = getUnpersisted(sectionData.academicQualifications);
      let mergedAcademic = sectionData.academicQualifications;
      if (newAcademic.length > 0) {
        setIsLoading(true);
        try {
          const results = await Promise.all(newAcademic.map((edu) => resumeService.addEducation(edu)));
          mergedAcademic = withCreatedIds(sectionData.academicQualifications, newAcademic, results);
        } catch (error) {
          setApiError(getApiErrorMessage(error, 'Failed to save academic qualifications. Please try again.'));
          setIsLoading(false);
          return; // Do not advance on error
        }
        setIsLoading(false);
      }
      dataToStore = { ...dataToStore, academicQualifications: markPersisted(mergedAcademic) };
    }

    // Section 5: STCW Certificates — call API
    if (activeSection === 5) {
      const newStcw = getUnpersisted(sectionData.stcwCertificates);
      let mergedStcw = sectionData.stcwCertificates;
      if (newStcw.length > 0) {
        setIsLoading(true);
        try {
          const results = await Promise.all(newStcw.map((cert) => resumeService.addStcwCertificate(cert)));
          mergedStcw = withCreatedIds(sectionData.stcwCertificates, newStcw, results);
        } catch (error) {
          setApiError(getApiErrorMessage(error, 'Failed to save STCW certificates. Please try again.'));
          setIsLoading(false);
          return; // Do not advance on error
        }
        setIsLoading(false);
      }
      dataToStore = { ...dataToStore, stcwCertificates: markPersisted(mergedStcw) };
    }

    // Section 6: Medical & Travel Documents — call API
    if (activeSection === 6) {
      const newMedical = getUnpersisted(sectionData.medicalDocuments);
      const newTravel = getUnpersisted(sectionData.travelDocuments);
      let mergedMedical = sectionData.medicalDocuments;
      let mergedTravel = sectionData.travelDocuments;

      if (newMedical.length > 0 || newTravel.length > 0) {
        setIsLoading(true);
        try {
          const [medicalResults, travelResults] = await Promise.all([
            Promise.all(newMedical.map(doc => resumeService.addMedicalTravelDocument({ ...doc, type: 'MEDICAL' }))),
            Promise.all(newTravel.map(doc => resumeService.addMedicalTravelDocument({ ...doc, type: 'TRAVEL' }))),
          ]);
          mergedMedical = withCreatedIds(sectionData.medicalDocuments, newMedical, medicalResults);
          mergedTravel = withCreatedIds(sectionData.travelDocuments, newTravel, travelResults);
        } catch (error) {
          setApiError(getApiErrorMessage(error, 'Failed to save medical/travel documents. Please try again.'));
          setIsLoading(false);
          return; // Do not advance on error
        }
        setIsLoading(false);
      }
      dataToStore = {
        ...dataToStore,
        medicalDocuments: markPersisted(mergedMedical),
        travelDocuments: markPersisted(mergedTravel),
      };
    }

    // Save section data locally
    const sectionKey = Object.keys(allData)[activeSection - 1];
    setAllData({
      ...allData,
      [sectionKey]: dataToStore
    });

    // Move to next section
    if (activeSection < sections.length) {
      setActiveSection(activeSection + 1);
    }
  };

  const handleGoBack = () => {
    if (activeSection > 1) {
      setActiveSection(activeSection - 1);
    }
  };

  // Sections report their live list state here as soon as it changes
  // (add/remove), independent of the "Next" click, so "Save & Continue
  // Later" — which serializes allData, not each section's own state —
  // never sends a stale snapshot that undoes an in-progress edit.
  const handleLocalChange = (sectionKey) => (partialData) => {
    setAllData((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], ...partialData },
    }));
  };

  const handleCompleteResume = async (sectionData) => {
    const tabs = sectionTabs[activeSection];
    const currentTab = getCurrentTab();

    if (tabs && currentTab !== tabs[tabs.length - 1]) {
      // Still more sub-tabs — advance the sub-tab
      const nextTabIndex = tabs.indexOf(currentTab) + 1;
      setCurrentTab(tabs[nextTabIndex]);
      return;
    }

    setApiError(null);
    setIsLoading(true);
    let dataToStore = sectionData;

    // Section 7a: Biometrics — call API
    if (sectionData.biometricData) {
      try {
        await resumeService.updateBiometrics(sectionData.biometricData);
      } catch (error) {
        setApiError(getApiErrorMessage(error, 'Failed to save biometrics. Please try again.'));
        setIsLoading(false);
        return; // Do not advance on error
      }
    }

    // Section 7b: Next Of Kin — call API
    const newKin = getUnpersisted(sectionData.nextOfKinList);
    let mergedKin = sectionData.nextOfKinList;
    if (newKin.length > 0) {
      try {
        const results = await Promise.all(newKin.map((kin) => resumeService.addNextOfKin(kin)));
        mergedKin = withCreatedIds(sectionData.nextOfKinList, newKin, results);
      } catch (error) {
        setApiError(getApiErrorMessage(error, 'Failed to save next of kin. Please try again.'));
        setIsLoading(false);
        return; // Do not advance on error
      }
    }

    // Section 7c: Referees — call API
    const newReferees = getUnpersisted(sectionData.refereesList);
    let mergedReferees = sectionData.refereesList;
    if (newReferees.length > 0) {
      try {
        const results = await Promise.all(newReferees.map((referee) => resumeService.addReferee(referee)));
        mergedReferees = withCreatedIds(sectionData.refereesList, newReferees, results);
      } catch (error) {
        setApiError(getApiErrorMessage(error, 'Failed to save referees. Please try again.'));
        setIsLoading(false);
        return; // Do not advance on error
      }
    }

    setIsLoading(false);

    dataToStore = {
      ...dataToStore,
      nextOfKinList: markPersisted(mergedKin),
      refereesList: markPersisted(mergedReferees),
    };

    // Save final section data
    setAllData({
      ...allData,
      biometricsNextOfKin: dataToStore
    });
    console.log('Resume completed!', allData);

    // Move to Review Resume section
    setActiveSection(8);
  };

  const handleSaveAndContinue = async () => {
    console.log('Saving and continuing later...', allData);
    try {
      setIsLoading(true);
      await resumeService.submitBulkResume(mergePendingDrafts(allData), 'PUT');

      // Saving from the review step is the submit action — it is what moves the
      // dashboard from "keep building" to "under review".
      saveResumeProgress(completionPercent, { submitted: isReviewStep });

      navigate('/personal/documents', {
        state: { showDocumentWalletPrompt: true },
      });
    } catch (error) {
      alert(getApiErrorMessage(error, 'Failed to save resume. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 1:
        return (
          <PersonalInfo
            onNext={handleNext}
            initialData={allData.personalInfo}
            isLoading={isLoading}
            apiError={apiError}
          />
        );
      case 2:
        return (
          <ProfessionalSummary
            onNext={handleNext}
            onBack={handleGoBack}
            initialData={allData.professionalSummary}
            isLoading={isLoading}
            apiError={apiError}
          />
        );
      case 3:
        return (
          <KeySkills
            onNext={handleNext}
            onBack={handleGoBack}
            initialData={allData.skills}
            isLoading={isLoading}
            apiError={apiError}
            onLocalChange={handleLocalChange('skills')}
          />
        );
      case 4:
        return (
          <SeaServiceLog
            onNext={handleNext}
            onBack={handleGoBack}
            initialData={allData.seaServiceLog}
            isLoading={isLoading}
            apiError={apiError}
            onLocalChange={handleLocalChange('seaServiceLog')}
          />
        );
      case 5:
        return (
          <AcademicQualifications
            onNext={handleNext}
            onBack={handleGoBack}
            initialData={allData.academicQualifications}
            activeTab={getCurrentTab() || 'academic'}
            setActiveTab={setCurrentTab}
            isLoading={isLoading}
            apiError={apiError}
            onLocalChange={handleLocalChange('academicQualifications')}
          />
        );
      case 6:
        return (
          <MedicalTravelDocs
            onNext={handleNext}
            onBack={handleGoBack}
            initialData={allData.medicalTravelDocs}
            activeTab={getCurrentTab() || 'medical'}
            setActiveTab={setCurrentTab}
            isLoading={isLoading}
            apiError={apiError}
            onLocalChange={handleLocalChange('medicalTravelDocs')}
          />
        );
      case 7:
        return (
          <BiometricsNextOfKin
            onNext={handleCompleteResume}
            onBack={handleGoBack}
            initialData={allData.biometricsNextOfKin}
            activeTab={getCurrentTab() || 'biometric'}
            setActiveTab={setCurrentTab}
            isLoading={isLoading}
            apiError={apiError}
            onLocalChange={handleLocalChange('biometricsNextOfKin')}
          />
        );
      case 8:
        return <Resume isReviewMode={true} defaultUserType="rating" onEdit={() => setActiveSection(1)} formData={allData} />;
      default:
        return <div>Section not found</div>;
    }
  };

  const getSectionTitle = () => {
    const titles = {
      1: 'Personal Info',
      2: 'Professional Summary',
      3: 'Key Skills',
      4: 'Sea Service Log',
      5: 'Academic Qualifications & STCW Certificates',
      6: 'Medical & Travel Documents',
      7: 'Biometric, Next Of Kin & Referees',
      8: 'Review Resume'
    };
    return titles[activeSection] || 'Unknown';
  };

  const getSectionDescription = () => {
    const descriptions = {
      1: 'Fill out to get started',
      2: 'Enter your professional summary',
      3: 'Add your skills',
      4: 'Add your sea service details',
      5: 'Add your academic and certificate details',
      6: 'Add your medical and travel documents',
      7: 'Fill out to get started',
      8: 'Review your complete profile before proceeding'
    };
    return descriptions[activeSection] || '';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar (slide-in) */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } transition-transform duration-300 ease-in-out z-50 flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between border-b">
          <img
            src="/images/logo.png"
            alt="MaritimeLink Logo"
            className="w-20 h-auto"
          />
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          <div className="bg-white rounded-2xl shadow-md p-3">
            {sections.map((section) => {
              const isActiveOrCompleted = section.id <= activeSection;

              return (
                <div
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    setSidebarOpen(false);
                  }}
                  className="flex items-center space-x-2.5 p-2 mb-1 cursor-pointer transition-colors hover:bg-gray-50 rounded-lg"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${isActiveOrCompleted
                      ? 'bg-[#003971] text-white'
                      : 'bg-gray-300 text-gray-500'
                      }`}
                  >
                    {section.id}
                  </div>
                  <span className={`text-xs font-normal leading-tight ${isActiveOrCompleted ? 'text-[#003971]' : 'text-gray-400'
                    }`}>
                    {section.title}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl shadow-md p-3">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-4 h-4 text-[#003971]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
              <span className="font-medium text-gray-700 text-xs">Resume</span>
            </div>
            <div className="mb-1.5">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-[#003971] h-1.5 rounded-full"
                  style={{ width: `${completionPercent}%` }}
                ></div>
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-2">
              {completionPercent}% complete
            </p>
            <button
              onClick={handleSaveAndContinue}
              className="w-full bg-[#003971] text-white py-1.5 px-3 rounded-full font-medium hover:bg-[#002855] transition-colors text-xs"
            >
              {isReviewStep ? 'Submit Resume for Review' : 'Save & Continue Later'}
            </button>
          </div>
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

      {/* Desktop Sidebar Column */}
      <div className="hidden lg:flex flex-col items-center w-72 px-4 py-4 sticky top-0 self-start">
        {/* Logo outside cards */}
        <div className="w-full mb-4">
          <img
            src="/images/logo.png"
            alt="MaritimeLink Logo"
            className="w-24 h-auto -ml-2"
          />
        </div>

        {/* Steps Card */}
        <div className="w-full bg-white rounded-2xl shadow-md p-3 mb-5">
          {sections.map((section) => {
            const isActiveOrCompleted = section.id <= activeSection;

            return (
              <div
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className="flex items-center space-x-2.5 p-2 mb-1 cursor-pointer transition-colors hover:bg-gray-50 rounded-lg"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${isActiveOrCompleted
                    ? 'bg-[#003971] text-white'
                    : 'bg-gray-300 text-gray-500'
                    }`}
                >
                  {section.id}
                </div>
                <span className={`text-xs font-normal leading-tight ${isActiveOrCompleted ? 'text-[#003971]' : 'text-gray-400'
                  }`}>
                  {section.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Resume Card */}
        <div className="w-full bg-white rounded-2xl shadow-md p-4">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-4 h-4 text-[#003971]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
              <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
            <span className="font-medium text-gray-700 text-xs">Resume</span>
          </div>
          <div className="mb-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-[#003971] h-1.5 rounded-full"
                style={{ width: `${completionPercent}%` }}
              ></div>
            </div>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            {completionPercent}% complete
          </p>
          <button
            onClick={handleSaveAndContinue}
            className="w-full bg-[#003971] text-white py-1.5 px-3 rounded-full font-medium hover:bg-[#002855] transition-colors text-xs"
          >
            {isReviewStep ? 'Submit Resume for Review' : 'Save & Continue Later'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex justify-center overflow-auto py-10 px-4 ${activeSection === 8 ? 'bg-[#F5F7FA]' : ''}`}>
        <div className={`w-full flex flex-col items-center ${activeSection === 8 ? 'max-w-7xl' : 'max-w-3xl'}`}>
          {/* Header */}
          {activeSection !== 8 && (
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {getSectionTitle()}
              </h1>
              <p className="text-gray-500 text-sm">
                {getSectionDescription()}
              </p>
            </div>
          )}

          {/* Form Container */}
          <div className={`w-full ${activeSection === 8 ? '' : 'max-w-xl bg-white rounded-2xl shadow-md p-8 h-[80vh] flex flex-col'}`}>
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingsDashboard;

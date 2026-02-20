import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PersonalInfo from './dashboard-sections/PersonalInfo';
import ProfessionalSummary from './dashboard-sections/ProfessionalSummary';
import KeySkills from './dashboard-sections/KeySkills';
import LicensesEndorsements from './dashboard-sections/LicensesEndorsements';
import SeaServiceLog from './dashboard-sections/SeaServiceLog';
import AcademicQualifications from './dashboard-sections/AcademicQualifications';
import MedicalTravelDocs from './dashboard-sections/MedicalTravelDocs';
import BiometricsNextOfKin from './dashboard-sections/BiometricsNextOfKin';
import Resume from '../dashboard/dashboard-sections/Resume';

const OfficerDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(1);
  const [completedSections, setCompletedSections] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Centralized data storage
  const [allData, setAllData] = useState({
    personalInfo: {},
    professionalSummary: {},
    skills: {},
    licensesEndorsements: {},
    seaServiceLog: {},
    academicQualifications: {},
    medicalTravelDocs: {},
    biometricsNextOfKin: {}
  });

  // Map of which sidebar sections have sub-tabs and their order
  const sectionTabs = {
    4: ['licenses', 'endorsements'],
    6: ['academic', 'stcw'],
    7: ['medical', 'travel'],
    8: ['biometric', 'nextOfKin', 'referees'],
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
    { id: 4, title: 'Licenses & Endorsement' },
    { id: 5, title: 'Sea Service Log' },
    { id: 6, title: 'Academic Qualifications & STCW Certificates' },
    { id: 7, title: 'Medical & Travel Documents' },
    { id: 8, title: 'Biometrics, Next Of Kin & Referees' }
  ];

  const handleNext = (sectionData) => {
    const tabs = sectionTabs[activeSection];
    const currentTab = getCurrentTab();

    if (tabs && currentTab !== tabs[tabs.length - 1]) {
      // Still more sub-tabs to go through — advance the sub-tab
      const nextTabIndex = tabs.indexOf(currentTab) + 1;
      setCurrentTab(tabs[nextTabIndex]);
      return;
    }

    // Save section data
    const sectionKey = Object.keys(allData)[activeSection - 1];
    setAllData({
      ...allData,
      [sectionKey]: sectionData
    });

    // Mark current section as completed
    if (!completedSections.includes(activeSection)) {
      setCompletedSections([...completedSections, activeSection]);
    }

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

  const handleCompleteResume = (sectionData) => {
    const tabs = sectionTabs[activeSection];
    const currentTab = getCurrentTab();

    if (tabs && currentTab !== tabs[tabs.length - 1]) {
      // Still more sub-tabs to go through — advance the sub-tab
      const nextTabIndex = tabs.indexOf(currentTab) + 1;
      setCurrentTab(tabs[nextTabIndex]);
      return;
    }

    // Save final section data
    setAllData({
      ...allData,
      biometricsNextOfKin: sectionData
    });
    console.log('Resume completed!', allData);

    // Mark section 8 as completed
    if (!completedSections.includes(8)) {
      setCompletedSections([...completedSections, 8]);
    }

    // Move to Review Resume section
    setActiveSection(9);
  };

  const handleSaveAndContinue = () => {
    console.log('Saving and continuing later...', allData);
    setShowSaveModal(true);
    // Auto close modal after 2 seconds
    setTimeout(() => {
      setShowSaveModal(false);
    }, 2000);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 1:
        return (
          <PersonalInfo
            onNext={handleNext}
            initialData={allData.personalInfo}
          />
        );
      case 2:
        return (
          <ProfessionalSummary
            onNext={handleNext}
            onBack={handleGoBack}
            initialData={allData.professionalSummary}
          />
        );
      case 3:
        return (
          <KeySkills
            onNext={handleNext}
            onBack={handleGoBack}
            initialData={allData.skills}
          />
        );
      case 4:
        return (
          <LicensesEndorsements
            onNext={handleNext}
            onBack={handleGoBack}
            initialData={allData.licensesEndorsements}
            activeTab={getCurrentTab() || 'licenses'}
            setActiveTab={setCurrentTab}
          />
        );
      case 5:
        return (
          <SeaServiceLog
            onNext={handleNext}
            onBack={handleGoBack}
            initialData={allData.seaServiceLog}
          />
        );
      case 6:
        return (
          <AcademicQualifications
            onNext={handleNext}
            onBack={handleGoBack}
            initialData={allData.academicQualifications}
            activeTab={getCurrentTab() || 'academic'}
            setActiveTab={setCurrentTab}
          />
        );
      case 7:
        return (
          <MedicalTravelDocs
            onNext={handleNext}
            onBack={handleGoBack}
            initialData={allData.medicalTravelDocs}
            activeTab={getCurrentTab() || 'medical'}
            setActiveTab={setCurrentTab}
          />
        );
      case 8:
        return (
          <BiometricsNextOfKin
            onNext={handleCompleteResume}
            onBack={handleGoBack}
            initialData={allData.biometricsNextOfKin}
            activeTab={getCurrentTab() || 'biometric'}
            setActiveTab={setCurrentTab}
          />
        );
      case 9:
        return <Resume isReviewMode={true} defaultUserType="officer" />;
      default:
        return <div>Section not found</div>;
    }
  };

  const getSectionTitle = () => {
    const titles = {
      1: 'Personal Info',
      2: 'Professional Summary',
      3: 'Key Skills',
      4: 'Licences & Endorsements',
      5: 'Sea Service Log',
      6: 'Academic Qualifications & STCW Certificates',
      7: 'Medical & Travel Documents',
      8: 'Biometric, Next Of Kin & Referees',
      9: 'Review Resume'
    };
    return titles[activeSection] || 'Unknown';
  };

  const getSectionDescription = () => {
    const descriptions = {
      1: 'Fill out to get started',
      2: 'Enter your professional summary',
      3: 'Add your skills',
      4: 'Add your licenses & endorsements',
      5: 'Add your sea service details',
      6: 'Add your academic and certificate details',
      7: 'Add your medical and travel documents',
      8: 'Fill out to get started',
      9: 'Review your complete profile before proceeding'
    };
    return descriptions[activeSection] || '';
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
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
                  style={{ width: `${Math.min(100, Math.round((activeSection / sections.length) * 100))}%` }}
                ></div>
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-2">
              {Math.min(100, Math.round((activeSection / sections.length) * 100))}% complete
            </p>
            <button
              onClick={handleSaveAndContinue}
              className="w-full bg-[#003971] text-white py-1.5 px-3 rounded-full font-medium hover:bg-[#002855] transition-colors text-xs"
            >
              {activeSection > sections.length ? 'Save & Continue to Dashboard' : 'Save & Continue Later'}
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
      <div className="hidden lg:flex flex-col items-center w-72 px-4 py-8">
        {/* Logo outside cards */}
        <div className="w-full mb-6">
          <img
            src="/images/logo.png"
            alt="MaritimeLink Logo"
            className="w-24 h-auto -ml-2"
          />
        </div>

        {/* Steps Card */}
        <div className="w-full bg-white rounded-2xl shadow-md p-3 mb-4">
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
        <div className="w-full bg-white rounded-2xl shadow-md p-4 mt-auto">
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
                style={{ width: `${Math.min(100, Math.round((activeSection / sections.length) * 100))}%` }}
              ></div>
            </div>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            {Math.min(100, Math.round((activeSection / sections.length) * 100))}% complete
          </p>
          <button
            onClick={handleSaveAndContinue}
            className="w-full bg-[#003971] text-white py-1.5 px-3 rounded-full font-medium hover:bg-[#002855] transition-colors text-xs"
          >
            {activeSection > sections.length ? 'Save & Continue to Dashboard' : 'Save & Continue Later'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex justify-center overflow-auto py-10 px-4 ${activeSection === 9 ? 'bg-[#F5F7FA]' : ''}`}>
        <div className={`w-full flex flex-col items-center ${activeSection === 9 ? 'max-w-7xl' : 'max-w-3xl'}`}>
          {/* Header */}
          {activeSection !== 9 && (
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
          <div className={`w-full ${activeSection === 9 ? '' : 'max-w-xl bg-white rounded-2xl shadow-md p-8 h-[80vh] flex flex-col'}`}>
            {renderSection()}
          </div>
        </div>
      </div>

      {/* Save Confirmation Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-4 transform transition-all">
            <div className="flex flex-col items-center">
              {/* Success Icon */}
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              {/* Message */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">Saved!</h3>
              <p className="text-gray-600 text-center text-sm">
                Your progress has been saved successfully
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerDashboard;

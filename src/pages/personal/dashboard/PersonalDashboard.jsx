import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  FileText,
  Folder,
  Briefcase,
  Award,
  MessageCircle,
  User,
  Menu,
  X
} from 'lucide-react';
// Logo image is now in public/images. Use direct path in <img src="/images/logo.png" />
import Dashboard from './dashboard-sections/Dashboard';
import DocumentsWallet from './dashboard-sections/DocumentsWallet';
import Chats from './dashboard-sections/Chats';
import Jobs from './dashboard-sections/Jobs';
import ApplyToJob from './dashboard-sections/ApplyToJob';
import MyJobs from './dashboard-sections/MyJobs';
import Training from './dashboard-sections/Training';
import BookCourse from './dashboard-sections/BookCourse';
import Profile from './dashboard-sections/Profile';
import ChangePassword from './dashboard-sections/ChangePassword';
import ManageSubscription from './dashboard-sections/ManageSubscription';

const PersonalDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [applyingToJob, setApplyingToJob] = useState(null);
  const [showMyJobs, setShowMyJobs] = useState(false);
  const [bookingCourse, setBookingCourse] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showManageSubscription, setShowManageSubscription] = useState(false);
  const [showOldDashboard, setShowOldDashboard] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile menu state

  // Handler for dashboard card navigation
  const handleDashboardNavigate = (section) => {
    setActiveTab(section);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'resume', label: 'Resume', icon: FileText },
    { id: 'documents', label: 'Documents', icon: Folder },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'training', label: 'Training', icon: Award },
    { id: 'chats', label: 'Chats', icon: MessageCircle },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  // Handle tab change and close mobile menu
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Mobile Header with Hamburger - Only show when sidebar should be visible */}
      {!showMyJobs && !applyingToJob && !bookingCourse && !showChangePassword && !showManageSubscription && (
        <div className="lg:hidden fixed top-0 left-0 right-0 bg-white z-40 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <img src={logo} alt="Maritime Link Logo" className="w-16 h-16 object-contain" />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      )}

      {/* Sidebar - Desktop and Mobile Drawer */}
      {!showMyJobs && !applyingToJob && !bookingCourse && !showChangePassword && !showManageSubscription && (
        <>
          {/* Mobile Overlay */}
          {isMobileMenuOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div className={`
            fixed lg:static inset-y-0 left-0 z-50
            w-64 bg-white flex flex-col
            transform transition-transform duration-300 ease-in-out
            lg:transform-none
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            border-r border-gray-200
          `}>
            {/* Logo */}
            <div className="p-6">
              <div className="flex items-center justify-between">
                <img src={logo} alt="Maritime Link Logo" className="w-20 h-20 object-contain" />
                {/* Close button for mobile */}
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 px-4 py-2 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 mb-1 text-left transition-all duration-200 rounded-lg min-h-[44px] ${isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                      }`}
                  >
                    <Icon size={18} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                    <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 bg-white overflow-y-auto pt-[73px] lg:pt-0">
        {activeTab === 'dashboard' && !showOldDashboard && (
          <Dashboard onNavigate={handleDashboardNavigate} />
        )}

        {activeTab === 'dashboard' && showOldDashboard && (
          <div className="h-full flex items-center justify-center p-8">
            <div className="max-w-2xl text-center">
              <h1 className="text-4xl font-bold text-blue-900 mb-6">
                Welcome to the Maritime Link
              </h1>
              <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                <p>Thank you for completing your profile.</p>
                <p>
                  Your information and documents are currently under review by our team.
                </p>
                <p>
                  Once the verification process is complete, you will be notified by email and
                  granted full access to your dashboard.
                </p>
                <p className="font-medium text-gray-700">
                  No further action is required from you at this time.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && <DocumentsWallet />}
        {activeTab === 'chats' && <Chats />}
        {activeTab === 'training' && !bookingCourse && <Training onBookClick={(course) => setBookingCourse(course)} />}
        {activeTab === 'profile' && !showChangePassword && !showManageSubscription && (
          <Profile
            onChangePasswordClick={() => setShowChangePassword(true)}
            onManageSubscriptionClick={() => setShowManageSubscription(true)}
          />
        )}
        {activeTab === 'jobs' && !applyingToJob && !showMyJobs && (
          <Jobs onApplyClick={(job) => setApplyingToJob(job)} onMyJobsClick={() => setShowMyJobs(true)} />
        )}
        {applyingToJob && <ApplyToJob job={applyingToJob} onBack={() => setApplyingToJob(null)} />}
        {showMyJobs && <MyJobs onBack={() => setShowMyJobs(false)} appliedJobs={[]} savedJobs={[]} />}
        {bookingCourse && <BookCourse course={bookingCourse} onBack={() => setBookingCourse(null)} />}
        {showChangePassword && <ChangePassword onBack={() => setShowChangePassword(false)} />}
        {showManageSubscription && <ManageSubscription onBack={() => setShowManageSubscription(false)} />}
      </div>
    </div>
  );
};

export default PersonalDashboard;

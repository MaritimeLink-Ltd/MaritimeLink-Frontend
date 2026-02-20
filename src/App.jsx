import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignIn from './pages/personal/auth/SignIn';
import SignUp from './pages/personal/auth/SignUp';
import OTPVerification from './pages/personal/auth/OTPVerification';
import SelectProfession from './pages/personal/auth/SelectProfession';
import UploadProfilePhoto from './pages/personal/auth/UploadProfilePhoto';
// ...existing code...
import ResetPassword from './pages/personal/auth/ResetPassword';
import OfficerCategory from './pages/personal/officer-category/OfficerCategory';
import SelectDeckOfficer from './pages/personal/officer-category/SelectDeckOfficer';
import SelectEngineOfficer from './pages/personal/officer-category/SelectEngineOfficer';
import OfficerDashboard from './pages/personal/officer-category/OfficerDashboard';
import RatingsCategory from './pages/personal/ratings-crew/RatingsCategory';
import SelectDeckRatings from './pages/personal/ratings-crew/SelectDeckRatings';
import SelectEngineRatings from './pages/personal/ratings-crew/SelectEngineRatings';
import RatingsDashboard from './pages/personal/ratings-crew/RatingsDashboard';
import CateringMedicalCategory from './pages/personal/catering-medical/CateringMedicalCategory';
import SelectCatering from './pages/personal/catering-medical/SelectCatering';
import SelectMedical from './pages/personal/catering-medical/SelectMedical';
import CateringMedicalDashboard from './pages/personal/catering-medical/CateringMedicalDashboard';
import PersonalDashboard from './pages/personal/dashboard/PersonalDashboard';
import CVResume from './pages/personal/CVResume';
import AdminLogin from './pages/admin/auth/AdminLogin';
import AdminForgotPassword from './pages/admin/auth/AdminForgotPassword';
// Placeholder for recruiter and training provider forgot password
import ForgotPassword from './pages/personal/auth/ForgotPassword';
import RecruiterLogin from './pages/admin/auth/RecruiterLogin';
import TrainingProviderLogin from './pages/admin/auth/TrainingProviderLogin';
import RecruiterSignup from './pages/admin/auth/RecruiterSignup';
import RecruiterOTPVerification from './pages/admin/auth/RecruiterOTPVerification';
import RecruiterProfileCompletion from './pages/admin/auth/RecruiterProfileCompletion';
import RecruiterPhoneVerification from './pages/admin/auth/RecruiterPhoneVerification';
import RecruiterCompanyDetails from './pages/admin/auth/RecruiterCompanyDetails';
import RecruiterCompanyVerification from './pages/admin/auth/RecruiterCompanyVerification';
import RecruiterCompliance from './pages/admin/auth/RecruiterCompliance';
import RecruiterUnderReview from './pages/admin/auth/RecruiterUnderReview';

import RecruiterDashboardMain from './pages/admin/recruiter-dashboard/RecruiterDashboardMain';
import RecruiterDashboard from './pages/admin/recruiter-dashboard/RecruiterDashboard';
import RecruiterNotifications from './pages/admin/recruiter-dashboard/RecruiterNotifications';
import AdminSearch from './pages/admin/recruiter-dashboard/search/AdminSearch';
import AdminJobs from './pages/admin/recruiter-dashboard/jobs/AdminJobs';
import JobDetail from './pages/admin/recruiter-dashboard/jobs/JobDetail';
import CandidateSummary from './pages/admin/recruiter-dashboard/candidate/CandidateSummary';
import AdminChats from './pages/admin/recruiter-dashboard/chats/AdminChats';
import AdminSettings from './pages/admin/recruiter-dashboard/settings/AdminSettings';

import RecruiterLayout from './pages/admin/recruiter-dashboard/layout/AdminLayout';
import TrainingProviderLayout from './pages/admin/trainingprovider-dashboard/layout/TrainingProviderLayout';
import TrainingProviderDashboard from './pages/admin/trainingprovider-dashboard/TrainingProviderDashboard';
import DemandPlanning from './pages/admin/trainingprovider-dashboard/demand/DemandPlanning';
import TrainingProviderCourses from './pages/admin/trainingprovider-dashboard/courses/TrainingProviderCourses';
import CourseDetail from './pages/admin/trainingprovider-dashboard/courses/CourseDetail';
import ManageSessions from './pages/admin/trainingprovider-dashboard/courses/ManageSessions';
import ScheduleSession from './pages/admin/trainingprovider-dashboard/courses/ScheduleSession';
import TrainingProviderCreateCourse from './pages/admin/trainingprovider-dashboard/courses/CreateCourse';
import EditCourse from './pages/admin/trainingprovider-dashboard/courses/EditCourse';
import Bookings from './pages/admin/trainingprovider-dashboard/bookings/Bookings';
import BookingDetail from './pages/admin/trainingprovider-dashboard/bookings/BookingDetail';
import TrainingProviderNotifications from './pages/admin/trainingprovider-dashboard/TrainingProviderNotifications';
import TrainingProviderProfile from './pages/admin/trainingprovider-dashboard/TrainingProviderProfile';

import SuperAdminLayout from './pages/admin/admin-dashboard/layout/AdminLayout';
import AdminDashboard from './pages/admin/admin-dashboard/AdminDashboard';
import Notifications from './pages/admin/admin-dashboard/Notifications';
import PlatformActivityReport from './pages/admin/admin-dashboard/PlatformActivityReport';
import TransactionHistory from './pages/admin/admin-dashboard/TransactionHistory';
import FlaggedAccounts from './pages/admin/admin-dashboard/FlaggedAccounts';
import UploadJob from './pages/admin/admin-dashboard/UploadJob';
import JobCreatedSuccess from './pages/admin/admin-dashboard/JobCreatedSuccess';
import CreateCourse from './pages/admin/admin-dashboard/CreateCourse';
import Accounts from './pages/admin/admin-dashboard/Accounts';
import AccountProfile from './pages/admin/admin-dashboard/AccountProfile';
import Companies from './pages/admin/admin-dashboard/Companies';
import CompanyProfile from './pages/admin/admin-dashboard/CompanyProfile';
import Compliance from './pages/admin/admin-dashboard/Compliance';
import ComplianceProfile from './pages/admin/admin-dashboard/ComplianceProfile';
import Marketplace from './pages/admin/admin-dashboard/Marketplace';
import Operations from './pages/admin/admin-dashboard/Operations';
import ActivityDetails from './pages/admin/admin-dashboard/ActivityDetails';
import SupportCaseDetails from './pages/admin/admin-dashboard/SupportCaseDetails';
import SystemJobDetail from './pages/admin/admin-dashboard/SystemJobDetail';
import ManualActionReview from './pages/admin/admin-dashboard/ManualActionReview';
import AdminProfile from './pages/admin/admin-dashboard/AdminProfile';

// Personal Dashboard Layout and Pages
import PersonalDashboardLayout from './pages/personal/dashboard/layout/PersonalDashboardLayout';
import Resume from './pages/personal/dashboard/dashboard-sections/Resume';
import DocumentsWallet from './pages/personal/dashboard/dashboard-sections/DocumentsWallet';
import Jobs from './pages/personal/dashboard/dashboard-sections/Jobs';
import JobDetailPersonal from './pages/personal/dashboard/dashboard-sections/JobDetail';
import ApplyToJob from './pages/personal/dashboard/dashboard-sections/ApplyToJob';
import MyJobs from './pages/personal/dashboard/dashboard-sections/MyJobs';
import Training from './pages/personal/dashboard/dashboard-sections/Training';
import BookCourse from './pages/personal/dashboard/dashboard-sections/BookCourse';
import Chats from './pages/personal/dashboard/dashboard-sections/Chats';
import Profile from './pages/personal/dashboard/dashboard-sections/Profile';
import ChangePassword from './pages/personal/dashboard/dashboard-sections/ChangePassword';
import ManageSubscription from './pages/personal/dashboard/dashboard-sections/ManageSubscription';
import TermsConditions from './pages/personal/dashboard/dashboard-sections/TermsConditions';
import PrivacyPolicy from './pages/personal/dashboard/dashboard-sections/PrivacyPolicy';

function App() {
  return (
    <div className="min-w-0 w-full max-w-full overflow-x-hidden">
      <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/otp-verification" element={<OTPVerification />} />
        <Route path="/upload-profile-photo" element={<UploadProfilePhoto />} />
        <Route path="/id-upload" element={<Navigate to="/upload-profile-photo" replace />} />
        <Route path="/select-profession" element={<SelectProfession />} />
        <Route path="/officer-category" element={<OfficerCategory />} />
        <Route path="/select-deck-officer" element={<SelectDeckOfficer />} />
        <Route path="/select-engine-officer" element={<SelectEngineOfficer />} />
        <Route path="/officer-dashboard" element={<OfficerDashboard />} />
        <Route path="/ratings-category" element={<RatingsCategory />} />
        <Route path="/select-deck-ratings" element={<SelectDeckRatings />} />
        <Route path="/select-engine-ratings" element={<SelectEngineRatings />} />
        <Route path="/ratings-dashboard" element={<RatingsDashboard />} />
        <Route path="/catering-medical-category" element={<CateringMedicalCategory />} />
        <Route path="/select-catering" element={<SelectCatering />} />
        <Route path="/select-medical" element={<SelectMedical />} />
        <Route path="/catering-medical-dashboard" element={<CateringMedicalDashboard />} />
        <Route path="/cv-resume" element={<CVResume />} />

        {/* Admin/Recruiter Setup Routes (No Layout) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
        <Route path="/agent/forgot-password" element={<ForgotPassword userType="recruiter" />} />
        <Route path="/training-provider/forgot-password" element={<ForgotPassword userType="training-provider" />} />
        <Route path="/recruiter/login" element={<RecruiterLogin />} />
        <Route path="/training-provider/login" element={<TrainingProviderLogin />} />
        <Route path="/agent/signup" element={<RecruiterSignup />} />
        <Route path="/agent/otp-verification" element={<RecruiterOTPVerification />} />
        <Route path="/agent/profile-completion" element={<RecruiterProfileCompletion />} />
        <Route path="/agent/phone-verification" element={<RecruiterPhoneVerification />} />
        <Route path="/agent/company-details" element={<RecruiterCompanyDetails />} />
        <Route path="/agent/company-verification" element={<RecruiterCompanyVerification />} />
        <Route path="/agent/compliance-declaration" element={<RecruiterCompliance />} />
        <Route path="/agent/under-review" element={<RecruiterUnderReview />} />

        {/* Recruiter Protected Routes (With Layout) */}
        <Route element={<RecruiterLayout />}>
          <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
          <Route path="/admin/search" element={<AdminSearch />} />
          <Route path="/admin/jobs" element={<AdminJobs />} />
          <Route path="/admin/jobs/:jobId" element={<JobDetail />} />
          <Route path="/admin/chats" element={<AdminChats />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/candidate/:candidateId" element={<CandidateSummary />} />
          <Route path="/admin/cv-resume" element={<CVResume isReadOnly={true} />} />
          <Route path="/admin/upload-job" element={<UploadJob />} />
          <Route path="/admin/job-created-success" element={<JobCreatedSuccess />} />
          <Route path="/recruiter/notifications" element={<RecruiterNotifications />} />
        </Route>

        {/* Training Provider Protected Routes (With Layout) */}
        <Route element={<TrainingProviderLayout />}>
          <Route path="/trainingprovider-dashboard" element={<TrainingProviderDashboard />} />
          <Route path="/trainingprovider/demand" element={<DemandPlanning />} />
          <Route path="/trainingprovider/courses" element={<TrainingProviderCourses />} />
          <Route path="/trainingprovider/courses/:courseId" element={<CourseDetail />} />
          <Route path="/trainingprovider/courses/:courseId/sessions" element={<ManageSessions />} />
          <Route path="/trainingprovider/courses/:courseId/sessions/schedule" element={<ScheduleSession />} />
          <Route path="/trainingprovider/courses/:courseId/sessions/edit" element={<ScheduleSession />} />
          <Route path="/trainingprovider/courses/create" element={<TrainingProviderCreateCourse />} />
          <Route path="/trainingprovider/courses/:courseId/edit" element={<EditCourse />} />
          <Route path="/trainingprovider/bookings" element={<Bookings />} />
          <Route path="/trainingprovider/bookings/:bookingId" element={<BookingDetail />} />
          <Route path="/trainingprovider/notifications" element={<TrainingProviderNotifications />} />
          <Route path="/trainingprovider/profile" element={<TrainingProviderProfile />} />
          <Route path="/trainingprovider/candidate/:candidateId" element={<CandidateSummary />} />
          <Route path="/trainingprovider/cv-resume" element={<CVResume isReadOnly={true} />} />
        </Route>

        {/* Super Admin Protected Routes (With Layout) */}
        <Route element={<SuperAdminLayout />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin/notifications" element={<Notifications />} />
          <Route path="/admin/platform-activity" element={<PlatformActivityReport />} />
          <Route path="/admin/transaction-history" element={<TransactionHistory />} />
          <Route path="/admin/flagged-accounts" element={<FlaggedAccounts />} />
          <Route path="/admin/marketplace/create-job" element={<UploadJob />} />
          <Route path="/admin/create-course" element={<CreateCourse />} />
          <Route path="/admin/accounts" element={<Accounts />} />
          <Route path="/admin/accounts/:id" element={<AccountProfile />} />
          <Route path="/admin/accounts/compliance/:id" element={<ComplianceProfile />} />
          <Route path="/admin/companies" element={<Companies />} />
          <Route path="/admin/companies/:id" element={<CompanyProfile />} />
          <Route path="/admin/compliance" element={<Compliance />} />
          <Route path="/admin/compliance/:id" element={<ComplianceProfile />} />
          <Route path="/admin/marketplace" element={<Marketplace />} />
          <Route path="/admin/marketplace/internal/jobs/:jobId" element={<JobDetail />} />
          <Route path="/admin/marketplace/internal/courses/:courseId" element={<CourseDetail />} />
          <Route path="/admin/marketplace/oversight/jobs/:jobId" element={<JobDetail />} />
          <Route path="/admin/marketplace/oversight/courses/:courseId" element={<CourseDetail />} />
          <Route path="/admin/operations" element={<Operations />} />
          <Route path="/admin/operations/activity/:id" element={<ActivityDetails />} />
          <Route path="/admin/operations/case/:id" element={<SupportCaseDetails />} />
          <Route path="/admin/operations/job/:id" element={<SystemJobDetail />} />
          <Route path="/admin/operations/manual-action/:id" element={<ManualActionReview />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="/admin/marketplace/candidate/:candidateId" element={<CandidateSummary />} />
        </Route>

        {/* Personal Dashboard Protected Routes (With Layout) */}
        <Route element={<PersonalDashboardLayout />}>
          <Route path="/personal/dashboard" element={<PersonalDashboard />} />
          <Route path="/personal/resume" element={<Resume />} />
          <Route path="/personal/documents" element={<DocumentsWallet />} />
          <Route path="/personal/jobs" element={<Jobs />} />
          <Route path="/personal/jobs/:jobId" element={<JobDetailPersonal />} />
          <Route path="/personal/jobs/apply/:jobId" element={<ApplyToJob />} />
          <Route path="/personal/my-jobs" element={<MyJobs />} />
          <Route path="/personal/training" element={<Training />} />
          <Route path="/personal/training/book/:courseId" element={<BookCourse />} />
          <Route path="/personal/chats" element={<Chats />} />
          <Route path="/personal/profile" element={<Profile />} />
          <Route path="/personal/profile/change-password" element={<ChangePassword />} />
          <Route path="/personal/profile/manage-subscription" element={<ManageSubscription />} />
          <Route path="/personal/terms" element={<TermsConditions />} />
          <Route path="/personal/privacy" element={<PrivacyPolicy />} />
        </Route>
      </Routes>
    </Router>
    </div>
  );
}

export default App;

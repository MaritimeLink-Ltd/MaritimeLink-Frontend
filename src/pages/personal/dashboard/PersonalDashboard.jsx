import Dashboard from './dashboard-sections/Dashboard';
import AccountPendingWelcome from '../../../components/account/AccountPendingWelcome';
import KycStage2Banner from '../../../components/kyc/KycStage2Banner';
import {
  getDashboardWelcomeMessages,
  isAccountPendingReview,
} from '../../../utils/accountStatus';
import { readUserProfile } from '../../../utils/kycStatus';

const PersonalDashboard = () => {
  const profile = readUserProfile();

  if (isAccountPendingReview(profile)) {
    const welcome = getDashboardWelcomeMessages(profile, 'professional');
    return (
      <div className="min-h-screen bg-white">
        <AccountPendingWelcome {...welcome} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <KycStage2Banner className="mx-4 sm:mx-6 mt-4" />
      <Dashboard />
    </div>
  );
};

export default PersonalDashboard;

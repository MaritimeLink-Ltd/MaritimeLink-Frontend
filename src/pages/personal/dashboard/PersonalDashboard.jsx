import Dashboard from './dashboard-sections/Dashboard';
import AccountPendingWelcome from '../../../components/account/AccountPendingWelcome';
import {
  getDashboardWelcomeMessages,
  shouldShowDashboardWelcome,
} from '../../../utils/accountStatus';
import { readUserProfile } from '../../../utils/kycStatus';

const PersonalDashboard = () => {
  const profile = readUserProfile();

  if (shouldShowDashboardWelcome(profile)) {
    const welcome = getDashboardWelcomeMessages(profile, 'professional');
    return (
      <div className="min-h-screen bg-white">
        <AccountPendingWelcome {...welcome} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Dashboard />
    </div>
  );
};

export default PersonalDashboard;

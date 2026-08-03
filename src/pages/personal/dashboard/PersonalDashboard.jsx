import { useNavigate } from 'react-router-dom';
import Dashboard from './dashboard-sections/Dashboard';
import AccountPendingWelcome from '../../../components/account/AccountPendingWelcome';
import ResumeProgressWelcome from '../../../components/account/ResumeProgressWelcome';
import KycStage2Banner from '../../../components/kyc/KycStage2Banner';
import { useResumeProgress } from '../../../hooks/useResumeProgress';
import {
  getDashboardWelcomeMessages,
  isAccountPendingReview,
} from '../../../utils/accountStatus';
import { readUserProfile } from '../../../utils/kycStatus';

const PersonalDashboard = () => {
  const navigate = useNavigate();
  const profile = readUserProfile();
  const pendingReview = isAccountPendingReview(profile);
  const { percent, submitted, isLoading, builderPath } = useResumeProgress({
    enabled: pendingReview,
  });

  if (pendingReview) {
    // Which of the two Stage 1 screens applies depends on the resume, so wait for
    // it rather than flashing the wrong one.
    if (isLoading) {
      return <div className="min-h-screen bg-white" />;
    }

    if (!submitted) {
      return (
        <div className="min-h-screen bg-white">
          <ResumeProgressWelcome
            completionPercent={percent}
            onContinue={() => navigate(builderPath)}
          />
        </div>
      );
    }

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

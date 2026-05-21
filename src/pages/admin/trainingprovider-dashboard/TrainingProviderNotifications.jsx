import NotificationFeed from '../../../components/NotificationFeed';
import trainerDashboardService from '../../../services/trainerDashboardService';

function TrainingProviderNotifications() {
    return (
        <NotificationFeed
            accent="#1e5a8f"
            breadcrumbAccent="text-[#1e5a8f]"
            loadNotifications={() => trainerDashboardService.getNotifications()}
        />
    );
}

export default TrainingProviderNotifications;

import NotificationFeed from '../../../components/NotificationFeed';
import adminDashboardService from '../../../services/adminDashboardService';

function Notifications() {
    return (
        <NotificationFeed
            accent="#1e5a8f"
            breadcrumbAccent="text-[#1e5a8f]"
            loadNotifications={() => adminDashboardService.getNotifications()}
        />
    );
}

export default Notifications;

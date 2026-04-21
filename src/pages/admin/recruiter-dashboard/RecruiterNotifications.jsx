import NotificationFeed from '../../../components/NotificationFeed';
import recruiterDashboardService from '../../../services/recruiterDashboardService';

function RecruiterNotifications() {
    return (
        <NotificationFeed
            accent="#003971"
            breadcrumbAccent="text-[#003971]"
            loadNotifications={() => recruiterDashboardService.getNotifications()}
        />
    );
}

export default RecruiterNotifications;

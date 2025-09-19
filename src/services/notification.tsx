import { get, put } from '../utils/ApiService';
const NotificationModuleService = {
    getAllNotification: async () => {
        return get(`api/v1/Notification/Notifications`);

    },
    putNotification: async (body: any) => {
        return put(`api/v1/Notification/UpdateReadCount`, body);

    },
    getAllNotificationCount: async () => {
        return get(`api/v1/Notification/UnReadCount`);

    },
};

export default NotificationModuleService;
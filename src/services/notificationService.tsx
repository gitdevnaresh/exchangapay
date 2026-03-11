import { get, put } from '../utils/ApiService';
const NotificationService = {
  getAllNotifications: async () => {
    return get(`api/v1/Notification/Notifications`);

  },
  putNotification: async (body: any) => {
    return put(`api/v1/Notification/UpdateReadCount`, body);

  },
  getAllNotificationCount: async () => {
    return get(`api/v1/Notification/UnReadCount`);

  }, customerTransactionTypes: async () => {
    return get(`/api/v1/Common/Customer/TransactionTypes`)
  },
}

export default NotificationService;
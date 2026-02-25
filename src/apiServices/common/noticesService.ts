import { get } from '../ApiService';

const NoticesService = {
  getNotices: async () => {
    return get('/api/v1/notices');
  }
};

export default NoticesService;
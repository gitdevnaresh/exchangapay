import { get, post } from '../ApiService';

const NotificationService = {
  getNotices: async () => {
    return get('/api/v1/notices');
  },

  markNoticesAsShown: async (noteIds: string[]) => {
    return post('/api/v1/notices/mark-shown', { NoteIds: noteIds });
  }
};

export default NotificationService;
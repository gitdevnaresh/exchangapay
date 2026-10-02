import { get, post } from "../../utils/ApiService";

const ChatbotService = {
    connectChannel: async () => {
        return post(`api/v1/SupportChat/Connect`, {});
    },
    createChat: async (body) => {
        return post(`api/v1/SupportChat/Chats`, body);
    },
    sendMessage: async (body) => {
        return post(`api/v1/SupportChat/Messages`, body);
    },
    getHistory: async (params) => {
        return get(`api/v1/SupportChat/History`, params);
    },
};

export default ChatbotService;

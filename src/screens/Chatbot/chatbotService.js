import { get, post } from "../../utils/ApiService";

const ChatbotService = {
    connectChannel: async () => {
        return post(`api/v1/Common/SupportChat/Connect`, {});
    },
    createChat: async (body) => {
        return post(`api/v1/Common/SupportChat/Chats`, body);
    },
    sendMessage: async (body) => {
        return post(`api/v1/Common/SupportChat/Messages`, body);
    },
    getHistory: async (params) => {
        return get(`api/v1/Common/SupportChat/History`, params);
    },
};

export default ChatbotService;

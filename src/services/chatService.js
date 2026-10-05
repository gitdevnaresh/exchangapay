
import ChatbotService from '../screens/Chatbot/chatbotService';

/**
 * ChatbotService returns the apisauce response, like every other service in
 * the app. The direct axios calls this replaced threw on a non-2xx, and the
 * screen's try/catch blocks are unchanged, so failures keep throwing here.
 */
const unwrapOrThrow = (response) => {
    if (response?.ok) {
        return response.data;
    }
    const message =
        response?.data?.message ||
        response?.data?.error ||
        response?.problem ||
        'Unknown error';
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
};

export class KommoChatAPI {
    constructor() {
        // No secretKey / channelId / accountId: the backend holds all three.
        this.scopeId = null;
        this.isConnected = false;
    };

    async connectChannel() {
        try {
            const data = unwrapOrThrow(await ChatbotService.connectChannel());
            if (data.scope_id) {
                this.scopeId = data.scope_id;
                this.isConnected = true;
                return data;
            } else {
                throw new Error('No scope_id in response');
            }

        } catch (error) {
            throw error;
        }
    }

    // The backend resolves the customer from the access token and builds the
    // Kommo user (id, name, avatar, phone, email) from its own record, so the
    // app sends no identity, scope or conversation id.
    async createChat() {
        try {
            if (!this.isConnected || !this.scopeId) {
                throw new Error('Channel not connected');
            }
            const data = unwrapOrThrow(await ChatbotService.createChat({}));
            return data;
        } catch (error) {
            throw error;
        }
    }

    // The backend picks the customer's chat from the token, keeps the
    // conversation id itself and builds the sender from the customer's record,
    // so only the message content is sent.
    async sendUserMessage(messageConfig) {
        try {
            const data = unwrapOrThrow(await ChatbotService.sendMessage({
                type: messageConfig.type,
                text: messageConfig.text,
                media: messageConfig.media
            }));
            return { success: true, data };

        } catch (error) {
            return {
                success: false,
                error: error?.response?.data || error.message || 'Unknown error'
            };
        }
    }

    async sendSignedGetRequest() {
        try {
            const data = unwrapOrThrow(await ChatbotService.getHistory());
            return { success: true, data: data };

        } catch (error) {
            return {
                success: false,
                error: error.message || 'Unknown error'
            };
        }
    };

}

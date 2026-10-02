/**
 * Support chat — Kommo (amojo) client.
 *
 * The chat flow is unchanged: connect the channel, create the chat, send a
 * message, pull history — same four methods, same arguments, same return
 * shapes as before.
 *
 * What moved is the signing. This file used to hold the channel's HMAC-SHA1
 * secret and build the `Date` / `Content-MD5` / `X-Signature` triple in JS,
 * which meant the secret shipped inside the bundle — unzip an APK or IPA and
 * you can sign any amojo call for our channel, read any customer's support
 * history or post as any customer. The secret now lives only in the
 * backend's secret store.
 *
 * The HTTP calls themselves are in ../screens/Chatbot/chatbotService.js. What
 * stays here is the client the screen talks to: scope handling, payload shaping
 * and the result envelopes the screen already expects.
 *
 * Backend contract: docs/SEC-02_KOMMO_CHAT_BACKEND_PROXY.md
 */

import { KEYCHAIN_SERVICES, readSecret, writeSecret } from '../utils/storage/keychainPolicy';
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
                await writeSecret(KEYCHAIN_SERVICES.CHAT_BOT, 'kommo_scope_id', data.scope_id);
                return data;
            } else {
                throw new Error('No scope_id in response');
            }

        } catch (error) {
            throw error;
        }
    }

    async createChat(userConfig) {
        try {
            if (!this.isConnected || !this.scopeId) {
                throw new Error('Channel not connected');
            }
            if (!userConfig.id || !userConfig.name) {
                throw new Error('User ID and name are required');
            }
            // The backend fills in source.external_id and profile_link; the
            // user fields stay as the screen supplies them today.
            const data = unwrapOrThrow(await ChatbotService.createChat({
                scopeId: this.scopeId,
                conversationId: userConfig.id || '',
                user: {
                    id: userConfig.id,
                    refId: userConfig.id || '',
                    name: userConfig.name,
                    avatar: userConfig.avatar || '',
                    phone: userConfig.phone || '',
                    email: userConfig.email || ''
                }
            }));
            return data;
        } catch (error) {
            throw error;
        }
    }

    async sendUserMessage(messageConfig, conversation_id) {
        let scopeId = null;
        const stored = await readSecret(KEYCHAIN_SERVICES.CHAT_BOT);
        if (stored.username === 'kommo_scope_id') {
            scopeId = stored.value;
        };

        try {
            const data = unwrapOrThrow(await ChatbotService.sendMessage({
                scopeId,
                conversationId: conversation_id,
                type: messageConfig.type,
                text: messageConfig.text,
                media: messageConfig.media,
                sender: {
                    id: messageConfig?.senderId,
                    name: messageConfig.name,
                    avatar: messageConfig.imageUrl,
                    phone: messageConfig?.phoneNo,
                    email: messageConfig?.email
                }
            }));
            return { success: true, data };

        } catch (error) {
            return {
                success: false,
                error: error?.response?.data || error.message || 'Unknown error'
            };
        }
    }

    async sendSignedGetRequest(conversation_id) {
        let kommoScopeId = null;
        const stored = await readSecret(KEYCHAIN_SERVICES.CHAT_BOT);
        if (stored.username === 'kommo_scope_id') {
            kommoScopeId = stored.value;
        }
        try {
            const data = unwrapOrThrow(await ChatbotService.getHistory({
                scopeId: kommoScopeId,
                conversationId: conversation_id
            }));
            return { success: true, data: data };

        } catch (error) {
            return {
                success: false,
                error: error.message || 'Unknown error'
            };
        }
    };

}

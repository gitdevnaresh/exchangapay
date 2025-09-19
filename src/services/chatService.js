import CryptoJS from 'crypto-js';
import * as Keychain from 'react-native-keychain';
import moment from 'moment';
import axios from 'axios';

export class KommoChatAPI {
    constructor(secretKey, channelId, accountId) {
        this.secretKey = secretKey;
        this.channelId = channelId;
        this.accountId = accountId;
        this.baseUrl = 'https://amojo.kommo.com';
        this.scopeId = null;
        this.isConnected = false;
    };
    generateRFC2822Date() {
        const now = new Date();
        return now.toUTCString().replace(/GMT/, '+0000');
    }
    calculateMD5(body = '') {
        let bodyString = '';

        if (typeof body === 'object') {
            bodyString = JSON.stringify(body);
        } else {
            bodyString = body.toString();
        }

        return CryptoJS.MD5(bodyString).toString().toLowerCase();
    };

    generateHeaders(body, endpoint, method = 'POST') {
        try {
            const date = moment.utc().format('ddd, DD MMM YYYY HH:mm:ss') + ' GMT';
            const contentMD5 = CryptoJS.MD5(CryptoJS.enc.Utf8.parse(body)).toString(CryptoJS.enc.Hex);
            const signatureString = [
                method.toUpperCase(),
                contentMD5,
                'application/json',
                date,
                endpoint
            ].join('\n');

            const signature = CryptoJS.HmacSHA1(signatureString, this.secretKey)
                .toString(CryptoJS.enc.Hex);

            return {
                'Date': date,
                'Content-Type': 'application/json',
                'Content-MD5': contentMD5,
                'X-Signature': signature
            };

        } catch (error) {
            throw error;
        }
    };

    async connectChannel() {
        try {
            const body = JSON.stringify({
                account_id: this.accountId,
                title: 'Exchangapay Chat support',
                hook_api_version: 'v2'
            });
            const endpoint = `/v2/origin/custom/${this.channelId}/connect`;
            const headers = this.generateHeaders(body, endpoint);
            const response = await axios.post(`${this.baseUrl}${endpoint}`, body, { headers });
            const data = response.data;
            if (data.scope_id) {
                this.scopeId = data.scope_id;
                this.isConnected = true;
                await Keychain.setGenericPassword('kommo_scope_id', data.scope_id, { service: 'chat_bot' });
                return data;
            } else {
                throw new Error('No scope_id in response');
            }

        } catch (error) {
            throw error;
        }
    }
    validateCredentials() {
        const errors = [];

        if (!this.secretKey) errors.push('Secret key is required');
        if (!this.channelId) errors.push('Channel ID is required');
        if (!this.accountId) errors.push('Account ID is required');

        if (errors.length > 0) throw new Error(errors.join(', '));
        return true;
    }
    async createChat(userConfig) {
        try {
            if (!this.isConnected || !this.scopeId) {
                throw new Error('Channel not connected');
            }
            if (!userConfig.id || !userConfig.name) {
                throw new Error('User ID and name are required');
            }
            const payload = JSON.stringify({
                conversation_id: userConfig.id || '',
                source: { external_id: 'amocrm:34707067' || '' },
                user: {
                    id: userConfig.id,
                    ref_id: userConfig.id || '',
                    name: userConfig.name,
                    avatar: userConfig.avatar || '',
                    profile: {
                        phone: userConfig.phone || '',
                        email: userConfig.email || ''
                    }
                },
                profile_link: "https://swokistoragespace.blob.core.windows.net/images/logox_orange.svg"
            });

            const endpoint = `/v2/origin/custom/${this.scopeId}/chats`;
            const headers = this.generateHeaders(payload, endpoint);
            const response = await axios.post(`${this.baseUrl}${endpoint}`, payload, { headers });
            const data = response.data;
            return data;
        } catch (error) {
            throw error;
        }
    }
    async sendUserMessage(messageConfig, conversation_id) {
        let scopeId = null;
        const credentials = await Keychain.getGenericPassword({ service: 'chat_bot' });
        if (credentials && credentials.username === 'kommo_scope_id') {
            scopeId = credentials.password;
        };
        const messageObject = {
            type: messageConfig.type,
            text: messageConfig.text
        };
        if (messageConfig.type === 'picture' && messageConfig.media) {
            messageObject.media = messageConfig.media;
        }
        const messagePayload = JSON.stringify({
            event_type: "new_message",
            payload: {
                timestamp: Math.floor(Date.now() / 1000),
                msec_timestamp: Date.now(),
                msgid: "user-msg-" + Date.now(),
                conversation_id: conversation_id,
                sender: {
                    id: messageConfig?.senderId,
                    name: messageConfig.name,
                    avatar: messageConfig.imageUrl || "https://www.w3schools.com/w3images/avatar2.png",
                    profile: {
                        phone: messageConfig?.phoneNo,
                        email: messageConfig?.email
                    }
                },
                message: {
                    type: messageConfig.type,
                    text: messageConfig.text,
                    media: messageConfig.media

                },
                messageObject,
                silent: false
            }
        });

        try {
            const endpoint = `/v2/origin/custom/${scopeId}`;
            const headers = this.generateHeaders(messagePayload, endpoint);
            const response = await axios.post(`${this.baseUrl}${endpoint}`, messagePayload, { headers });
            return { success: true, data: response.data };

        } catch (error) {
            return {
                success: false,
                error: error?.response?.data || error.message || 'Unknown error'
            };
        }
    }
    async sendSignedGetRequest(conversation_id) {
        let kommoScopeId = null;
        const credentials = await Keychain.getGenericPassword({ service: 'chat_bot' });
        if (credentials && credentials.username === 'kommo_scope_id') {
            kommoScopeId = credentials.password;
        }
        const secret = '60d0c569acef691e8c11f4db628152b5aaa3ab4a';
        const method = 'GET';
        const contentType = 'application/json';
        const path = `/v2/origin/custom/${kommoScopeId}/chats/${conversation_id}/history`;
        const body = '';
        const contentMD5 = CryptoJS.MD5(body).toString(CryptoJS.enc.Hex);
        const date = moment().utc().format('ddd, DD MMM YYYY HH:mm:ss [GMT]');
        const stringToSign = [method, contentMD5, contentType, date, path].join('\n');
        const signature = CryptoJS.HmacSHA1(
            CryptoJS.enc.Utf8.parse(stringToSign),
            CryptoJS.enc.Utf8.parse(secret)
        ).toString(CryptoJS.enc.Hex);
        const requestHeaders = {
            'Date': date,
            'Content-Type': contentType,
            'Content-MD5': contentMD5,
            'X-Signature': signature,
            'User-Agent': 'okhttp/4.11.0',
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive'
        };
        try {
            const response = await fetch(`https://amojo.kommo.com${path}`, {
                method: 'GET',
                headers: requestHeaders
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
            }

            const data = await response.json();
            return { success: true, data: data };

        } catch (error) {
            return {
                success: false,
                error: error.message || 'Unknown error'
            };
        }
    };

}
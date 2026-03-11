// googleDialogflowService.ts
import { KJUR } from 'jsrsasign';

// Interface for the OAuth2 token response
interface OAuth2TokenResponse {
  access_token: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

// Interfaces for the Dialogflow detectIntent API response
interface DialogflowIntentQueryText {
  text: string;
  languageCode: string;
}

interface DialogflowQueryInput {
  text: DialogflowIntentQueryText;
}

interface DialogflowQueryResult {
  queryText?: string;
  action?: string;
  parameters?: { [key: string]: any };
  allRequiredParamsPresent?: boolean;
  fulfillmentText?: string;
  fulfillmentMessages?: any[];
  outputContexts?: any[];
  intent?: {
    name?: string;
    displayName?: string;
  };
  intentDetectionConfidence?: number;
  languageCode?: string;
}

interface DialogflowDetectIntentResponse {
  responseId?: string;
  queryResult?: DialogflowQueryResult;
  webhookStatus?: any;
  error?: {
    code?: number;
    message?: string;
    status?: string;
    details?: any[];
  };
}

const serviceAccount = require('../../../android/app/src/main/assets/web3bank-460713-ed4d31f7657f 1.json');

// Cache for access token to avoid repeated requests
let cachedToken: { token: string; expires: number } | null = null;

const getAccessToken = async (): Promise<string> => {
  console.log('[Dialogflow] Attempting to get access token...');

  if (cachedToken && Date.now() < cachedToken.expires) {
    console.log('[Dialogflow] Using cached access token');
    return cachedToken.token;
  }

  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;

  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/dialogflow',
    aud: 'https://oauth2.googleapis.com/token',
    iat,
    exp,
  };

  try {
    const header = { alg: 'RS256', typ: 'JWT' };
    const sHeader = JSON.stringify(header);
    const sPayload = JSON.stringify(payload);

    const signedJwt = KJUR.jws.JWS.sign(null, sHeader, sPayload, serviceAccount.private_key);

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${signedJwt}`,
    });

    const tokenJson: OAuth2TokenResponse = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenJson.access_token) {
      console.error('[Dialogflow] Failed to get access token:', JSON.stringify(tokenJson, null, 2));
      throw new Error(`Failed to get access token: ${tokenJson.error_description || tokenResponse.statusText || 'Unknown error'}`);
    }

    cachedToken = {
      token: tokenJson.access_token,
      expires: Date.now() + 50 * 60 * 1000, // Cache for 50 minutes
    };

    return tokenJson.access_token;
  } catch (error) {
    console.error('[Dialogflow] Error in getAccessToken:', error);
    throw error;
  }
};

export const sendMessageToDialogflow = async (message: string): Promise<string> => {
  console.log(`[Dialogflow] Sending message: "${message}"`);

  if (!message.trim()) {
    return 'Please enter a message to start the conversation.';
  }

  try {
    const accessToken = await getAccessToken();
    const sessionId = `session-${Date.now()}`;

    const dialogflowUrl = `https://dialogflow.googleapis.com/v2/projects/${serviceAccount.project_id}/agent/sessions/${sessionId}:detectIntent`;

    const requestBody = {
      queryInput: {
        text: {
          text: message.trim(),
          languageCode: 'en-US',
        },
      },
    };

    const response = await fetch(dialogflowUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data: DialogflowDetectIntentResponse = await response.json();

    if (!response.ok || !data.queryResult) {
      const errorMessage = data?.error?.message || `Dialogflow API Error: ${response.status}`;
      return `Sorry, there was an error: ${errorMessage}`;
    }

    const fulfillmentText = data.queryResult.fulfillmentText?.trim();

    if (!fulfillmentText) {
      return 'Sorry, I didn’t understand that. Can you please rephrase?';
    }

    return fulfillmentText;
  } catch (error) {
    console.error('[Dialogflow] Error in sendMessageToDialogflow:', error);

    if (error instanceof Error) {
      if (error.message.includes('network') || error.message.includes('fetch')) {
        return 'I\'m having trouble connecting right now. Please check your internet connection.';
      }
      return `Sorry, something went wrong: ${error.message}`;
    }

    return 'Something went wrong. Please try again later.';
  }
};

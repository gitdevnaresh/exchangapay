import CryptoJS from "crypto-js";

const ZENDESK_KID = "app_696df9436dd6ddc4087e3c62";
const ZENDESK_SIGNING_SECRET = "TL2AXeejBGVgGPnlzzU7r2RvyVKM_7XpvDdGlJ-_6MeVgDTrzHcjwpEDICz5kTfowLy4CTuAYN8v5iFZKjQTTQ";

function base64UrlEncode(input: string) {
  return input.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function utf8ToBase64Url(str: string) {
  const b64 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(str));
  return base64UrlEncode(b64);
}

function wordArrayToBase64Url(wordArray: CryptoJS.lib.WordArray) {
  const b64 = CryptoJS.enc.Base64.stringify(wordArray);
  return base64UrlEncode(b64);
}

export function generateZendeskMessagingJwt(user: {
  externalId: string;
  name?: string;
  email?: string;
}) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (24 * 60 * 60); // 24 hours

  const header = {
    alg: "HS256",
    typ: "JWT",
    kid: ZENDESK_KID,
  };

  const payload = {
    iss: ZENDESK_KID,
    external_id: user.externalId,
    scope: "user",
    name: user.name || "",
    email: user.email || "",
    iat: now,
    exp: exp,
    jti: `${user.externalId}_${now}_${Math.random().toString(36).substr(2, 9)}`,
  };

  const encodedHeader = utf8ToBase64Url(JSON.stringify(header));
  const encodedPayload = utf8ToBase64Url(JSON.stringify(payload));

  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = CryptoJS.HmacSHA256(signingInput, ZENDESK_SIGNING_SECRET);
  const encodedSignature = wordArrayToBase64Url(signature);

  return `${signingInput}.${encodedSignature}`;
}

export function clearZendeskSession() {
  // Force clear Zendesk session for user switching
  return {
    shouldClearSession: true,
    timestamp: Date.now()
  };
}
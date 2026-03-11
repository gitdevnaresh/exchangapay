import { Platform } from "react-native";
import {
  initialize,
  openMessagingView,
  login,
  logout,
} from "react-native-zendesk-messaging";
import { generateZendeskMessagingJwt } from "./zendeskJwt";

const CHANNEL_KEY = Platform.OS === 'ios'
  ? "eyJzZXR0aW5nc191cmwiOiJodHRwczovL2ZpbmFjaWFsc3VwcG9ydC56ZW5kZXNrLmNvbS9tb2JpbGVfc2RrX2FwaS9zZXR0aW5ncy8wMUtFSDZCM05WOFRHWlhNTjZLMFRYVkhBUy5qc29uIn0="
  : "eyJzZXR0aW5nc191cmwiOiJodHRwczovL2ZpbmFjaWFsc3VwcG9ydC56ZW5kZXNrLmNvbS9tb2JpbGVfc2RrX2FwaS9zZXR0aW5ncy8wMUtFRVFLQ0RDOEIyWkVOOEJNMzg1UVYyRi5qc29uIn0=";

let initPromise: Promise<void> | null = null;
let currentJwt: string | null = null;
let currentUserId: string | null = null;
let currentUser: { id: string; name?: string; email?: string; } | null = null;

export function zendeskInit() {
  if (initPromise) return initPromise;

  const payload = Platform.OS === "ios"
    ? { channelKey: CHANNEL_KEY, skipOpenMessaging: true }
    : { channelKey: CHANNEL_KEY };

  initPromise = initialize(payload)
    .then(() => {
      // Zendesk initialized successfully
    })
    .catch((e) => {
      initPromise = null;
      throw e;
    });

  return initPromise;
}

// Check if current JWT is expired
export function isCurrentJwtExpired(): boolean {
  if (!currentJwt) return true;
  
  try {
    const parts = currentJwt.split('.');
    if (parts.length !== 3) return true;
    
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    const now = Math.floor(Date.now() / 1000);
    
    return payload.exp <= now;
  } catch {
    return true;
  }
}

// Auto-refresh JWT before expiry
let refreshTimer: NodeJS.Timeout | null = null;

function scheduleJwtRefresh() {
  if (refreshTimer) clearTimeout(refreshTimer);
  
  // Refresh 1 hour before expiry (23 hours)
  refreshTimer = setTimeout(async () => {
    await refreshJwtIfNeeded();
    scheduleJwtRefresh();
  }, 23 * 60 * 60 * 1000); // 23 hours
}

export async function refreshJwtIfNeeded() {
  if (!currentUser) return;
  
  try {
    const newJwt = generateZendeskMessagingJwt({
      externalId: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
    });
    
    await login(newJwt);
    currentJwt = newJwt;
  } catch (e) {
    // Handle refresh errors silently
  }
}

export async function zendeskAuth(user: {
  id: string;
  name?: string;
  email?: string;
}) {
  // Force reinitialize Zendesk to clear any corrupted state
  initPromise = null;
  await zendeskInit();
  
  // Store current user for JWT refresh
  currentUser = user;
  
  // Generate fresh JWT
  const jwt = generateZendeskMessagingJwt({
    externalId: user.id,
    name: user.name,
    email: user.email,
  });
  
  try {
    await login(jwt);
    currentJwt = jwt;
    currentUserId = user.id;
    
    // Start auto-refresh timer
    scheduleJwtRefresh();
  } catch (e) {
    currentJwt = null;
    currentUserId = null;
    currentUser = null;
    throw e;
  }
}

export async function zendeskOpen() {
  try {
    await zendeskInit();
    
    // Try to refresh JWT before opening if we have a current user
    if (currentUser) {
      await refreshJwtIfNeeded();
    }
    
    openMessagingView();
  } catch (e) {
    // Handle error silently
  }
}

export async function zendeskLogout() {
  try {
    // Clear auto-refresh timer
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      refreshTimer = null;
    }
    
    await logout();
    currentJwt = null;
    currentUserId = null;
    currentUser = null;
  } catch (e) {
    // Handle logout errors silently
  }
}

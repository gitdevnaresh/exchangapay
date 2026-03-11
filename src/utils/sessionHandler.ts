export const handleSessionExpiry = (error: any, onSessionExpired?: () => void) => {
  const errorData = error?.data || error?.response?.data;
  const errorCode = errorData?.errorCode;
  const errorMsg = errorData?.errors?.[0] || error?.message;
  
  // Check for session expiry
  if (errorCode === 'ER-01095' || 
      errorMsg?.toLowerCase().includes('session expired') ||
      errorMsg?.toLowerCase().includes('inactivity')) {
    
    onSessionExpired?.();
    return { isSessionExpired: true, message: errorMsg };
  }
  
  return { isSessionExpired: false };
};
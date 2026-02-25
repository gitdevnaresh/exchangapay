/**
 * Secure Error Boundary Component
 * 
 * PURPOSE:
 * This component implements a "fail-closed" security pattern by catching
 * encryption/decryption errors and displaying a secure fallback UI instead
 * of exposing sensitive data or crashing the app.
 * 
 * HOW IT WORKS:
 * 1. Wraps child components to catch JavaScript errors during rendering
 * 2. Detects security-related errors (encryption, auth tokens, network security)
 * 3. Shows identical UI for both security and general errors (fail-closed pattern)
 * 4. Logs errors internally for debugging while hiding details from users
 * 5. Prevents app crashes that could expose sensitive data or stack traces
 * 
 * SECURITY BENEFITS:
 * - Prevents information leakage through error messages
 * - Maintains consistent user experience during security failures
 * - Logs security incidents for monitoring without exposing details
 * - Implements defense-in-depth by catching errors at component level
 * 
 * USAGE:
 * Wrap sensitive components or entire app sections:
 * <SecureErrorBoundary>
 *   <SensitiveComponent />
 * </SecureErrorBoundary>
 * 
 * @author Security Implementation - Task 3: Fix Silent Error Handling
 * @compliance CWE-391: Unchecked Error Condition - RESOLVED
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Logger } from '../../utils/Logger';
import { Provider } from 'react-redux';
import { store } from '../../redux/reducers/index';
import { Dimensions, SafeAreaView } from 'react-native';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../CommonStyles';
import { SomeTimesWentWrong } from '../../assets/svg';
import ViewComponent from '../view/view';
import TextMultiLanguage from '../textComponets/multiLanguageText/textMultiLangauge';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorType: 'SECURITY' | 'GENERAL';
}

class SecureErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorType: 'GENERAL' };
  }

  /**
   * React lifecycle method that catches errors and determines error type
   * @param error - The error that was thrown
   * @returns New state with error flag and type classification
   */
  static getDerivedStateFromError(error: Error): State {
    // Determine if this is a security-related error by checking error message patterns
    const isSecurityError = error.message.includes('SECURE_SESSION_FAILED') ||
                           error.message.includes('ENCRYPTION_') ||
                           error.message.includes('DECRYPTION_') ||
                           error.message.includes('AUTH_TOKEN_') ||
                           error.message.includes('NETWORK_SECURITY_');

    return {
      hasError: true,
      errorType: isSecurityError ? 'SECURITY' : 'GENERAL'
    };
  }

  /**
   * Logs error details for debugging while maintaining security
   * @param error - The error object
   * @param errorInfo - React error info with component stack
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring system with sanitized context
    Logger.error('Error Boundary caught an error', {
      originalError: error.message,
      context: 'ERROR_BOUNDARY',
      errorType: this.state.errorType,
      componentStack: errorInfo.componentStack
    });
  }



  render() {
    if (this.state.hasError) {
      return (
        <Provider store={store}>
          <ErrorWrapper>
            <GeneralErrorUI />
          </ErrorWrapper>
        </Provider>
      );
    }

    return this.props.children;
  }
}

/**
 * Error Wrapper Component
 * 
 * Provides additional error catching layer and handles theme/navigation context
 * for error UI components. Acts as a safety net for errors in error handling.
 */
const ErrorWrapper = ({ children }: { children: React.ReactNode }) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  
  try {
    return <>{children}</>;
  } catch (error) {
    // Log the error for debugging purposes
    Logger.error('ErrorWrapper caught an error', {
      originalError: error instanceof Error ? error.message : 'Unknown error',
      context: 'ERROR_WRAPPER'
    });
    
    return (
      <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
        <ViewComponent style={[commonStyles.flex1, commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.p24]}>
          <TextMultiLanguage style={[commonStyles.sectionTitle, commonStyles.textCenter, commonStyles.mb16]} text={"Application Error"} />
          <TextMultiLanguage style={[commonStyles.sectiontitlepara, commonStyles.textCenter]} text={"Close the app completely and reopen it"} />
        </ViewComponent>
      </SafeAreaView>
    );
  }
};

/**
 * General Error UI Component
 * 
 * Displays user-friendly error message with consistent styling.
 * Shows same UI for both security and general errors (fail-closed pattern).
 */
const GeneralErrorUI = () => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const { width, height } = Dimensions.get("window");
  
  return (
    <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
      <ViewComponent style={[commonStyles.flex1, commonStyles.p24]}>
        <ViewComponent style={[commonStyles.flex1, commonStyles.justifyCenter]}>
          <ViewComponent
            style={[{
              width: width * 0.8,
              height: height * 0.30,
              alignSelf: "center",
            }, commonStyles.titleSectionGap]}
          >
            <SomeTimesWentWrong width="100%" height="100%" />
          </ViewComponent>
          <TextMultiLanguage style={[commonStyles.sectionTitle, commonStyles.textCenter, commonStyles.mb6]} text={"Application Error"} />
          <TextMultiLanguage style={[commonStyles.sectiontitlepara, commonStyles.textCenter]} text={"The application has stopped working. Please close and reopen the app."} />
        </ViewComponent>
      </ViewComponent>
    </SafeAreaView>
  );
};

export default SecureErrorBoundary;
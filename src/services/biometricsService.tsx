import ReactNativeBiometrics, { BiometryTypes } from "react-native-biometrics";

interface BiometricResult {
  available: boolean;
  biometryType?: string;
  error?: string;
}

interface KeyResult {
  publicKey?: string;
  keysExist?: boolean;
  keysDeleted?: boolean;
}

interface SignatureResult {
  success: boolean;
  signature?: string;
  error?: string;
}

interface PromptResult {
  success: boolean;
  error?: string;
}

class BiometricsService {
  private rnBiometrics: ReactNativeBiometrics;

  constructor(allowDeviceCredentials: boolean = false) {
    this.rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials });
  }

  /**
   * Check if biometric sensor is available
   */
  async isSensorAvailable(): Promise<BiometricResult> {
    try {
      const result = await this.rnBiometrics.isSensorAvailable();
      return result;
    } catch (error: any) {
      console.error("Error checking biometric sensor:", error);
      return {
        available: false,
        biometryType: undefined,
        error: error.message,
      };
    }
  }

  /**
   * Create biometric keys
   */
  async createKeys(): Promise<KeyResult> {
    try {
      const result = await this.rnBiometrics.createKeys();
      return result;
    } catch (error: any) {
      console.error("Error creating biometric keys:", error);
      throw error;
    }
  }

  /**
   * Check if biometric keys exist
   */
  async biometricKeysExist(): Promise<KeyResult> {
    try {
      const result = await this.rnBiometrics.biometricKeysExist();
      return result;
    } catch (error: any) {
      console.error("Error checking biometric keys:", error);
      return { keysExist: false };
    }
  }

  /**
   * Delete biometric keys
   */
  async deleteKeys(): Promise<KeyResult> {
    try {
      const result = await this.rnBiometrics.deleteKeys();
      return result;
    } catch (error: any) {
      console.error("Error deleting biometric keys:", error);
      throw error;
    }
  }

  /**
   * Create signature using biometrics
   */
  async createSignature(
    payload: string,
    promptMessage: string = "Sign in"
  ): Promise<SignatureResult> {
    try {
      const result = await this.rnBiometrics.createSignature({
        promptMessage,
        payload,
        cancelButtonText: "Cancel",
      });
      return result;
    } catch (error: any) {
      console.error("Error creating signature:", error);
      throw error;
    }
  }

  /**
   * Simple biometric prompt
   */
  async simplePrompt(
    promptMessage: string = "Confirm your identity"
  ): Promise<PromptResult> {
    try {
      const result = await this.rnBiometrics.simplePrompt({
        promptMessage,
        fallbackPromptMessage: "Use passcode",
        cancelButtonText: "Cancel",
      });
      return result;
    } catch (error: any) {
      console.error("Error with biometric prompt:", error);
      throw error;
    }
  }

  /**
   * Get biometry type string
   */
  getBiometryTypeString(biometryType: string): string {
    switch (biometryType) {
      case BiometryTypes.TouchID:
        return "Touch ID";
      case BiometryTypes.FaceID:
        return "Face ID";
      case BiometryTypes.Biometrics:
        return "Biometrics";
      default:
        return "Unknown";
    }
  }

  /**
   * Initialize biometric authentication
   * This method sets up biometric authentication by checking availability and creating keys if needed
   */
  async initializeBiometrics(): Promise<{
    success: boolean;
    message: string;
    biometryType?: string;
  }> {
    try {
      // Check if biometric sensor is available
      const sensorResult = await this.isSensorAvailable();

      if (!sensorResult.available) {
        return {
          success: false,
          message:
            sensorResult.error ||
            "Biometric authentication is not available on this device",
        };
      }

      // Check if keys already exist
      const keysResult = await this.biometricKeysExist();

      if (!keysResult.keysExist) {
        // Create new keys
        const createResult = await this.createKeys();
        if (createResult.publicKey) {
          return {
            success: true,
            message: "Biometric authentication initialized successfully",
            biometryType: sensorResult.biometryType,
          };
        } else {
          return {
            success: false,
            message: "Failed to create biometric keys",
          };
        }
      }

      return {
        success: true,
        message: "Biometric authentication is already initialized",
        biometryType: sensorResult.biometryType,
      };
    } catch (error: any) {
      console.error("Error initializing biometrics:", error);
      return {
        success: false,
        message:
          error.message || "Failed to initialize biometric authentication",
      };
    }
  }

  /**
   * Authenticate user with biometrics
   * This method prompts the user for biometric authentication
   */
  async authenticateUser(
    promptMessage: string = "Authenticate to continue"
  ): Promise<{ success: boolean; message: string }> {
    try {
      const result = await this.simplePrompt(promptMessage);

      if (result.success) {
        return {
          success: true,
          message: "Authentication successful",
        };
      } else {
        return {
          success: false,
          message: result.error || "Authentication failed",
        };
      }
    } catch (error: any) {
      console.error("Error during authentication:", error);
      return {
        success: false,
        message: error.message || "Authentication failed",
      };
    }
  }

  /**
   * Create a secure signature for server authentication
   * This method creates a cryptographic signature that can be verified by your server
   */
  async createSecureSignature(
    payload: string,
    promptMessage: string = "Sign in securely"
  ): Promise<{ success: boolean; signature?: string; message: string }> {
    try {
      const result = await this.createSignature(payload, promptMessage);

      if (result.success && result.signature) {
        return {
          success: true,
          signature: result.signature,
          message: "Signature created successfully",
        };
      } else {
        return {
          success: false,
          message: result.error || "Failed to create signature",
        };
      }
    } catch (error: any) {
      console.error("Error creating secure signature:", error);
      return {
        success: false,
        message: error.message || "Failed to create signature",
      };
    }
  }

  /**
   * Check if biometric authentication is properly set up
   */
  async isBiometricsSetUp(): Promise<{
    isSetUp: boolean;
    biometryType?: string;
    message: string;
  }> {
    try {
      const sensorResult = await this.isSensorAvailable();

      if (!sensorResult.available) {
        return {
          isSetUp: false,
          message: "Biometric sensor is not available",
        };
      }

      const keysResult = await this.biometricKeysExist();

      if (!keysResult.keysExist) {
        return {
          isSetUp: false,
          message: "Biometric keys are not set up",
        };
      }

      return {
        isSetUp: true,
        biometryType: sensorResult.biometryType,
        message: "Biometric authentication is properly set up",
      };
    } catch (error: any) {
      console.error("Error checking biometric setup:", error);
      return {
        isSetUp: false,
        message: error.message || "Failed to check biometric setup",
      };
    }
  }

  /**
   * Reset biometric authentication
   * This method deletes existing keys and allows for re-initialization
   */
  async resetBiometrics(): Promise<{ success: boolean; message: string }> {
    try {
      const result = await this.deleteKeys();

      if (result.keysDeleted) {
        return {
          success: true,
          message: "Biometric authentication has been reset",
        };
      } else {
        return {
          success: false,
          message: "No biometric keys found to delete",
        };
      }
    } catch (error: any) {
      console.error("Error resetting biometrics:", error);
      return {
        success: false,
        message: error.message || "Failed to reset biometric authentication",
      };
    }
  }
}

export default BiometricsService;

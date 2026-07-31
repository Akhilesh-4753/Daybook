import * as LocalAuthentication from 'expo-local-authentication';
import * as Crypto from 'expo-crypto';
import { PreferencesService } from './PreferencesService';

export const SecurityService = {
  checkBiometricsSupport: async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch {
      return false;
    }
  },

  authenticateBiometrics: async (promptMessage = 'Unlock Daybook') => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Use PIN',
        disableDeviceFallback: false,
      });
      return result.success;
    } catch (e) {
      console.error('Biometric authentication error:', e);
      return false;
    }
  },

  hashPin: async (pin) => {
    try {
      const hashed = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `DAYBOOK_SALT_${pin}`
      );
      return hashed;
    } catch (e) {
      return pin;
    }
  },

  verifyPin: async (inputPin) => {
    const config = await PreferencesService.getSecurityConfig();
    if (!config.pinHash) return true; // No PIN set

    const hashedInput = await SecurityService.hashPin(inputPin);
    return hashedInput === config.pinHash;
  },

  setPin: async (newPin, enableBiometrics = false) => {
    const pinHash = await SecurityService.hashPin(newPin);
    await PreferencesService.saveSecurityConfig({
      pinHash,
      isPinEnabled: true,
      isBiometricsEnabled: enableBiometrics,
    });
  },

  disableSecurity: async () => {
    await PreferencesService.saveSecurityConfig({
      pinHash: null,
      isPinEnabled: false,
      isBiometricsEnabled: false,
    });
  },
};

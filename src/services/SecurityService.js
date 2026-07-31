import * as LocalAuthentication from 'expo-local-authentication';
import * as Crypto from 'expo-crypto';
import { PreferencesService } from './PreferencesService';

export const SecurityService = {
  checkBiometricsSupport: async () => {
    try {
      if (LocalAuthentication && typeof LocalAuthentication.hasHardwareAsync === 'function') {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        return Boolean(hasHardware && isEnrolled);
      }
      return false;
    } catch (e) {
      return false;
    }
  },

  authenticateBiometrics: async (promptMessage = 'Unlock Daybook') => {
    try {
      if (LocalAuthentication && typeof LocalAuthentication.authenticateAsync === 'function') {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage,
          fallbackLabel: 'Use PIN',
          disableDeviceFallback: false,
        });
        return Boolean(result && result.success);
      }
      return false;
    } catch (e) {
      console.warn('Biometric authentication error:', e);
      return false;
    }
  },

  hashPin: async (pin) => {
    try {
      if (
        Crypto &&
        Crypto.CryptoDigestAlgorithm &&
        Crypto.CryptoDigestAlgorithm.SHA256 &&
        typeof Crypto.digestStringAsync === 'function'
      ) {
        const hashed = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          `DAYBOOK_SALT_${pin}`
        );
        return hashed;
      }
      return `PIN_SALT_${pin}`;
    } catch (e) {
      return `PIN_SALT_${pin}`;
    }
  },

  verifyPin: async (inputPin) => {
    try {
      const config = await PreferencesService.getSecurityConfig();
      if (!config || !config.pinHash) return true; // No PIN set

      const hashedInput = await SecurityService.hashPin(inputPin);
      return hashedInput === config.pinHash;
    } catch (e) {
      return false;
    }
  },

  setPin: async (newPin, enableBiometrics = false) => {
    try {
      const pinHash = await SecurityService.hashPin(newPin);
      await PreferencesService.saveSecurityConfig({
        pinHash,
        isPinEnabled: true,
        isBiometricsEnabled: enableBiometrics,
      });
    } catch (e) {
      console.error('setPin error:', e);
    }
  },

  disableSecurity: async () => {
    try {
      await PreferencesService.saveSecurityConfig({
        pinHash: null,
        isPinEnabled: false,
        isBiometricsEnabled: false,
      });
    } catch (e) {
      console.error('disableSecurity error:', e);
    }
  },
};

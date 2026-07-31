import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppState } from 'react-native';
import { SecurityService } from '../services/SecurityService';
import { PreferencesService } from '../services/PreferencesService';

const SecurityContext = createContext();

export const SecurityProvider = ({ children }) => {
  const [isLocked, setIsLocked] = useState(false);
  const [isPinSet, setIsPinSet] = useState(false);
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(false);
  const [isBiometricsSupported, setIsBiometricsSupported] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initSecurity();
  }, []);

  // Screen Off / App Background Listener: Locks app when phone screen is turned off
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' && isPinSet) {
        setIsLocked(true);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isPinSet]);

  const initSecurity = async () => {
    try {
      const config = await PreferencesService.getSecurityConfig();
      const bioSupported = await SecurityService.checkBiometricsSupport();

      setIsBiometricsSupported(bioSupported);
      setIsPinSet(!!config.pinHash);
      setIsBiometricsEnabled(!!config.isBiometricsEnabled);

      if (config.pinHash) {
        setIsLocked(true); // Lock on cold start if PIN is configured
      }
    } catch (e) {
      console.error('Security init error:', e);
    } finally {
      setLoading(false);
    }
  };

  const unlockWithPin = useCallback(async (pinInput) => {
    const isValid = await SecurityService.verifyPin(pinInput);
    if (isValid) {
      setIsLocked(false);
      return true;
    }
    return false;
  }, []);

  const unlockWithBiometrics = useCallback(async () => {
    const success = await SecurityService.authenticateBiometrics('Unlock Daybook');
    if (success) {
      setIsLocked(false);
      return true;
    }
    return false;
  }, []);

  const setupPin = useCallback(async (newPin, enableBio = false) => {
    await SecurityService.setPin(newPin, enableBio);
    setIsPinSet(true);
    setIsBiometricsEnabled(enableBio);
  }, []);

  const removeSecurity = useCallback(async () => {
    await SecurityService.disableSecurity();
    setIsPinSet(false);
    setIsBiometricsEnabled(false);
    setIsLocked(false);
  }, []);

  const lockApp = useCallback(() => {
    if (isPinSet) {
      setIsLocked(true);
    }
  }, [isPinSet]);

  return (
    <SecurityContext.Provider
      value={{
        isLocked,
        isPinSet,
        isBiometricsEnabled,
        isBiometricsSupported,
        loading,
        unlockWithPin,
        unlockWithBiometrics,
        setupPin,
        removeSecurity,
        lockApp,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => useContext(SecurityContext);

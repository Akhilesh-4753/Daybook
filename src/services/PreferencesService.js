let AsyncStorage;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  const memoryStore = {};
  AsyncStorage = {
    getItem: async (k) => memoryStore[k] || null,
    setItem: async (k, v) => { memoryStore[k] = v; },
    removeItem: async (k) => { delete memoryStore[k]; },
  };
}

const KEYS = {
  THEME: '@daybook_theme',
  SESSION: '@daybook_user_session',
  SETTINGS: '@daybook_app_settings',
  FIRST_LAUNCH: '@daybook_first_launch',
  PIN_SECURITY: '@daybook_pin_security',
};

export const PreferencesService = {
  // Theme
  getTheme: async () => {
    try {
      return (await AsyncStorage.getItem(KEYS.THEME)) || 'light';
    } catch {
      return 'light';
    }
  },
  saveTheme: async (themeMode) => {
    try {
      await AsyncStorage.setItem(KEYS.THEME, themeMode);
    } catch (e) {
      console.error(e);
    }
  },

  // Session Management (Restores user session across app restarts)
  getSession: async () => {
    try {
      const sessionData = await AsyncStorage.getItem(KEYS.SESSION);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch {
      return null;
    }
  },
  saveSession: async (userData) => {
    try {
      await AsyncStorage.setItem(KEYS.SESSION, JSON.stringify(userData));
    } catch (e) {
      console.error(e);
    }
  },
  clearSession: async () => {
    try {
      await AsyncStorage.removeItem(KEYS.SESSION);
    } catch (e) {
      console.error(e);
    }
  },

  // Security & App Lock State
  getSecurityConfig: async () => {
    try {
      const data = await AsyncStorage.getItem(KEYS.PIN_SECURITY);
      return data ? JSON.parse(data) : { pinHash: null, isPinEnabled: false, isBiometricsEnabled: false };
    } catch {
      return { pinHash: null, isPinEnabled: false, isBiometricsEnabled: false };
    }
  },
  saveSecurityConfig: async (config) => {
    try {
      await AsyncStorage.setItem(KEYS.PIN_SECURITY, JSON.stringify(config));
    } catch (e) {
      console.error(e);
    }
  },
};

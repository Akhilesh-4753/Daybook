import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Icon } from '../components/Icons';
import { LoginScreen } from './LoginScreen';
import { SignupScreen } from './SignupScreen';

export const AuthScreen = ({ onAuthSuccess, onLoginSuccess }) => {
  const { theme } = useTheme();
  const [isLoginMode, setIsLoginMode] = useState(true);

  const handleSuccess = (userData) => {
    if (onAuthSuccess) onAuthSuccess(userData);
    if (onLoginSuccess) onLoginSuccess(userData);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Branding Header */}
      <View style={styles.brandContainer}>
        <View style={[styles.logoCircle, { backgroundColor: theme.colors.primary }]}>
          <Icon name="sparkles" size={28} color="#FFFFFF" />
        </View>
        <Text style={[styles.brandTitle, { color: theme.colors.textPrimary }]}>
          Daybook
        </Text>
        <Text style={[styles.brandSubtitle, { color: theme.colors.textSecondary }]}>
          Plan Your Day, Organize Your Life.
        </Text>
      </View>

      {/* Main Card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        {/* Toggle Segment Bar */}
        <View
          style={[
            styles.toggleContainer,
            { backgroundColor: theme.colors.cardSecondary },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.toggleTab,
              isLoginMode && [styles.activeToggleTab, { backgroundColor: theme.colors.primary }],
            ]}
            onPress={() => setIsLoginMode(true)}
          >
            <Text
              style={[
                styles.toggleText,
                { color: isLoginMode ? '#FFFFFF' : theme.colors.textSecondary },
              ]}
            >
              Log In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleTab,
              !isLoginMode && [styles.activeToggleTab, { backgroundColor: theme.colors.primary }],
            ]}
            onPress={() => setIsLoginMode(false)}
          >
            <Text
              style={[
                styles.toggleText,
                { color: !isLoginMode ? '#FFFFFF' : theme.colors.textSecondary },
              ]}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Active Screen Component */}
        {isLoginMode ? (
          <LoginScreen
            onLoginSuccess={handleSuccess}
            onSwitchToSignup={() => setIsLoginMode(false)}
          />
        ) : (
          <SignupScreen
            onSignupSuccess={handleSuccess}
            onSwitchToLogin={() => setIsLoginMode(true)}
          />
        )}
      </View>

      <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
        By logging in, you agree to Daybook's Terms of Service & Privacy Policy.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logoCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    elevation: 6,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    elevation: 4,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  toggleTab: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeToggleTab: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '700',
  },
  footerText: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 300,
  },
});

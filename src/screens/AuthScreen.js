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
    >
      {/* Branding Header */}
      <View style={styles.brandContainer}>
        <View style={[styles.logoCircle, { backgroundColor: theme.colors.primary }]}>
          <Icon name="sparkles" size={32} color="#FFFFFF" />
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
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  toggleTab: {
    flex: 1,
    height: 40,
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
    marginTop: 20,
    maxWidth: 300,
  },
});

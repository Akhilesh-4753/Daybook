import { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from '../components/Icons';
import { useTheme } from '../theme/ThemeContext';
import { LoginScreen } from './LoginScreen';
import { SignupScreen } from './SignupScreen';

export const AuthScreen = ({ onAuthSuccess, onLoginSuccess }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [isLoginMode, setIsLoginMode] = useState(true);

  const handleSuccess = (userData) => {
    if (onAuthSuccess) onAuthSuccess(userData);
    if (onLoginSuccess) onLoginSuccess(userData);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Absolute Top Right Header Theme Toggle */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.themeToggleBtn}
          onPress={toggleTheme}
          activeOpacity={0.7}
        >
          <Icon
            name={isDarkMode ? 'sun' : 'moon'}
            size={24}
            color={isDarkMode ? '#F59E0B' : theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Branding Header */}
        <View style={styles.brandContainer}>
        <Image
          source={require('../../assets/images/daybook-logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  topBar: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  themeToggleBtn: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logoImage: {
    width: 220,
    height: 125,
    marginBottom: 4,
  },
  brandTitle: {
    fontSize: 26,
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

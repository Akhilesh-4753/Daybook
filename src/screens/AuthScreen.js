import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Icon } from '../components/Icons';
import {
  signUpUser,
  loginUser,
  resetUserPassword,
  isFirebaseConfigured,
} from '../services/firebase';

export const AuthScreen = ({ onAuthSuccess }) => {
  const { theme } = useTheme();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    setErrorMessage('');
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address (e.g. user@example.com).');
      return;
    }

    if (cleanPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (!isLoginMode) {
      if (!name.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (cleanPassword !== confirmPassword.trim()) {
        setErrorMessage('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      if (isLoginMode) {
        const res = await loginUser(cleanEmail, cleanPassword);
        const userData = {
          name: res.user.displayName || cleanEmail.split('@')[0],
          email: res.user.email || cleanEmail,
          uid: res.user.uid,
          productivityScore: 87,
          streak: 12,
        };
        onAuthSuccess && onAuthSuccess(userData);
      } else {
        const res = await signUpUser(name.trim(), cleanEmail, cleanPassword);
        const userData = {
          name: res.user.displayName || name.trim(),
          email: res.user.email || cleanEmail,
          uid: res.user.uid,
          productivityScore: 100,
          streak: 1,
        };
        onAuthSuccess && onAuthSuccess(userData);
      }
    } catch (error) {
      console.log('Auth error:', error);
      let msg = error.message || 'An error occurred during authentication.';
      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential'
      ) {
        msg = 'Invalid email or password. Please try again.';
      } else if (error.code === 'auth/email-already-in-use') {
        msg = 'An account with this email address already exists.';
      } else if (error.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        msg = 'Password is too weak. Please use at least 6 characters.';
      } else if (error.code === 'auth/too-many-requests') {
        msg = 'Too many failed login attempts. Please wait a few minutes before trying again.';
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };


  const handleDemoMode = () => {
    onAuthSuccess({
      name: 'Akhilesh',
      email: 'akhilesh@daybook.app',
      uid: 'demo_user',
      productivityScore: 87,
      streak: 12,
    });
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Reset Password', 'Please enter your email address in the field above.');
      return;
    }
    try {
      await resetUserPassword(email);
      Alert.alert('Password Reset', `Password reset instructions sent to ${email}`);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
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

        {/* Firebase indicator */}
        <View
          style={[
            styles.firebaseBadge,
            {
              backgroundColor: isFirebaseConfigured
                ? 'rgba(16, 185, 129, 0.15)'
                : 'rgba(245, 158, 11, 0.15)',
              borderColor: isFirebaseConfigured ? theme.colors.success : theme.colors.warning,
            },
          ]}
        >
          <Text
            style={[
              styles.firebaseBadgeText,
              { color: isFirebaseConfigured ? theme.colors.success : '#D97706' },
            ]}
          >
            {isFirebaseConfigured
              ? '🔥 Connected to Firebase Auth & Database'
              : '⚡ Firebase Sync Ready (Demo & Offline Mode)'}
          </Text>
        </View>
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
            onPress={() => {
              setIsLoginMode(true);
              setErrorMessage('');
            }}
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
            onPress={() => {
              setIsLoginMode(false);
              setErrorMessage('');
            }}
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

        {/* Error Banner */}
        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Form Inputs */}
        {!isLoginMode && (
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Full Name</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  color: theme.colors.textPrimary,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="e.g. Akhilesh"
              placeholderTextColor={theme.colors.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>
        )}

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Email Address</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surfaceVariant,
                color: theme.colors.textPrimary,
                borderColor: theme.colors.border,
              },
            ]}
            placeholder="you@example.com"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Password</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surfaceVariant,
                color: theme.colors.textPrimary,
                borderColor: theme.colors.border,
              },
            ]}
            placeholder="••••••••"
            placeholderTextColor={theme.colors.textMuted}
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {!isLoginMode && (
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Confirm Password
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  color: theme.colors.textPrimary,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="••••••••"
              placeholderTextColor={theme.colors.textMuted}
              secureTextEntry={true}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>
        )}

        {isLoginMode && (
          <TouchableOpacity style={styles.forgotBtn} onPress={handleForgotPassword}>
            <Text style={[styles.forgotText, { color: theme.colors.primary }]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
        )}

        {/* Submit Action Button */}
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: theme.colors.primary }]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>
              {isLoginMode ? 'Log In to Daybook' : 'Create Account'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Demo Fast Access Button */}
        <View style={styles.dividerRow}>
          <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
          <Text style={[styles.dividerText, { color: theme.colors.textMuted }]}>OR</Text>
          <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
        </View>

        <TouchableOpacity
          style={[
            styles.demoBtn,
            { backgroundColor: theme.colors.cardSecondary, borderColor: theme.colors.border },
          ]}
          onPress={handleDemoMode}
        >
          <Text style={[styles.demoBtnText, { color: theme.colors.textPrimary }]}>
            🚀 Continue as Demo User (Akhilesh)
          </Text>
        </TouchableOpacity>
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
  firebaseBadge: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  firebaseBadgeText: {
    fontSize: 11,
    fontWeight: '700',
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
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '600',
  },
  submitBtn: {
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  line: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
    marginHorizontal: 10,
  },
  demoBtn: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 20,
    maxWidth: 300,
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Icon } from '../components/Icons';
import { loginUser, resetUserPassword } from '../services/firebase';

export const LoginScreen = ({ onLoginSuccess, onSwitchToSignup }) => {
  const { theme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [pendingUserData, setPendingUserData] = useState(null);

  const handleLogin = async () => {
    setErrorMessage('');
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (cleanPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser(cleanEmail, cleanPassword);
      const userData = {
        name: res.user.displayName || cleanEmail.split('@')[0],
        email: res.user.email || cleanEmail,
        uid: res.user.uid,
        productivityScore: 87,
        streak: 12,
      };
      setPendingUserData(userData);
      setIsSuccessModalVisible(true);
    } catch (error) {
      let msg = error.message || 'Login failed. Please try again.';
      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential'
      ) {
        msg = 'Invalid email or password. Please check your credentials.';
      } else if (error.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      } else if (error.code === 'auth/user-disabled') {
        msg = 'This user account has been disabled.';
      } else if (error.code === 'auth/too-many-requests') {
        msg = 'Too many failed login attempts. Please wait a moment and try again.';
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSuccess = () => {
    setIsSuccessModalVisible(false);
    if (pendingUserData && onLoginSuccess) {
      onLoginSuccess(pendingUserData);
    }
  };

  const handleForgotPassword = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      Alert.alert('Reset Password', 'Please enter your email address in the email field above.');
      return;
    }
    try {
      await resetUserPassword(cleanEmail);
      Alert.alert('Password Reset Sent', `A password reset link has been sent to ${cleanEmail}`);
    } catch (e) {
      Alert.alert('Reset Error', e.message || 'Could not send reset email.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Screen Title */}
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Welcome Back</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Sign in to your Daybook account
      </Text>

      {/* Error Banner */}
      {errorMessage ? (
        <View style={styles.errorBox}>
          <Icon name="ban" size={18} color="#EF4444" style={styles.errorIcon} />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      {/* Email Address Field */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Email Address</Text>
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: theme.colors.surfaceVariant,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Icon name="email" size={18} color={theme.colors.primary} style={styles.fieldIcon} />
          <TextInput
            style={[styles.input, { color: theme.colors.textPrimary }]}
            placeholder="you@example.com"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>
      </View>

      {/* Password Field */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Password</Text>
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: theme.colors.surfaceVariant,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Icon name="lock" size={18} color={theme.colors.primary} style={styles.fieldIcon} />
          <TextInput
            style={[styles.input, { color: theme.colors.textPrimary }]}
            placeholder="••••••••"
            placeholderTextColor={theme.colors.textMuted}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn} activeOpacity={0.7}>
            <Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitBtn, { backgroundColor: theme.colors.primary }]}
        onPress={handleLogin}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitBtnText}>Log In</Text>
        )}
      </TouchableOpacity>

      {/* Switch to Sign Up */}
      <View style={styles.switchRow}>
        <Text style={[styles.switchText, { color: theme.colors.textSecondary }]}>
          Don't have an account?{' '}
        </Text>
        <TouchableOpacity onPress={onSwitchToSignup}>
          <Text style={[styles.switchLink, { color: theme.colors.primary }]}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      {/* Login Successful Custom Success Modal */}
      <Modal
        visible={isSuccessModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleConfirmSuccess}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.stylishAlertContainer,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <View style={[styles.successIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Icon name="check" size={32} color="#10B981" />
            </View>

            <Text style={[styles.stylishAlertTitle, { color: theme.colors.textPrimary }]}>
              Login Successful
            </Text>
            <Text style={[styles.stylishAlertMessage, { color: theme.colors.textSecondary }]}>
              Welcome back! You have successfully logged in.
            </Text>

            <TouchableOpacity
              style={[styles.stylishAlertButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleConfirmSuccess}
              activeOpacity={0.85}
            >
              <Text style={styles.stylishAlertButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 14,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 12,
  },
  errorIcon: {
    marginRight: 6,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 46,
  },
  inputWrapperFocused: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  fieldIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    height: '100%',
    outlineStyle: 'none',
  },
  eyeBtn: {
    padding: 6,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 14,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '600',
  },
  submitBtn: {
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchText: {
    fontSize: 13,
  },
  switchLink: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  stylishAlertContainer: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  stylishAlertTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  stylishAlertMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  stylishAlertButton: {
    width: '100%',
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stylishAlertButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});


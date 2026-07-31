import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Icon } from '../components/Icons';
import { loginUser, resetUserPassword, isFirebaseConfigured } from '../services/firebase';

export const LoginScreen = ({ onLoginSuccess, onSwitchToSignup, onDemoAccess }) => {
  const { theme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
      onLoginSuccess && onLoginSuccess(userData);
    } catch (error) {
      console.log('Login error:', error);
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
          <Icon name="alert-circle" size={18} color="#EF4444" style={styles.errorIcon} />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      {/* Form Fields */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Email Address</Text>
        <View style={[styles.inputWrapper, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}>
          <Icon name="mail" size={18} color={theme.colors.textMuted} style={styles.fieldIcon} />
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

      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Password</Text>
        <View style={[styles.inputWrapper, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}>
          <Icon name="lock" size={18} color={theme.colors.textMuted} style={styles.fieldIcon} />
          <TextInput
            style={[styles.input, { color: theme.colors.textPrimary }]}
            placeholder="••••••••"
            placeholderTextColor={theme.colors.textMuted}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            <Icon name={showPassword ? 'eye-off' : 'eye'} size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Forgot Password */}
      <TouchableOpacity style={styles.forgotBtn} onPress={handleForgotPassword}>
        <Text style={[styles.forgotText, { color: theme.colors.primary }]}>Forgot Password?</Text>
      </TouchableOpacity>

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

      {/* Divider */}
      <View style={styles.dividerRow}>
        <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
        <Text style={[styles.dividerText, { color: theme.colors.textMuted }]}>OR</Text>
        <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
      </View>

      {/* Switch to Sign Up */}
      <View style={styles.switchRow}>
        <Text style={[styles.switchText, { color: theme.colors.textSecondary }]}>
          Don't have an account?{' '}
        </Text>
        <TouchableOpacity onPress={onSwitchToSignup}>
          <Text style={[styles.switchLink, { color: theme.colors.primary }]}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      {/* Demo Mode Button */}
      {onDemoAccess && (
        <TouchableOpacity
          style={[styles.demoBtn, { backgroundColor: theme.colors.cardSecondary, borderColor: theme.colors.border }]}
          onPress={onDemoAccess}
        >
          <Text style={[styles.demoBtnText, { color: theme.colors.textPrimary }]}>
            🚀 Demo Mode (Quick Sign-In)
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 48,
  },
  fieldIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  eyeBtn: {
    padding: 6,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 18,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
  },
  submitBtn: {
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchText: {
    fontSize: 14,
  },
  switchLink: {
    fontSize: 14,
    fontWeight: '700',
  },
  demoBtn: {
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

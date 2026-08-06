import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Icon } from '../components/Icons';
import { signUpUser } from '../services/firebase';

export const SignupScreen = ({ onSignupSuccess, onSwitchToLogin }) => {
  const { theme } = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const handleSignup = async () => {
    setErrorMessage('');
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanName) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
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

    if (cleanPassword !== cleanConfirm) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await signUpUser(cleanName, cleanEmail, cleanPassword);
      const userData = {
        name: res.user.displayName || cleanName,
        email: res.user.email || cleanEmail,
        uid: res.user.uid,
        productivityScore: 0,
        streak: 0,
      };
      onSignupSuccess && onSignupSuccess(userData);
    } catch (error) {
      let msg = error.message || 'Registration failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        msg = 'An account with this email address already exists. Please log in.';
      } else if (error.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        msg = 'Password is too weak. Please use at least 6 characters.';
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Screen Title */}
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Create Account</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Join Daybook to organize your day
      </Text>

      {/* Error Banner */}
      {errorMessage ? (
        <View style={styles.errorBox}>
          <Icon name="ban" size={18} color="#EF4444" style={styles.errorIcon} />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      {/* Full Name Field */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Full Name</Text>
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: theme.colors.surfaceVariant,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Icon name="user" size={18} color={theme.colors.primary} style={styles.fieldIcon} />
          <TextInput
            style={[styles.input, { color: theme.colors.textPrimary }]}
            placeholder="e.g. Akhilesh"
            placeholderTextColor={theme.colors.textMuted}
            value={name}
            onChangeText={setName}
          />
        </View>
      </View>

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
            placeholder="At least 6 characters"
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

      {/* Confirm Password Field */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Confirm Password</Text>
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
            placeholder="Re-enter password"
            placeholderTextColor={theme.colors.textMuted}
            secureTextEntry={!showPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitBtn, { backgroundColor: theme.colors.primary, marginTop: 6 }]}
        onPress={handleSignup}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitBtnText}>Create Account</Text>
        )}
      </TouchableOpacity>

      {/* Switch to Log In */}
      <View style={styles.switchRow}>
        <Text style={[styles.switchText, { color: theme.colors.textSecondary }]}>
          Already have an account?{' '}
        </Text>
        <TouchableOpacity onPress={onSwitchToLogin}>
          <Text style={[styles.switchLink, { color: theme.colors.primary }]}>Log In</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 10,
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
    height: 44,
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
});

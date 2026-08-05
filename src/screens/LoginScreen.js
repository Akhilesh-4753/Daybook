import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { GoogleIcon, Icon } from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { resetUserPassword } from '../services/firebase';
import { useTheme } from '../theme/ThemeContext';

export const LoginScreen = ({ onLoginSuccess, onSwitchToSignup }) => {
  const { theme } = useTheme();
  const { login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotMsg, setShowForgotMsg] = useState(false);
  const [showGoogleMsg, setShowGoogleMsg] = useState(false);
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
      // login() in AuthContext calls Firebase and then suppresses onAuthStateChanged
      // for 2.8s, giving the success modal time to display before navigation fires.
      const result = await login(cleanEmail, cleanPassword);
      const userData = result?.userData || {
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
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

  const handleGoogleLogin = () => {
    setErrorMessage('');
    setShowGoogleMsg(true);
  };

  // Tapping "Continue" just closes the modal visually.
  // AuthContext.login() already scheduled setIsAuthenticated(true) after 2.8s,
  // which will unmount LoginScreen and navigate to the main app.
  const handleConfirmSuccess = () => {
    setIsSuccessModalVisible(false);
  };

  // Auto-dismiss the modal after 1250ms (AuthContext navigates at 1400ms)
  useEffect(() => {
    if (!isSuccessModalVisible) return;
    const timer = setTimeout(() => {
      setIsSuccessModalVisible(false);
    }, 1250);
    return () => clearTimeout(timer);
  }, [isSuccessModalVisible]);


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

      {/* Forgot Password */}
      <TouchableOpacity
        style={styles.forgotLink}
        onPress={() => setShowForgotMsg(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.forgotLinkText, { color: theme.colors.primary }]}>Forgot Password?</Text>
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

      {/* OR Divider */}
      <View style={styles.dividerRow}>
        <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
        <Text style={[styles.dividerText, { color: theme.colors.textMuted }]}>or</Text>
        <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
      </View>

      {/* Continue with Google */}
      <TouchableOpacity
        style={[
          styles.googleBtn,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
        ]}
        onPress={handleGoogleLogin}
        disabled={loading}
        activeOpacity={0.85}
      >
        <GoogleIcon size={22} />
        <Text style={[styles.googleBtnText, { color: theme.colors.textPrimary }]}>
          Continue with Google
        </Text>
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
          </View>
        </View>
      </Modal>

      {/* Forgot Password Modal */}
      <Modal
        visible={showForgotMsg}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowForgotMsg(false)}
      >
        <View style={styles.modalOverlay}>
          {/* Premium split card */}
          <View style={[styles.forgotModalCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>

            {/* Top coloured banner with layered glowing circles */}
            <View style={styles.forgotModalBanner}>
              <View style={styles.forgotDecorCircle1} />
              <View style={styles.forgotDecorCircle2} />

              {/* Frosted ring with Custom Vector Lock Illustration */}
              <View style={styles.forgotIconRing}>
                <View style={styles.shackle} />
                <View style={styles.lockBody}>
                  <View style={styles.keyholeDot} />
                  <View style={styles.keyholeNotch} />
                </View>
              </View>
            </View>

            {/* Bottom content */}
            <View style={styles.forgotModalBody}>
              {/* Coming Soon badge with indicator dot */}
              <View style={styles.forgotBadge}>
                <View style={styles.badgePulseDot} />
                <Text style={styles.forgotBadgeText}>Coming Soon</Text>
              </View>

              <Text style={[styles.forgotModalTitle, { color: theme.colors.textPrimary }]}>
                Password Reset
              </Text>
              <Text style={[styles.forgotModalDesc, { color: theme.colors.textSecondary }]}>
                Password reset will be available soon. We are working to make account recovery completely seamless.
              </Text>

              {/* Divider */}
              <View style={[styles.forgotDivider, { backgroundColor: theme.colors.border }]} />

              <TouchableOpacity
                style={[styles.forgotModalBtn, { backgroundColor: theme.colors.primary }]}
                onPress={() => setShowForgotMsg(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.forgotModalBtnText}>Got It</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Google Coming Soon Modal */}
      <Modal
        visible={showGoogleMsg}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGoogleMsg(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.forgotModalCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            
            {/* Google themed banner with color glow circles */}
            <View style={styles.googleModalBanner}>
              <View style={styles.googleDecorCircle1} />
              <View style={styles.googleDecorCircle2} />
              <View style={styles.googleDecorCircle3} />
              <View style={styles.googleDecorCircle4} />

              <View style={styles.googleIconRing}>
                <GoogleIcon size={34} />
              </View>
            </View>

            <View style={styles.forgotModalBody}>
              {/* Coming Soon badge */}
              <View style={styles.forgotBadge}>
                <View style={styles.badgePulseDot} />
                <Text style={styles.forgotBadgeText}>Coming Soon</Text>
              </View>

              <Text style={[styles.forgotModalTitle, { color: theme.colors.textPrimary }]}>
                Google Sign-In
              </Text>
              <Text style={[styles.forgotModalDesc, { color: theme.colors.textSecondary }]}>
                Google Sign-In will be available soon. We are working on secure one-tap Google login access.
              </Text>

              <View style={[styles.forgotDivider, { backgroundColor: theme.colors.border }]} />

              <TouchableOpacity
                style={[styles.forgotModalBtn, { backgroundColor: theme.colors.primary }]}
                onPress={() => setShowGoogleMsg(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.forgotModalBtnText}>Got It</Text>
              </TouchableOpacity>
            </View>
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '600',
    marginHorizontal: 10,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 14,
    gap: 10,
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: 14,
    marginTop: 4,
  },
  forgotLinkText: {
    fontSize: 13,
    fontWeight: '600',
  },
  forgotModalCard: {
    width: '85%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  forgotModalBanner: {
    backgroundColor: '#4338CA',
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  forgotDecorCircle1: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -40,
    left: -40,
  },
  forgotDecorCircle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
    bottom: -30,
    right: -20,
  },
  forgotIconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  forgotModalBody: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  forgotBadge: {
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  forgotBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.6,
  },
  forgotModalTitle: {
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  forgotModalDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
  forgotDivider: {
    width: '100%',
    height: 1,
    marginBottom: 18,
  },
  forgotModalBtn: {
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  forgotModalBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  googleModalBanner: {
    backgroundColor: '#EFF6FF',
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  googleDecorCircle1: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(66, 133, 244, 0.08)',
    top: -30,
    left: -20,
  },
  googleDecorCircle2: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(234, 67, 53, 0.06)',
    top: -40,
    right: -10,
  },
  googleDecorCircle3: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(251, 188, 5, 0.06)',
    bottom: -30,
    left: 20,
  },
  googleDecorCircle4: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(52, 168, 83, 0.06)',
    bottom: -20,
    right: 40,
  },
  googleIconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
});



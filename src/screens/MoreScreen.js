import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { useSecurity } from '../context/SecurityContext';
import { useTasks } from '../context/TaskContext';
import { BackupService } from '../services/BackupService';
import { SecurityService } from '../services/SecurityService';
import { useTheme } from '../theme/ThemeContext';

export const MoreScreen = ({ onNavigateTab, onLogout }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { user, updateUserProfile } = useAuth();
  const { isPinSet, setupPin, removeSecurity } = useSecurity();
  const { refreshData } = useTasks();

  // Custom Logout Confirm Modal State
  const [isLogoutConfirmVisible, setIsLogoutConfirmVisible] = useState(false);

  // Profile Edit Modal State
  const [isEditProfileVisible, setIsEditProfileVisible] = useState(false);
  const [editName, setEditName] = useState(user?.name || 'Akhilesh');
  const [editPhotoUri, setEditPhotoUri] = useState(user?.photoUri || null);

  // Stylish Alert Modal State
  const [isProfileSavedAlertVisible, setIsProfileSavedAlertVisible] = useState(false);

  // Image Source Options Modal State
  const [isImageOptionsVisible, setIsImageOptionsVisible] = useState(false);

  // Security Modal State Flow
  const [isSecurityModalVisible, setIsSecurityModalVisible] = useState(false);
  const [modalStep, setModalStep] = useState('select_type');
  const [selectedLockType, setSelectedLockType] = useState('pin');

  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [enableBio, setEnableBio] = useState(true);
  const [pinError, setPinError] = useState('');

  // Security Success Modals
  const [isSecuritySavedAlertVisible, setIsSecuritySavedAlertVisible] = useState(false);
  const [isSecurityRemovedAlertVisible, setIsSecurityRemovedAlertVisible] = useState(false);

  // Privacy Policy, Camera Privacy, About Us, and Privacy FAQ Modal States
  const [isPrivacyModalVisible, setIsPrivacyModalVisible] = useState(false);
  const [isCameraPrivacyModalVisible, setIsCameraPrivacyModalVisible] = useState(false);
  const [isAboutUsModalVisible, setIsAboutUsModalVisible] = useState(false);
  const [isPrivacyFaqModalVisible, setIsPrivacyFaqModalVisible] = useState(false);


  const handleExportBackup = async () => {
    try {
      await BackupService.exportBackup();
      Alert.alert('Export Complete', 'daybook_backup.json generated successfully!');
    } catch (e) {
      Alert.alert('Export Failed', e.message || 'Could not export backup.');
    }
  };

  const handleImportBackup = () => {
    Alert.alert(
      'Import Backup',
      'This will restore tasks, habits, diary entries, and reminders from your daybook_backup.json file.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed',
          onPress: async () => {
            try {
              await refreshData();
              Alert.alert('Restore Complete', 'Daybook data restored successfully!');
            } catch (e) {
              Alert.alert('Restore Failed', e.message || 'Could not import backup.');
            }
          },
        },
      ]
    );
  };

  // Profile Edit Handlers
  const handleOpenEditProfile = () => {
    setEditName(user?.name || 'Akhilesh');
    setEditPhotoUri(user?.photoUri || null);
    setIsEditProfileVisible(true);
  };

  // Check if profile details have changed
  const hasProfileChanges =
    editName.trim() !== (user?.name || 'Akhilesh') ||
    editPhotoUri !== (user?.photoUri || null);

  const handleSaveProfile = async () => {
    if (!hasProfileChanges) return;
    if (!editName.trim()) {
      Alert.alert('Invalid Name', 'Please enter your name.');
      return;
    }
    await updateUserProfile(editName.trim(), editPhotoUri);
    setIsEditProfileVisible(false);
    setIsProfileSavedAlertVisible(true);
  };

  const handleTakePhoto = async () => {
    setIsImageOptionsVisible(false);
    try {
      if (Platform.OS !== 'web') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission Required', 'Camera permission is required to take a photo.');
          return;
        }
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const formattedUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        setEditPhotoUri(formattedUri);
      }
    } catch (e) {
      console.warn('Camera error:', e);
    }
  };

  const handleChooseFromGallery = async () => {
    setIsImageOptionsVisible(false);
    try {
      if (Platform.OS !== 'web') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission Required', 'Gallery access is required to pick an image.');
          return;
        }
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const formattedUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        setEditPhotoUri(formattedUri);
      }
    } catch (e) {
      console.warn('Gallery pick error:', e);
    }
  };

  const handleRemovePhoto = () => {
    setIsImageOptionsVisible(false);
    setEditPhotoUri(null);
  };

  // Security Handlers
  const handleOpenSecurityModal = () => {
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setPinError('');

    if (isPinSet) {
      setModalStep('verify_current');
    } else {
      setModalStep('select_type');
    }
    setIsSecurityModalVisible(true);
  };

  const handleVerifyCurrentPin = async () => {
    setPinError('');
    if (!currentPin || currentPin.length !== 4) {
      setPinError('Please enter your 4-digit current PIN.');
      return;
    }

    const isValid = await SecurityService.verifyPin(currentPin);
    if (!isValid) {
      setPinError('Incorrect current PIN. Please try again.');
      return;
    }

    setCurrentPin('');
    setModalStep('manage_security');
  };

  const handleSaveNewPin = async () => {
    setPinError('');
    if (!newPin || newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      setPinError('Please enter a valid 4-digit numeric PIN.');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('PINs do not match. Please re-enter.');
      return;
    }

    try {
      const isBio = selectedLockType === 'biometric' || enableBio;
      await setupPin(newPin, isBio);
      setIsSecurityModalVisible(false);
      setIsSecuritySavedAlertVisible(true);
    } catch (e) {
      setPinError('Failed to save security PIN.');
    }
  };

  const handleDisableSecurity = async () => {
    await removeSecurity();
    setIsSecurityModalVisible(false);
    setIsSecurityRemovedAlertVisible(true);
  };

  const handleOpenSocialLink = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Cannot Open Link', `Opening URL: ${url}`);
      }
    } catch (e) {
      Alert.alert('Link Error', url);
    }
  };

  const menuSections = [
    {
      title: 'Preferences & Security',
      items: [
        {
          id: 'theme',
          title: 'Dark / Light Mode',
          subtitle: isDarkMode ? 'Currently Enabled (Dark)' : 'Currently Enabled (Light)',
          icon: 'palette',
          isSwitch: true,
          value: isDarkMode,
          onToggle: toggleTheme,
        },
        {
          id: 'security',
          title: 'App Lock & Biometrics',
          subtitle: isPinSet ? '🔒 Security Active (Tap to change or remove)' : '🔓 Off (Tap to setup lock)',
          icon: 'lock',
          onPress: handleOpenSecurityModal,
        },
      ],
    },
    {
      title: 'Productivity & Backup',
      items: [
        {
          id: 'habits',
          title: 'Recurring Habits & Goals',
          subtitle: 'Manage daily habits, streak tracking',
          icon: 'target',
          onPress: () => onNavigateTab && onNavigateTab('habits'),
        },
        {
          id: 'export_backup',
          title: 'Export Backup (JSON)',
          subtitle: 'Option disabled',
          icon: 'cloud',
          disabled: true,
          onPress: () => { },
        },
        {
          id: 'import_backup',
          title: 'Restore Data from Backup',
          subtitle: 'Option disabled',
          icon: 'sparkles',
          disabled: true,
          onPress: () => { },
        },
      ],
    },
    {
      title: 'About & Legal',
      items: [
        {
          id: 'camera_privacy',
          title: 'Camera & Gallery Privacy',
          subtitle: 'Permissions, Sandboxing & Data Protection',
          icon: 'shield',
          onPress: () => setIsCameraPrivacyModalVisible(true),
        },
        {
          id: 'privacy_faq',
          title: 'Privacy & Authentication FAQ',
          subtitle: 'Why Firebase is used & how your data stays local',
          icon: 'lock',
          onPress: () => setIsPrivacyFaqModalVisible(true),
        },
        {
          id: 'about_us',
          title: 'About Us & Developer',
          subtitle: 'Created by Akhilesh — Story, Vision & Socials',
          icon: 'user',
          onPress: () => setIsAboutUsModalVisible(true),
        },
        {
          id: 'privacy_policy',
          title: 'Privacy Policy & Security',
          subtitle: '100% Local Storage & Offline Privacy Promise',
          icon: 'shield',
          onPress: () => setIsPrivacyModalVisible(true),
        },
      ],
    },
    {
      title: 'Account & Support',
      items: [
        {
          id: 'logout',
          title: 'Log Out',
          subtitle: 'Sign out of your Daybook account',
          icon: 'trash',
          onPress: () => setIsLogoutConfirmVisible(true),
        },
      ],
    },

  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header: User & Settings */}
      <View style={styles.topHeader}>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
          User & Settings
        </Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Clean User Profile Card */}
        <TouchableOpacity
          style={[
            styles.profileCard,
            { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
          ]}
          onPress={handleOpenEditProfile}
          activeOpacity={0.8}
        >
          <View style={styles.avatarWrapper}>
            {user?.photoUri ? (
              <Image source={{ uri: user.photoUri }} style={styles.avatarImg} resizeMode="cover" />
            ) : (
              <View style={[styles.avatarBg, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.avatarText}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.colors.textPrimary }]}>
              {user?.name || 'Akhilesh'}
            </Text>
            <Text style={[styles.profileEmail, { color: theme.colors.textMuted }]}>
              {user?.email || 'akhilesh@daybook.app'}
            </Text>

            {/* Subscription Badge */}
            <View style={[styles.badgePill, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
              <Text style={[styles.badgeText, { color: theme.colors.primary }]}>
                ⭐ Premium Member
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Menu Sections */}
        {menuSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>
              {section.title}
            </Text>

            <View
              style={[
                styles.menuCard,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
              ]}
            >
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItemRow,
                    index < section.items.length - 1 && [
                      styles.itemBorder,
                      { borderBottomColor: theme.colors.border },
                    ],
                    item.disabled && { opacity: 0.4 },
                  ]}
                  disabled={item.disabled}
                  onPress={item.onPress}
                  activeOpacity={item.isSwitch ? 1 : 0.7}
                >
                  <View
                    style={[
                      styles.menuIconBg,
                      { backgroundColor: theme.colors.surfaceVariant },
                    ]}
                  >
                    <Icon name={item.icon} size={20} color={theme.colors.primary} />
                  </View>

                  <View style={styles.menuTextContainer}>
                    <Text style={[styles.menuTitle, { color: theme.colors.textPrimary }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.menuSub, { color: theme.colors.textMuted }]}>
                      {item.subtitle}
                    </Text>
                  </View>

                  {item.isSwitch ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
                      thumbColor={item.value ? theme.colors.primary : '#F4F3F4'}
                    />
                  ) : (
                    <Icon name="chevronRight" size={16} color={theme.colors.textMuted} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Privacy Policy Modal */}
      <Modal
        visible={isPrivacyModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsPrivacyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.aboutModalCard,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={[styles.modalHeaderIconBg, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                <Icon name="shield" size={28} color={theme.colors.primary} />
              </View>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                Privacy Policy & Data Security
              </Text>
              <Text style={[styles.modalSub, { color: theme.colors.textSecondary }]}>
                100% Offline • Zero Cloud Tracking • Your Data Belongs Only to You
              </Text>
            </View>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={true}>
              <View style={[styles.privacyBadgeBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: '#10B981' }]}>
                <Text style={styles.privacyBadgeTitle}>🛡️ Our Absolute Privacy Promise</Text>
                <Text style={[styles.privacyBadgeDesc, { color: theme.colors.textPrimary }]}>
                  Daybook is engineered from the ground up to respect your privacy. We NEVER store, upload, transmit, or harvest your personal tasks, habits, diary entries, or profile photos on any external cloud server or remote database.
                </Text>
              </View>

              <View style={styles.privacySection}>
                <Text style={[styles.privacyHeading, { color: theme.colors.textPrimary }]}>
                  1. Local SQLite Storage Architecture
                </Text>
                <Text style={[styles.privacyText, { color: theme.colors.textSecondary }]}>
                  All your data—including daily tasks, reminder schedules, mood diaries, and habit streaks—is saved directly inside an encrypted SQLite database stored locally on your device hardware.
                </Text>
              </View>

              <View style={styles.privacySection}>
                <Text style={[styles.privacyHeading, { color: theme.colors.textPrimary }]}>
                  2. Zero Data Sales & Zero Telemetry
                </Text>
                <Text style={[styles.privacyText, { color: theme.colors.textSecondary }]}>
                  We do not sell, share, or monetize your personal information. Daybook operates completely offline without background ad trackers, behavioral profiling, or analytical telemetry.
                </Text>
              </View>

              <View style={styles.privacySection}>
                <Text style={[styles.privacyHeading, { color: theme.colors.textPrimary }]}>
                  3. Full User Data Ownership & Local Backups
                </Text>
                <Text style={[styles.privacyText, { color: theme.colors.textSecondary }]}>
                  You own 100% of your data. You can export a full local JSON backup (`daybook_backup.json`) at any time and transfer it freely to any device without cloud lock-in.
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.closeModalBtn, { backgroundColor: theme.colors.primary }]}
              onPress={() => setIsPrivacyModalVisible(false)}
            >
              <Text style={styles.closeModalBtnText}>I Understand & Agree</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Privacy & Authentication FAQ Modal */}
      <Modal
        visible={isPrivacyFaqModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsPrivacyFaqModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.aboutModalCard,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={[styles.modalHeaderIconBg, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                <Icon name="lock" size={26} color={theme.colors.primary} />
              </View>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                Privacy & Authentication FAQ
              </Text>
            </View>

            <ScrollView style={{ maxHeight: 480 }} showsVerticalScrollIndicator={false}>
              {/* Privacy Callout Banner */}
              <View
                style={[
                  styles.storyCard,
                  { backgroundColor: 'rgba(99, 102, 241, 0.08)', borderColor: theme.colors.primary, borderWidth: 1 },
                ]}
              >
                <Text style={[styles.storySectionHeading, { color: theme.colors.primary }]}>
                  🔐 Your Privacy Comes First.
                </Text>
                <Text style={[styles.storyParagraph, { color: theme.colors.textPrimary, lineHeight: 20 }]}>
                  Daybook is designed with a <Text style={{ fontWeight: '800' }}>privacy-first, offline-first</Text> approach. We use <Text style={{ fontWeight: '800', color: theme.colors.primary }}>Firebase Authentication</Text> only to verify your identity during Sign Up and Log In. Once authenticated, your personal data remains on <Text style={{ fontWeight: '800' }}>your device</Text> and is <Text style={{ fontWeight: '800', color: '#EF4444' }}>never stored in Firebase</Text>.
                </Text>
              </View>

              {/* FAQ Questions & Answers */}
              <View style={{ marginTop: 14 }}>
                {/* Q1 */}
                <View style={[styles.faqCard, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}>
                  <Text style={[styles.optionTitle, { color: theme.colors.textPrimary, fontSize: 16, marginBottom: 8 }]}>
                    🔥 Why do I need to log in?
                  </Text>
                  <Text style={[styles.storyParagraph, { color: theme.colors.textSecondary, lineHeight: 21 }]}>
                    Logging in allows Daybook to securely verify your identity and protect access to your account.
                  </Text>
                  <Text style={[styles.storyParagraph, { color: theme.colors.textSecondary, marginTop: 8, lineHeight: 21 }]}>
                    Firebase Authentication is used <Text style={{ fontWeight: '700' }}>only</Text> for:
                    {'\n'}• Secure Sign Up
                    {'\n'}• Secure Log In
                    {'\n'}• Identity Verification
                  </Text>
                  <Text style={[styles.storyParagraph, { color: theme.colors.textMuted, marginTop: 8, fontSize: 12 }]}>
                    Once authentication is complete, all your personal productivity data is stored locally on your device.
                  </Text>
                </View>

                {/* Q2 */}
                <View style={[styles.faqCard, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}>
                  <Text style={[styles.optionTitle, { color: theme.colors.textPrimary, fontSize: 16, marginBottom: 8 }]}>
                    💾 What data is stored locally?
                  </Text>
                  <Text style={[styles.storyParagraph, { color: theme.colors.textSecondary, lineHeight: 22 }]}>
                    The following information is stored <Text style={{ fontWeight: '700' }}>only on your device</Text> using SQLite and AsyncStorage:
                    {'\n\n'}✅ Tasks
                    {'\n'}✅ Diary Entries
                    {'\n'}✅ Habits & Goals
                    {'\n'}✅ Calendar Reminders
                    {'\n'}✅ Reports & Analytics
                    {'\n'}✅ Theme Preferences
                    {'\n'}✅ App Settings
                    {'\n'}✅ Profile Information
                  </Text>
                </View>

                {/* Q3 */}
                <View style={[styles.faqCard, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}>
                  <Text style={[styles.optionTitle, { color: theme.colors.textPrimary, fontSize: 16, marginBottom: 8 }]}>
                    ☁️ Does Firebase store my personal data?
                  </Text>
                  <Text style={[styles.storyParagraph, { color: '#EF4444', fontWeight: '800', fontSize: 16, marginBottom: 4 }]}>
                    No.
                  </Text>
                  <Text style={[styles.storyParagraph, { color: theme.colors.textSecondary, lineHeight: 21 }]}>
                    Firebase is used <Text style={{ fontWeight: '700' }}>only</Text> for authentication. Your personal productivity data—including diary entries, tasks, reminders, habits, reports, and settings—is <Text style={{ fontWeight: '700' }}>never uploaded</Text> to Firebase.
                  </Text>
                </View>

                {/* Q4 */}
                <View style={[styles.faqCard, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}>
                  <Text style={[styles.optionTitle, { color: theme.colors.textPrimary, fontSize: 16, marginBottom: 8 }]}>
                    👨‍💻 Can the developer view my data?
                  </Text>
                  <Text style={[styles.storyParagraph, { color: '#EF4444', fontWeight: '800', fontSize: 16, marginBottom: 4 }]}>
                    No.
                  </Text>
                  <Text style={[styles.storyParagraph, { color: theme.colors.textSecondary, lineHeight: 21 }]}>
                    Daybook does not upload your personal productivity data to any cloud database. Because your data stays on your device, the developer cannot access your:
                    {'\n\n'}• Diary Entries
                    {'\n'}• Tasks
                    {'\n'}• Habits
                    {'\n'}• Reminders
                    {'\n'}• Reports
                    {'\n'}• Personal Notes
                  </Text>
                </View>

                {/* Q5 */}
                <View style={[styles.faqCard, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}>
                  <Text style={[styles.optionTitle, { color: theme.colors.textPrimary, fontSize: 16, marginBottom: 8 }]}>
                    🤝 Why can I trust Daybook?
                  </Text>
                  <Text style={[styles.storyParagraph, { color: theme.colors.textSecondary, lineHeight: 21 }]}>
                    Daybook follows a <Text style={{ fontWeight: '700', color: theme.colors.primary }}>Privacy-First</Text> philosophy. Your information belongs to <Text style={{ fontWeight: '700' }}>you</Text>, not to us. We intentionally designed Daybook so your personal productivity data remains under your complete control.
                  </Text>
                </View>

                {/* Q6 */}
                <View style={[styles.faqCard, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}>
                  <Text style={[styles.optionTitle, { color: theme.colors.textPrimary, fontSize: 16, marginBottom: 8 }]}>
                    🌐 Do I need an internet connection?
                  </Text>
                  <Text style={[styles.storyParagraph, { color: theme.colors.textSecondary, lineHeight: 21 }]}>
                    An internet connection is required only for:
                    {'\n'}• Creating a new account
                    {'\n'}• Logging in to your account
                    {'\n\n'}Once you're signed in, Daybook works completely offline for all core features.
                  </Text>
                </View>

                {/* Q7 */}
                <View style={[styles.faqCard, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}>
                  <Text style={[styles.optionTitle, { color: theme.colors.textPrimary, fontSize: 16, marginBottom: 8 }]}>
                    📱 Can I use the same account on multiple devices?
                  </Text>
                  <Text style={[styles.storyParagraph, { color: theme.colors.textSecondary, lineHeight: 21 }]}>
                    <Text style={{ fontWeight: '700' }}>Yes.</Text> You can sign in using the same account on multiple devices. However, each device maintains its own independent local database. This means data created on one device is <Text style={{ fontWeight: '700' }}>not automatically synchronized</Text> with another device.
                  </Text>
                </View>

                {/* Q8 */}
                <View style={[styles.faqCard, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}>
                  <Text style={[styles.optionTitle, { color: theme.colors.textPrimary, fontSize: 16, marginBottom: 8 }]}>
                    🔒 If someone gains access to my account, can they read my diary?
                  </Text>
                  <Text style={[styles.storyParagraph, { color: theme.colors.textSecondary, lineHeight: 21 }]}>
                    <Text style={{ fontWeight: '800', color: '#10B981' }}>No.</Text> Your diary entries, tasks, reminders, habits, and reports are stored locally on your device. Even if someone signs in with your account on another device, they <Text style={{ fontWeight: '700' }}>cannot access</Text> the local data stored on your device.
                    {'\n\n'}For additional protection, you can enable:
                    {'\n'}🔑 App Lock PIN
                    {'\n'}👆 Fingerprint Authentication
                    {'\n'}😊 Face Authentication (Supported Devices)
                  </Text>
                </View>

                {/* Q9 */}
                <View style={[styles.faqCard, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}>
                  <Text style={[styles.optionTitle, { color: theme.colors.textPrimary, fontSize: 16, marginBottom: 8 }]}>
                    ☁️ Can Google or Firebase view my diary?
                  </Text>
                  <Text style={[styles.storyParagraph, { color: theme.colors.textSecondary, lineHeight: 21 }]}>
                    <Text style={{ fontWeight: '800', color: '#10B981' }}>No.</Text> Google Firebase only verifies your account during authentication. Your personal productivity data is <Text style={{ fontWeight: '700' }}>never uploaded</Text> to Firebase.
                  </Text>
                </View>

                {/* Architecture Flow Box (Fixed Static Layout) */}
                <View style={[styles.faqCard, { backgroundColor: 'rgba(99, 102, 241, 0.06)', borderColor: theme.colors.primary }]}>
                  <Text style={[styles.optionTitle, { color: theme.colors.primary, fontSize: 16, marginBottom: 8 }]}>
                    Architecture & Data Flow
                  </Text>
                  <Text style={[styles.storyParagraph, { color: theme.colors.textSecondary, fontSize: 13, lineHeight: 19, marginBottom: 10 }]}>
                    Authentication and data storage serve different purposes. Firebase securely verifies your identity. After login, Daybook stores all productivity data locally using SQLite and AsyncStorage.
                  </Text>
                  <View style={{ backgroundColor: theme.colors.card, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.border, width: '100%' }}>
                    <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 10, color: theme.colors.primary, textAlign: 'center', lineHeight: 16 }}>
                      Internet (Only During Login){'\n'}
                      │{'\n'}
                      ▼{'\n'}
                      Firebase Authentication{'\n'}
                      │{'\n'}
                      Identity Verification{'\n'}
                      │{'\n'}
                      ▼{'\n'}
                      Login Successful ➔ Daybook App{'\n'}
                      │{'\n'}
                      ┌──────────┴──────────┐{'\n'}
                      ▼                     ▼{'\n'}
                      SQLite DB         AsyncStorage{'\n'}
                      (Tasks, Diary)    (Settings)
                    </Text>
                  </View>
                </View>

                {/* Privacy Promise Box */}
                <View style={[styles.uniqueBox, { marginTop: 12 }]}>
                  <Text style={[styles.uniqueTitle, { color: theme.colors.textPrimary }]}>
                    🛡️ Your Privacy Promise
                  </Text>
                  <Text style={[styles.bulletText, { color: theme.colors.textSecondary, lineHeight: 22, marginTop: 6 }]}>
                    🔒 100% Local Data Storage{'\n'}
                    📴 Offline-First Experience{'\n'}
                    🔑 Optional PIN & Biometric Protection{'\n'}
                    📦 User-Controlled Backup & Restore{'\n'}
                    🚫 No Cloud Storage for Personal Data{'\n'}
                    🔐 Secure Firebase Authentication
                  </Text>
                </View>

                {/* Commitment Box */}
                <View style={[styles.storyCard, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border, marginTop: 12 }]}>
                  <Text style={[styles.storySectionHeading, { color: theme.colors.primary }]}>
                    ❤️ Our Commitment
                  </Text>
                  <Text style={[styles.storyParagraph, { color: theme.colors.textSecondary, lineHeight: 20 }]}>
                    Your personal thoughts, goals, habits, and memories are private. Daybook was built to help you stay organized while ensuring your data remains under <Text style={{ fontWeight: '800', color: theme.colors.textPrimary }}>your control</Text>, <Text style={{ fontWeight: '800', color: theme.colors.textPrimary }}>on your device</Text>, and <Text style={{ fontWeight: '800', color: theme.colors.textPrimary }}>protected by modern security practices</Text>.
                  </Text>
                  <Text style={{ textAlign: 'center', fontWeight: '800', color: theme.colors.primary, marginTop: 12, fontSize: 14 }}>
                    Your data. Your privacy. Your Daybook.
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Styled Primary Action Close Button */}
            <TouchableOpacity
              style={[styles.closeFaqBtn, { backgroundColor: theme.colors.primary }]}
              onPress={() => setIsPrivacyFaqModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.closeFaqBtnText}>Close FAQ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* About Us & Developer Story Modal */}
      <Modal
        visible={isAboutUsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsAboutUsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.aboutModalCard,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <ScrollView style={{ maxHeight: 460 }} showsVerticalScrollIndicator={false}>
              {/* Builder Profile Header */}
              <View style={styles.builderHeader}>
                <View style={[styles.builderAvatarBorder, { borderColor: theme.colors.primary }]}>
                  <Image
                    source={require('../../assets/images/builder.png')}
                    style={styles.builderImg}
                    resizeMode="cover"
                  />
                </View>
                <Text style={[styles.builderName, { color: theme.colors.textPrimary }]}>
                  Akhilesh
                </Text>
                <Text style={[styles.builderTitlePill, { color: theme.colors.primary, backgroundColor: 'rgba(99, 102, 241, 0.12)' }]}>
                  🚀 Creator & Lead Developer of Daybook
                </Text>
                <Text style={[styles.builderDegree, { color: theme.colors.textMuted }]}>
                  Accountant ➔ Software Developer
                </Text>
              </View>


              {/* Story Content */}
              <View style={[styles.storyCard, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}>
                <Text style={[styles.storySectionHeading, { color: theme.colors.textPrimary }]}>
                  💡 The Story Behind Daybook
                </Text>

                <Text style={[styles.storyParagraph, { color: theme.colors.textSecondary }]}>
                  Every meaningful journey begins with a <Text style={{ fontWeight: '700', color: theme.colors.primary }}>simple idea</Text>.
                </Text>

                <Text style={[styles.storyParagraph, { color: theme.colors.textSecondary }]}>
                  For years, I relied on <Text style={{ fontWeight: '700', color: theme.colors.textPrimary }}>handwritten notes and sticky notes</Text> to remember important tasks, ideas, and daily plans. They helped me stay organized—but were <Text style={{ fontWeight: '700', color: theme.colors.textPrimary }}>easy to misplace and difficult to manage</Text>. I realized I was spending more time trying to <Text style={{ fontStyle: 'italic', fontWeight: '700', color: theme.colors.primary }}>remember</Text> my plans than actually <Text style={{ fontStyle: 'italic', fontWeight: '700', color: theme.colors.primary }}>completing</Text> them.
                </Text>

                <Text style={[styles.storyParagraph, { color: theme.colors.textSecondary }]}>
                  As I transitioned into software development, I saw an opportunity to create something better. That idea became <Text style={{ fontWeight: '800', color: theme.colors.primary }}>Daybook</Text>—a <Text style={{ fontWeight: '700', color: theme.colors.textPrimary }}>simple, private, and reliable productivity companion</Text> that brings your tasks, habits, reminders, and personal journal together in one place.
                </Text>

                <Text style={[styles.storyParagraph, { color: theme.colors.textSecondary }]}>
                  The purpose of Daybook is not just to create a to-do list. It's designed to help you <Text style={{ fontWeight: '700', color: theme.colors.primary }}>plan with clarity</Text>, <Text style={{ fontWeight: '700', color: theme.colors.primary }}>stay organized</Text>, <Text style={{ fontWeight: '700', color: theme.colors.primary }}>build consistent habits</Text>, and focus on what truly matters. Instead of trying to remember everything, <Text style={{ fontWeight: '700', color: theme.colors.textPrimary }}>let Daybook remember it for you</Text>, so you can focus your energy on taking action.
                </Text>

                <Text style={[styles.storyParagraph, { color: theme.colors.textSecondary }]}>
                  Every goal begins with a plan. <Text style={{ fontWeight: '700', color: theme.colors.textPrimary }}>Every achievement begins with a single step.</Text> Whether you're managing your daily routine, working toward a dream, or simply keeping life's important moments safe, Daybook is here to help you <Text style={{ fontWeight: '700', color: theme.colors.primary }}>stay focused, stay consistent, and grow—one day at a time.</Text>
                </Text>

                <View style={[styles.quoteCard, { backgroundColor: 'rgba(99, 102, 241, 0.08)', borderColor: theme.colors.primary }]}>
                  <Text style={[styles.quoteText, { color: theme.colors.textPrimary }]}>
                    "Don't fill your mind with things you can write down. Free your mind to think, create, and achieve."
                  </Text>
                </View>
              </View>

              {/* Why You'll Love Daybook */}
              <View style={styles.uniqueBox}>
                <Text style={[styles.uniqueTitle, { color: theme.colors.textPrimary }]}>
                  Why You'll Love Daybook
                </Text>

                <View style={styles.bulletRow}>
                  <Text style={styles.bulletEmoji}>📝</Text>
                  <Text style={[styles.bulletText, { color: theme.colors.textSecondary }]}>
                    Organize your daily life in one place.
                  </Text>
                </View>

                <View style={styles.bulletRow}>
                  <Text style={styles.bulletEmoji}>🎯</Text>
                  <Text style={[styles.bulletText, { color: theme.colors.textSecondary }]}>
                    Turn plans into consistent actions.
                  </Text>
                </View>

                <View style={styles.bulletRow}>
                  <Text style={styles.bulletEmoji}>⏰</Text>
                  <Text style={[styles.bulletText, { color: theme.colors.textSecondary }]}>
                    Never forget important tasks or reminders.
                  </Text>
                </View>

                <View style={styles.bulletRow}>
                  <Text style={styles.bulletEmoji}>📖</Text>
                  <Text style={[styles.bulletText, { color: theme.colors.textSecondary }]}>
                    Keep your thoughts and memories safe.
                  </Text>
                </View>

                <View style={styles.bulletRow}>
                  <Text style={styles.bulletEmoji}>🌱</Text>
                  <Text style={[styles.bulletText, { color: theme.colors.textSecondary }]}>
                    Build habits that create lasting success.
                  </Text>
                </View>

                <View style={styles.bulletRow}>
                  <Text style={styles.bulletEmoji}>🔒</Text>
                  <Text style={[styles.bulletText, { color: theme.colors.textSecondary }]}>
                    Enjoy complete privacy with your data stored locally on your device.
                  </Text>
                </View>
              </View>

              {/* A Thought to Remember */}
              <View style={[styles.quoteCard, { backgroundColor: 'rgba(16, 185, 129, 0.08)', borderColor: theme.colors.success, marginTop: 6, marginBottom: 16 }]}>
                <Text style={[styles.quoteHeader, { color: theme.colors.success }]}>💡 A Thought to Remember</Text>
                <Text style={[styles.quoteText, { color: theme.colors.textPrimary, fontStyle: 'italic', marginTop: 4 }]}>
                  "Success isn't built by remembering everything. Great achievements begin with a single thought, take shape through thoughtful planning, and become reality through consistent action. Daybook helps you do exactly that."
                </Text>
              </View>

              {/* Social Media Connect Links */}
              <Text style={[styles.socialSectionTitle, { color: theme.colors.textPrimary }]}>
                🌐 Connect with Akhilesh:
              </Text>
              <View style={styles.socialGrid}>
                <TouchableOpacity
                  style={[styles.socialBtn, { backgroundColor: '#25D366' }]}
                  onPress={() => handleOpenSocialLink('https://wa.me/+919526008613')}
                >
                  <Icon name="whatsapp" size={18} color="#FFFFFF" />
                  <Text style={styles.socialBtnText}>WhatsApp</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.socialBtn, { backgroundColor: '#E1306C' }]}
                  onPress={() => handleOpenSocialLink('https://www.instagram.com/_akhiles___h__')}
                >
                  <Icon name="instagram" size={18} color="#FFFFFF" />
                  <Text style={styles.socialBtnText}>Instagram</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.socialBtn, { backgroundColor: '#0A66C2' }]}
                  onPress={() => handleOpenSocialLink('https://www.linkedin.com/in/akhilesh4753')}
                >
                  <Icon name="linkedin" size={18} color="#FFFFFF" />
                  <Text style={styles.socialBtnText}>LinkedIn</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.socialBtn, { backgroundColor: '#24292E' }]}
                  onPress={() => handleOpenSocialLink('https://github.com/Akhilesh-4753')}
                >
                  <Icon name="github" size={18} color="#FFFFFF" />
                  <Text style={styles.socialBtnText}>GitHub</Text>
                </TouchableOpacity>
              </View>

              {/* Minimalist Professional Footer (3 Lines) */}
              <View style={styles.minimalFooterContainer}>
                <Text style={[styles.footerVersionText, { color: theme.colors.textMuted }]}>
                  Version 1.0.0
                </Text>
                <Text style={[styles.footerCreditText, { color: theme.colors.textSecondary }]}>
                  Built with ❤️ by <Text style={{ fontWeight: '700', color: theme.colors.primary }}>Akhilesh</Text>
                </Text>
                <Text style={[styles.footerCopyrightText, { color: theme.colors.textMuted }]}>
                  © 2026 Daybook. All Rights Reserved.
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.closeModalBtn, { backgroundColor: theme.colors.primary, marginTop: 14 }]}
              onPress={() => setIsAboutUsModalVisible(false)}
            >
              <Text style={styles.closeModalBtnText}>Close Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit User Profile Modal */}
      <Modal
        visible={isEditProfileVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsEditProfileVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                Edit User Profile
              </Text>
              <Text style={[styles.modalSub, { color: theme.colors.textSecondary }]}>
                Update photo and display name
              </Text>
            </View>

            {/* Avatar Edit Section */}
            <View style={styles.avatarEditContainer}>
              <TouchableOpacity
                style={styles.avatarEditWrapper}
                onPress={() => setIsImageOptionsVisible(true)}
                activeOpacity={0.8}
              >
                {editPhotoUri ? (
                  <Image source={{ uri: editPhotoUri }} style={styles.editAvatarImg} resizeMode="cover" />
                ) : (
                  <View style={[styles.editAvatarBg, { backgroundColor: theme.colors.primary }]}>
                    <Text style={styles.editAvatarText}>
                      {editName ? editName.charAt(0).toUpperCase() : 'A'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <Text style={[styles.tapToChangeText, { color: theme.colors.primary }]}>
                Tap photo to change or remove
              </Text>
            </View>

            {/* Editable Name Field */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
                User Display Name
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    color: theme.colors.textPrimary,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder="Enter your name"
                placeholderTextColor={theme.colors.textMuted}
                value={editName}
                onChangeText={setEditName}
              />
            </View>

            {/* Default Subscription Field */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
                Membership Tier
              </Text>
              <View
                style={[
                  styles.subscriptionDisplayBox,
                  { backgroundColor: 'rgba(99, 102, 241, 0.12)', borderColor: theme.colors.border },
                ]}
              >
                <Text style={[styles.subscriptionDisplayText, { color: theme.colors.primary }]}>
                  ⭐ Premium Member
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: theme.colors.border }]}
                onPress={() => setIsEditProfileVisible(false)}
              >
                <Text style={[styles.cancelBtnText, { color: theme.colors.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.savePinBtn,
                  {
                    backgroundColor: hasProfileChanges
                      ? theme.colors.primary
                      : theme.colors.border,
                    opacity: hasProfileChanges ? 1 : 0.5,
                  },
                ]}
                disabled={!hasProfileChanges}
                onPress={handleSaveProfile}
                activeOpacity={hasProfileChanges ? 0.8 : 1}
              >
                <Text
                  style={[
                    styles.savePinBtnText,
                    { color: hasProfileChanges ? '#FFFFFF' : theme.colors.textMuted },
                  ]}
                >
                  Update Profile
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Stylish Profile Saved Success Modal Alert */}
      <Modal
        visible={isProfileSavedAlertVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsProfileSavedAlertVisible(false)}
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
              Profile Updated
            </Text>
            <Text style={[styles.stylishAlertMessage, { color: theme.colors.textSecondary }]}>
              Your profile details have been saved.
            </Text>

            <TouchableOpacity
              style={[styles.stylishAlertButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setIsProfileSavedAlertVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.stylishAlertButtonText}>Got It</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Security Saved Success Modal */}
      <Modal
        visible={isSecuritySavedAlertVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsSecuritySavedAlertVisible(false)}
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
              Security Updated
            </Text>
            <Text style={[styles.stylishAlertMessage, { color: theme.colors.textSecondary }]}>
              App Lock has been enabled successfully. Your app is now protected.
            </Text>

            <TouchableOpacity
              style={[styles.stylishAlertButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setIsSecuritySavedAlertVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.stylishAlertButtonText}>Got It</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Security Removed Success Modal */}
      <Modal
        visible={isSecurityRemovedAlertVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsSecurityRemovedAlertVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.stylishAlertContainer,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <View style={[styles.successIconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
              <Icon name="lock" size={30} color={theme.colors.danger || '#EF4444'} />
            </View>

            <Text style={[styles.stylishAlertTitle, { color: theme.colors.textPrimary }]}>
              Lock Removed
            </Text>
            <Text style={[styles.stylishAlertMessage, { color: theme.colors.textSecondary }]}>
              App Lock and biometric protection have been disabled.
            </Text>

            <TouchableOpacity
              style={[styles.stylishAlertButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setIsSecurityRemovedAlertVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.stylishAlertButtonText}>Got It</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Custom Logout Confirmation Modal */}
      <Modal
        visible={isLogoutConfirmVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsLogoutConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.stylishAlertContainer,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <View style={[styles.successIconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <Icon name="trash" size={32} color={theme.colors.danger || '#EF4444'} />
            </View>

            <Text style={[styles.stylishAlertTitle, { color: theme.colors.textPrimary }]}>
              Log Out
            </Text>
            <Text style={[styles.stylishAlertMessage, { color: theme.colors.textSecondary, marginBottom: 24 }]}>
              Are you sure you want to log out?
            </Text>

            <View style={[styles.modalBtnRow, { width: '100%' }]}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: theme.colors.border, backgroundColor: theme.colors.cardSecondary }]}
                onPress={() => setIsLogoutConfirmVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelBtnText, { color: theme.colors.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.savePinBtn, { backgroundColor: theme.colors.danger || '#EF4444' }]}
                onPress={() => {
                  setIsLogoutConfirmVisible(false);
                  onLogout && onLogout();
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.savePinBtnText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Camera & Gallery Privacy Modal */}
      <Modal
        visible={isCameraPrivacyModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsCameraPrivacyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.aboutModalCard,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={[styles.modalHeaderIconBg, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                <Icon name="shield" size={28} color={theme.colors.primary} />
              </View>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                Camera & Gallery Privacy
              </Text>
              <Text style={[styles.modalSub, { color: theme.colors.textSecondary }]}>
                Your Privacy and Security are Our Highest Priorities
              </Text>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={true}>
              <View style={[styles.privacyBadgeBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: '#10B981' }]}>
                <Text style={styles.privacyBadgeTitle}>🔒 Camera & Gallery Privacy Guarantee</Text>
                <Text style={[styles.privacyBadgeDesc, { color: theme.colors.textPrimary }]}>
                  Daybook only accesses your camera or photo library when you explicitly choose to update your profile picture or attach an image.
                </Text>
              </View>

              <View style={styles.privacySection}>
                <Text style={[styles.privacyHeading, { color: theme.colors.textPrimary }]}>
                  1. Your Data Stays Under Your Control
                </Text>
                <Text style={[styles.privacyText, { color: theme.colors.textSecondary }]}>
                  Permission is always required. Daybook never accesses your camera or gallery without your explicit consent.
                </Text>
              </View>

              <View style={styles.privacySection}>
                <Text style={[styles.privacyHeading, { color: theme.colors.textPrimary }]}>
                  2. Only the Selected Image is Accessible
                </Text>
                <Text style={[styles.privacyText, { color: theme.colors.textSecondary }]}>
                  When you choose a photo, Android or iOS provides Daybook with only that specific image—not your entire photo library.
                </Text>
              </View>

              <View style={styles.privacySection}>
                <Text style={[styles.privacyHeading, { color: theme.colors.textPrimary }]}>
                  3. No Background Access
                </Text>
                <Text style={[styles.privacyText, { color: theme.colors.textSecondary }]}>
                  Daybook never runs your camera, gallery, or microphone in the background.
                </Text>
              </View>

              <View style={styles.privacySection}>
                <Text style={[styles.privacyHeading, { color: theme.colors.textPrimary }]}>
                  4. Secure Operating System Protection
                </Text>
                <Text style={[styles.privacyText, { color: theme.colors.textSecondary }]}>
                  Android and iOS isolate every app using system-level sandboxing, preventing Daybook from accessing other apps or your private files.
                </Text>
              </View>

              <View style={styles.privacySection}>
                <Text style={[styles.privacyHeading, { color: theme.colors.textPrimary }]}>
                  5. Your Journal Remains Private
                </Text>
                <Text style={[styles.privacyText, { color: theme.colors.textSecondary }]}>
                  Your personal notes, images, and app data are stored securely and are never accessed without your permission.
                </Text>
              </View>

              {/* FAQ Section */}
              <View style={[styles.faqCard, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border, marginTop: 14 }]}>
                <Text style={[styles.optionTitle, { color: theme.colors.textPrimary, fontSize: 15, marginBottom: 8 }]}>
                  ❓ Can Someone Hack My Camera or Gallery Through Daybook?
                </Text>
                <Text style={[styles.storyParagraph, { color: theme.colors.textSecondary, lineHeight: 21 }]}>
                  <Text style={{ fontWeight: '800', color: theme.colors.primary }}>No.</Text> Granting camera or gallery permission does not allow anyone to remotely control your device. Daybook only uses the official Android and iOS system APIs, and access is limited to the actions you initiate.
                </Text>
                <Text style={[styles.storyParagraph, { color: theme.colors.textMuted, marginTop: 8, fontSize: 12 }]}>
                  Your privacy is protected by both Daybook's security practices and the built-in security architecture of Android and iOS.
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.closeModalBtn, { backgroundColor: theme.colors.primary, marginTop: 14 }]}
              onPress={() => setIsCameraPrivacyModalVisible(false)}
            >
              <Text style={styles.closeModalBtnText}>Got It</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


      {/* Image Source Selection Modal */}
      <Modal
        visible={isImageOptionsVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsImageOptionsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary, marginBottom: 16 }]}>
              Profile Photo Options
            </Text>

            <TouchableOpacity
              style={[styles.optionCard, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}
              onPress={handleTakePhoto}
            >
              <Text style={styles.optionEmoji}>📷</Text>
              <View style={styles.optionTextCol}>
                <Text style={[styles.optionTitle, { color: theme.colors.textPrimary }]}>
                  Open Camera
                </Text>
                <Text style={[styles.optionSub, { color: theme.colors.textMuted }]}>
                  Take a new profile picture
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionCard, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}
              onPress={handleChooseFromGallery}
            >
              <Text style={styles.optionEmoji}>🖼️</Text>
              <View style={styles.optionTextCol}>
                <Text style={[styles.optionTitle, { color: theme.colors.textPrimary }]}>
                  Choose from Gallery
                </Text>
                <Text style={[styles.optionSub, { color: theme.colors.textMuted }]}>
                  Select photo from your device
                </Text>
              </View>
            </TouchableOpacity>

            {editPhotoUri ? (
              <TouchableOpacity
                style={[styles.optionCard, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }]}
                onPress={handleRemovePhoto}
              >
                <Text style={styles.optionEmoji}>🗑️</Text>
                <View style={styles.optionTextCol}>
                  <Text style={[styles.optionTitle, { color: theme.colors.danger || '#EF4444' }]}>
                    Remove Image
                  </Text>
                  <Text style={[styles.optionSub, { color: theme.colors.textMuted }]}>
                    Delete current profile photo
                  </Text>
                </View>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[styles.cancelBtnFull, { borderColor: theme.colors.border, marginTop: 10 }]}
              onPress={() => setIsImageOptionsVisible(false)}
            >
              <Text style={[styles.cancelBtnText, { color: theme.colors.textSecondary }]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Multi-Step App Lock & Security Modal */}
      <Modal
        visible={isSecurityModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsSecurityModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={[styles.lockIconCircle, { backgroundColor: theme.colors.primary }]}>
                <Icon name="lock" size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                App Lock & Security
              </Text>
            </View>

            {pinError ? <Text style={styles.modalError}>{pinError}</Text> : null}

            {/* STEP 1 (Existing User): Verify Current Password */}
            {modalStep === 'verify_current' && (
              <View>
                <Text style={[styles.modalSub, { color: theme.colors.textSecondary }]}>
                  Enter your current 4-digit security PIN to unlock security settings:
                </Text>

                <View style={styles.fieldGroup}>
                  <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
                    Current 4-Digit PIN
                  </Text>
                  <TextInput
                    style={[
                      styles.pinInput,
                      {
                        backgroundColor: theme.colors.surfaceVariant,
                        color: theme.colors.textPrimary,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    placeholder="Enter current PIN"
                    placeholderTextColor={theme.colors.textMuted}
                    keyboardType="number-pad"
                    maxLength={4}
                    secureTextEntry={true}
                    value={currentPin}
                    onChangeText={setCurrentPin}
                  />
                </View>

                <View style={styles.modalBtnRow}>
                  <TouchableOpacity
                    style={[styles.cancelBtn, { borderColor: theme.colors.border }]}
                    onPress={() => setIsSecurityModalVisible(false)}
                  >
                    <Text style={[styles.cancelBtnText, { color: theme.colors.textSecondary }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.savePinBtn, { backgroundColor: theme.colors.primary }]}
                    onPress={handleVerifyCurrentPin}
                  >
                    <Text style={styles.savePinBtnText}>Verify Password</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* STEP 2 (Existing User Verified): Manage Security Choices */}
            {modalStep === 'manage_security' && (
              <View>
                <Text style={[styles.modalSub, { color: theme.colors.textSecondary }]}>
                  Current password verified! Choose an action below:
                </Text>

                <TouchableOpacity
                  style={[styles.optionCard, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}
                  onPress={() => setModalStep('select_type')}
                >
                  <Text style={styles.optionEmoji}>🔑</Text>
                  <View style={styles.optionTextCol}>
                    <Text style={[styles.optionTitle, { color: theme.colors.textPrimary }]}>
                      Change Security PIN / Lock Method
                    </Text>
                    <Text style={[styles.optionSub, { color: theme.colors.textMuted }]}>
                      Set a new 4-digit PIN or biometrics
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionCard, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }]}
                  onPress={handleDisableSecurity}
                >
                  <Text style={styles.optionEmoji}>🔓</Text>
                  <View style={styles.optionTextCol}>
                    <Text style={[styles.optionTitle, { color: theme.colors.danger || '#EF4444' }]}>
                      Turn Off App Lock
                    </Text>
                    <Text style={[styles.optionSub, { color: theme.colors.textMuted }]}>
                      Remove PIN and Biometric security
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.cancelBtnFull, { borderColor: theme.colors.border }]}
                  onPress={() => setIsSecurityModalVisible(false)}
                >
                  <Text style={[styles.cancelBtnText, { color: theme.colors.textSecondary }]}>
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 1 (New User): Select Lock Type */}
            {modalStep === 'select_type' && (
              <View>
                <Text style={[styles.modalSub, { color: theme.colors.textSecondary }]}>
                  Choose your preferred security lock method:
                </Text>

                {[
                  { id: 'pin', title: 'PIN Lock (4-Digit PIN)', sub: 'Secure with a 4-digit numeric passcode', icon: '🔢' },
                  { id: 'biometric', title: 'Fingerprint / Face ID', sub: 'Unlock with device biometrics & PIN backup', icon: '👆' },
                  { id: 'pattern', title: 'Pattern / Passcode Lock', sub: 'Set up pattern passcode security', icon: '🔒' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.optionCard,
                      {
                        backgroundColor: selectedLockType === item.id ? 'rgba(99, 102, 241, 0.12)' : theme.colors.surfaceVariant,
                        borderColor: selectedLockType === item.id ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                    onPress={() => setSelectedLockType(item.id)}
                  >
                    <Text style={styles.optionEmoji}>{item.icon}</Text>
                    <View style={styles.optionTextCol}>
                      <Text style={[styles.optionTitle, { color: theme.colors.textPrimary }]}>
                        {item.title}
                      </Text>
                      <Text style={[styles.optionSub, { color: theme.colors.textMuted }]}>
                        {item.sub}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}

                <View style={styles.modalBtnRow}>
                  <TouchableOpacity
                    style={[styles.cancelBtn, { borderColor: theme.colors.border }]}
                    onPress={() => setIsSecurityModalVisible(false)}
                  >
                    <Text style={[styles.cancelBtnText, { color: theme.colors.textSecondary }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.savePinBtn, { backgroundColor: theme.colors.primary }]}
                    onPress={() => setModalStep('enter_pin')}
                  >
                    <Text style={styles.savePinBtnText}>Next Step →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* STEP 2: Enter & Confirm New PIN */}
            {modalStep === 'enter_pin' && (
              <View>
                <Text style={[styles.modalSub, { color: theme.colors.textSecondary }]}>
                  Enter a 4-digit security PIN:
                </Text>

                <View style={styles.fieldGroup}>
                  <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
                    New 4-Digit PIN
                  </Text>
                  <TextInput
                    style={[
                      styles.pinInput,
                      {
                        backgroundColor: theme.colors.surfaceVariant,
                        color: theme.colors.textPrimary,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    placeholder="e.g. 1234"
                    placeholderTextColor={theme.colors.textMuted}
                    keyboardType="number-pad"
                    maxLength={4}
                    secureTextEntry={true}
                    value={newPin}
                    onChangeText={setNewPin}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
                    Confirm PIN
                  </Text>
                  <TextInput
                    style={[
                      styles.pinInput,
                      {
                        backgroundColor: theme.colors.surfaceVariant,
                        color: theme.colors.textPrimary,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    placeholder="Re-enter PIN"
                    placeholderTextColor={theme.colors.textMuted}
                    keyboardType="number-pad"
                    maxLength={4}
                    secureTextEntry={true}
                    value={confirmPin}
                    onChangeText={setConfirmPin}
                  />
                </View>

                <View style={styles.modalBtnRow}>
                  <TouchableOpacity
                    style={[styles.cancelBtn, { borderColor: theme.colors.border }]}
                    onPress={() => setModalStep('select_type')}
                  >
                    <Text style={[styles.cancelBtnText, { color: theme.colors.textSecondary }]}>
                      Back
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.savePinBtn, { backgroundColor: theme.colors.primary }]}
                    onPress={handleSaveNewPin}
                  >
                    <Text style={styles.savePinBtnText}>Save Security PIN</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  scroll: {
    flex: 1,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  avatarWrapper: {
    marginRight: 16,
  },
  avatarImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
  },
  profileEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  badgePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  itemBorder: {
    borderBottomWidth: 1,
  },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  menuSub: {
    fontSize: 12,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
  },
  aboutModalCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalHeaderIconBg: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 16,
  },
  privacyBadgeBox: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  privacyBadgeTitle: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  privacyBadgeDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  privacySection: {
    marginBottom: 14,
  },
  privacyHeading: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  privacyText: {
    fontSize: 12,
    lineHeight: 17,
  },
  builderHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  builderAvatarBorder: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    padding: 0,
    marginBottom: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#F3F4F6',
  },
  builderImg: {
    width: 104,
    height: 155,
    marginTop: 0,
  },
  builderName: {
    fontSize: 22,
    fontWeight: '800',
  },
  builderTitlePill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    overflow: 'hidden',
  },
  builderDegree: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  storyCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  storySectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  storyParagraph: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  quoteCard: {
    padding: 12,
    borderRadius: 14,
    borderLeftWidth: 3.5,
    marginTop: 6,
    marginBottom: 16,
  },
  quoteHeader: {
    fontSize: 12,
    fontWeight: '700',
  },
  quoteText: {
    fontSize: 12,
    lineHeight: 18,
  },
  minimalFooterContainer: {
    marginTop: 24,
    marginBottom: 10,
    alignItems: 'center',
    gap: 3,
  },
  footerVersionText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  footerCreditText: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  footerCopyrightText: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.7,
  },
  uniqueBox: {
    marginBottom: 16,
  },
  uniqueTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletEmoji: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 1,
  },
  bulletText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 17,
  },
  socialSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  socialBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  closeModalBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeModalBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  avatarEditContainer: {
    alignItems: 'center',
    marginVertical: 14,
  },
  avatarEditWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  editAvatarImg: {
    width: '100%',
    height: '100%',
  },
  editAvatarBg: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  tapToChangeText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  textInput: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
    outlineStyle: 'none',
  },
  subscriptionDisplayBox: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  subscriptionDisplayText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  savePinBtn: {
    flex: 1.5,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savePinBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  faqCard: {
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
  },
  closeFaqBtn: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    elevation: 2,
    shadowColor: 'rgba(99, 102, 241, 0.3)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  closeFaqBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  optionEmoji: {
    fontSize: 22,
    marginRight: 12,
  },
  optionTextCol: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  optionSub: {
    fontSize: 11,
    marginTop: 2,
  },
  cancelBtnFull: {
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  lockIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  modalError: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  pinInput: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 8,
    outlineStyle: 'none',
  },
  stylishAlertContainer: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
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

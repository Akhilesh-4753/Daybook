import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useSecurity } from '../context/SecurityContext';
import { useTasks } from '../context/TaskContext';
import { Icon } from '../components/Icons';
import { BackupService } from '../services/BackupService';

export const MoreScreen = ({ user, onNavigateTab, onLogout, onGoBack }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { isPinSet, isBiometricsEnabled, setupPin, removeSecurity } = useSecurity();
  const { refreshData } = useTasks();

  // Cross-Platform PIN Setup / Change Modal State
  const [isPinModalVisible, setIsPinModalVisible] = useState(false);
  const [isChangeMode, setIsChangeMode] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [enableBio, setEnableBio] = useState(true);
  const [pinError, setPinError] = useState('');

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

  const handleOpenSetupPin = () => {
    setIsChangeMode(false);
    setNewPin('');
    setConfirmPin('');
    setPinError('');
    setIsPinModalVisible(true);
  };

  const handleOpenChangePin = () => {
    setIsChangeMode(true);
    setNewPin('');
    setConfirmPin('');
    setPinError('');
    setIsPinModalVisible(true);
  };

  const handleToggleSecurity = () => {
    if (isPinSet) {
      Alert.alert('Disable App Lock', 'Are you sure you want to remove PIN & Biometric security?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove Security', style: 'destructive', onPress: removeSecurity },
      ]);
    } else {
      handleOpenSetupPin();
    }
  };

  const handleSavePin = async () => {
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
      await setupPin(newPin, enableBio);
      setIsPinModalVisible(false);
      Alert.alert(
        isChangeMode ? 'PIN Updated' : 'Security Activated',
        isChangeMode
          ? 'Your 4-digit security PIN has been updated successfully.'
          : 'App Lock activated with 4-digit PIN & Biometrics.'
      );
    } catch (e) {
      setPinError('Failed to save security PIN.');
    }
  };

  const menuSections = [
    {
      title: 'Preferences & Security',
      items: [
        {
          id: 'theme',
          title: 'Dark / Night Mode',
          subtitle: isDarkMode ? 'Currently Enabled (Dark)' : 'Currently Enabled (Light)',
          icon: 'palette',
          isSwitch: true,
          value: isDarkMode,
          onToggle: toggleTheme,
        },
        {
          id: 'security',
          title: 'App Lock & Biometrics',
          subtitle: isPinSet ? '🔒 Security Active (Tap to remove security)' : '🔓 Off (Tap to setup 4-digit PIN)',
          icon: 'lock',
          onPress: handleToggleSecurity,
        },
        ...(isPinSet
          ? [
              {
                id: 'change_pin',
                title: 'Change Security PIN',
                subtitle: 'Update your 4-digit security PIN & biometrics',
                icon: 'edit',
                onPress: handleOpenChangePin,
              },
            ]
          : []),
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
          subtitle: 'Save daybook_backup.json locally',
          icon: 'cloud',
          onPress: handleExportBackup,
        },
        {
          id: 'import_backup',
          title: 'Restore Data from Backup',
          subtitle: 'Import offline daybook_backup.json',
          icon: 'sparkles',
          onPress: handleImportBackup,
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
          onPress: onLogout,
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
        {/* User Profile Card */}
        <View
          style={[
            styles.profileCard,
            { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
          ]}
        >
          <View
            style={[
              styles.avatarBg,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Text style={styles.avatarText}>
              {user?.name ? user.name.charAt(0) : 'A'}
            </Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.colors.textPrimary }]}>
              {user?.name || 'Akhilesh'}
            </Text>
            <Text style={[styles.profileEmail, { color: theme.colors.textMuted }]}>
              {user?.email || 'akhilesh@daybook.app'}
            </Text>
            <View style={[styles.badgePill, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
              <Text style={[styles.badgeText, { color: theme.colors.primary }]}>
                ⭐ Pro Member • SQLite Offline Mode Active
              </Text>
            </View>
          </View>
        </View>

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
                  ]}
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

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Setup / Change PIN Modal */}
      <Modal visible={isPinModalVisible} transparent={true} animationType="fade" onRequestClose={() => setIsPinModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.modalHeader}>
              <View style={[styles.lockIconCircle, { backgroundColor: theme.colors.primary }]}>
                <Icon name="lock" size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                {isChangeMode ? 'Change 4-Digit PIN' : 'Setup 4-Digit PIN'}
              </Text>
              <Text style={[styles.modalSub, { color: theme.colors.textSecondary }]}>
                {isChangeMode ? 'Enter a new 4-digit security PIN below' : 'Secure your diary and application data'}
              </Text>
            </View>

            {pinError ? <Text style={styles.modalError}>{pinError}</Text> : null}

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
                {isChangeMode ? 'New 4-Digit PIN' : '4-Digit PIN'}
              </Text>
              <TextInput
                style={[styles.pinInput, { backgroundColor: theme.colors.surfaceVariant, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
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
              <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>Confirm PIN</Text>
              <TextInput
                style={[styles.pinInput, { backgroundColor: theme.colors.surfaceVariant, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                placeholder="Re-enter 4-digit PIN"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry={true}
                value={confirmPin}
                onChangeText={setConfirmPin}
              />
            </View>

            <View style={styles.bioSwitchRow}>
              <Text style={[styles.bioSwitchText, { color: theme.colors.textPrimary }]}>
                Enable Fingerprint / Face ID
              </Text>
              <Switch
                value={enableBio}
                onValueChange={setEnableBio}
                trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
                thumbColor={enableBio ? theme.colors.primary : '#F4F3F4'}
              />
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: theme.colors.border }]}
                onPress={() => setIsPinModalVisible(false)}
              >
                <Text style={[styles.cancelBtnText, { color: theme.colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.savePinBtn, { backgroundColor: theme.colors.primary }]}
                onPress={handleSavePin}
              >
                <Text style={styles.savePinBtnText}>
                  {isChangeMode ? 'Update PIN' : 'Save Security PIN'}
                </Text>
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
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    marginVertical: 12,
  },
  avatarBg: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
  },
  profileEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  badgePill: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    borderRadius: 20,
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
    width: 40,
    height: 40,
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
    fontWeight: '700',
  },
  menuSub: {
    fontSize: 12,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  lockIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  modalError: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 14,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  pinInput: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    letterSpacing: 2,
  },
  bioSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 14,
  },
  bioSwitchText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
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
});

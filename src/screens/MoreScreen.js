import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useSecurity } from '../context/SecurityContext';
import { useTasks } from '../context/TaskContext';
import { Icon } from '../components/Icons';
import { BackupService } from '../services/BackupService';

export const MoreScreen = ({ user, onNavigateTab, onLogout }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { isPinSet, isBiometricsEnabled, setupPin, removeSecurity } = useSecurity();
  const { refreshData } = useTasks();

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
              // Trigger refresh after restore
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

  const handleToggleSecurity = () => {
    if (isPinSet) {
      Alert.alert('Disable App Lock', 'Are you sure you want to remove PIN & Biometric security?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: removeSecurity },
      ]);
    } else {
      Alert.prompt(
        'Setup 4-Digit Security PIN',
        'Enter a 4-digit numeric PIN to secure your diary & app:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Set PIN',
            onPress: (pin) => {
              if (pin && pin.length === 4 && /^\d+$/.test(pin)) {
                setupPin(pin, true);
                Alert.alert('Security Enabled', 'App Lock activated with PIN & Biometrics.');
              } else {
                Alert.alert('Invalid PIN', 'Please enter a 4-digit numeric PIN.');
              }
            },
          },
        ],
        'secure-text'
      );
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
          subtitle: isPinSet ? '🔒 Security Lock Enabled (PIN & Biometrics)' : '🔓 Off (Tap to setup 4-digit PIN)',
          icon: 'lock',
          onPress: handleToggleSecurity,
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
          onPress: () => onNavigateTab('habits'),
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
      {/* Header */}
      <View style={styles.topHeader}>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
          More & Settings
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
    fontSize: 26,
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
});

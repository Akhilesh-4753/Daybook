import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Icon } from './Icons';

export const Header = ({ userName = 'Akhilesh', notificationCount = 1, onNotificationPress }) => {
  const { theme } = useTheme();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning,';
    if (hour < 18) return 'Good Afternoon,';
    return 'Good Evening,';
  };

  const getFormattedDate = () => {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
          {getGreeting()}
        </Text>
        <View style={styles.nameRow}>
          <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>
            {userName}
          </Text>
          <Text style={styles.waveEmoji}>👋</Text>
        </View>
        <Text style={[styles.dateText, { color: theme.colors.textMuted }]}>
          {getFormattedDate()}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.bellButton,
          {
            backgroundColor: theme.colors.cardSecondary,
            borderColor: theme.colors.border,
          },
        ]}
        onPress={onNotificationPress}
        activeOpacity={0.7}
      >
        <Icon name="bell" size={20} color={theme.colors.primary} />
        {notificationCount > 0 && (
          <View style={[styles.badge, { backgroundColor: theme.colors.danger }]}>
            <Text style={styles.badgeText}>{notificationCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  waveEmoji: {
    fontSize: 22,
    marginLeft: 6,
  },
  dateText: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '400',
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});

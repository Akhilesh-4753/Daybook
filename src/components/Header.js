import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export const Header = ({ userName = 'Akhilesh' }) => {
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
});

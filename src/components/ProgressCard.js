import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Icon } from './Icons';

export const ProgressCard = ({ total = 10, completed = 8, onPress }) => {
  const { theme } = useTheme();
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadow,
        },
      ]}
    >
      <View style={styles.leftSection}>
        <Text style={[styles.title, { color: theme.colors.textSecondary }]}>
          Today's Progress
        </Text>
        <View style={styles.percentRow}>
          <Text style={[styles.percentage, { color: theme.colors.textPrimary }]}>
            {percentage}%
          </Text>
          <View style={[styles.badge, { backgroundColor: theme.colors.statusBadgeLowBg }]}>
            <Text style={[styles.badgeText, { color: theme.colors.statusBadgeLowText }]}>
              {completed}/{total} Completed
            </Text>
          </View>
        </View>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          {percentage >= 80 ? '🔥 Great momentum! Keep it up.' : '⚡ Keep checking off tasks!'}
        </Text>

        {/* Progress Bar */}
        <View style={[styles.progressBarBg, { backgroundColor: theme.colors.progressBg }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${percentage}%`,
                backgroundColor: theme.colors.primary,
              },
            ]}
          />
        </View>
      </View>

      {/* Ring Visual Indicator */}
      <View style={[styles.ringContainer, { borderColor: theme.colors.primaryLight }]}>
        <View style={[styles.innerRing, { backgroundColor: theme.colors.cardSecondary }]}>
          <Text style={[styles.ringText, { color: theme.colors.primary }]}>
            {percentage}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  leftSection: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  percentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  percentage: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  badge: {
    marginLeft: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  ringContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringText: {
    fontSize: 14,
    fontWeight: '800',
  },
});

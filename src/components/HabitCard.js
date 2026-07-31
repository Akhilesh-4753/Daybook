import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Icon } from './Icons';

export const HabitCard = ({ habit, onToggleComplete, onToggleAutoAdd }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.leftGroup}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          >
            <Icon name={habit.icon || 'star'} size={22} color={theme.colors.primary} />
          </View>
          <View>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
              {habit.title}
            </Text>
            <Text style={[styles.frequency, { color: theme.colors.textSecondary }]}>
              {habit.frequency}
            </Text>
          </View>
        </View>

        <View style={styles.rightGroup}>
          <Text style={[styles.progressPercent, { color: theme.colors.primary }]}>
            {habit.progress}%
          </Text>
          <TouchableOpacity
            style={[
              styles.checkButton,
              {
                backgroundColor: habit.completedToday
                  ? theme.colors.success
                  : theme.colors.cardSecondary,
                borderColor: habit.completedToday
                  ? theme.colors.success
                  : theme.colors.border,
              },
            ]}
            onPress={() => onToggleComplete(habit.id)}
            activeOpacity={0.7}
          >
            <Icon
              name="check"
              size={16}
              color={habit.completedToday ? '#FFFFFF' : theme.colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBg, { backgroundColor: theme.colors.progressBg }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${habit.progress}%`,
              backgroundColor:
                habit.progress >= 80
                  ? theme.colors.success
                  : habit.progress >= 50
                  ? theme.colors.primary
                  : theme.colors.warning,
            },
          ]}
        />
      </View>

      {/* Footer info: Streak & Auto-Add to Today */}
      <View style={styles.footerRow}>
        <View style={styles.streakBadge}>
          <Icon name="fire" size={14} color="#F59E0B" />
          <Text style={styles.streakText}>{habit.streak} Day Streak</Text>
        </View>

        <View style={styles.autoAddContainer}>
          <Text style={[styles.autoAddText, { color: theme.colors.textMuted }]}>
            Auto-Add Today
          </Text>
          <Switch
            value={habit.autoAddToday}
            onValueChange={() => onToggleAutoAdd(habit.id)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
            thumbColor={habit.autoAddToday ? theme.colors.primary : '#F4F3F4'}
            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14,
    marginHorizontal: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  frequency: {
    fontSize: 12,
    marginTop: 2,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '800',
    marginRight: 12,
  },
  checkButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
    marginLeft: 4,
  },
  autoAddContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  autoAddText: {
    fontSize: 11,
    marginRight: 4,
  },
});

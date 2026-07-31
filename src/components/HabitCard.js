import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Icon } from './Icons';

export const HabitCard = ({ habit, onToggleAutoAdd, onEdit, onDelete }) => {
  const { theme } = useTheme();

  const handleDeletePress = () => {
    const message = `Are you sure you want to delete "${habit.title}"?`;
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(message)) {
        onDelete && onDelete(habit.id);
      }
    } else {
      Alert.alert(
        'Delete Habit',
        message,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => onDelete && onDelete(habit.id),
          },
        ]
      );
    }
  };

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
            <Icon name={habit.icon || 'sparkles'} size={22} color={theme.colors.primary} />
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
          {/* Edit & Delete Action Buttons (Checkmark button removed) */}
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={() => onEdit && onEdit(habit)}
            activeOpacity={0.7}
          >
            <Icon name="edit" size={16} color={theme.colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}
            onPress={handleDeletePress}
            activeOpacity={0.7}
          >
            <Icon name="trash" size={16} color={theme.colors.danger} />
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

      {/* Footer info: Streak & Auto-Add To Task */}
      <View style={styles.footerRow}>
        <View style={styles.streakBadge}>
          <Icon name="fire" size={14} color="#F59E0B" />
          <Text style={styles.streakText}>{habit.streak} Day Streak</Text>
        </View>

        <View style={styles.autoAddContainer}>
          <Text style={[styles.autoAddText, { color: theme.colors.textMuted }]}>
            Auto-Add To Task
          </Text>
          <Switch
            value={habit.autoAddToday}
            onValueChange={() => onToggleAutoAdd && onToggleAutoAdd(habit.id)}
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
    flex: 1,
    marginRight: 8,
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
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
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
    paddingHorizontal: 10,
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
    fontWeight: '600',
    marginRight: 4,
  },
});

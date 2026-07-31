import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Icon } from './Icons';

export const TaskCard = ({ task, isSelected, onToggleCheckbox, onPressTask, onDeleteTask }) => {
  const { theme } = useTheme();

  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = !task.completed && task.date && task.date < todayStr;

  const getFormattedCreatedDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      }
    } catch (e) {}
    return dateStr;
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
      case 'Critical':
        return {
          bg: theme.colors.statusBadgeHighBg,
          text: theme.colors.statusBadgeHighText,
          dotColor: '#EF4444',
        };
      case 'Medium':
        return {
          bg: theme.colors.statusBadgeMediumBg,
          text: theme.colors.statusBadgeMediumText,
          dotColor: '#F59E0B',
        };
      default:
        return {
          bg: theme.colors.statusBadgeLowBg,
          text: theme.colors.statusBadgeLowText,
          dotColor: '#10B981',
        };
    }
  };

  const badgeStyle = getPriorityBadge(task.priority);
  const hasIcon = task.icon && task.icon !== 'none';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isOverdue
            ? 'rgba(239, 68, 68, 0.05)'
            : theme.colors.card,
          borderColor: isSelected
            ? theme.colors.primary
            : isOverdue
            ? '#EF4444'
            : theme.colors.border,
        },
        task.completed && styles.completedCard,
        isSelected && { borderWidth: 2, backgroundColor: theme.colors.surfaceVariant },
        isOverdue && !isSelected && { borderWidth: 1.5 },
      ]}
    >
      {/* Checkbox */}
      <TouchableOpacity
        style={[
          styles.checkbox,
          {
            borderColor: task.completed
              ? theme.colors.success
              : isSelected
              ? theme.colors.primary
              : isOverdue
              ? '#EF4444'
              : theme.colors.textMuted,
            backgroundColor: task.completed
              ? theme.colors.success
              : isSelected
              ? theme.colors.primary
              : 'transparent',
          },
        ]}
        onPress={() => onToggleCheckbox(task.id)}
        activeOpacity={0.7}
      >
        {(task.completed || isSelected) && (
          <Icon name="check" size={14} color="#FFFFFF" />
        )}
      </TouchableOpacity>

      {/* Task Details */}
      <TouchableOpacity
        style={styles.contentSection}
        onPress={() => onPressTask && onPressTask(task)}
        activeOpacity={0.8}
      >
        <View style={styles.titleRow}>
          <View style={styles.iconTitleGroup}>
            {hasIcon ? (
              <View style={[styles.taskIconCircle, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Icon name={task.icon} size={16} color={theme.colors.primary} />
              </View>
            ) : null}
            <Text
              style={[
                styles.title,
                { color: theme.colors.textPrimary },
                task.completed && [styles.completedText, { color: theme.colors.textMuted }],
              ]}
            >
              {task.title}
            </Text>
          </View>

          {/* Priority Badge */}
          <View style={[styles.priorityBadge, { backgroundColor: badgeStyle.bg }]}>
            <View style={[styles.priorityDot, { backgroundColor: badgeStyle.dotColor }]} />
            <Text style={[styles.priorityText, { color: badgeStyle.text }]}>
              {task.priority || 'Normal'}
            </Text>
          </View>
        </View>

        {/* Subtitle / Meta row */}
        <View style={styles.metaRow}>
          {/* Overdue Badge */}
          {isOverdue && (
            <View style={styles.overdueBadge}>
              <Text style={styles.overdueText}>
                ⚠️ Overdue ({getFormattedCreatedDate(task.date)})
              </Text>
            </View>
          )}

          {task.time ? (
            <View style={styles.metaItem}>
              <Icon name="clock" size={12} color={theme.colors.textMuted} />
              <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                {task.time}
              </Text>
            </View>
          ) : null}

          {task.category ? (
            <View
              style={[
                styles.categoryTag,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <Text style={[styles.categoryText, { color: theme.colors.primary }]}>
                {task.category}
              </Text>
            </View>
          ) : null}
        </View>

        {task.notes ? (
          <Text
            numberOfLines={1}
            style={[styles.notesSnippet, { color: theme.colors.textMuted }]}
          >
            {task.notes}
          </Text>
        ) : null}
      </TouchableOpacity>

      {onDeleteTask && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDeleteTask(task)}
        >
          <Icon name="trash" size={16} color={theme.colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    marginHorizontal: 20,
  },
  completedCard: {
    opacity: 0.7,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  contentSection: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  taskIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 8,
  },
  overdueBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  overdueText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  notesSnippet: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: 6,
    marginLeft: 6,
  },
});

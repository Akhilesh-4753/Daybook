import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { ProgressCard } from '../components/ProgressCard';
import { TaskCard } from '../components/TaskCard';
import { Icon } from '../components/Icons';

export const TodayScreen = ({
  tasks,
  user,
  reminders,
  selectedTaskIds = [],
  onToggleSelectTask,
  onMarkSelectedCompleted,
  onAddTask,
  onOpenMore,
  onDeleteTask,
}) => {
  const { theme } = useTheme();
  const [showCompleted, setShowCompleted] = useState(false);

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const upcomingReminders = reminders.slice(0, 2);

  const selectedCount = selectedTaskIds.length;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header userName={user?.name || 'Akhilesh'} notificationCount={1} onNotificationPress={onOpenMore} />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Progress Card */}
        <ProgressCard
          total={tasks.length}
          completed={completedTasks.length}
          onPress={() => setShowCompleted(!showCompleted)}
        />

        {/* Section Header: Today's Tasks */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Today's Tasks
          </Text>
          <TouchableOpacity onPress={onAddTask}>
            <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>
              + Add Task
            </Text>
          </TouchableOpacity>
        </View>

        {/* Common Mark Completed Button */}
        {activeTasks.length > 0 && (
          <TouchableOpacity
            style={[
              styles.markCompleteButton,
              {
                backgroundColor: selectedCount > 0 ? theme.colors.success || '#10B981' : theme.colors.surfaceVariant,
                borderColor: selectedCount > 0 ? theme.colors.success || '#10B981' : theme.colors.border,
              },
            ]}
            onPress={onMarkSelectedCompleted}
            activeOpacity={0.85}
          >
            <Icon name="check" size={18} color={selectedCount > 0 ? '#FFFFFF' : theme.colors.textMuted} />
            <Text
              style={[
                styles.markCompleteText,
                { color: selectedCount > 0 ? '#FFFFFF' : theme.colors.textSecondary },
              ]}
            >
              {selectedCount > 0
                ? `Mark ${selectedCount} Selected Task${selectedCount > 1 ? 's' : ''} as Completed`
                : 'Mark Selected as Completed'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Active Tasks or Empty State */}
        {activeTasks.length === 0 ? (
          <View
            style={[
              styles.emptyStateCard,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <View style={[styles.illustrationBg, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Icon name="sparkles" size={48} color={theme.colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
              No tasks for today.
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textMuted }]}>
              Start planning your day and boost your productivity!
            </Text>
            <TouchableOpacity
              style={[styles.emptyAddBtn, { backgroundColor: theme.colors.primary }]}
              onPress={onAddTask}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyAddBtnText}>+ Add Task Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          activeTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isSelected={selectedTaskIds.includes(task.id)}
              onToggleCheckbox={onToggleSelectTask}
              onDeleteTask={onDeleteTask}
            />
          ))
        )}


        {/* Pending tasks highlight badge */}
        {activeTasks.length > 0 && (
          <View style={[styles.pendingAlert, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
            <Icon name="clock" size={16} color={theme.colors.danger} />
            <Text style={[styles.pendingText, { color: theme.colors.danger }]}>
              {activeTasks.length} Pending Tasks require your focus today
            </Text>
          </View>
        )}

        {/* Completed Tasks Accordion */}
        {completedTasks.length > 0 && (
          <View style={styles.completedSection}>
            <TouchableOpacity
              style={styles.completedHeader}
              onPress={() => setShowCompleted(!showCompleted)}
            >
              <Text style={[styles.completedTitle, { color: theme.colors.textSecondary }]}>
                Completed ({completedTasks.length})
              </Text>
              <Icon
                name={showCompleted ? 'chevronRight' : 'chevronRight'}
                size={16}
                color={theme.colors.textMuted}
              />
            </TouchableOpacity>

            {showCompleted &&
              completedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleCheckbox={onToggleCheckbox}
                  onDeleteTask={onDeleteTask}
                />
              ))}
          </View>
        )}

        {/* Upcoming Reminders Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Upcoming Reminders
          </Text>
        </View>

        {upcomingReminders.map((rem) => (
          <View
            key={rem.id}
            style={[
              styles.reminderCard,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <View style={styles.reminderRow}>
              <View
                style={[
                  styles.reminderIconBg,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              >
                <Icon name="bell" size={20} color={theme.colors.primary} />
              </View>

              <View style={styles.reminderContent}>
                <Text style={[styles.reminderTitle, { color: theme.colors.textPrimary }]}>
                  {rem.title}
                </Text>
                <Text style={[styles.reminderDate, { color: theme.colors.textMuted }]}>
                  {rem.date} • {rem.time}
                </Text>
                {rem.importance ? (
                  <Text
                    style={[styles.reminderNotes, { color: theme.colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {rem.importance}
                  </Text>
                ) : null}
              </View>
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
  scroll: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
  },
  markCompleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  markCompleteText: {
    fontSize: 14,
    fontWeight: '700',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyStateCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginVertical: 10,
  },
  illustrationBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyAddBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  pendingAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  pendingText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
  completedSection: {
    marginTop: 8,
  },
  completedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  completedTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  reminderCard: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  reminderDate: {
    fontSize: 12,
    marginTop: 2,
  },
  reminderNotes: {
    fontSize: 12,
    marginTop: 4,
  },
});

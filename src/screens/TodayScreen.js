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
import { useTasks } from '../context/TaskContext';
import { Header } from '../components/Header';
import { ProgressCard } from '../components/ProgressCard';
import { TaskCard } from '../components/TaskCard';
import { Icon } from '../components/Icons';
import { AddReminderModal } from '../components/AddReminderModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

export const TodayScreen = ({
  tasks = [],
  user,
  reminders = [],
  selectedTaskIds = [],
  onToggleSelectTask,
  onMarkSelectedCompleted,
  onAddTask,
  onOpenMore,
  onDeleteTask,
}) => {
  const { theme } = useTheme();
  const { updateReminder, deleteReminder } = useTasks();

  const [showCompleted, setShowCompleted] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [deletingReminder, setDeletingReminder] = useState(null);

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const upcomingReminders = reminders.slice(0, 4);

  const selectedCount = selectedTaskIds.length;

  const handleSaveEditedReminder = async (updated) => {
    await updateReminder(updated);
    setEditingReminder(null);
  };

  const handleConfirmDeleteReminder = async () => {
    if (deletingReminder) {
      await deleteReminder(deletingReminder.id, deletingReminder.notificationId);
      setDeletingReminder(null);
    }
  };

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
        {selectedCount > 0 && (
          <TouchableOpacity
            style={[
              styles.markCompleteButton,
              { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
            ]}
            onPress={onMarkSelectedCompleted}
            activeOpacity={0.85}
          >
            <Icon name="check" size={16} color="#FFFFFF" />
            <Text style={[styles.markCompleteText, { color: '#FFFFFF' }]}>
              Mark Completed ({selectedCount})
            </Text>
          </TouchableOpacity>
        )}

        {/* Active Tasks Checklist */}
        {activeTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image
              source={require('../../assets/images/empty_state_illustration.png')}
              style={styles.emptyIllustration}
              resizeMode="contain"
            />
            <Text style={[styles.emptyText, { color: theme.colors.textPrimary }]}>
              All done for today! 🎉
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.textMuted }]}>
              Enjoy your free time or add a new task above
            </Text>
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

        {/* Completed Tasks Toggle */}
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
                name="chevronRight"
                size={16}
                color={theme.colors.textMuted}
              />
            </TouchableOpacity>

            {showCompleted &&
              completedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isSelected={false}
                  onToggleCheckbox={onToggleSelectTask}
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

              {/* Edit & Delete Action Buttons */}
              <View style={styles.reminderActions}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.colors.surfaceVariant }]}
                  onPress={() => setEditingReminder(rem)}
                  activeOpacity={0.7}
                >
                  <Icon name="edit" size={15} color={theme.colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}
                  onPress={() => setDeletingReminder(rem)}
                  activeOpacity={0.7}
                >
                  <Icon name="trash" size={15} color={theme.colors.danger || '#EF4444'} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Edit Reminder Modal */}
      <AddReminderModal
        visible={!!editingReminder}
        editingReminder={editingReminder}
        onClose={() => setEditingReminder(null)}
        onSave={handleSaveEditedReminder}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        visible={!!deletingReminder}
        title="Delete Reminder?"
        itemTitle={deletingReminder ? deletingReminder.title : ''}
        itemType="Reminder"
        onConfirm={handleConfirmDeleteReminder}
        onCancel={() => setDeletingReminder(null)}
      />
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyIllustration: {
    width: 80,
    height: 80,
    marginBottom: 12,
    opacity: 0.6,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 13,
    marginTop: 4,
  },
  completedSection: {
    marginTop: 12,
  },
  completedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  completedTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  reminderCard: {
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
    marginTop: 2,
  },
  reminderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 8,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

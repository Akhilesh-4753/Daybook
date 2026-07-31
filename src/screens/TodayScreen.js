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
  tasks = [],
  user,
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

  const selectedCount = selectedTaskIds.length;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        userName={user?.name || 'Akhilesh'}
        user={user}
        onProfilePress={onOpenMore}
      />

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

        <View style={{ height: 20 }} />
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
});

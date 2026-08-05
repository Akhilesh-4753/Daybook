import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Header } from '../components/Header';
import { Icon } from '../components/Icons';
import { ProgressCard } from '../components/ProgressCard';
import { TaskCard } from '../components/TaskCard';
import { useTheme } from '../theme/ThemeContext';

export const TodayScreen = ({
  tasks = [],
  user,
  selectedTaskIds = [],
  onToggleSelectTask,
  onMarkSelectedCompleted,
  onAddTask,
  onOpenMore,
  onDeleteTask,
  onEditTask,
}) => {
  const { theme, isDarkMode } = useTheme();

  const [showCompleted, setShowCompleted] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rippleScale = useRef(new Animated.Value(1)).current;
  const rippleOpacity = useRef(new Animated.Value(0.7)).current;

  const isListEmpty = tasks.length === 0;

  // Pulse & Radar Ripple animation loop (runs only when task list is empty)
  useEffect(() => {
    if (isListEmpty) {
      rippleScale.setValue(1);
      rippleOpacity.setValue(0.7);

      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );

      const rippleLoop = Animated.loop(
        Animated.parallel([
          Animated.timing(rippleScale, {
            toValue: 1.45,
            duration: 1600,
            useNativeDriver: true,
          }),
          Animated.timing(rippleOpacity, {
            toValue: 0,
            duration: 1600,
            useNativeDriver: true,
          }),
        ])
      );

      pulseLoop.start();
      rippleLoop.start();

      return () => {
        pulseLoop.stop();
        rippleLoop.stop();
      };
    } else {
      pulseAnim.stopAnimation();
      rippleScale.stopAnimation();
      rippleOpacity.stopAnimation();

      Animated.parallel([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(rippleScale, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(rippleOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isListEmpty]);

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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
      >
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
          <View style={{ position: 'relative', justifyContent: 'center', alignItems: 'center' }}>
            {isListEmpty && (
              <Animated.View
                style={[
                  styles.rippleHalo,
                  {
                    borderColor: theme.colors.primary,
                    transform: [{ scale: rippleScale }],
                    opacity: rippleOpacity,
                  },
                ]}
              />
            )}
            <Animated.View
              style={{
                transform: [{ scale: isListEmpty ? pulseAnim : 1 }],
              }}
            >
              <TouchableOpacity
                onPress={onAddTask}
                activeOpacity={0.7}
                style={[
                  styles.highlightPill,
                  { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.viewAllText,
                    {
                      color: '#FFFFFF',
                      fontWeight: '700',
                    },
                  ]}
                >
                  + Add Task
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
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
              source={
                isDarkMode
                  ? require('../../assets/images/empty_state_illustration_dark.png')
                  : require('../../assets/images/empty_state_illustration.png')
              }
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
              onEditTask={onEditTask}
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
                  onEditTask={onEditTask}
                  onDeleteTask={onDeleteTask}
                />
              ))}
          </View>
        )}
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
  highlightPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 5,
    elevation: 4,
  },
  rippleHalo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  emptyIllustration: {
    width: 260,
    height: 260,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
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

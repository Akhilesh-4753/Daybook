import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Modal, Platform, StatusBar as RNStatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddReminderModal } from '../src/components/AddReminderModal';
import { AddTaskModal } from '../src/components/AddTaskModal';
import { BottomNavigation } from '../src/components/BottomNavigation';
import { CompletionModal } from '../src/components/CompletionModal';
import { DeleteConfirmModal } from '../src/components/DeleteConfirmModal';
import { Icon } from '../src/components/Icons';
import { useAuth } from '../src/context/AuthContext';
import { useTasks } from '../src/context/TaskContext';
import { AuthScreen } from '../src/screens/AuthScreen';
import { CalendarScreen } from '../src/screens/CalendarScreen';
import { DiaryScreen } from '../src/screens/DiaryScreen';
import { HabitsScreen } from '../src/screens/HabitsScreen';
import { MoreScreen } from '../src/screens/MoreScreen';
import { ReportsScreen } from '../src/screens/ReportsScreen';
import { TodayScreen } from '../src/screens/TodayScreen';
import { useTheme } from '../src/theme/ThemeContext';

import { SecurityLockModal } from '../src/components/SecurityLockModal';
import { initNotificationHandler } from '../src/services/NotificationService';

SplashScreen.preventAutoHideAsync().catch(() => { });

function MainApp() {
  const { user, isAuthenticated, logout, setUser } = useAuth();
  const { theme, isDarkMode } = useTheme();

  useEffect(() => {
    initNotificationHandler();
    SplashScreen.hideAsync().catch(() => { });
  }, []);

  const {
    tasks,
    reminders,
    habits,
    diaryEntries,
    addTask,
    toggleTaskCompletion,
    deleteTask,
    updateTask,
    toggleHabit,
    addHabit,
    addReminder,
    addDiaryEntry,
    deleteDiaryEntry,
  } = useTasks();

  const [activeTab, setActiveTab] = useState('today');
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [isReminderModalVisible, setIsReminderModalVisible] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<any>(null);

  // Tracks the clicked date from CalendarScreen (e.g., '2026-08-06')
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Selection & Confirmation states
  const [selectedTaskIds, setSelectedTaskIds] = useState<any[]>([]);
  const [isConfirmCompleteVisible, setIsConfirmCompleteVisible] = useState(false);
  const [showNoTaskAlert, setShowNoTaskAlert] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<any>(null);

  const insets = useSafeAreaInsets();
  const safeTop = (insets && typeof insets.top === 'number') ? insets.top : 0;
  const topPadding = Platform.OS === 'android'
    ? Math.max(safeTop, RNStatusBar.currentHeight || 28)
    : Math.max(safeTop, 12);

  // If user is not authenticated, show AuthScreen
  if (!isAuthenticated) {
    return (
      <View style={[styles.safeArea, { backgroundColor: theme.colors.background, paddingTop: topPadding }]}>
        <RNStatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} translucent={true} />
        <AuthScreen
          onAuthSuccess={(userData: any) => setUser(userData)}
          onLoginSuccess={(userData: any) => setUser(userData)}
        />
      </View>
    );
  }

  // Toggle checkbox selection state
  const handleToggleSelectTask = (taskId: any) => {
    setSelectedTaskIds((prev: any[]) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  // Common button: Mark Selected as Completed
  const handleMarkSelectedCompleted = () => {
    if (selectedTaskIds.length === 0) {
      setShowNoTaskAlert(true);
    } else {
      setIsConfirmCompleteVisible(true);
    }
  };

  const handleConfirmBatchCompletion = () => {
    selectedTaskIds.forEach((id) => {
      toggleTaskCompletion(id, true);
    });
    setSelectedTaskIds([]);
    setIsConfirmCompleteVisible(false);
  };

  // Delete task confirmation
  const handleRequestDeleteTask = (task: any) => {
    setTaskToDelete(task);
  };

  const handleConfirmDeleteTask = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
      setSelectedTaskIds((prev: any[]) => prev.filter((id) => id !== taskToDelete.id));
      setTaskToDelete(null);
    }
  };

  const renderCurrentScreen = () => {
    switch (activeTab) {
      case 'today':
        return (
          <TodayScreen
            tasks={tasks}
            user={user}
            reminders={reminders}
            selectedTaskIds={selectedTaskIds}
            onToggleSelectTask={handleToggleSelectTask}
            onMarkSelectedCompleted={handleMarkSelectedCompleted}
            onAddTask={() => {
              setTaskToEdit(null);
              setIsTaskModalVisible(true);
            }}
            onOpenMore={() => setActiveTab('more')}
            onDeleteTask={handleRequestDeleteTask}
            onEditTask={(task: any) => {
              setTaskToEdit(task);
              setIsTaskModalVisible(true);
            }}
          />
        );
      case 'calendar':
        return (
          <CalendarScreen
            reminders={reminders}
            onAddReminder={(dateFromCalendar?: string) => {
              if (dateFromCalendar) {
                setSelectedDate(dateFromCalendar);
              }
              setIsReminderModalVisible(true);
            }}
          />
        );
      case 'diary':
        return (
          <DiaryScreen
            diaryEntries={diaryEntries}
            onSaveEntry={addDiaryEntry}
            onDeleteEntry={deleteDiaryEntry}
          />
        );
      case 'reports':
        return (
          <ReportsScreen
            tasks={tasks}
            habits={habits}
            reminders={reminders}
            user={user}
          />
        );
      case 'more':
        return (
          <MoreScreen
            user={user}
            onNavigateTab={(tab: any) => setActiveTab(tab)}
            onLogout={logout}
          />
        );
      case 'habits':
        return (
          <HabitsScreen
            habits={habits}
            onToggleHabit={toggleHabit}
            onAddHabit={addHabit}
          />
        );
      default:
        return (
          <TodayScreen
            tasks={tasks}
            user={user}
            reminders={reminders}
            selectedTaskIds={selectedTaskIds}
            onToggleSelectTask={handleToggleSelectTask}
            onMarkSelectedCompleted={handleMarkSelectedCompleted}
            onAddTask={() => {
              setTaskToEdit(null);
              setIsTaskModalVisible(true);
            }}
            onOpenMore={() => setActiveTab('more')}
            onDeleteTask={handleRequestDeleteTask}
            onEditTask={(task: any) => {
              setTaskToEdit(task);
              setIsTaskModalVisible(true);
            }}
          />
        );
    }
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: theme.colors.background, paddingTop: topPadding }]}>
      <RNStatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} translucent={true} />
      <View style={styles.container}>
        {renderCurrentScreen()}

        <BottomNavigation
          activeTab={activeTab}
          onTabPress={(tabId: any) => setActiveTab(tabId)}
          onFabPress={() => setIsTaskModalVisible(false)}
        />

        {/* Security App Lock Modal */}
        <SecurityLockModal />

        {/* Modals */}
        <AddTaskModal
          key={isTaskModalVisible ? (taskToEdit ? `edit-${taskToEdit.id}` : 'new-task') : 'hidden'}
          visible={isTaskModalVisible}
          taskToEdit={taskToEdit}
          onClose={() => {
            setIsTaskModalVisible(false);
            setTaskToEdit(null);
          }}
          onSave={(taskData: any) => {
            if (taskToEdit) {
              updateTask(taskData);
            } else {
              addTask(taskData);
            }
            setIsTaskModalVisible(false);
            setTaskToEdit(null);
          }}
        />

        <AddReminderModal
          visible={isReminderModalVisible}
          selectedDate={selectedDate}
          onClose={() => setIsReminderModalVisible(false)}
          onSave={(newReminder: any) => {
            addReminder(newReminder);
            setIsReminderModalVisible(false);
          }}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          visible={!!taskToDelete}
          title="Delete Task?"
          itemTitle={taskToDelete?.title}
          itemType="Task"
          onConfirm={handleConfirmDeleteTask}
          onCancel={() => setTaskToDelete(null)}
        />

        {/* Confirmation Modal for Batch Completion */}
        <CompletionModal
          visible={isConfirmCompleteVisible}
          task={{ title: `${selectedTaskIds.length} Selected Task${selectedTaskIds.length > 1 ? 's' : ''}` }}
          onConfirm={handleConfirmBatchCompletion}
          onCancel={() => setIsConfirmCompleteVisible(false)}
        />

        {/* Notice Modal when no checkbox is checked */}
        <Modal visible={showNoTaskAlert} transparent={true} animationType="fade" onRequestClose={() => setShowNoTaskAlert(false)}>
          <View style={styles.alertOverlay}>
            <View style={[styles.alertContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <View style={[styles.alertIconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Icon name="bell" size={32} color="#D97706" />
              </View>

              <Text style={[styles.alertTitle, { color: theme.colors.textPrimary }]}>
                No Task Selected
              </Text>
              <Text style={[styles.alertMessage, { color: theme.colors.textSecondary }]}>
                Please check the checkbox of at least one task first before clicking &quot;Mark Selected as Completed&quot;.
              </Text>

              <TouchableOpacity
                style={[styles.alertButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => setShowNoTaskAlert(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.alertButtonText}>Got It</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Security App Lock Modal Overlay */}
        <SecurityLockModal />
      </View>
    </View>
  );
}

export default function Index() {
  return <MainApp />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  alertContainer: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  alertIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  alertMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  alertButton: {
    width: '100%',
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
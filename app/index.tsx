import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Modal, Text, TouchableOpacity } from 'react-native';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { TaskProvider, useTasks } from '../src/context/TaskContext';
import { ThemeProvider, useTheme } from '../src/theme/ThemeContext';
import { BottomNavigation } from '../src/components/BottomNavigation';
import { TodayScreen } from '../src/screens/TodayScreen';
import { CalendarScreen } from '../src/screens/CalendarScreen';
import { DiaryScreen } from '../src/screens/DiaryScreen';
import { ReportsScreen } from '../src/screens/ReportsScreen';
import { MoreScreen } from '../src/screens/MoreScreen';
import { HabitsScreen } from '../src/screens/HabitsScreen';
import { AuthScreen } from '../src/screens/AuthScreen';
import { AddTaskModal } from '../src/components/AddTaskModal';
import { AddReminderModal } from '../src/components/AddReminderModal';
import { CompletionModal } from '../src/components/CompletionModal';
import { DeleteConfirmModal } from '../src/components/DeleteConfirmModal';
import { Icon } from '../src/components/Icons';

import { SecurityProvider } from '../src/context/SecurityContext';
import { SecurityLockModal } from '../src/components/SecurityLockModal';

function MainApp() {
  const { user, isAuthenticated, logout, setUser } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const {
    tasks,
    reminders,
    habits,
    diaryEntries,
    addTask,
    toggleTaskCompletion,
    deleteTask,
    toggleHabit,
    addHabit,
    addReminder,
    addDiaryEntry,
  } = useTasks();

  const [activeTab, setActiveTab] = useState('today');
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [isReminderModalVisible, setIsReminderModalVisible] = useState(false);

  // Selection & Confirmation states
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [isConfirmCompleteVisible, setIsConfirmCompleteVisible] = useState(false);
  const [showNoTaskAlert, setShowNoTaskAlert] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // If user is not authenticated, show AuthScreen
  if (!isAuthenticated) {
    return (
      <AuthScreen
        onAuthSuccess={(userData) => setUser(userData)}
        onLoginSuccess={(userData) => setUser(userData)}
      />
    );
  }

  // Toggle checkbox selection state
  const handleToggleSelectTask = (taskId) => {
    setSelectedTaskIds((prev) =>
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
  const handleRequestDeleteTask = (task) => {
    setTaskToDelete(task);
  };

  const handleConfirmDeleteTask = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
      setSelectedTaskIds((prev) => prev.filter((id) => id !== taskToDelete.id));
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
            onAddTask={() => setIsTaskModalVisible(true)}
            onOpenMore={() => setActiveTab('more')}
            onDeleteTask={handleRequestDeleteTask}
          />
        );
      case 'calendar':
        return (
          <CalendarScreen
            reminders={reminders}
            onAddReminder={() => setIsReminderModalVisible(true)}
          />
        );
      case 'diary':
        return (
          <DiaryScreen
            diaryEntries={diaryEntries}
            onSaveEntry={addDiaryEntry}
          />
        );
      case 'reports':
        return (
          <ReportsScreen
            tasks={tasks}
            habits={habits}
            user={user}
          />
        );
      case 'more':
        return (
          <MoreScreen
            user={user}
            onNavigateTab={(tab) => setActiveTab(tab)}
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
            onAddTask={() => setIsTaskModalVisible(true)}
            onOpenMore={() => setActiveTab('more')}
            onDeleteTask={handleRequestDeleteTask}
          />
        );
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
      <View style={styles.container}>
        {renderCurrentScreen()}

        <BottomNavigation
          activeTab={activeTab}
          onTabPress={(tabId) => setActiveTab(tabId)}
          onFabPress={() => setIsTaskModalVisible(true)}
        />

        {/* Security App Lock Modal */}
        <SecurityLockModal />

        {/* Modals */}
        <AddTaskModal
          visible={isTaskModalVisible}
          onClose={() => setIsTaskModalVisible(false)}
          onSave={(newTask) => {
            addTask(newTask);
            setIsTaskModalVisible(false);
          }}
        />

        <AddReminderModal
          visible={isReminderModalVisible}
          onClose={() => setIsReminderModalVisible(false)}
          onSave={(newReminder) => {
            addReminder(newReminder);
            setIsReminderModalVisible(false);
          }}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          visible={!!taskToDelete}
          itemTitle={taskToDelete?.title}
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
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SecurityProvider>
      <AuthProvider>
        <TaskProvider>
          <ThemeProvider>
            <MainApp />
          </ThemeProvider>
        </TaskProvider>
      </AuthProvider>
    </SecurityProvider>
  );
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


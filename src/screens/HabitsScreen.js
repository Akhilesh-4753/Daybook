import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { HabitCard } from '../components/HabitCard';
import { Icon } from '../components/Icons';
import { AddHabitModal } from '../components/AddHabitModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

export const HabitsScreen = ({ habits = [], onGoBack }) => {
  const { theme } = useTheme();
  const { addHabit, updateHabit, deleteHabit, toggleAutoAddHabit } = useTasks();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  // Deletion Modal State
  const [deletingHabit, setDeletingHabit] = useState(null);

  const handleOpenAddModal = () => {
    setEditingHabit(null);
    setModalVisible(true);
  };

  const handleOpenEditModal = (habit) => {
    setEditingHabit(habit);
    setModalVisible(true);
  };

  const handleSaveHabitData = (habitData) => {
    if (editingHabit) {
      updateHabit({ ...editingHabit, ...habitData });
    } else {
      addHabit({
        ...habitData,
        progress: 0,
        streak: 0,
        completedToday: false,
      });
    }
  };

  const handleRequestDelete = (habit) => {
    setDeletingHabit(habit);
  };

  const handleConfirmDelete = async () => {
    if (deletingHabit) {
      await deleteHabit(deletingHabit.id);
      setDeletingHabit(null);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header with Back Button */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeftRow}>
          {onGoBack && (
            <TouchableOpacity
              style={[styles.backBtn, { backgroundColor: theme.colors.surfaceVariant }]}
              onPress={onGoBack}
              activeOpacity={0.8}
            >
              <Icon name="arrowLeft" size={18} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          )}
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
            Habit Tracker
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
          onPress={handleOpenAddModal}
        >
          <Text style={styles.addBtnText}>+ New Habit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Streak Motivation Banner */}
        <View
          style={[
            styles.streakBanner,
            { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: theme.colors.success },
          ]}
        >
          <View style={styles.fireCircle}>
            <Icon name="fire" size={24} color="#10B981" />
          </View>
          <View style={styles.bannerTextCol}>
            <Text style={[styles.bannerTitle, { color: theme.colors.textPrimary }]}>
              Consistency is Key!
            </Text>
            <Text style={[styles.bannerSub, { color: theme.colors.textSecondary }]}>
              Daily habits automatically appear in your Today Checklist every morning when Auto-Add To Task is enabled.
            </Text>
          </View>
        </View>

        {/* List of Habits */}
        <View style={styles.listContainer}>
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggleAutoAdd={() => toggleAutoAddHabit && toggleAutoAddHabit(habit.id)}
              onEdit={handleOpenEditModal}
              onDelete={() => handleRequestDelete(habit)}
            />
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add / Edit Habit Modal Component (100% Identical to AddTaskModal) */}
      <AddHabitModal
        visible={modalVisible}
        editingHabit={editingHabit}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveHabitData}
      />

      {/* Delete Confirmation Popup */}
      <DeleteConfirmModal
        visible={!!deletingHabit}
        title="Delete Habit?"
        itemTitle={deletingHabit ? deletingHabit.title : ''}
        itemType="Habit"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingHabit(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  addBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  fireCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  bannerSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  listContainer: {
    paddingHorizontal: 0,
  },
});

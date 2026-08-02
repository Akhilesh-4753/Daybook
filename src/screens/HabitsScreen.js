import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { HabitCard } from '../components/HabitCard';
import { Icon } from '../components/Icons';
import { TimePickerInput } from '../components/TimePickerInput';
import { formatMultiLineText } from '../utils/textUtils';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

export const HabitsScreen = ({ habits = [], onGoBack }) => {
  const { theme } = useTheme();
  const { addHabit, updateHabit, deleteHabit, toggleAutoAddHabit } = useTasks();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  // Deletion Modal State
  const [deletingHabit, setDeletingHabit] = useState(null);

  // Habit Inputs
  const [newTitle, setNewTitle] = useState('');
  const [category, setCategory] = useState('Health');
  const [priority, setPriority] = useState('Medium');
  const [time, setTime] = useState('08:00 AM');
  const [notes, setNotes] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('note');
  const [autoAddToday, setAutoAddToday] = useState(true);

  const categories = ['Health', 'Work', 'Personal', 'Finance'];
  const priorities = ['Low', 'Medium', 'High'];

  const availableIcons = [
    { id: 'note', label: 'Note', symbol: '📝' },
    { id: 'droplet', label: 'Water', symbol: '💧' },
    { id: 'walking', label: 'Walking', symbol: '🚶' },
    { id: 'dumbbell', label: 'Workout', symbol: '🏋️' },
    { id: 'book', label: 'Reading', symbol: '📚' },
    { id: 'sparkles', label: 'Meditation', symbol: '🧘' },
    { id: 'ban', label: 'No Sugar', symbol: '🚫' },
    { id: 'dog', label: 'Dog Walk', symbol: '🐕' },
    { id: 'writing', label: 'Writing', symbol: '✍️' },
    { id: 'mirror', label: 'Affirmation', symbol: '🪞' },
  ];

  const handleOpenAddModal = () => {
    setEditingHabit(null);
    setNewTitle('');
    setCategory('Health');
    setPriority('Medium');
    setTime('08:00 AM');
    setNotes('');
    setSelectedIcon('note');
    setAutoAddToday(false);
    setModalVisible(true);
  };

  const handleOpenEditModal = (habit) => {
    setEditingHabit(habit);
    setNewTitle(habit.title);
    setCategory(habit.category || 'Health');
    setPriority(habit.priority || 'Medium');
    setTime(habit.time || '08:00 AM');
    setNotes(habit.notes || '');
    setSelectedIcon(habit.icon === 'none' || !habit.icon ? 'note' : habit.icon);
    setAutoAddToday(habit.autoAddToday !== false);
    setModalVisible(true);
  };

  const handleSave = () => {
    const cleanTitle = newTitle.trim();
    if (!cleanTitle) return;
    const cleanNotes = formatMultiLineText(notes);

    if (editingHabit) {
      // Edit existing habit
      const updated = {
        ...editingHabit,
        title: cleanTitle,
        category,
        priority,
        time,
        notes: cleanNotes,
        icon: selectedIcon,
        autoAddToday: autoAddToday,
      };
      updateHabit(updated);
    } else {
      // Add new habit
      const newHabit = {
        id: 'h_' + Date.now(),
        title: cleanTitle,
        category,
        priority,
        time,
        notes: cleanNotes,
        progress: 0,
        streak: 0,
        completedToday: false,
        autoAddToday: autoAddToday,
        icon: selectedIcon,
      };
      addHabit(newHabit);
    }

    setModalVisible(false);
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

      {/* Add / Edit Habit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                {editingHabit ? 'Edit Habit' : 'Add New Habit'}
              </Text>

              {/* Habit Title */}
              <View style={styles.labelRow}>
                <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                  Habit Title
                </Text>
                <Text style={[styles.charCounter, { color: theme.colors.textMuted }]}>
                  {newTitle.length}/20
                </Text>
              </View>
              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    color: theme.colors.textPrimary,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder="e.g., Drink Water, Morning Jog"
                placeholderTextColor={theme.colors.textMuted}
                maxLength={20}
                value={newTitle}
                onChangeText={setNewTitle}
              />

              {/* Habit Icon Selector */}
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                Choose Icon
              </Text>
              <View style={styles.iconGrid}>
                {availableIcons.map((ic) => (
                  <TouchableOpacity
                    key={ic.id}
                    style={[
                      styles.iconBox,
                      {
                        backgroundColor:
                          selectedIcon === ic.id
                            ? 'rgba(99, 102, 241, 0.2)'
                            : theme.colors.surfaceVariant,
                        borderColor:
                          selectedIcon === ic.id ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                    onPress={() => setSelectedIcon(ic.id)}
                  >
                    <Text style={styles.iconSymbolText}>{ic.symbol}</Text>
                    <Text
                      style={[
                        styles.iconLabelText,
                        { color: selectedIcon === ic.id ? theme.colors.primary : theme.colors.textMuted },
                      ]}
                    >
                      {ic.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Category */}
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                Category
              </Text>
              <View style={styles.optionsRow}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.optionPill,
                      {
                        backgroundColor:
                          category === cat
                            ? theme.colors.primary
                            : theme.colors.surfaceVariant,
                      },
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: category === cat ? '#FFFFFF' : theme.colors.textSecondary },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Priority */}
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                Priority
              </Text>
              <View style={styles.optionsRow}>
                {priorities.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.optionPill,
                      {
                        backgroundColor:
                          priority === p
                            ? theme.colors.primary
                            : theme.colors.surfaceVariant,
                      },
                    ]}
                    onPress={() => setPriority(p)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: priority === p ? '#FFFFFF' : theme.colors.textSecondary },
                      ]}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Reminder Time Input */}
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                Reminder Time
              </Text>
              <TimePickerInput value={time} onChangeTime={setTime} />

              {/* Notes (Optional) */}
              <View style={styles.labelRow}>
                <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                  Notes (Optional)
                </Text>
                <Text style={[styles.charCounter, { color: theme.colors.textMuted }]}>
                  {notes.length}/100
                </Text>
              </View>
              <TextInput
                style={[
                  styles.modalInput,
                  styles.textArea,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    color: theme.colors.textPrimary,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder="Add daily habit goals, notes, or details..."
                placeholderTextColor={theme.colors.textMuted}
                multiline={true}
                maxLength={100}
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
              />

              {/* Auto-Add To Task Toggle */}
              <View style={styles.autoAddSwitchRow}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={[styles.autoAddSwitchTitle, { color: theme.colors.textPrimary }]}>
                    Auto-Add To Task
                  </Text>
                  <Text style={[styles.autoAddSwitchSub, { color: theme.colors.textMuted }]}>
                    Automatically add this habit into Today's Task list
                  </Text>
                </View>
                <Switch
                  value={autoAddToday}
                  onValueChange={setAutoAddToday}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
                  thumbColor={autoAddToday ? theme.colors.primary : '#F4F3F4'}
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalCancelBtn, { borderColor: theme.colors.border }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={[styles.cancelBtnText, { color: theme.colors.textSecondary }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalSaveBtn, { backgroundColor: theme.colors.primary }]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveBtnText}>
                    {editingHabit ? 'Save Changes' : 'Add Habit'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Stylish Delete Confirmation Popup */}
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
    paddingBottom: 10,
  },
  headerLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
  },
  addBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
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
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginVertical: 12,
  },
  fireCircle: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  charCounter: {
    fontSize: 11,
    fontWeight: '600',
  },
  modalInput: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
    includeFontPadding: false,
    outlineStyle: 'none',
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  iconBox: {
    width: '18%',
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSymbolText: {
    fontSize: 20,
    marginBottom: 2,
  },
  iconLabelText: {
    fontSize: 9,
    fontWeight: '700',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  optionPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  autoAddSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  autoAddSwitchTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  autoAddSwitchSub: {
    fontSize: 11,
    marginTop: 2,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalSaveBtn: {
    flex: 1.5,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Switch,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { formatMultiLineText } from '../utils/textUtils';
import { Icon } from './Icons';
import { TimePickerInput } from './TimePickerInput';

export const AddHabitModal = ({ visible, onClose, onSave, editingHabit }) => {
  const { theme } = useTheme();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Health');
  const [priority, setPriority] = useState('Medium');
  const [time, setTime] = useState('08:00 AM');
  const [notes, setNotes] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('note');
  const [autoAddToday, setAutoAddToday] = useState(false);

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

  useEffect(() => {
    if (editingHabit) {
      setTitle(editingHabit.title || '');
      setCategory(editingHabit.category || 'Health');
      setPriority(editingHabit.priority || 'Medium');
      setTime(editingHabit.time || '08:00 AM');
      setNotes(editingHabit.notes || '');
      setSelectedIcon(editingHabit.icon === 'none' || !editingHabit.icon ? 'note' : editingHabit.icon);
      setAutoAddToday(editingHabit.autoAddToday !== false);
    } else {
      reset();
    }
  }, [editingHabit, visible]);

  const reset = () => {
    setTitle('');
    setNotes('');
    setCategory('Health');
    setPriority('Medium');
    setSelectedIcon('note');
    setTime('08:00 AM');
    setAutoAddToday(false);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    const cleanTitle = title.trim();
    const cleanNotes = formatMultiLineText(notes);

    const habitData = {
      id: editingHabit ? editingHabit.id : 'h_' + Date.now(),
      title: cleanTitle,
      category,
      priority,
      time,
      notes: cleanNotes,
      icon: selectedIcon,
      autoAddToday,
    };

    onSave(habitData);
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
              {editingHabit ? 'Edit Habit' : 'Create New Habit'}
            </Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Icon name="close" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollBody}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets={true}
          >

            {/* Habit Title */}
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Habit Title</Text>
              <Text style={[styles.charCounter, { color: theme.colors.textMuted }]}>
                {title.length}/20
              </Text>
            </View>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  color: theme.colors.textPrimary,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="e.g., Drink Water, Morning Jog"
              placeholderTextColor={theme.colors.textMuted}
              maxLength={20}
              value={title}
              onChangeText={setTitle}
            />

            {/* Choose Habit Icon */}
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Choose Icon</Text>
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
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Category</Text>
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
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Priority</Text>
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

            {/* Reminder Time */}
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Reminder Time</Text>
            <TimePickerInput value={time} onChangeTime={setTime} />

            {/* Notes (Optional) */}
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Notes (Optional)</Text>
              <Text style={[styles.charCounter, { color: theme.colors.textMuted }]}>
                {notes.length}/100
              </Text>
            </View>
            <TextInput
              style={[
                styles.input,
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

            {/* Auto-Add To Task Switch Row */}
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
          </ScrollView>

          {/* Action button */}
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>
              {editingHabit ? 'Save Changes' : 'Save Habit'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>

  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    padding: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  scrollBody: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  charCounter: {
    fontSize: 11,
    fontWeight: '600',
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    outlineStyle: 'none',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 6,
  },
  iconBox: {
    width: '18%',
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSymbolText: {
    fontSize: 18,
    marginBottom: 2,
  },
  iconLabelText: {
    fontSize: 9,
    fontWeight: '700',
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
    marginTop: 12,
    marginBottom: 16,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  autoAddSwitchTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  autoAddSwitchSub: {
    fontSize: 11,
    marginTop: 2,
  },
  saveBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

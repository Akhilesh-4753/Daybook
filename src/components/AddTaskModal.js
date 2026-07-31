import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Icon } from './Icons';
import { TimePickerInput } from './TimePickerInput';

export const AddTaskModal = ({ visible, onClose, onSave }) => {
  const { theme } = useTheme();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Work');
  const [priority, setPriority] = useState('High');
  const [time, setTime] = useState('10:00 AM');
  const [notes, setNotes] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('none');

  const categories = ['Work', 'Health', 'Personal', 'Finance'];
  const priorities = ['Low', 'Medium', 'High'];

  const availableIcons = [
    { id: 'none', label: 'None', symbol: '⭕' },
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

  const handleSave = () => {
    if (!title.trim()) return;
    const newTask = {
      id: 't_' + Date.now(),
      title,
      category,
      priority,
      time,
      notes,
      icon: selectedIcon,
      completed: false,
      date: new Date().toISOString().split('T')[0],
    };
    onSave(newTask);
    reset();
    onClose();
  };

  const reset = () => {
    setTitle('');
    setNotes('');
    setCategory('Work');
    setPriority('High');
    setSelectedIcon('none');
    setTime('10:00 AM');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
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
              Create New Task
            </Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Icon name="close" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Title */}
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Task Title</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  color: theme.colors.textPrimary,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="What do you need to get done?"
              placeholderTextColor={theme.colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            {/* Choose Task Icon */}
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

            {/* Logical Time Picker */}
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Reminder Time</Text>
            <TimePickerInput value={time} onChangeTime={setTime} />

            {/* Notes */}
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Notes (Optional)</Text>
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
              placeholder="Add details, subtasks, or links..."
              placeholderTextColor={theme.colors.textMuted}
              multiline={true}
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
            />
          </ScrollView>

          {/* Action button */}
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>Add Task</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
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

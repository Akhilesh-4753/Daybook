import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Icon } from './Icons';

export const AddReminderModal = ({ visible, onClose, onSave, selectedDate }) => {
  const { theme } = useTheme();

  const [title, setTitle] = useState('');
  const [importance, setImportance] = useState('');
  const [notes, setNotes] = useState('');
  const [time, setTime] = useState('10:00 AM');
  const [repeat, setRepeat] = useState('Does not repeat');
  const [priority, setPriority] = useState('High');
  const [alarmTone, setAlarmTone] = useState('Default');
  const [notification, setNotification] = useState(true);
  const [category, setCategory] = useState('Work');

  const repeatOptions = ['Does not repeat', 'Daily', 'Weekly', 'Monthly', 'Yearly'];
  const priorityOptions = ['Normal', 'High', 'Critical'];
  const categoryOptions = ['Work', 'Health', 'Personal', 'Finance'];

  const handleSave = () => {
    if (!title.trim()) return;
    const newReminder = {
      id: 'r_' + Date.now(),
      title,
      importance,
      notes,
      date: selectedDate || new Date().toISOString().split('T')[0],
      time,
      alarmTone,
      repeat,
      priority,
      notification,
      category,
    };
    onSave(newReminder);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle('');
    setImportance('');
    setNotes('');
    setTime('10:00 AM');
    setRepeat('Does not repeat');
    setPriority('High');
    setNotification(true);
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
            <View style={styles.headerTitleRow}>
              <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
                Add Reminder
              </Text>
              <Text style={[styles.dateBadge, { color: theme.colors.primary }]}>
                {selectedDate || 'Today'}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Icon name="close" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Title Field */}
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Title Field</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  color: theme.colors.textPrimary,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="Add Reminder Title (e.g., Team Meeting)"
              placeholderTextColor={theme.colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            {/* Importance Field */}
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Why is this date important?
            </Text>
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
              placeholder="Importance details (e.g., Annual project deliverable)"
              placeholderTextColor={theme.colors.textMuted}
              multiline={true}
              numberOfLines={2}
              value={importance}
              onChangeText={setImportance}
            />

            {/* Notes / Motivation Quote */}
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Motivation Quote / Quick Notes
            </Text>
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
              placeholder="Quick notes or motivational reminder..."
              placeholderTextColor={theme.colors.textMuted}
              multiline={true}
              numberOfLines={2}
              value={notes}
              onChangeText={setNotes}
            />

            {/* Date & Time Row */}
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Time</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.surfaceVariant,
                      color: theme.colors.textPrimary,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  value={time}
                  onChangeText={setTime}
                />
              </View>

              <View style={styles.halfWidth}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Alarm Sound</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.surfaceVariant,
                      color: theme.colors.textPrimary,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  value={alarmTone}
                  onChangeText={setAlarmTone}
                />
              </View>
            </View>

            {/* Category Selector */}
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Category</Text>
            <View style={styles.optionsRow}>
              {categoryOptions.map((cat) => (
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

            {/* Priority Selector */}
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Priority</Text>
            <View style={styles.optionsRow}>
              {priorityOptions.map((p) => (
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

            {/* Repeat Selector */}
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Repeat</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollOptions}>
              {repeatOptions.map((rep) => (
                <TouchableOpacity
                  key={rep}
                  style={[
                    styles.optionPill,
                    {
                      backgroundColor:
                        repeat === rep
                          ? theme.colors.secondary
                          : theme.colors.surfaceVariant,
                      marginRight: 8,
                    },
                  ]}
                  onPress={() => setRepeat(rep)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: repeat === rep ? '#FFFFFF' : theme.colors.textSecondary },
                    ]}
                  >
                    {rep}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Notification Toggle */}
            <View style={styles.toggleRow}>
              <Text style={[styles.label, { color: theme.colors.textPrimary, marginBottom: 0 }]}>
                Enable Trigger Notification
              </Text>
              <Switch
                value={notification}
                onValueChange={setNotification}
                trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
                thumbColor={notification ? theme.colors.primary : '#F4F3F4'}
              />
            </View>
          </ScrollView>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>Save Reminder</Text>
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
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  dateBadge: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
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
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  scrollOptions: {
    flexDirection: 'row',
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingVertical: 8,
  },
  saveBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

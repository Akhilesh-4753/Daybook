import { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { formatMultiLineText } from '../utils/textUtils';
import { Icon } from './Icons';
import { TimePickerInput } from './TimePickerInput';

export const AddReminderModal = ({ visible, onClose, onSave, selectedDate, editingReminder }) => {
  const { theme } = useTheme();

  const [title, setTitle] = useState('');
  const [importance, setImportance] = useState('');
  const [notes, setNotes] = useState('');
  const [time, setTime] = useState('10:10 AM');
  const [repeat, setRepeat] = useState('No Repeat');
  const [priority, setPriority] = useState('High');
  const [category, setCategory] = useState('Work');
  const [validationError, setValidationError] = useState('');

  const repeatOptions = ['No Repeat', 'Daily', 'Weekly', 'Monthly', 'Yearly'];
  const priorityOptions = ['Normal', 'High', 'Critical'];
  const categoryOptions = ['Work', 'Health', 'Personal', 'Finance'];

  const parseDateTime = (dStr, tStr) => {
    try {
      if (!dStr) return new Date(0);
      const parts = dStr.split('-').map(Number);
      let h = 10, m = 10;
      if (tStr) {
        const isPM = tStr.toUpperCase().includes('PM');
        const isAM = tStr.toUpperCase().includes('AM');
        const clean = tStr.replace(/(AM|PM|\s)/gi, '');
        const tParts = clean.split(':').map(Number);
        if (tParts.length >= 2 && !isNaN(tParts[0]) && !isNaN(tParts[1])) {
          h = tParts[0];
          m = tParts[1];
          if (isPM && h < 12) h += 12;
          if (isAM && h === 12) h = 0;
        }
      }
      return new Date(parts[0], parts[1] - 1, parts[2], h, m, 0, 0);
    } catch (e) {
      return new Date(0);
    }
  };

  useEffect(() => {
    setValidationError('');
    if (editingReminder) {
      setTitle(editingReminder.title || '');
      setImportance(editingReminder.importance || '');
      setTime(editingReminder.time || '10:10 AM');
      setRepeat((editingReminder.repeat === 'Does not repeat' || editingReminder.repeat === "Doesn't repeat" || !editingReminder.repeat) ? 'No Repeat' : editingReminder.repeat);
      setPriority(editingReminder.priority || 'High');
      setCategory(editingReminder.category || 'Work');
    } else {
      resetForm();
    }
  }, [editingReminder, visible]);

  const handleClose = () => {
    setValidationError('');
    onClose();
  };

  const handleSave = () => {
    setValidationError('');

    // 1. Title mandatory check
    if (!title.trim()) {
      setValidationError('Title field is mandatory.');
      return;
    }

    // 2. Time mandatory check
    if (!time || !time.trim()) {
      setValidationError('Reminder time is mandatory.');
      return;
    }

    // 3. Past time check (Reminder time must be greater than current time)
    const activeDateStr = editingReminder
      ? editingReminder.date
      : selectedDate && selectedDate >= new Date().toISOString().split('T')[0]
        ? selectedDate
        : new Date().toISOString().split('T')[0];

    const targetDateTime = parseDateTime(activeDateStr, time);
    const now = new Date();

    if (targetDateTime.getTime() <= now.getTime()) {
      setValidationError('Reminder time must be greater than current time. You cannot set a reminder in the past.');
      return;
    }

    const cleanTitle = title.trim();
    const cleanImportance = formatMultiLineText(importance);

    const reminderData = {
      id: editingReminder ? editingReminder.id : 'r_' + Date.now(),
      title: cleanTitle,
      importance: cleanImportance,
      notes: '',
      date: activeDateStr,
      time,
      repeat,
      priority,
      category,
      notificationId: editingReminder ? editingReminder.notificationId : null,
    };
    onSave(reminderData);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setValidationError('');
    setTitle('');
    setImportance('');
    setTime('10:10 AM');
    setRepeat('No Repeat');
    setPriority('High');
    setCategory('Work');
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
                {editingReminder ? 'Edit Reminder' : 'Add Reminder'}
              </Text>
              <Text style={[styles.dateBadge, { color: theme.colors.primary }]}>
                {editingReminder ? editingReminder.date : selectedDate || 'Today'}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
              <Icon name="close" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Validation Error Banner */}
            {validationError ? (
              <View style={styles.errorBox}>
                <Icon name="ban" size={16} color="#EF4444" style={{ marginRight: 8 }} />
                <Text style={styles.errorText}>{validationError}</Text>
              </View>
            ) : null}

            {/* Title Field */}
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Title Field <Text style={{ color: '#EF4444' }}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  color: theme.colors.textPrimary,
                  borderColor: validationError && validationError.includes('Title') ? '#EF4444' : theme.colors.border,
                },
              ]}
              placeholder="Add Reminder Title (e.g., Team Meeting)"
              placeholderTextColor={theme.colors.textMuted}
              maxLength={20}
              value={title}
              onChangeText={(txt) => {
                setValidationError('');
                setTitle(txt);
              }}
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
              maxLength={100}
              numberOfLines={2}
              value={importance}
              onChangeText={setImportance}
            />

            {/* Time Selector */}
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Reminder Time <Text style={{ color: '#EF4444' }}>*</Text>
            </Text>
            <TimePickerInput
              value={time}
              onChangeTime={(t) => {
                setValidationError('');
                setTime(t);
              }}
            />

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
                          ? theme.colors.primary
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
          </ScrollView>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>
              {editingReminder ? 'Save Changes' : 'Save Reminder'}
            </Text>
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
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  dateBadge: {
    fontSize: 13,
    fontWeight: '600',
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
    outlineStyle: 'none',
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
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
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 4,
    marginTop: 2,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
});

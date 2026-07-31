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
import { Icon } from '../components/Icons';
import { AddReminderModal } from '../components/AddReminderModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

export const CalendarScreen = ({ reminders = [], onAddReminder }) => {
  const { theme } = useTheme();
  const { updateReminder, deleteReminder } = useTasks();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [editingReminder, setEditingReminder] = useState(null);
  const [deletingReminder, setDeletingReminder] = useState(null);

  // Month Navigation State
  const [currentDateObj, setCurrentDateObj] = useState(new Date());

  const year = currentDateObj.getFullYear();
  const month = currentDateObj.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = () => {
    setCurrentDateObj(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDateObj(new Date(year, month + 1, 1));
  };

  // Generate Days for Calendar Grid cleanly without timezone shifts
  const generateCalendarDays = () => {
    const days = [];

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    // Previous month info
    const prevMonthNum = month === 0 ? 12 : month;
    const prevYear = month === 0 ? year - 1 : year;

    // Previous month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const dateStr = `${prevYear}-${String(prevMonthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

      days.push({
        day: dayNum,
        dateStr,
        isCurrentMonth: false,
        hasReminder: reminders.some((r) => r.date === dateStr),
      });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= totalDaysInMonth; dayNum++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

      days.push({
        day: dayNum,
        dateStr,
        isCurrentMonth: true,
        hasReminder: reminders.some((r) => r.date === dateStr),
      });
    }

    // Next month info
    const nextMonthNum = month + 2 > 12 ? 1 : month + 2;
    const nextYear = month + 2 > 12 ? year + 1 : year;
    const remainingCells = (7 - (days.length % 7)) % 7;

    // Next month padding days to complete grid cells
    for (let i = 1; i <= remainingCells; i++) {
      const dateStr = `${nextYear}-${String(nextMonthNum).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

      days.push({
        day: i,
        dateStr,
        isCurrentMonth: false,
        hasReminder: reminders.some((r) => r.date === dateStr),
      });
    }

    return days;
  };

  const calendarGrid = generateCalendarDays();
  const selectedReminders = reminders.filter((r) => r.date === selectedDate);
  const isPastDate = selectedDate < todayStr;

  const handleSaveEditedReminder = async (updated) => {
    await updateReminder(updated);
    setEditingReminder(null);
  };

  const handleConfirmDeleteReminder = async () => {
    if (deletingReminder) {
      await deleteReminder(deletingReminder.id, deletingReminder.notificationId);
      setDeletingReminder(null);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.topHeader}>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
          Calendar & Schedule
        </Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Month Navigation */}
        <View style={styles.monthHeader}>
          <Text style={[styles.monthTitle, { color: theme.colors.textPrimary }]}>
            {monthNames[month]} {year}
          </Text>

          <View style={styles.navRow}>
            <TouchableOpacity
              style={[styles.navBtn, { backgroundColor: theme.colors.cardSecondary }]}
              onPress={handlePrevMonth}
            >
              <Text style={[styles.navArrow, { color: theme.colors.textPrimary }]}>‹</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navBtn, { backgroundColor: theme.colors.cardSecondary }]}
              onPress={handleNextMonth}
            >
              <Text style={[styles.navArrow, { color: theme.colors.textPrimary }]}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Days of Week Header */}
        <View style={styles.weekHeader}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <Text key={d} style={[styles.weekDayText, { color: theme.colors.textMuted }]}>
              {d}
            </Text>
          ))}
        </View>

        {/* Calendar Days Grid */}
        <View style={styles.gridContainer}>
          {calendarGrid.map((item, idx) => {
            const isSelected = item.isCurrentMonth && item.dateStr === selectedDate;
            const isTodayCell = item.isCurrentMonth && item.dateStr === todayStr;

            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.dayCell,
                  isSelected && [
                    styles.selectedDayCell,
                    { backgroundColor: theme.colors.primary },
                  ],
                  isTodayCell && !isSelected && { borderWidth: 1, borderColor: theme.colors.primary },
                ]}
                onPress={() => {
                  if (item.isCurrentMonth) {
                    setSelectedDate(item.dateStr);
                  }
                }}
                activeOpacity={item.isCurrentMonth ? 0.7 : 1}
              >
                <Text
                  style={[
                    styles.dayText,
                    {
                      color: !item.isCurrentMonth
                        ? theme.colors.textMuted
                        : isSelected
                        ? '#FFFFFF'
                        : theme.colors.textPrimary,
                    },
                    isSelected && styles.selectedDayText,
                  ]}
                >
                  {item.day}
                </Text>

                {item.hasReminder && (
                  <View style={styles.dotsRow}>
                    <View
                      style={[
                        styles.dot,
                        {
                          backgroundColor: isSelected
                            ? '#FFFFFF'
                            : theme.colors.secondary,
                        },
                      ]}
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected Date Agenda Header */}
        <View style={styles.agendaHeader}>
          <View style={styles.agendaTitleBox}>
            <Text style={[styles.agendaDateTitle, { color: theme.colors.textPrimary }]}>
              Reminders for {selectedDate}
            </Text>
            {isPastDate && (
              <Text style={[styles.pastLabel, { color: theme.colors.textMuted }]}>
                (Past Date - Cannot Add Reminders)
              </Text>
            )}
          </View>

          {/* Hide Add Reminder Button for Past Dates */}
          {!isPastDate && (
            <TouchableOpacity
              style={[styles.addReminderBtn, { backgroundColor: theme.colors.primary }]}
              onPress={() => onAddReminder && onAddReminder(selectedDate)}
              activeOpacity={0.85}
            >
              <Text style={styles.addReminderBtnText}>+ Add Reminder</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Reminders List for Selected Date */}
        {selectedReminders.length === 0 ? (
          <View style={styles.noRemindersBox}>
            <Text style={[styles.noRemindersText, { color: theme.colors.textMuted }]}>
              {isPastDate
                ? 'No past reminders found for this date.'
                : 'No reminders scheduled for this date.'}
            </Text>
          </View>
        ) : (
          selectedReminders.map((rem) => (
            <View
              key={rem.id}
              style={[
                styles.reminderCard,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
              ]}
            >
              <View style={styles.reminderHeader}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: theme.colors.surfaceVariant },
                  ]}
                >
                  <Icon name="bell" size={20} color={theme.colors.primary} />
                </View>

                <View style={styles.reminderMain}>
                  <Text style={[styles.reminderTitle, { color: theme.colors.textPrimary }]}>
                    {rem.title}
                  </Text>
                  <Text style={[styles.reminderTime, { color: theme.colors.primary }]}>
                    ⏰ {rem.time} • Repeat: {rem.repeat || 'None'}
                  </Text>
                </View>

                {/* Edit & Delete Action Buttons */}
                <View style={styles.reminderActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: theme.colors.surfaceVariant }]}
                    onPress={() => setEditingReminder(rem)}
                    activeOpacity={0.7}
                  >
                    <Icon name="edit" size={15} color={theme.colors.primary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}
                    onPress={() => setDeletingReminder(rem)}
                    activeOpacity={0.7}
                  >
                    <Icon name="trash" size={15} color={theme.colors.danger || '#EF4444'} />
                  </TouchableOpacity>
                </View>
              </View>

              {rem.importance ? (
                <View style={[styles.noteBox, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <Text style={[styles.noteImportanceTitle, { color: theme.colors.textSecondary }]}>
                    💡 Importance & Details:
                  </Text>
                  <Text style={[styles.noteImportanceText, { color: theme.colors.textPrimary }]}>
                    {rem.importance}
                  </Text>
                </View>
              ) : null}

              {rem.notes ? (
                <Text style={[styles.notesText, { color: theme.colors.textMuted }]}>
                  Notes: {rem.notes}
                </Text>
              ) : null}
            </View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Edit Reminder Modal */}
      <AddReminderModal
        visible={!!editingReminder}
        editingReminder={editingReminder}
        onClose={() => setEditingReminder(null)}
        onSave={handleSaveEditedReminder}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        visible={!!deletingReminder}
        title="Delete Reminder?"
        itemTitle={deletingReminder ? deletingReminder.title : ''}
        itemType="Reminder"
        onConfirm={handleConfirmDeleteReminder}
        onCancel={() => setDeletingReminder(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
  },
  scroll: {
    flex: 1,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginVertical: 12,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  navRow: {
    flexDirection: 'row',
    gap: 8,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrow: {
    fontSize: 20,
    fontWeight: '700',
  },
  weekHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginVertical: 2,
  },
  selectedDayCell: {
    borderRadius: 14,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedDayText: {
    fontWeight: '800',
  },
  dotsRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  agendaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 14,
  },
  agendaTitleBox: {
    flex: 1,
  },
  agendaDateTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  pastLabel: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  addReminderBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addReminderBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  noRemindersBox: {
    marginHorizontal: 20,
    padding: 20,
    alignItems: 'center',
  },
  noRemindersText: {
    fontSize: 14,
    fontWeight: '500',
  },
  reminderCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reminderMain: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  reminderTime: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  reminderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 8,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
  },
  noteImportanceTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  noteImportanceText: {
    fontSize: 12,
    fontWeight: '500',
  },
  notesText: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
});

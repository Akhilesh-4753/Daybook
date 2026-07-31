import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Icon } from '../components/Icons';

export const CalendarScreen = ({ reminders = [], onAddReminder }) => {
  const { theme } = useTheme();

  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const todayStr = getTodayStr();

  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonthIdx, setCurrentMonthIdx] = useState(new Date().getMonth()); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const handlePrevMonth = () => {
    if (currentMonthIdx === 0) {
      setCurrentMonthIdx(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonthIdx((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIdx === 11) {
      setCurrentMonthIdx(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonthIdx((m) => m + 1);
    }
  };

  // Generate dynamic grid for current month/year
  const calendarDays = useMemo(() => {
    const days = [];
    const firstDayOfMonth = new Date(currentYear, currentMonthIdx, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonthIdx + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0-6
    const totalDaysInMonth = lastDayOfMonth.getDate();

    // Previous month padding days
    const prevMonthLastDay = new Date(currentYear, currentMonthIdx, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDay = prevMonthLastDay - i;
      const prevMonth = currentMonthIdx === 0 ? 11 : currentMonthIdx - 1;
      const prevYear = currentMonthIdx === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(prevDay).padStart(2, '0')}`;
      days.push({ day: prevDay, isCurrentMonth: false, dateStr });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hasRem = reminders.some((r) => r.date === dateStr);
      days.push({ day: d, isCurrentMonth: true, dateStr, hasReminder: hasRem });
    }

    // Next month padding days
    const remainingCells = 42 - days.length;
    for (let d = 1; d <= remainingCells; d++) {
      const nextMonth = currentMonthIdx === 11 ? 0 : currentMonthIdx + 1;
      const nextYear = currentMonthIdx === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, isCurrentMonth: false, dateStr });
    }

    return days;
  }, [currentYear, currentMonthIdx, reminders]);

  const selectedReminders = useMemo(() => {
    return reminders.filter((r) => r.date === selectedDate);
  }, [reminders, selectedDate]);

  const isPastDate = selectedDate < todayStr;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Title Header */}
      <View style={styles.topHeader}>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
          Calendar
        </Text>
        <TouchableOpacity
          style={[styles.todayBtn, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            const today = getTodayStr();
            setSelectedDate(today);
            setCurrentYear(new Date().getFullYear());
            setCurrentMonthIdx(new Date().getMonth());
          }}
        >
          <Text style={styles.todayBtnText}>Today</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Month Selector Bar */}
        <View style={styles.monthHeader}>
          <Text style={[styles.monthText, { color: theme.colors.textPrimary }]}>
            {monthNames[currentMonthIdx]} {currentYear}
          </Text>
          <View style={styles.arrowsRow}>
            <TouchableOpacity style={styles.arrowBtn} onPress={handlePrevMonth}>
              <Text style={[styles.arrowText, { color: theme.colors.textSecondary }]}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.arrowBtn} onPress={handleNextMonth}>
              <Text style={[styles.arrowText, { color: theme.colors.textSecondary }]}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Days of Week Header */}
        <View style={styles.daysOfWeekRow}>
          {daysOfWeek.map((day) => (
            <Text
              key={day}
              style={[styles.dayOfWeekText, { color: theme.colors.textMuted }]}
            >
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.grid}>
          {calendarDays.map((item, index) => {
            const isSelected = item.dateStr === selectedDate;
            const isTodayCell = item.dateStr === todayStr;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  isSelected && [
                    styles.selectedDayCell,
                    { backgroundColor: theme.colors.primary },
                  ],
                  isTodayCell && !isSelected && { borderWidth: 1, borderColor: theme.colors.primary },
                ]}
                onPress={() => setSelectedDate(item.dateStr)}
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
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
  },
  todayBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
  },
  todayBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
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
  monthText: {
    fontSize: 18,
    fontWeight: '700',
  },
  arrowsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  arrowBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  arrowText: {
    fontSize: 24,
    fontWeight: '700',
  },
  daysOfWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  dayOfWeekText: {
    width: 40,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  dayCell: {
    width: '14.28%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    borderRadius: 24,
  },
  selectedDayCell: {
    borderRadius: 24,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '600',
  },
  selectedDayText: {
    fontWeight: '800',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
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
    marginRight: 10,
  },
  agendaDateTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  pastLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  addReminderBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addReminderBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  noRemindersBox: {
    marginHorizontal: 20,
    padding: 20,
    alignItems: 'center',
  },
  noRemindersText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  reminderCard: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
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
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  noteBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
  },
  noteImportanceTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  noteImportanceText: {
    fontSize: 13,
    fontWeight: '500',
  },
  notesText: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
});

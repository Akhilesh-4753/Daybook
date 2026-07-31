import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Icon } from '../components/Icons';

export const CalendarScreen = ({ reminders, onAddReminder }) => {
  const { theme } = useTheme();

  const [selectedDate, setSelectedDate] = useState('2026-07-29');
  const [currentMonth, setCurrentMonth] = useState('July 2026');

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // Days matrix for July 2026 (Starts on Wednesday July 1)
  // July has 31 days
  const calendarDays = [
    { day: 28, isCurrentMonth: false, dateStr: '2026-06-28' },
    { day: 29, isCurrentMonth: false, dateStr: '2026-06-29' },
    { day: 30, isCurrentMonth: false, dateStr: '2026-06-30' },
    { day: 1, isCurrentMonth: true, dateStr: '2026-07-01' },
    { day: 2, isCurrentMonth: true, dateStr: '2026-07-02' },
    { day: 3, isCurrentMonth: true, dateStr: '2026-07-03' },
    { day: 4, isCurrentMonth: true, dateStr: '2026-07-04' },
    { day: 5, isCurrentMonth: true, dateStr: '2026-07-05' },
    { day: 6, isCurrentMonth: true, dateStr: '2026-07-06' },
    { day: 7, isCurrentMonth: true, dateStr: '2026-07-07' },
    { day: 8, isCurrentMonth: true, dateStr: '2026-07-08' },
    { day: 9, isCurrentMonth: true, dateStr: '2026-07-09' },
    { day: 10, isCurrentMonth: true, dateStr: '2026-07-10' },
    { day: 11, isCurrentMonth: true, dateStr: '2026-07-11' },
    { day: 12, isCurrentMonth: true, dateStr: '2026-07-12' },
    { day: 13, isCurrentMonth: true, dateStr: '2026-07-13' },
    { day: 14, isCurrentMonth: true, dateStr: '2026-07-14' },
    { day: 15, isCurrentMonth: true, dateStr: '2026-07-15' },
    { day: 16, isCurrentMonth: true, dateStr: '2026-07-16' },
    { day: 17, isCurrentMonth: true, dateStr: '2026-07-17' },
    { day: 18, isCurrentMonth: true, dateStr: '2026-07-18' },
    { day: 19, isCurrentMonth: true, dateStr: '2026-07-19' },
    { day: 20, isCurrentMonth: true, dateStr: '2026-07-20' },
    { day: 21, isCurrentMonth: true, dateStr: '2026-07-21' },
    { day: 22, isCurrentMonth: true, dateStr: '2026-07-22' },
    { day: 23, isCurrentMonth: true, dateStr: '2026-07-23' },
    { day: 24, isCurrentMonth: true, dateStr: '2026-07-24' },
    { day: 25, isCurrentMonth: true, dateStr: '2026-07-25' },
    { day: 26, isCurrentMonth: true, dateStr: '2026-07-26' },
    { day: 27, isCurrentMonth: true, dateStr: '2026-07-27' },
    { day: 28, isCurrentMonth: true, dateStr: '2026-07-28' },
    { day: 29, isCurrentMonth: true, dateStr: '2026-07-29', hasReminder: true },
    { day: 30, isCurrentMonth: true, dateStr: '2026-07-30', hasReminder: true },
    { day: 31, isCurrentMonth: true, dateStr: '2026-07-31', hasReminder: true },
    { day: 1, isCurrentMonth: false, dateStr: '2026-08-01' },
  ];

  const selectedReminders = reminders.filter(
    (r) => r.date === selectedDate || r.date === '2026-07-30'
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Title Header */}
      <View style={styles.topHeader}>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
          Calendar
        </Text>
        <TouchableOpacity
          style={[styles.todayBtn, { backgroundColor: theme.colors.primary }]}
          onPress={() => setSelectedDate('2026-07-29')}
        >
          <Text style={styles.todayBtnText}>Today</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Month Selector Bar */}
        <View style={styles.monthHeader}>
          <Text style={[styles.monthText, { color: theme.colors.textPrimary }]}>
            {currentMonth}
          </Text>
          <View style={styles.arrowsRow}>
            <TouchableOpacity style={styles.arrowBtn}>
              <Text style={[styles.arrowText, { color: theme.colors.textSecondary }]}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.arrowBtn}>
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
            const hasDots = item.hasReminder || item.dateStr === '2026-07-29';

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  isSelected && [
                    styles.selectedDayCell,
                    { backgroundColor: theme.colors.primary },
                  ],
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

                {hasDots && (
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
                    <View
                      style={[
                        styles.dot,
                        {
                          backgroundColor: isSelected
                            ? '#FFFFFF'
                            : theme.colors.success,
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
          <Text style={[styles.agendaDateTitle, { color: theme.colors.textPrimary }]}>
            Reminders for {selectedDate}
          </Text>
          <TouchableOpacity
            style={[styles.addReminderBtn, { backgroundColor: theme.colors.primary }]}
            onPress={() => onAddReminder(selectedDate)}
          >
            <Text style={styles.addReminderBtnText}>+ Add Reminder</Text>
          </TouchableOpacity>
        </View>

        {/* Reminders List for Selected Date */}
        {selectedReminders.length === 0 ? (
          <View style={styles.noRemindersBox}>
            <Text style={[styles.noRemindersText, { color: theme.colors.textMuted }]}>
              No reminders scheduled for this date.
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
                    💡 Why this date is important:
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
    padding: 6,
  },
  arrowText: {
    fontSize: 22,
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
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  agendaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 14,
  },
  agendaDateTitle: {
    fontSize: 17,
    fontWeight: '700',
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

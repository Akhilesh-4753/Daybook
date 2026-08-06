import { useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { TasksDonutChart, WeeklyBarChart } from '../components/Charts';
import { Icon } from '../components/Icons';
import { useTheme } from '../theme/ThemeContext';

export const ReportsScreen = ({ tasks = [], habits = [], reminders = [], user }) => {
  const { theme } = useTheme();

  // Filter Pills: Today, This Week, This Month, Custom Date
  const filterOptions = ['Today', 'This Week', 'This Month', 'Custom Date'];
  const [timeFilter, setTimeFilter] = useState('Today');

  // Custom Date Range Modal State
  const [isCustomDateModalVisible, setIsCustomDateModalVisible] = useState(false);
  const [isUnderDevelopmentModalVisible, setIsUnderDevelopmentModalVisible] = useState(false);
  const [validationError, setValidationError] = useState('');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const defaultStartStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  }, []);

  // Single Input state per Date
  const [startDateText, setStartDateText] = useState(defaultStartStr);
  const [endDateText, setEndDateText] = useState(todayStr);

  // Active Applied Range String (YYYY-MM-DD)
  const [appliedStartDate, setAppliedStartDate] = useState(defaultStartStr);
  const [appliedEndDate, setAppliedEndDate] = useState(todayStr);

  const categories = ['All', 'Work', 'Health', 'Personal', 'Finance'];

  // Auto-format digits into YYYY-MM-DD hyphenated date structure with deletion support
  const formatAutoDate = (text, isDeleting = false) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 8);
    if (cleaned.length < 4) return cleaned;
    if (cleaned.length === 4) return isDeleting ? cleaned : `${cleaned}-`;
    if (cleaned.length < 6) return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
    if (cleaned.length === 6) return isDeleting ? `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}` : `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-`;
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`;
  };

  const handleStartDateChange = (val) => {
    setValidationError('');
    const isDeleting = val.length < startDateText.length;
    setStartDateText(formatAutoDate(val, isDeleting));
  };

  const handleEndDateChange = (val) => {
    setValidationError('');
    const isDeleting = val.length < endDateText.length;
    setEndDateText(formatAutoDate(val, isDeleting));
  };

  const handleSelectFilter = (filter) => {
    if (filter === 'Custom Date') {
      setIsUnderDevelopmentModalVisible(true);
      return;
    }
    setTimeFilter(filter);
  };

  // Comprehensive Date Validation Function
  const validateCustomDateRange = (sDate, eDate) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const userRegDate = user?.createdAt || defaultStartStr;

    if (sDate.length < 10) return 'Please enter a complete Start Date (YYYY-MM-DD).';
    if (eDate.length < 10) return 'Please enter a complete End Date (YYYY-MM-DD).';

    const validateDateSyntax = (dStr, fieldLabel) => {
      const parts = dStr.split('-');
      if (parts.length !== 3) return `Invalid ${fieldLabel} format.`;
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);

      if (isNaN(year) || year < 2000 || year > 2100) {
        return `Invalid Year in ${fieldLabel}. Please enter a valid year.`;
      }
      if (isNaN(month) || month < 1 || month > 12) {
        return `Invalid Month in ${fieldLabel}. Month must be between 01 and 12.`;
      }

      // Check max days in month (handling leap years)
      const maxDaysInMonth = new Date(year, month, 0).getDate();
      if (isNaN(day) || day < 1 || day > maxDaysInMonth) {
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const mName = monthNames[month - 1];
        if (month === 2) {
          const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
          return `Invalid Day in ${fieldLabel}. February ${year} has a maximum of ${maxDaysInMonth} days (${isLeap ? 'Leap Year' : 'Non-Leap Year'}).`;
        }
        return `Invalid Day in ${fieldLabel}. ${mName} ${year} has a maximum of ${maxDaysInMonth} days.`;
      }
      return null;
    };

    // 1. Syntax & Calendar Validation (Month 1-12, Days in month, Leap year)
    const startSyntaxErr = validateDateSyntax(sDate, 'Start Date');
    if (startSyntaxErr) return startSyntaxErr;

    const endSyntaxErr = validateDateSyntax(eDate, 'End Date');
    if (endSyntaxErr) return endSyntaxErr;

    // 2. Future Date Check (No future dates allowed)
    if (eDate > todayStr) {
      return `Future dates are not allowed. End Date cannot be beyond today (${todayStr}).`;
    }
    if (sDate > todayStr) {
      return `Future dates are not allowed. Start Date cannot be beyond today (${todayStr}).`;
    }

    // 3. Registration / First Usage Date Check
    if (sDate < userRegDate) {
      return `You started using Daybook on ${userRegDate}. Please select a Start Date on or after ${userRegDate}.`;
    }

    // 4. Start Date <= End Date check
    if (sDate > eDate) {
      return 'Start Date cannot be after End Date.';
    }

    return null; // Passed all validations
  };

  const handleApplyCustomDate = () => {
    const errorMsg = validateCustomDateRange(startDateText, endDateText);
    if (errorMsg) {
      setValidationError(errorMsg);
      return;
    }

    setAppliedStartDate(startDateText);
    setAppliedEndDate(endDateText);
    setTimeFilter('Custom Date');
    setIsCustomDateModalVisible(false);
  };

  // Calculate filtered reminders based on selected time filter
  const filteredReminders = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (timeFilter === 'Today') {
      return reminders.filter((r) => r.date && r.date.trim() === todayStr);
    } else if (timeFilter === 'This Week') {
      const dayOfWeek = today.getDay();
      const distanceToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(today);
      monday.setDate(today.getDate() + distanceToMon);
      const monStr = monday.toISOString().split('T')[0];

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const sunStr = sunday.toISOString().split('T')[0];

      return reminders.filter((r) => r.date && r.date.trim() >= monStr && r.date.trim() <= sunStr);
    } else if (timeFilter === 'This Month') {
      const currentMonthStr = todayStr.substring(0, 7); // 'YYYY-MM'
      return reminders.filter((r) => r.date && r.date.trim().startsWith(currentMonthStr));
    } else if (timeFilter === 'Custom Date') {
      return reminders.filter((r) => r.date && r.date.trim() >= appliedStartDate && r.date.trim() <= appliedEndDate);
    }
    return reminders;
  }, [reminders, timeFilter, appliedStartDate, appliedEndDate]);

  // Calculate filtered tasks based on selected time filter
  const filteredTasks = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (timeFilter === 'Today') {
      return tasks.filter((t) => t.date && t.date.trim() === todayStr);
    } else if (timeFilter === 'This Week') {
      const dayOfWeek = today.getDay();
      const distanceToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(today);
      monday.setDate(today.getDate() + distanceToMon);
      const monStr = monday.toISOString().split('T')[0];

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const sunStr = sunday.toISOString().split('T')[0];

      return tasks.filter((t) => t.date && t.date.trim() >= monStr && t.date.trim() <= sunStr);
    } else if (timeFilter === 'This Month') {
      const currentMonthStr = todayStr.substring(0, 7); // 'YYYY-MM'
      return tasks.filter((t) => t.date && t.date.trim().startsWith(currentMonthStr));
    } else if (timeFilter === 'Custom Date') {
      return tasks.filter((t) => t.date && t.date.trim() >= appliedStartDate && t.date.trim() <= appliedEndDate);
    }
    return tasks;
  }, [tasks, timeFilter, appliedStartDate, appliedEndDate]);

  const completedCount = useMemo(() => {
    return filteredTasks.filter((t) => t.completed).length;
  }, [filteredTasks]);

  const pendingCount = useMemo(() => {
    return filteredTasks.filter((t) => !t.completed).length;
  }, [filteredTasks]);

  const totalTasksCount = completedCount + pendingCount;

  const productivityScore = useMemo(() => {
    if (totalTasksCount === 0) return 0;
    return Math.round((completedCount / totalTasksCount) * 100);
  }, [completedCount, totalTasksCount]);

  const habitsRate = useMemo(() => {
    if (!habits || habits.length === 0) return 0;

    const completedHabitsCount = habits.filter((h) => {
      if (timeFilter === 'Today') {
        if (h.completedToday) return true;
        const matchingTask = filteredTasks.find(
          (t) =>
            (t.habitId && t.habitId === h.id && t.completed) ||
            (t.title && t.title.trim().toLowerCase() === h.title.trim().toLowerCase() && t.completed)
        );
        return Boolean(matchingTask);
      } else {
        const matchingTask = filteredTasks.find(
          (t) =>
            (t.habitId && t.habitId === h.id && t.completed) ||
            (t.title && t.title.trim().toLowerCase() === h.title.trim().toLowerCase() && t.completed)
        );
        return Boolean(matchingTask);
      }
    }).length;

    if (completedHabitsCount === 0) return 0;
    return Math.round((completedHabitsCount / habits.length) * 100);
  }, [habits, filteredTasks, timeFilter]);

  // Calculate real daily progress data for current week or custom filter
  const weeklyProgressData = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const dayOfWeek = today.getDay();
    const distanceToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMon);

    const daysList = [
      { name: 'Mon', offset: 0 },
      { name: 'Tue', offset: 1 },
      { name: 'Wed', offset: 2 },
      { name: 'Thu', offset: 3 },
      { name: 'Fri', offset: 4 },
      { name: 'Sat', offset: 5 },
      { name: 'Sun', offset: 6 },
    ];

    return daysList.map((item) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + item.offset);
      const dateStr = d.toISOString().split('T')[0];

      const dayTasks = filteredTasks.filter((t) => {
        if (t.date) {
          return t.date === dateStr;
        }
        return dateStr === todayStr;
      });

      const completed = dayTasks.filter((t) => t.completed).length;
      const total = dayTasks.length;

      let percent = 0;
      if (total > 0) {
        percent = Math.round((completed / total) * 100);
      }

      return {
        day: item.name,
        date: dateStr,
        val: percent,
        completed,
        total,
        isToday: dateStr === todayStr,
      };
    });
  }, [filteredTasks]);

  const categoryBreakdown = useMemo(() => {
    const counts = { Work: 0, Health: 0, Personal: 0, Finance: 0 };
    filteredTasks.forEach((t) => {
      const cat = t.category || 'Personal';
      if (counts[cat] !== undefined) {
        counts[cat] += 1;
      } else {
        counts.Personal += 1;
      }
    });
    return counts;
  }, [filteredTasks]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Clean Header: Title Only */}
      <View style={styles.topHeader}>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
          Reports & Analytics
        </Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Filter Pills Bar: Today, This Week, This Month, Custom Date */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterPill,
                {
                  backgroundColor:
                    timeFilter === filter
                      ? theme.colors.primary
                      : theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => handleSelectFilter(filter)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  style={[
                    styles.filterPillText,
                    { color: timeFilter === filter ? '#FFFFFF' : theme.colors.textSecondary },
                  ]}
                >
                  {filter}
                </Text>
                {filter === 'Custom Date' && (
                  <Icon
                    name="calendar"
                    size={14}
                    color={timeFilter === filter ? '#FFFFFF' : theme.colors.primary}
                    style={{ marginLeft: 6 }}
                  />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Read-Only Informational Range Banner */}
        {timeFilter === 'Custom Date' && (
          <View
            style={[
              styles.activeCustomBanner,
              { backgroundColor: 'rgba(99, 102, 241, 0.12)', borderColor: theme.colors.primary },
            ]}
          >
            <Icon name="calendar" size={16} color={theme.colors.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.activeCustomText, { color: theme.colors.primary }]}>
              Filtered Range: {appliedStartDate} to {appliedEndDate}
            </Text>
          </View>
        )}

        {/* 4 Summary Stat Cards */}
        <View style={styles.statsGrid}>
          <View
            style={[
              styles.statBox,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <Text style={[styles.statVal, { color: theme.colors.success }]}>
              {completedCount}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
              Completed
            </Text>
          </View>

          <View
            style={[
              styles.statBox,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <Text style={[styles.statVal, { color: theme.colors.danger }]}>
              {pendingCount}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
              Pending
            </Text>
          </View>

          <View
            style={[
              styles.statBox,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <Text style={[styles.statVal, { color: theme.colors.primary }]}>
              {filteredReminders.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
              Reminders
            </Text>
          </View>

          <View
            style={[
              styles.statBox,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <Text style={[styles.statVal, { color: theme.colors.secondary }]}>
              {habitsRate}%
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
              Habits Rate
            </Text>
          </View>
        </View>

        {/* Productivity Score Banner */}
        <View
          style={[
            styles.productivityBanner,
            { backgroundColor: 'rgba(99, 102, 241, 0.12)', borderColor: theme.colors.primaryLight },
          ]}
        >
          <View style={styles.bannerIconBox}>
            <Text style={styles.bannerEmoji}>⚡</Text>
          </View>
          <View style={styles.bannerContent}>
            <Text style={[styles.bannerTitle, { color: theme.colors.textPrimary }]}>
              Productivity Score: {productivityScore}%
            </Text>
            <Text style={[styles.bannerSub, { color: theme.colors.textSecondary }]}>
              {productivityScore >= 80
                ? `Outstanding performance for selected period!`
                : `Keep completing your planned activities!`}
            </Text>
          </View>
        </View>

        {/* Tasks Overview Donut Chart */}
        <TasksDonutChart completedCount={completedCount} pendingCount={pendingCount} />

        {/* Weekly Progress Bar Chart */}
        <WeeklyBarChart data={weeklyProgressData} />

        {/* Category Filters Breakdown */}
        <View style={styles.categoryHeader}>
          <Text style={[styles.categoryTitle, { color: theme.colors.textPrimary }]}>
            Category Breakdown ({timeFilter === 'Custom Date' ? `${appliedStartDate} - ${appliedEndDate}` : timeFilter})
          </Text>
        </View>

        <View style={styles.categoryGrid}>
          {categories.slice(1).map((cat) => (
            <View
              key={cat}
              style={[
                styles.categoryCard,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
              ]}
            >
              <Text style={[styles.catName, { color: theme.colors.textPrimary }]}>
                {cat}
              </Text>
              <Text style={[styles.catCount, { color: theme.colors.primary }]}>
                {categoryBreakdown[cat] || 0} Tasks
              </Text>
            </View>
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Under Development Feature Modal for Custom Date */}
      <Modal
        visible={isUnderDevelopmentModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsUnderDevelopmentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border, alignItems: 'center' },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
              <Icon name="calendar" size={30} color={theme.colors.primary} />
            </View>

            <Text style={[styles.devModalTitle, { color: theme.colors.textPrimary }]}>
              Custom Date Filter
            </Text>

            <Text style={[styles.devModalSub, { color: theme.colors.textSecondary }]}>
              This feature is currently under development and will be available in a future update.
            </Text>

            <TouchableOpacity
              style={[styles.devModalOkBtn, { backgroundColor: theme.colors.primary }]}
              onPress={() => setIsUnderDevelopmentModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.devModalOkBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Custom Date Range Filter Modal */}
      <Modal
        visible={isCustomDateModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsCustomDateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={[styles.calendarIconCircle, { backgroundColor: theme.colors.primary }]}>
                <Icon name="calendar" size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                Select Custom Date Range
              </Text>
              <Text style={[styles.modalSub, { color: theme.colors.textSecondary }]}>
                Filter reports data between start and end dates
              </Text>
            </View>

            {/* Validation Error Banner */}
            {validationError ? (
              <View style={styles.errorBox}>
                <Icon name="ban" size={16} color="#EF4444" style={{ marginRight: 8 }} />
                <Text style={styles.errorText}>{validationError}</Text>
              </View>
            ) : null}

            {/* Single Start Date Input Field with Auto Hyphen Formatting */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
                Start Date (YYYY-MM-DD)
              </Text>
              <TextInput
                style={[
                  styles.dateInput,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    color: theme.colors.textPrimary,
                    borderColor: validationError && validationError.includes('Start Date') ? '#EF4444' : theme.colors.border,
                  },
                ]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="number-pad"
                maxLength={10}
                value={startDateText}
                onChangeText={handleStartDateChange}
              />
            </View>

            {/* Single End Date Input Field with Auto Hyphen Formatting */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
                End Date (YYYY-MM-DD)
              </Text>
              <TextInput
                style={[
                  styles.dateInput,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    color: theme.colors.textPrimary,
                    borderColor: validationError && validationError.includes('End Date') ? '#EF4444' : theme.colors.border,
                  },
                ]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="number-pad"
                maxLength={10}
                value={endDateText}
                onChangeText={handleEndDateChange}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: theme.colors.border }]}
                onPress={() => setIsCustomDateModalVisible(false)}
              >
                <Text style={[styles.cancelBtnText, { color: theme.colors.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.applyBtn, { backgroundColor: theme.colors.primary }]}
                onPress={handleApplyCustomDate}
              >
                <Text style={styles.applyBtnText}>Apply Filter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 24,
    fontWeight: '800',
  },
  scroll: {
    flex: 1,
  },
  filterScroll: {
    marginVertical: 10,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 8,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  activeCustomBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  activeCustomText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginVertical: 10,
    gap: 10,
  },
  statBox: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  statVal: {
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  productivityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  bannerIconBox: {
    marginRight: 14,
  },
  bannerEmoji: {
    fontSize: 28,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  bannerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  categoryHeader: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  catName: {
    fontSize: 14,
    fontWeight: '700',
  },
  catCount: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
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
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 14,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  dateInput: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
    outlineStyle: 'none',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  applyBtn: {
    flex: 1.5,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  devModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  devModalSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  devModalOkBtn: {
    width: '100%',
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  devModalOkBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

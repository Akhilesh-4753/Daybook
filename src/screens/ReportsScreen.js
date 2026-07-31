import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { TasksDonutChart, WeeklyBarChart } from '../components/Charts';

export const ReportsScreen = ({ tasks = [], habits = [], reminders = [], user }) => {
  const { theme } = useTheme();

  // Order: Today, This Week, This Month, Custom Date
  const filterOptions = ['Today', 'This Week', 'This Month', 'Custom Date'];
  const [timeFilter, setTimeFilter] = useState('Today');

  const categories = ['All', 'Work', 'Health', 'Personal', 'Finance'];

  // Calculate filtered tasks based on selected time filter
  const filteredTasks = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (timeFilter === 'Today') {
      return tasks.filter((t) => !t.date || t.date === todayStr);
    } else if (timeFilter === 'This Week') {
      // Find current week Monday to Sunday
      const dayOfWeek = today.getDay();
      const distanceToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(today);
      monday.setDate(today.getDate() + distanceToMon);
      const monStr = monday.toISOString().split('T')[0];

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const sunStr = sunday.toISOString().split('T')[0];

      return tasks.filter((t) => {
        if (!t.date) return true;
        return t.date >= monStr && t.date <= sunStr;
      });
    } else if (timeFilter === 'This Month') {
      const currentMonthStr = todayStr.substring(0, 7); // 'YYYY-MM'
      return tasks.filter((t) => !t.date || t.date.startsWith(currentMonthStr));
    }
    return tasks;
  }, [tasks, timeFilter]);

  const completedCount = useMemo(() => {
    return filteredTasks.filter((t) => t.completed).length;
  }, [filteredTasks]);

  const pendingCount = useMemo(() => {
    return filteredTasks.filter((t) => !t.completed).length;
  }, [filteredTasks]);

  const totalTasksCount = completedCount + pendingCount;

  const productivityScore = useMemo(() => {
    if (totalTasksCount === 0) return 100;
    return Math.round((completedCount / totalTasksCount) * 100);
  }, [completedCount, totalTasksCount]);

  const habitsRate = useMemo(() => {
    if (habits.length === 0) return 100;
    const completedHabits = habits.filter((h) => h.completedToday).length;
    return Math.round((completedHabits / habits.length) * 100);
  }, [habits]);

  // Calculate real daily progress data for current week (Mon - Sun)
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

      const dayTasks = tasks.filter((t) => {
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
  }, [tasks]);

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
      {/* Header */}
      <View style={styles.topHeader}>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
          Reports & Analytics
        </Text>

        <TouchableOpacity
          style={[
            styles.filterDropdown,
            {
              backgroundColor: theme.colors.surfaceVariant,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.filterDropdownText, { color: theme.colors.primary }]}>
            {timeFilter} ▾
          </Text>
        </TouchableOpacity>
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
              onPress={() => setTimeFilter(filter)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  { color: timeFilter === filter ? '#FFFFFF' : theme.colors.textSecondary },
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

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
              {reminders.length}
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
                ? `Outstanding performance for ${timeFilter.toLowerCase()}!`
                : `Keep completing your planned activities for ${timeFilter.toLowerCase()}!`}
            </Text>
          </View>
        </View>

        {/* Tasks Overview Donut Chart */}
        <TasksDonutChart completedCount={completedCount} pendingCount={pendingCount} />

        {/* Weekly Progress Bar Chart (Dynamic real data) */}
        <WeeklyBarChart data={weeklyProgressData} />

        {/* Category Filters Breakdown */}
        <View style={styles.categoryHeader}>
          <Text style={[styles.categoryTitle, { color: theme.colors.textPrimary }]}>
            Category Breakdown ({timeFilter})
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
    fontSize: 24,
    fontWeight: '800',
  },
  filterDropdown: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterDropdownText: {
    fontSize: 13,
    fontWeight: '700',
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
});

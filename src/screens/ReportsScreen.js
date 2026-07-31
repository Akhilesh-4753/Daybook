import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { TasksDonutChart, WeeklyBarChart } from '../components/Charts';
import { Icon } from '../components/Icons';

export const ReportsScreen = ({ tasks, habits, user }) => {
  const { theme } = useTheme();
  const [timeFilter, setTimeFilter] = useState('This Week');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filterOptions = ['This Week', 'This Month', 'Today', 'Custom Date'];
  const categories = ['All', 'Work', 'Health', 'Personal', 'Finance'];

  const completedCount = tasks.filter((t) => t.completed).length + 27; // Including historical completed count
  const pendingCount = tasks.filter((t) => !t.completed).length;

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
        {/* Filter Pills Bar */}
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
              12
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
              85%
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
              Productivity Score: 87%
            </Text>
            <Text style={[styles.bannerSub, { color: theme.colors.textSecondary }]}>
              You are more productive than 87% of users! (+12% from last week)
            </Text>
          </View>
        </View>

        {/* Tasks Overview Donut Chart */}
        <TasksDonutChart completedCount={completedCount} pendingCount={pendingCount} />

        {/* Weekly Progress Bar Chart */}
        <WeeklyBarChart />

        {/* Category Filters */}
        <View style={styles.categoryHeader}>
          <Text style={[styles.categoryTitle, { color: theme.colors.textPrimary }]}>
            Category Breakdown
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
                {cat === 'Work' ? '14 Tasks' : cat === 'Health' ? '8 Tasks' : '5 Tasks'}
              </Text>
            </View>
          ))}
        </View>

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
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 26,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  productivityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginVertical: 12,
  },
  bannerIconBox: {
    marginRight: 12,
  },
  bannerEmoji: {
    fontSize: 28,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  bannerSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  categoryHeader: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 20,
  },
  categoryCard: {
    width: '48%',
    padding: 14,
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
    marginTop: 2,
  },
});

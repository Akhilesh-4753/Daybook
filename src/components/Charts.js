import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export const TasksDonutChart = ({ completedCount = 0, pendingCount = 0 }) => {
  const { theme } = useTheme();
  const total = completedCount + pendingCount;
  const completedPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const pendingPercent = total > 0 ? 100 - completedPercent : 0;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
        Tasks Overview
      </Text>

      <View style={styles.chartRow}>
        {/* Ring Chart representation */}
        <View
          style={[
            styles.donutOuter,
            {
              borderColor: theme.colors.success,
              backgroundColor: theme.colors.surfaceVariant,
            },
          ]}
        >
          <View
            style={[
              styles.donutInner,
              {
                backgroundColor: theme.colors.card,
              },
            ]}
          >
            <Text style={[styles.centerPercent, { color: theme.colors.textPrimary }]}>
              {completedPercent}%
            </Text>
            <Text style={[styles.centerSub, { color: theme.colors.textMuted }]}>
              Completed
            </Text>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.success }]} />
            <Text style={[styles.legendLabel, { color: theme.colors.textSecondary }]}>
              Completed ({completedCount})
            </Text>
            <Text style={[styles.legendVal, { color: theme.colors.textPrimary }]}>
              {completedPercent}%
            </Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.danger }]} />
            <Text style={[styles.legendLabel, { color: theme.colors.textSecondary }]}>
              Pending ({pendingCount})
            </Text>
            <Text style={[styles.legendVal, { color: theme.colors.textPrimary }]}>
              {pendingPercent}%
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export const WeeklyBarChart = ({ data = [] }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
          Daily Progress
        </Text>
        <Text style={[styles.timeLabel, { color: theme.colors.textMuted }]}>
          This Week
        </Text>
      </View>

      <View style={styles.barChartContainer}>
        {data.map((item) => {
          const val = item.val || 0;
          return (
            <View key={item.day} style={styles.barColumn}>
              <Text
                style={[
                  styles.countBadgeText,
                  { color: item.isToday ? theme.colors.primary : theme.colors.textMuted },
                ]}
              >
                {item.total > 0 ? `${item.completed}/${item.total}` : '0'}
              </Text>

              <View
                style={[
                  styles.barTrack,
                  { backgroundColor: theme.colors.surfaceVariant },
                  item.isToday && { borderWidth: 1, borderColor: theme.colors.primary },
                ]}
              >
                <View
                  style={[
                    styles.barFill,
                    {
                      height: val > 0 ? `${val}%` : item.total > 0 ? '10%' : '0%',
                      backgroundColor: val === 100 ? theme.colors.success : item.total > 0 && val === 0 ? '#EF4444' : theme.colors.primary,
                    },
                  ]}
                />
              </View>

              <Text
                style={[
                  styles.dayLabel,
                  {
                    color: item.isToday ? theme.colors.primary : theme.colors.textMuted,
                    fontWeight: item.isToday ? '800' : '600',
                  },
                ]}
              >
                {item.day}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  donutOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutInner: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerPercent: {
    fontSize: 20,
    fontWeight: '800',
  },
  centerSub: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  legendContainer: {
    justifyContent: 'center',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 13,
    fontWeight: '500',
    width: 100,
  },
  legendVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    paddingTop: 10,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  barTrack: {
    width: 18,
    height: 90,
    borderRadius: 9,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 9,
  },
  dayLabel: {
    fontSize: 12,
    marginTop: 6,
  },
});

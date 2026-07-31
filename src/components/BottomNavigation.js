import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Icon } from './Icons';

export const BottomNavigation = ({ activeTab, onTabPress }) => {
  const { theme } = useTheme();

  const tabs = [
    { id: 'today', label: 'Today', icon: 'home' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar' },
    { id: 'diary', label: 'Diary', icon: 'diary' },
    { id: 'reports', label: 'Reports', icon: 'reports' },
    { id: 'more', label: 'User', icon: 'user' },
  ];

  return (
    <View
      style={[
        styles.navContainer,
        {
          backgroundColor: theme.colors.tabBar,
          borderTopColor: theme.colors.tabBarBorder,
          shadowColor: theme.colors.shadow,
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const iconColor = isActive ? theme.colors.iconActive : theme.colors.iconInactive;

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabItem}
            onPress={() => onTabPress(tab.id)}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrapper}>
              <Icon name={tab.icon} size={22} color={iconColor} />
            </View>
            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? theme.colors.primary : theme.colors.textMuted },
                isActive && styles.activeTabLabel,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 64,
    borderTopWidth: 1,
    paddingHorizontal: 10,
    elevation: 12,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  iconWrapper: {
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  activeTabLabel: {
    fontWeight: '700',
  },
});

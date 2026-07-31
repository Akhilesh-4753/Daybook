import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Icon } from '../components/Icons';

// Screens
import { TodayScreen } from '../screens/TodayScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { DiaryScreen } from '../screens/DiaryScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { MoreScreen } from '../screens/MoreScreen';
import { HabitsScreen } from '../screens/HabitsScreen';

const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation, onFabPress }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined ? options.tabBarLabel : route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let iconName = 'home';
        if (route.name === 'Today') iconName = 'home';
        else if (route.name === 'Calendar') iconName = 'calendar';
        else if (route.name === 'Diary') iconName = 'diary';
        else if (route.name === 'Insights') iconName = 'reports';
        else if (route.name === 'More') iconName = 'more';

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.7}
            style={styles.tabItem}
          >
            <Icon
              name={iconName}
              size={22}
              color={isFocused ? theme.colors.primary : theme.colors.textMuted}
            />
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isFocused ? theme.colors.primary : theme.colors.textMuted,
                  fontWeight: isFocused ? '700' : '500',
                },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export const BottomNavigator = ({ onFabPress }) => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} onFabPress={onFabPress} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Diary" component={DiaryScreen} />
      <Tab.Screen name="Insights" options={{ tabBarLabel: 'Insights' }} component={ReportsScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    height: 64,
    borderTopWidth: 1,
    paddingBottom: 6,
    paddingTop: 6,
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 3,
  },
});

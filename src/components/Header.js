import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';

import { Icon } from './Icons';

export const Header = ({ userName = 'Akhilesh', user: propUser, onProfilePress }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { user: authUser } = useAuth();

  const user = propUser || authUser;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning,';
    if (hour >= 12 && hour < 17) return 'Good Afternoon,';
    if (hour >= 17 && hour < 21) return 'Good Evening,';
    return 'Good Night,';
  };

  const getFormattedDate = () => {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return new Date().toLocaleDateString('en-US', options);
  };

  const displayName = user?.name || userName || 'Akhilesh';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      {/* Left Main Row: Profile Photo Avatar + Content (Greeting, Name, Date) */}
      <View style={styles.leftRow}>
        <TouchableOpacity
          style={styles.avatarWrapper}
          onPress={onProfilePress}
          activeOpacity={0.8}
        >
          {user?.photoUri ? (
            <Image source={{ uri: user.photoUri }} style={styles.avatarImg} resizeMode="cover" />
          ) : (
            <View style={[styles.avatarBg, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.textContainer}>
          <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
            {getGreeting()}
          </Text>
          <View style={styles.nameRow}>
            <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>
              {displayName}
            </Text>
            <Text style={styles.waveEmoji}>👋</Text>
          </View>
          <Text style={[styles.dateText, { color: theme.colors.textMuted }]}>
            {getFormattedDate()}
          </Text>
        </View>
      </View>

      {/* Right Header Action Icon: Dark/Light Mode Toggle */}
      <TouchableOpacity
        style={styles.themeToggleBtn}
        onPress={toggleTheme}
        activeOpacity={0.7}
      >
        <Icon name={isDarkMode ? 'sun' : 'moon'} size={24} color={isDarkMode ? '#F59E0B' : theme.colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    marginRight: 14,
  },
  avatarImg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  avatarBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  textContainer: {
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 13,
    fontWeight: '500',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  waveEmoji: {
    fontSize: 20,
    marginLeft: 6,
  },
  dateText: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '400',
  },
  themeToggleBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/context/AuthContext';
import { SecurityProvider } from '../src/context/SecurityContext';
import { TaskProvider } from '../src/context/TaskContext';
import { ThemeProvider } from '../src/theme/ThemeContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SecurityProvider>
        <AuthProvider>
          <TaskProvider>
            <ThemeProvider>
              <Slot />
            </ThemeProvider>
          </TaskProvider>
        </AuthProvider>
      </SecurityProvider>
    </SafeAreaProvider>
  );
}

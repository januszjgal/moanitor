import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { ColorValue } from 'react-native';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: ColorValue;
}) {
  return <Ionicons size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface, // Use a darker surface color for the navbar
          borderTopColor: theme.colors.secondary, // Optional: Add a border for separation
          //paddingVertical: theme.spacing.md, // Add vertical padding
          height: 55,
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: {
          fontWeight: 'bold',
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Log Entry',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="add-circle" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="calendar" color={color} />
          ),
        }}
      />
        <Tabs.Screen 
        name="settings" 
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
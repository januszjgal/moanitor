// hooks/useTheme.ts
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from '@/styles/theme';

export function useTheme() {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkTheme : lightTheme;
};
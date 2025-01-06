import React from 'react';
import { View, type ViewProps } from 'react-native';
import { useTheme } from '@/hooks/useTheme'; // Import your custom theme hook

export type ThemedViewProps = ViewProps & {
  style?: any;
};

export function ThemedView({ style, ...otherProps }: ThemedViewProps) {
  const theme = useTheme(); // Use your theme hook to get the current theme
  return <View style={[{ backgroundColor: theme.colors.background }, style]} {...otherProps} />;
}
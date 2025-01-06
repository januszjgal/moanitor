// styles/styles.ts
import { StyleSheet, Platform } from 'react-native';
import { Theme } from './theme';

// 1) Convert Calendar styles
export const createCalendarStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.secondary,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      margin: theme.spacing.md,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    monthText: {
      color: theme.colors.text.primary,
      fontSize: 20,
      fontWeight: '600',
    },
    navigationButton: {
      color: theme.colors.primary,
    },
    daysGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    dayHeader: {
      width: '14.28%',
      textAlign: 'center',
      color: theme.colors.text.secondary,
      padding: theme.spacing.xs,
    },
    dayCell: {
      width: '14.28%',
      aspectRatio: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dayText: {
      color: theme.colors.text.primary,
    },
    selectedDay: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
    },
    dayWithEntry: {
      backgroundColor: theme.colors.primary,
      opacity: 0.8,
      borderRadius: theme.borderRadius.sm,
    },
  });

// 2) Convert Button styles
export const createButtonStyles = (theme: Theme) =>
  StyleSheet.create({
    primary: {
      backgroundColor: theme.colors.button.primary,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
    },
    secondary: {
      backgroundColor: theme.colors.button.secondary,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
    },
    buttonText: {
      color: theme.colors.text.primary,
      fontSize: 16,
      fontWeight: '500',
    },
  });

// 3) Convert History styles
export const createHistoryStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.background,
    },
    toggleContainer: {
      flexDirection: 'row',
      marginBottom: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    toggleButton: {
      flex: 1,
      padding: theme.spacing.md,
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
    },
    toggleButtonActive: {
      backgroundColor: theme.colors.primary,
      color: '#FFFFFF', // Ensure white text color
    },
    listContainer: {
      flex: 1,
    },
    entryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },
    entryDate: {
      fontSize: 16,
      color: theme.colors.text.primary,
    },
    entryItem: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.sm,
      // Platform-specific shadows
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 1.41,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    deleteButton: {
      padding: theme.spacing.sm,
    },
    soloIndicator: {
      fontSize: 12,
      marginTop: 4,
    },
    calendarWrapper: {
      borderRadius: theme.borderRadius.lg, // Rounded corners
      overflow: 'hidden', // Ensure content respects the border radius
      backgroundColor: theme.colors.surface, // Matches calendar background
    },
  });
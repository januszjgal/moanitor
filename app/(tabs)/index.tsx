import React, { useState } from 'react';
import { StyleSheet, Platform, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TouchableOpacity } from 'react-native';
import { createButtonStyles } from '@/styles/styles'; 
import { useEntries } from '@/hooks/useEntries';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

export default function LogScreen() {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSolo, setIsSolo] = useState(false);
  const { addEntry } = useEntries();
  //theming
  const theme = useTheme();
  const styles = createLogScreenStyles(theme);
  const buttonStyles = createButtonStyles(theme);

  // Show the appropriate picker(s) depending on the platform
  const showPicker = () => {
    if (Platform.OS === 'ios') {
      // iOS can do datetime in a single picker
      setShowDatePicker(true);
    } else {
      // Android, show the date picker first
      setShowDatePicker(true);
    }
  };

  // Called when the date picker changes
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false); // Hide the date picker
    if (event.type !== 'dismissed' && selectedDate) {
      setDate(selectedDate);

      // On Android, once the user picks a date, show the time picker next
      if (Platform.OS === 'android') {
        setShowTimePicker(true);
      }
    }
  };

  // Called when the time picker changes (Android-only in this example)
  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false); // Hide the time picker
    if (event.type !== 'dismissed' && selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    try {
      const newEntry = {
        id: Date.now().toString(),
        date: date.toISOString(),
        solo: isSolo, // Add the solo property
      };
      
      await addEntry(newEntry);
      setDate(new Date());
      setTimeout(() => {
        router.push("/history");
      }, 100);
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Log New Entry</ThemedText>
      
      <TouchableOpacity
        style={[buttonStyles.secondary, styles.dateButton]}
        onPress={showPicker}
      >
        <ThemedText type="defaultSemiBold">
          {date.toLocaleString()}
        </ThemedText>
      </TouchableOpacity>


      {/* iOS: single picker with mode="datetime" */}
      {showDatePicker && Platform.OS === 'ios' && (
        <DateTimePicker
          value={date}
          mode="datetime"
          onChange={handleDateChange}
          display="spinner" // or "inline" if you want the inline style on iOS
        />
      )}

      {/* Android: date picker first */}
      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={date}
          mode="date"
          onChange={handleDateChange}
          display="calendar" // ensures calendar UI on Android
        />
      )}

      {/* Android: time picker second */}
      {showTimePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={date}
          mode="time"
          onChange={handleTimeChange}
          display="clock" // ensures clock UI on Android
        />
      )}

      <TouchableOpacity 
        style={styles.checkboxContainer}
        onPress={() => setIsSolo(!isSolo)}
      >
        <View style={[styles.checkbox, isSolo && styles.checkboxChecked]}>
          {isSolo && <Ionicons name="checkmark" size={16} color="white" />}
        </View>
        <ThemedText style={styles.checkboxLabel}>Solo</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[buttonStyles.primary, styles.submitButton]}
        onPress={handleSubmit}
      >
        <ThemedText style={buttonStyles.buttonText}>
        😩
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const createLogScreenStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    dateButton: {
      width: '100%',
      marginVertical: theme.spacing.md,
    },
    submitButton: {
      width: '100%',
      marginTop: theme.spacing.md,
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: theme.spacing.sm,
      alignSelf: 'flex-start',
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      marginRight: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxChecked: {
      backgroundColor: theme.colors.primary,
    },
    checkboxLabel: {
      fontSize: 16,
      color: theme.colors.text.primary, // optional if you want to match text color
    },
  });


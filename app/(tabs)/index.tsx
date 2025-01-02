// index.tsx

import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  Platform, 
  View, 
  TouchableOpacity,
  GestureResponderEvent
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { createButtonStyles } from '@/styles/styles'; 
import { useEntries } from '@/hooks/useEntries';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Celebration } from '@/components/Celebration';

export default function LogScreen() {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSolo, setIsSolo] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number } | null>(null);
  const { addEntry } = useEntries();
  const theme = useTheme();
  const styles = createLogScreenStyles(theme);
  const buttonStyles = createButtonStyles(theme);

  // Create a ref for the submit button's container View
  const submitButtonRef = useRef<View>(null);

  // Handle press to capture button's position and submit
  const handlePress = () => {
    if (submitButtonRef.current) {
      // Measure the position of the View relative to the window
      submitButtonRef.current.measureInWindow((x, y, width, height) => {
        // Calculate the center position of the button
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const position = { x: centerX, y: centerY };
        console.log('Measured Button Position:', position);
        handleSubmit(position);
      });
    }
  };

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

  const handleSubmit = async (position: { x: number; y: number }) => {
    try {
      const newEntry = {
        id: Date.now().toString(),
        date: date.toISOString(),
        solo: isSolo,
      };
      
      await addEntry(newEntry);
      setDate(new Date());
      
      console.log('Touch Position Before Celebration:', position);
      
      // Set touchPosition and show celebration
      setTouchPosition(position);
      setShowCelebration(true);
      
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Celebration 
        visible={showCelebration && touchPosition !== null}
        onComplete={() => {
          console.log('Ending celebration...');
          setShowCelebration(false);
          router.push("/history");
        }}
        origin={touchPosition || { x: 0, y: 0 }}
      />
      <ThemedText type="title">Finished?</ThemedText>
      
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

      {/* Wrap TouchableOpacity in a View to attach the ref */}
      <View ref={submitButtonRef} style={styles.submitButtonContainer}>
        <TouchableOpacity
          style={[buttonStyles.primary, styles.submitButton]}
          onPressIn={(event: GestureResponderEvent) => {
            // Get the raw touch event
            const touch = event.nativeEvent;
            const position = {
              x: touch.pageX,
              y: touch.pageY
            };
            console.log('Raw Touch Position:', position);
            handleSubmit(position);
          }}
        >
          <View style={styles.submitButtonContent}>
            <ThemedText style={[buttonStyles.buttonText, styles.submitButtonText]}>
              😩
            </ThemedText>
          </View>
        </TouchableOpacity>
      </View>
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
      minHeight: 50, // Ensure good tap target size
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 12, // Add explicit vertical padding
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
    submitButtonContainer: {
      width: '100%',
      alignItems: 'center',
    },
    submitButtonContent: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: 36, // Explicit height for the content container
    },
    submitButtonText: {
      fontSize: 24,
      lineHeight: 36, // Match the container height
      includeFontPadding: false, // Remove extra font padding
      textAlignVertical: 'center', 
    },
  });
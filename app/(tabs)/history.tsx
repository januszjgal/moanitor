// screens/HistoryScreen.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Calendar } from 'react-native-calendars'; // <--- from react-native-calendars
import { createHistoryStyles } from '@/styles/styles';
import { useEntries } from '@/hooks/useEntries';
import { Entry } from '@/styles/theme';
import { useTheme } from '@/hooks/useTheme'; // Add this import
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';

export default function HistoryScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const styles = createHistoryStyles(theme);

  const [view, setView] = useState<'list' | 'calendar'>('calendar');
  const { entries, loading, loadEntries, deleteEntry } = useEntries();

      // Add debug logs
  useEffect(() => {
    console.log('Entries in HistoryScreen:', entries);
  }, [entries]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('History screen focused');
      // We need to expose loadEntries from useEntries for this to work
      loadEntries();
    });

    return () => unsubscribe();
  }, [navigation]);

  const sortedEntries = useMemo(() => {
    console.log('Sorting entries:', entries); // Debug log
    const sorted = [...entries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    console.log('Sorted entries:', sorted); // Debug log
    return sorted;
  }, [entries]);

  const markedDates = useMemo(() => {
    const result: Record<string, { dots: { key: string; color: string }[] }> = {};
  
    entries.forEach((entry) => {
      // Convert the entry.date to localDateStr
      const date = new Date(entry.date);
      const localDateStr = new Date(
        date.getTime() - date.getTimezoneOffset() * 60 * 1000
      )
        .toISOString()
        .split('T')[0];
          
      // If this date hasn't been initialized, initialize with an empty array
      if (!result[localDateStr]) {
        result[localDateStr] = {
          dots: [],
        };
      }
  
      // Push a new dot object into the array
      result[localDateStr].dots.push({
        key: entry.id, // or any unique value
        color: entry.solo ? theme.colors.tertiary : theme.colors.primary,
        // Optionally, you can add a `selectedDotColor`, etc.
      });
    });
  
    return result;
  }, [entries, theme]);

  // Handle deleting an entry
  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteEntry(entryId);
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };
  

  const renderList = () => (
    <ScrollView style={styles.listContainer}>
      {sortedEntries.map((entry) => (
        <ThemedView key={entry.id} style={styles.entryRow}>
          <TouchableOpacity style={styles.entryItem}>
            <ThemedText style={styles.entryDate}>
              {/* Use the stored UTC time directly */}
              {new Date(entry.date).toLocaleString('en-US', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
            </ThemedText>
            {entry.solo && (
              <ThemedText style={[styles.soloIndicator, { color: theme.colors.tertiary }]}>
                Solo
              </ThemedText>
            )}
          </TouchableOpacity>
  
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteEntry(entry.id)}
          >
            <Ionicons name="trash" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </ThemedView>
      ))}
    </ScrollView>
  );
  
  

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            view === 'calendar' && styles.toggleButtonActive
          ]}
          onPress={() => setView('calendar')}
        >
          <ThemedText type="defaultSemiBold">Calendar</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            view === 'list' && styles.toggleButtonActive
          ]}
          onPress={() => setView('list')}
        >
          <ThemedText type="defaultSemiBold">List</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {view === 'list' ? (
        renderList()
      ) : (
        <ThemedView style={styles.calendarWrapper}>
        <Calendar
        markingType="multi-dot" // <- this tells the calendar to interpret `dots` arrays
        markedDates={markedDates}
        onDayPress={(day: any) => {
            const selectedDate = new Date(day.timestamp);
            console.log('Selected date:', selectedDate);
        }}
        theme={{
            calendarBackground: theme.colors.surface,
            dayTextColor: theme.colors.text.primary,
            textDisabledColor: theme.colors.text.secondary,
            todayTextColor: theme.colors.primary,
            selectedDayBackgroundColor: theme.colors.primary,
            arrowColor: theme.colors.primary,
            textMonthFontWeight: 'bold',
            monthTextColor: theme.colors.text.primary,
            backgroundColor: theme.colors.background,
        }}
        initialDate={new Date().toISOString().split('T')[0]}
        />
        </ThemedView>
      )}
    </ThemedView>
  );
}
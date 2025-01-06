import React, { useState, useMemo, useEffect } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Calendar } from 'react-native-calendars';
import { createHistoryStyles } from '@/styles/styles';
import { useEntries } from '@/hooks/useEntries';
import { Entry } from '@/styles/theme';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';

// Helper arrays for labeling days/months
const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// For time-of-day categorization
const TIME_OF_DAY_LABELS = {
  morning: 'Morning (5am–11am)',
  afternoon: 'Afternoon (12pm–4pm)',
  evening: 'Evening (5pm–8pm)',
  night: 'Night (9pm–4am)',
};

/**
 * Get the "year-week" identifier for a given date.
 * This is a simplified approach to grouping by weeks.
 * For a more precise ISO-week approach, you might need a specialized function.
 */
function getYearWeek(date: Date) {
  // Start with a copy to avoid mutating the original
  const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  
  // Set to Thursday of current week, per ISO standard (optional but common approach)
  const dayNumber = (temp.getUTCDay() + 6) % 7; // shift Sunday(0) to end
  temp.setUTCDate(temp.getUTCDate() - dayNumber + 3);

  // ISO week year
  const year = temp.getUTCFullYear();

  // First Thursday of the year
  const firstThursday = new Date(Date.UTC(year, 0, 4));
  const firstThursdayDayNumber = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstThursdayDayNumber + 3);

  // Week number is how many weeks between this date and the first Thursday of the year
  const weekNumber = 1 + Math.floor((temp.getTime() - firstThursday.getTime()) / (1000 * 60 * 60 * 24 * 7));

  return `${year}-W${weekNumber}`;
}

export default function HistoryScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const styles = createHistoryStyles(theme);

  const [view, setView] = useState<'list' | 'calendar' | 'stats'>('calendar');
  const { entries, loading, loadEntries, deleteEntry } = useEntries();

  useEffect(() => {
    console.log('Entries in HistoryScreen:', entries);
  }, [entries]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('History screen focused');
      loadEntries();
    });

    return () => unsubscribe();
  }, [navigation]);

  // Sort entries descending by date for List
  const sortedEntriesDesc = useMemo(() => {
    return [...entries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [entries]);

  // Prepare for stats: sort ascending
  const sortedEntriesAsc = useMemo(() => {
    return [...entries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [entries]);

  // Build the markedDates for the Calendar
  const markedDates = useMemo(() => {
    const result: Record<string, { dots: { key: string; color: string }[] }> = {};

    entries.forEach((entry) => {
      const date = new Date(entry.date);
      const localDateStr = new Date(
        date.getTime() - date.getTimezoneOffset() * 60 * 1000
      )
        .toISOString()
        .split('T')[0];

      if (!result[localDateStr]) {
        result[localDateStr] = { dots: [] };
      }

      result[localDateStr].dots.push({
        key: entry.id,
        color: entry.solo ? theme.colors.tertiary : theme.colors.primary,
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

  // ----- STATISTICS (Daily + Weekly Streaks, Gaps, etc.) -----
  const stats = useMemo(() => {
    if (entries.length === 0) {
      return {
        totalEntries: 0,
        soloCount: 0,
        notSoloCount: 0,
        mostFrequentDays: [],
        mostFrequentMonths: [],
        earliestDate: null,
        latestDate: null,
        longestDailyStreak: 0,
        currentDailyStreak: 0,
        longestWeeklyStreak: 0,
        currentWeeklyStreak: 0,
        longestGapInDays: 0,
        earliestTime: null,
        latestTime: null,
        favoriteTimeOfDay: '', // e.g. 'Morning'
        avgEntriesPerMonth: 0,
        avgEntriesPerWeek: 0,
      };
    }

    // Basic counters
    const dayOfWeekCounts: Record<string, number> = {};
    const monthCounts: Record<string, number> = {};
    let soloCount = 0;
    let notSoloCount = 0;

    // Time-of-day tallies
    const timeOfDayCounts: Record<string, number> = {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0,
    };

    // For earliest & latest times
    let earliestTime = 24; // set high so any real hour is less
    let latestTime = -1;

    // For daily gaps and streaks
    let longestGap = 0;
    let currentDailyStreak = 1;
    let longestDailyStreak = 1;

    // For weekly streaks, track each "year-week"
    // Then find consecutive year-weeks.
    const weekSet = new Set<string>();

    // Sort ascending for daily streak checks
    const ascEntries = sortedEntriesAsc;
    const firstEntryDate = new Date(ascEntries[0].date);
    const lastEntryDate = new Date(ascEntries[ascEntries.length - 1].date);

    ascEntries.forEach((entry, index) => {
      const date = new Date(entry.date);
      const dayOfWeek = DAYS_OF_WEEK[date.getDay()];
      const monthName = MONTHS[date.getMonth()];

      // Solo vs Not Solo
      if (entry.solo) {
        soloCount++;
      } else {
        notSoloCount++;
      }

      // Day of Week counts
      dayOfWeekCounts[dayOfWeek] = (dayOfWeekCounts[dayOfWeek] || 0) + 1;
      // Month counts
      monthCounts[monthName] = (monthCounts[monthName] || 0) + 1;

      // Time-of-day counts
      const hour = date.getHours();
      if (hour >= 5 && hour <= 11) {
        timeOfDayCounts.morning++;
      } else if (hour >= 12 && hour <= 16) {
        timeOfDayCounts.afternoon++;
      } else if (hour >= 17 && hour <= 20) {
        timeOfDayCounts.evening++;
      } else {
        // Covers 21:00–4:00
        timeOfDayCounts.night++;
      }

      // Earliest / Latest time
      if (hour < earliestTime) earliestTime = hour;
      if (hour > latestTime) latestTime = hour;

      // Daily Gap & Daily Streak calculation
      if (index > 0) {
        const prevDate = new Date(ascEntries[index - 1].date);
        const diffDays = Math.floor(
          (date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        // Longest gap
        if (diffDays > longestGap) {
          longestGap = diffDays;
        }
        // Daily streak logic
        if (diffDays === 1) {
          // Consecutive day -> increment
          currentDailyStreak++;
          longestDailyStreak = Math.max(longestDailyStreak, currentDailyStreak);
        } else if (diffDays > 1) {
          // reset daily streak
          currentDailyStreak = 1;
        }
      }

      // Mark this entry’s "year-week"
      const yw = getYearWeek(date);
      weekSet.add(yw);
    });

    // ---------- Weekly Streaks ----------
    // Now we have a set of “year-week” strings (e.g., '2023-W15', '2023-W16', ...)
    // Convert to array and sort them in ascending order.
    // Then check consecutive weeks.
    const allWeeks = Array.from(weekSet).sort(); // e.g. ['2022-W52','2023-W1','2023-W2','2023-W3',...]
    let longestWeeklyStreak = 1;
    let currentWeeklyStreak = 1;

    for (let i = 1; i < allWeeks.length; i++) {
      // Parse 'YYYY-WX' => {year, weekNum}
      const [prevYearStr, prevWeekStr] = allWeeks[i - 1].split('-W');
      const [currYearStr, currWeekStr] = allWeeks[i].split('-W');

      const prevYear = parseInt(prevYearStr, 10);
      const currYear = parseInt(currYearStr, 10);
      const prevWeek = parseInt(prevWeekStr, 10);
      const currWeek = parseInt(currWeekStr, 10);

      // Check if curr is exactly 1 week after prev
      //   e.g., 2023-W15 -> 2023-W16
      //   or 2023-W52 -> 2024-W1
      let isConsecutiveWeek = false;

      if (currYear === prevYear && currWeek === prevWeek + 1) {
        // Same year, consecutive week
        isConsecutiveWeek = true;
      } else if (currYear === prevYear + 1 && prevWeek >= 52 && currWeek === 1) {
        // Rolling over from one year to the next
        // (We are simplifying the 52 or 53 weeks in a year scenario)
        isConsecutiveWeek = true;
      }

      if (isConsecutiveWeek) {
        currentWeeklyStreak++;
        longestWeeklyStreak = Math.max(longestWeeklyStreak, currentWeeklyStreak);
      } else {
        currentWeeklyStreak = 1;
      }
    }

    // Helper to find keys with the highest frequency
    const getMaxKeys = (counts: Record<string, number>) => {
      const maxValue = Math.max(0, ...Object.values(counts));
      return Object.entries(counts)
        .filter(([_, value]) => value === maxValue)
        .map(([key]) => key);
    };

    const mostFrequentDays = getMaxKeys(dayOfWeekCounts);
    const mostFrequentMonths = getMaxKeys(monthCounts);

    // Favorite Time of Day
    const maxTimeOfDayCount = Math.max(...Object.values(timeOfDayCounts));
    let favoriteTimeOfDay = Object.entries(timeOfDayCounts).find(
      ([, val]) => val === maxTimeOfDayCount
    )?.[0];
    // Convert key to a user-friendly label (morning, afternoon, evening, night)
    favoriteTimeOfDay = favoriteTimeOfDay
      ? TIME_OF_DAY_LABELS[favoriteTimeOfDay as keyof typeof TIME_OF_DAY_LABELS]
      : '';

    // Convert earliestTime/latestTime to "hh:00 AM/PM" format
    const formatTime = (hour: number) => {
      if (hour < 0 || hour > 23) return null;
      const suffix = hour < 12 ? 'AM' : 'PM';
      let displayHour = hour % 12;
      if (displayHour === 0) displayHour = 12;
      return `${displayHour}:00 ${suffix}`;
    };

    // Averages
    const totalEntries = ascEntries.length;
    const totalMonths =
      (lastEntryDate.getFullYear() - firstEntryDate.getFullYear()) * 12 +
      (lastEntryDate.getMonth() - firstEntryDate.getMonth()) +
      1;
    const totalWeeks =
      Math.floor(
        (lastEntryDate.getTime() - firstEntryDate.getTime()) /
          (1000 * 60 * 60 * 24 * 7)
      ) + 1;

    const avgEntriesPerMonth =
      totalMonths > 0 ? totalEntries / totalMonths : 0;
    const avgEntriesPerWeek =
      totalWeeks > 0 ? totalEntries / totalWeeks : 0;

    return {
      totalEntries,
      soloCount,
      notSoloCount,
      mostFrequentDays,
      mostFrequentMonths,

      earliestDate: ascEntries[0].date,
      latestDate: ascEntries[ascEntries.length - 1].date,

      // Daily Streak
      longestDailyStreak,
      currentDailyStreak,

      // Weekly Streak
      longestWeeklyStreak,
      currentWeeklyStreak,

      // Gaps
      longestGapInDays: longestGap,

      // Times
      earliestTime: formatTime(earliestTime),
      latestTime: formatTime(latestTime),
      favoriteTimeOfDay,

      // Averages
      avgEntriesPerMonth: Number(avgEntriesPerMonth.toFixed(2)),
      avgEntriesPerWeek: Number(avgEntriesPerWeek.toFixed(2)),
    };
  }, [entries, sortedEntriesAsc]);

  // ----- RENDER FUNCTIONS -----
  const renderList = () => (
    <ScrollView style={styles.listContainer}>
      {sortedEntriesDesc.map((entry) => (
        <ThemedView key={entry.id} style={styles.entryRow}>
          <TouchableOpacity style={styles.entryItem}>
            <ThemedText style={styles.entryDate}>
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
              <ThemedText
                style={[
                  styles.soloIndicator,
                  { color: theme.colors.tertiary }
                ]}
              >
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

  const renderStats = () => {
    return (
      <ScrollView style={styles.listContainer}>
        {/* 1. Total Entries & Solo/Not Solo */}
        <ThemedView style={styles.entryRow}>
          <ThemedText style={styles.entryDate}>
            <ThemedText style={{ fontWeight: 'bold' }}>Total Entries:</ThemedText> {stats.totalEntries}
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.entryRow}>
          <ThemedText style={styles.entryDate}>
            <ThemedText style={{ fontWeight: 'bold' }}>Solo:</ThemedText> {stats.soloCount}{'  '}|{'  '}
            <ThemedText style={{ fontWeight: 'bold' }}>Not Solo:</ThemedText> {stats.notSoloCount}
          </ThemedText>
        </ThemedView>

        {/* 2. Most Frequent Days/Months */}
        <ThemedView style={styles.entryRow}>
          <ThemedText style={styles.entryDate}>
            <ThemedText style={{ fontWeight: 'bold' }}>Most Frequent Day(s):</ThemedText>{' '}
            {stats.mostFrequentDays.join(', ') || 'N/A'}
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.entryRow}>
          <ThemedText style={styles.entryDate}>
            <ThemedText style={{ fontWeight: 'bold' }}>Most Frequent Month(s):</ThemedText>{' '}
            {stats.mostFrequentMonths.join(', ') || 'N/A'}
          </ThemedText>
        </ThemedView>

        {/* 3. Earliest & Latest Date */}
        <ThemedView style={styles.entryRow}>
          <ThemedText style={styles.entryDate}>
            <ThemedText style={{ fontWeight: 'bold' }}>Earliest Entry:</ThemedText>{' '}
            {stats.earliestDate
              ? new Date(stats.earliestDate).toLocaleDateString()
              : 'N/A'}
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.entryRow}>
          <ThemedText style={styles.entryDate}>
            <ThemedText style={{ fontWeight: 'bold' }}>Latest Entry:</ThemedText>{' '}
            {stats.latestDate
              ? new Date(stats.latestDate).toLocaleDateString()
              : 'N/A'}
          </ThemedText>
        </ThemedView>

        {/* 4. Daily Streaks */}
        <ThemedView style={styles.entryRow}>
          <ThemedText style={styles.entryDate}>
            <ThemedText style={{ fontWeight: 'bold' }}>Longest Daily Streak:</ThemedText>{' '}
            {stats.longestDailyStreak || 0} day(s)
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.entryRow}>
          <ThemedText style={styles.entryDate}>
            <ThemedText style={{ fontWeight: 'bold' }}>Current Daily Streak:</ThemedText>{' '}
            {stats.currentDailyStreak || 0} day(s)
          </ThemedText>
        </ThemedView>

        {/* 5. Weekly Streaks */}
        <ThemedView style={styles.entryRow}>
          <ThemedText style={styles.entryDate}>
            <ThemedText style={{ fontWeight: 'bold' }}>Longest Weekly Streak:</ThemedText>{' '}
            {stats.longestWeeklyStreak || 0} week(s)
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.entryRow}>
          <ThemedText style={styles.entryDate}>
            <ThemedText style={{ fontWeight: 'bold' }}>Current Weekly Streak:</ThemedText>{' '}
            {stats.currentWeeklyStreak || 0} week(s)
          </ThemedText>
        </ThemedView>

        {/* 6. Longest Gap */}
        <ThemedView style={styles.entryRow}>
          <ThemedText style={styles.entryDate}>
            <ThemedText style={{ fontWeight: 'bold' }}>Longest Gap:</ThemedText>{' '}
            {stats.longestGapInDays} day(s)
          </ThemedText>
        </ThemedView>

        {/* 7. Earliest / Latest Time of Day */}
        <ThemedView style={styles.entryRow}>
          <ThemedText style={styles.entryDate}>
            <ThemedText style={{ fontWeight: 'bold' }}>Earliest Time of Day:</ThemedText>{' '}
            {stats.earliestTime || 'N/A'}
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.entryRow}>
          <ThemedText style={styles.entryDate}>
            <ThemedText style={{ fontWeight: 'bold' }}>Latest Time of Day:</ThemedText>{' '}
            {stats.latestTime || 'N/A'}
          </ThemedText>
        </ThemedView>

        {/* 8. Favorite Time of Day */}
        <ThemedView style={styles.entryRow}>
          <ThemedText style={styles.entryDate}>
            <ThemedText style={{ fontWeight: 'bold' }}>Favorite Time of Day:</ThemedText>{' '}
            {stats.favoriteTimeOfDay || 'N/A'}
          </ThemedText>
        </ThemedView>

        {/* 9. Averages per Month / Week */}
        <ThemedView style={styles.entryRow}>
          <ThemedText style={styles.entryDate}>
            <ThemedText style={{ fontWeight: 'bold' }}>Avg. Entries / Month:</ThemedText>{' '}
            {stats.avgEntriesPerMonth}
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.entryRow}>
          <ThemedText style={styles.entryDate}>
            <ThemedText style={{ fontWeight: 'bold' }}>Avg. Entries / Week:</ThemedText>{' '}
            {stats.avgEntriesPerWeek}
          </ThemedText>
        </ThemedView>
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Toggle among calendar, list, and stats */}
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
        <TouchableOpacity
          style={[
            styles.toggleButton,
            view === 'stats' && styles.toggleButtonActive
          ]}
          onPress={() => setView('stats')}
        >
          <ThemedText type="defaultSemiBold">Stats</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {view === 'list' ? (
        renderList()
      ) : view === 'calendar' ? (
        <ThemedView style={styles.calendarWrapper}>
          <Calendar
            markingType="multi-dot"
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
      ) : (
        // STATS VIEW
        renderStats()
      )}
    </ThemedView>
  );
}
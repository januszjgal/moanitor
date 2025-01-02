// components/Calendar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { calendarStyles as styles } from '../styles/styles';
import { theme } from '@/styles/theme';
import type { Entry } from '@/styles/theme';

interface CalendarProps {
  date?: Date;
  onDateSelect?: (date: Date) => void;
  style?: ViewStyle;
  entries?: Entry[];  // Add entries prop
}

export const Calendar: React.FC<CalendarProps> = ({ 
  date = new Date(),
  onDateSelect,
  style,
  entries = []  // Default to empty array
}) => {
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  // Helper function to check if a day has any entries
  const hasEntryOnDay = (dayNumber: number) => {
    const checkDate = new Date(date.getFullYear(), date.getMonth(), dayNumber);
    return entries.some(entry => {
      const entryDate = new Date(entry.date);
      return (
        entryDate.getDate() === checkDate.getDate() &&
        entryDate.getMonth() === checkDate.getMonth() &&
        entryDate.getFullYear() === checkDate.getFullYear()
      );
    });
  };

  const renderDays = () => {
    const daysInMonth = getDaysInMonth(date);
    const firstDayOfMonth = getFirstDayOfMonth(date);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.dayCell} />
      );
    }

    // Add cells for each day of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = 
        i === new Date().getDate() && 
        date.getMonth() === new Date().getMonth() && 
        date.getFullYear() === new Date().getFullYear();
      
      const hasEntry = hasEntryOnDay(i);

      days.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.dayCell,
            isToday && styles.selectedDay,
            hasEntry && styles.dayWithEntry
          ]}
          onPress={() => {
            const selectedDate = new Date(date.getFullYear(), date.getMonth(), i);
            onDateSelect?.(selectedDate);
          }}
        >
          <Text style={[
            styles.dayText,
            (isToday || hasEntry) && { color: theme.colors.text.primary }
          ]}>
            {i}
          </Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={styles.navigationButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {monthNames[date.getMonth()]} {date.getFullYear()}
        </Text>
        <TouchableOpacity>
          <Text style={styles.navigationButton}>→</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.daysGrid}>
        {dayNames.map(day => (
          <Text key={day} style={styles.dayHeader}>{day}</Text>
        ))}
        {renderDays()}
      </View>
    </View>
  );
};
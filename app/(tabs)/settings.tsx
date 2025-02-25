import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, useColorScheme, Share, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';


export default function Settings() {
  const [storageData, setStorageData] = useState<string>('');
  const theme = useTheme();

  const checkStorage = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const result = await AsyncStorage.multiGet(keys);
      const formattedData = result.map(([key, value]) => {
        try {
          return {
            key,
            value: JSON.parse(value || '[]')
          };
        } catch {
          return { key, value };
        }
      });
      setStorageData(JSON.stringify(formattedData, null, 2));
      console.log('Storage keys found:', keys);
      result.forEach(([key, value]) => {
        console.log(`Key: ${key}`);
        try {
          console.log('Value:', JSON.parse(value || '[]'));
        } catch (e) {
          console.log('Raw value:', value);
        }
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        setStorageData(`Error retrieving storage: ${error.message}`);
      } else {
        setStorageData('An unknown error occurred');
      }
    }
  };

  const clearStorage = async () => {
    try {
      await AsyncStorage.clear();
      setStorageData('Storage cleared successfully');
      console.log('Storage cleared');
    } catch (error: unknown) {
      if (error instanceof Error) {
        setStorageData(`Error clearing storage: ${error.message}`);
      } else {
        setStorageData('An unknown error occurred');
      }
    }
  };

  const exportData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const result = await AsyncStorage.multiGet(keys);
      const exportData = Object.fromEntries(result);
      const exportString = JSON.stringify(exportData);
      
      if (Platform.OS === 'web') {
        const blob = new Blob([exportString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'entries_export.json';
        a.click();
        URL.revokeObjectURL(url);
      } else {
        await Share.share({
          message: exportString,
          title: 'Entries Export'
        });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setStorageData(`Error exporting data: ${error.message}`);
      } else {
        setStorageData('An unknown error occurred during export');
      }
    }
  };

  const importData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json'
      });
      
      if (!result.canceled) {
        const response = await fetch(result.assets[0].uri);
        const text = await response.text();
        const importedData = JSON.parse(text);
        
        // Clear existing storage first
        await AsyncStorage.clear();
        
        // Import new data
        const entries: [string, string][] = Object.entries(importedData).map(([key, value]) => [
          key,
          typeof value === 'string' ? value : JSON.stringify(value)
        ]);
        await AsyncStorage.multiSet(entries);
        
        setStorageData('Data imported successfully');
        await checkStorage(); // Refresh the display
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setStorageData(`Error importing data: ${error.message}`);
      } else {
        setStorageData('An unknown error occurred during import');
      }
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    button: {
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginVertical: theme.spacing.sm,
    },
    buttonText: {
      color: '#fff',
      textAlign: 'center',
      fontSize: 16,
      fontWeight: '600',
    },
    dataContainer: {
      marginTop: theme.spacing.lg,
      flex: 1,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
    },
    dataText: {
      fontFamily: 'monospace',
      fontSize: 12,
      color: theme.colors.text.primary,
  },
  });

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={checkStorage}>
        <Text style={styles.buttonText}>Check Storage Contents</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={clearStorage}>
        <Text style={styles.buttonText}>Clear All Storage</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={exportData}>
        <Text style={styles.buttonText}>Export Entries</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={importData}>
        <Text style={styles.buttonText}>Import Entries</Text>
      </TouchableOpacity>
      <ScrollView style={styles.dataContainer}>
        <Text style={styles.dataText}>{storageData}</Text>
      </ScrollView>
    </ThemedView>
  );
}
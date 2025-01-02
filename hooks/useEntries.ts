import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { Entry } from '@/styles/theme';

const ENTRIES_STORAGE_KEY = '@moanitor_entries';

export const useEntries = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = async () => {
    setLoading(true); // Ensure loading is true when we start
    try {
      const storedEntries = await AsyncStorage.getItem(ENTRIES_STORAGE_KEY);
      console.log('Raw stored entries:', storedEntries);
      
      if (storedEntries) {
        const parsed = JSON.parse(storedEntries);
        // Ensure we're getting the value array
        const entriesArray = parsed?.value || [];
        console.log('Setting entries to:', entriesArray);
        setEntries(entriesArray);
      } else {
        setEntries([]);
      }
    } catch (error) {
      console.error('Error loading entries:', error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Loading entries effect triggered');
    loadEntries();
  }, []); // Keep the empty dependency array

  const addEntry = useCallback(async (newEntry: Entry) => {
    try {
      const storedEntries = await AsyncStorage.getItem(ENTRIES_STORAGE_KEY);
      const currentEntries = storedEntries ? JSON.parse(storedEntries).value || [] : [];
      const updatedEntries = [...currentEntries, newEntry];
      await AsyncStorage.setItem(ENTRIES_STORAGE_KEY, JSON.stringify({ value: updatedEntries }));
      setEntries(updatedEntries);
      // Add debug log
      console.log('Added new entry, updated entries:', updatedEntries);
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    try {
      const storedEntries = await AsyncStorage.getItem(ENTRIES_STORAGE_KEY);
      const currentEntries = storedEntries ? JSON.parse(storedEntries).value || [] : [];
      const updatedEntries = currentEntries.filter((entry: Entry) => entry.id !== id);
      await AsyncStorage.setItem(ENTRIES_STORAGE_KEY, JSON.stringify({ value: updatedEntries }));
      // Update local state immediately
      setEntries(updatedEntries);
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  }, []);

  return { entries, loading, loadEntries, addEntry, deleteEntry };
};
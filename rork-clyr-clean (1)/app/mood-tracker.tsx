import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Plus, ArrowLeft, Smile, Zap, Brain } from 'lucide-react-native';
import { useRecovery } from '@/contexts/RecoveryContext';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function MoodTrackerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { moodEntries, addMoodEntry } = useRecovery();
  
  const [isAdding, setIsAdding] = useState(false);
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [focus, setFocus] = useState(5);
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    addMoodEntry(mood, energy, focus, notes.trim() || undefined);
    setMood(5);
    setEnergy(5);
    setFocus(5);
    setNotes('');
    setIsAdding(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#4ECDC4';
    if (score >= 6) return '#95E1D3';
    if (score >= 4) return '#FFE66D';
    if (score >= 2) return '#FF9A76';
    return '#FF6B6B';
  };

  const getAverageMood = (): number => {
    if (moodEntries.length === 0) return 0;
    const sum = moodEntries.reduce((acc, entry) => acc + entry.mood, 0);
    return parseFloat((sum / moodEntries.length).toFixed(1));
  };

  const getAverageEnergy = (): number => {
    if (moodEntries.length === 0) return 0;
    const sum = moodEntries.reduce((acc, entry) => acc + entry.energy, 0);
    return parseFloat((sum / moodEntries.length).toFixed(1));
  };

  const getAverageFocus = (): number => {
    if (moodEntries.length === 0) return 0;
    const sum = moodEntries.reduce((acc, entry) => acc + entry.focus, 0);
    return parseFloat((sum / moodEntries.length).toFixed(1));
  };

  const renderSlider = (value: number, onChange: (val: number) => void, label: string, icon: any) => {
    const Icon = icon;
    const color = getScoreColor(value);
    
    return (
      <View style={styles.sliderContainer}>
        <View style={styles.sliderHeader}>
          <View style={styles.sliderLabel}>
            <Icon size={20} color={color} />
            <Text style={styles.sliderLabelText}>{label}</Text>
          </View>
          <Text style={[styles.sliderValue, { color }]}>{value}/10</Text>
        </View>
        
        <View style={styles.sliderTrack}>
          <View style={[styles.sliderFill, { width: `${(value / 10) * 100}%`, backgroundColor: color }]} />
          <View style={styles.sliderDots}>
            {Array.from({ length: 10 }).map((_, i) => (
              <TouchableOpacity
                key={i}
                style={styles.sliderDot}
                onPress={() => onChange(i + 1)}
              />
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: false,
        }} 
      />
      
      <LinearGradient
        colors={['#0F2027', '#203A43', '#2C5364']}
        style={styles.gradient}
      >
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mood & Energy</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setIsAdding(true)}
          >
            <Plus size={24} color="#4ECDC4" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.intro}>
            <Heart size={48} color="#4ECDC4" />
            <Text style={styles.introTitle}>Track Your Progress</Text>
            <Text style={styles.introText}>
              See how recovery affects your well-being over time
            </Text>
          </View>

          {moodEntries.length > 0 && (
            <View style={styles.averagesContainer}>
              <View style={styles.averageCard}>
                <Smile size={24} color={getScoreColor(getAverageMood())} />
                <Text style={styles.averageValue}>{getAverageMood().toFixed(1)}</Text>
                <Text style={styles.averageLabel}>Avg Mood</Text>
              </View>
              <View style={styles.averageCard}>
                <Zap size={24} color={getScoreColor(getAverageEnergy())} />
                <Text style={styles.averageValue}>{getAverageEnergy().toFixed(1)}</Text>
                <Text style={styles.averageLabel}>Avg Energy</Text>
              </View>
              <View style={styles.averageCard}>
                <Brain size={24} color={getScoreColor(getAverageFocus())} />
                <Text style={styles.averageValue}>{getAverageFocus().toFixed(1)}</Text>
                <Text style={styles.averageLabel}>Avg Focus</Text>
              </View>
            </View>
          )}

          {moodEntries.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No entries yet</Text>
              <Text style={styles.emptySubtext}>Tap + to log your first mood entry</Text>
            </View>
          )}

          <View style={styles.entriesContainer}>
            {moodEntries.map((entry) => (
              <View key={entry.id} style={styles.entryCard}>
                <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                
                <View style={styles.scoresGrid}>
                  <View style={styles.scoreItem}>
                    <Smile size={18} color={getScoreColor(entry.mood)} />
                    <Text style={styles.scoreLabel}>Mood</Text>
                    <Text style={[styles.scoreValue, { color: getScoreColor(entry.mood) }]}>
                      {entry.mood}/10
                    </Text>
                  </View>
                  
                  <View style={styles.scoreItem}>
                    <Zap size={18} color={getScoreColor(entry.energy)} />
                    <Text style={styles.scoreLabel}>Energy</Text>
                    <Text style={[styles.scoreValue, { color: getScoreColor(entry.energy) }]}>
                      {entry.energy}/10
                    </Text>
                  </View>
                  
                  <View style={styles.scoreItem}>
                    <Brain size={18} color={getScoreColor(entry.focus)} />
                    <Text style={styles.scoreLabel}>Focus</Text>
                    <Text style={[styles.scoreValue, { color: getScoreColor(entry.focus) }]}>
                      {entry.focus}/10
                    </Text>
                  </View>
                </View>

                {entry.notes && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesText}>{entry.notes}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>

        <Modal
          visible={isAdding}
          transparent
          animationType="slide"
          onRequestClose={() => setIsAdding(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>How are you feeling?</Text>
                
                {renderSlider(mood, setMood, 'Mood', Smile)}
                {renderSlider(energy, setEnergy, 'Energy', Zap)}
                {renderSlider(focus, setFocus, 'Focus', Brain)}

                <Text style={styles.label}>Notes (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Any thoughts or observations?"
                  placeholderTextColor="#5A5A7D"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => setIsAdding(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={handleSave}
                  >
                    <Text style={styles.saveButtonText}>Save Entry</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F2027',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  addButton: {
    width: 40,
    height: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  intro: {
    alignItems: 'center' as const,
    marginBottom: 30,
  },
  introTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  introText: {
    fontSize: 16,
    color: '#B8C6DB',
    textAlign: 'center' as const,
    lineHeight: 24,
  },
  averagesContainer: {
    flexDirection: 'row' as const,
    gap: 12,
    marginBottom: 30,
  },
  averageCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  averageValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  averageLabel: {
    fontSize: 12,
    color: '#B8C6DB',
    fontWeight: '500' as const,
  },
  emptyState: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center' as const,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#B8C6DB',
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8A8A9D',
  },
  entriesContainer: {
    gap: 16,
  },
  entryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  entryDate: {
    fontSize: 13,
    color: '#8A8A9D',
    fontWeight: '500' as const,
    marginBottom: 16,
  },
  scoresGrid: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    gap: 12,
  },
  scoreItem: {
    flex: 1,
    alignItems: 'center' as const,
    gap: 6,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#B8C6DB',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  notesContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  notesText: {
    fontSize: 14,
    color: '#B8C6DB',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end' as const,
  },
  modalContent: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 24,
  },
  sliderContainer: {
    marginBottom: 24,
  },
  sliderHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  sliderLabel: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  sliderLabelText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#B8C6DB',
  },
  sliderValue: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  sliderTrack: {
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    overflow: 'hidden' as const,
    position: 'relative' as const,
  },
  sliderFill: {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 20,
  },
  sliderDots: {
    flexDirection: 'row' as const,
    justifyContent: 'space-evenly' as const,
    alignItems: 'center' as const,
    height: '100%',
    paddingHorizontal: 10,
  },
  sliderDot: {
    width: width / 14,
    height: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#B8C6DB',
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    minHeight: 100,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalActions: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center' as const,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#8A8A9D',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#4ECDC4',
    alignItems: 'center' as const,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});

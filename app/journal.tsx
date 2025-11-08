import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BookMarked, Plus, ArrowLeft, Smile, Meh, Frown } from 'lucide-react-native';
import { useRecovery } from '@/contexts/RecoveryContext';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';

export default function JournalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { journalEntries, addJournalEntry } = useRecovery();
  
  const [isWriting, setIsWriting] = useState(false);
  const [newEntry, setNewEntry] = useState('');
  const [selectedMood, setSelectedMood] = useState<'great' | 'good' | 'okay' | 'struggling' | 'difficult' | undefined>();

  const handleSave = () => {
    if (newEntry.trim()) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      addJournalEntry(newEntry.trim(), selectedMood);
      setNewEntry('');
      setSelectedMood(undefined);
      setIsWriting(false);
    }
  };

  const handleCancel = () => {
    setNewEntry('');
    setSelectedMood(undefined);
    setIsWriting(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMoodColor = (mood?: string) => {
    switch (mood) {
      case 'great': return '#4ECDC4';
      case 'good': return '#95E1D3';
      case 'okay': return '#FFE66D';
      case 'struggling': return '#FF9A76';
      case 'difficult': return '#FF6B6B';
      default: return '#8A8A9D';
    }
  };

  const getMoodLabel = (mood?: string) => {
    if (!mood) return 'No mood';
    return mood.charAt(0).toUpperCase() + mood.slice(1);
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
          <Text style={styles.headerTitle}>Personal Journal</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setIsWriting(true)}
          >
            <Plus size={24} color="#4ECDC4" />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {!isWriting && (
              <>
                <View style={styles.intro}>
                  <BookMarked size={48} color="#4ECDC4" />
                  <Text style={styles.introTitle}>Your Journey</Text>
                  <Text style={styles.introText}>
                    Write about your thoughts, urges, and victories
                  </Text>
                </View>

                {journalEntries.length === 0 && (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No entries yet</Text>
                    <Text style={styles.emptySubtext}>Tap + to write your first entry</Text>
                  </View>
                )}

                <View style={styles.entriesContainer}>
                  {journalEntries.map((entry) => (
                    <View key={entry.id} style={styles.entryCard}>
                      <View style={styles.entryHeader}>
                        <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                        {entry.mood && (
                          <View style={[styles.moodBadge, { backgroundColor: `${getMoodColor(entry.mood)}20` }]}>
                            <Text style={[styles.moodText, { color: getMoodColor(entry.mood) }]}>
                              {getMoodLabel(entry.mood)}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.entryContent}>{entry.content}</Text>
                      {entry.aiSuggestion && (
                        <View style={styles.aiSuggestion}>
                          <Text style={styles.aiLabel}>AI Insight:</Text>
                          <Text style={styles.aiText}>{entry.aiSuggestion}</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </>
            )}

            {isWriting && (
              <View style={styles.writingContainer}>
                <Text style={styles.writingTitle}>New Entry</Text>
                
                <Text style={styles.label}>How are you feeling?</Text>
                <View style={styles.moodSelector}>
                  {[
                    { value: 'great' as const, label: 'Great', icon: Smile },
                    { value: 'good' as const, label: 'Good', icon: Smile },
                    { value: 'okay' as const, label: 'Okay', icon: Meh },
                    { value: 'struggling' as const, label: 'Struggling', icon: Meh },
                    { value: 'difficult' as const, label: 'Difficult', icon: Frown },
                  ].map((mood) => {
                    const Icon = mood.icon;
                    const isSelected = selectedMood === mood.value;
                    return (
                      <TouchableOpacity
                        key={mood.value}
                        style={[
                          styles.moodButton,
                          { borderColor: getMoodColor(mood.value) },
                          isSelected && { backgroundColor: `${getMoodColor(mood.value)}30` }
                        ]}
                        onPress={() => setSelectedMood(mood.value)}
                      >
                        <Icon size={20} color={getMoodColor(mood.value)} />
                        <Text style={[styles.moodButtonText, { color: getMoodColor(mood.value) }]}>
                          {mood.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.label}>What&apos;s on your mind?</Text>
                <TextInput
                  style={styles.textInput}
                  value={newEntry}
                  onChangeText={setNewEntry}
                  placeholder="Write about your day, thoughts, urges, or victories..."
                  placeholderTextColor="#5A5A7D"
                  multiline
                  numberOfLines={10}
                  textAlignVertical="top"
                  autoFocus
                />

                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={handleCancel}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.saveButton, !newEntry.trim() && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={!newEntry.trim()}
                  >
                    <Text style={styles.saveButtonText}>Save Entry</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
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
  entryHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  entryDate: {
    fontSize: 13,
    color: '#8A8A9D',
    fontWeight: '500' as const,
  },
  moodBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  moodText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  entryContent: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  aiSuggestion: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.2)',
  },
  aiLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#4ECDC4',
    marginBottom: 6,
    textTransform: 'uppercase' as const,
  },
  aiText: {
    fontSize: 14,
    color: '#B8C6DB',
    lineHeight: 20,
  },
  writingContainer: {
    gap: 20,
  },
  writingTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#B8C6DB',
    marginBottom: 12,
  },
  moodSelector: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 10,
  },
  moodButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  moodButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    minHeight: 200,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButtons: {
    flexDirection: 'row' as const,
    gap: 12,
    marginTop: 10,
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
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});

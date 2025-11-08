import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Repeat, Plus, ArrowLeft, CheckCircle2, Circle, Sunrise, Sun, Sunset, Clock } from 'lucide-react-native';
import { useRecovery } from '@/contexts/RecoveryContext';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';

export default function HabitsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { habitItems, addHabit, toggleHabitCompletion } = useRecovery();
  
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitDescription, setNewHabitDescription] = useState('');
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'anytime'>('anytime');

  const today = new Date().toISOString().split('T')[0];

  const handleAdd = () => {
    if (newHabitTitle.trim()) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      addHabit(newHabitTitle.trim(), newHabitDescription.trim() || undefined, selectedTimeOfDay);
      setNewHabitTitle('');
      setNewHabitDescription('');
      setSelectedTimeOfDay('anytime');
      setIsAdding(false);
    }
  };

  const handleToggle = (habitId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    toggleHabitCompletion(habitId, today);
  };

  const getTimeIcon = (time?: string) => {
    switch (time) {
      case 'morning': return Sunrise;
      case 'afternoon': return Sun;
      case 'evening': return Sunset;
      default: return Clock;
    }
  };

  const getTimeColor = (time?: string) => {
    switch (time) {
      case 'morning': return '#FFE66D';
      case 'afternoon': return '#FF9A76';
      case 'evening': return '#9D84B7';
      default: return '#8A8A9D';
    }
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
          <Text style={styles.headerTitle}>Habit Builder</Text>
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
            <Repeat size={48} color="#4ECDC4" />
            <Text style={styles.introTitle}>Build Your Routine</Text>
            <Text style={styles.introText}>
              Stack healthy habits to replace old patterns
            </Text>
          </View>

          {habitItems.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No habits yet</Text>
              <Text style={styles.emptySubtext}>Tap + to create your first habit</Text>
            </View>
          )}

          <View style={styles.habitsContainer}>
            {habitItems.map((habit) => {
              const isCompletedToday = habit.completedDates.includes(today);
              const streak = habit.completedDates.length;
              const TimeIcon = getTimeIcon(habit.timeOfDay);
              const timeColor = getTimeColor(habit.timeOfDay);

              return (
                <TouchableOpacity
                  key={habit.id}
                  style={[styles.habitCard, isCompletedToday && styles.habitCardCompleted]}
                  onPress={() => handleToggle(habit.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.habitIcon}>
                    {isCompletedToday ? (
                      <CheckCircle2 size={32} color="#4ECDC4" fill="#4ECDC4" />
                    ) : (
                      <Circle size={32} color="#8A8A9D" />
                    )}
                  </View>

                  <View style={styles.habitContent}>
                    <Text style={[styles.habitTitle, isCompletedToday && styles.habitTitleCompleted]}>
                      {habit.title}
                    </Text>
                    {habit.description && (
                      <Text style={styles.habitDescription}>{habit.description}</Text>
                    )}
                    
                    <View style={styles.habitMeta}>
                      <View style={[styles.timeBadge, { backgroundColor: `${timeColor}20` }]}>
                        <TimeIcon size={14} color={timeColor} />
                        <Text style={[styles.timeText, { color: timeColor }]}>
                          {habit.timeOfDay || 'anytime'}
                        </Text>
                      </View>
                      
                      {streak > 0 && (
                        <View style={styles.streakBadge}>
                          <Text style={styles.streakText}>{streak} day{streak !== 1 ? 's' : ''}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
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
              <Text style={styles.modalTitle}>New Habit</Text>
              
              <Text style={styles.label}>Habit Name</Text>
              <TextInput
                style={styles.input}
                value={newHabitTitle}
                onChangeText={setNewHabitTitle}
                placeholder="e.g., Morning Exercise"
                placeholderTextColor="#5A5A7D"
                autoFocus
              />

              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={styles.input}
                value={newHabitDescription}
                onChangeText={setNewHabitDescription}
                placeholder="e.g., 15 minutes of cardio"
                placeholderTextColor="#5A5A7D"
              />

              <Text style={styles.label}>Time of Day</Text>
              <View style={styles.timeSelector}>
                {[
                  { value: 'morning' as const, label: 'Morning', icon: Sunrise },
                  { value: 'afternoon' as const, label: 'Afternoon', icon: Sun },
                  { value: 'evening' as const, label: 'Evening', icon: Sunset },
                  { value: 'anytime' as const, label: 'Anytime', icon: Clock },
                ].map((time) => {
                  const Icon = time.icon;
                  const isSelected = selectedTimeOfDay === time.value;
                  const color = getTimeColor(time.value);
                  
                  return (
                    <TouchableOpacity
                      key={time.value}
                      style={[
                        styles.timeButton,
                        { borderColor: color },
                        isSelected && { backgroundColor: `${color}30` }
                      ]}
                      onPress={() => setSelectedTimeOfDay(time.value)}
                    >
                      <Icon size={20} color={color} />
                      <Text style={[styles.timeButtonText, { color }]}>
                        {time.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => {
                    setNewHabitTitle('');
                    setNewHabitDescription('');
                    setSelectedTimeOfDay('anytime');
                    setIsAdding(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.saveButton, !newHabitTitle.trim() && styles.saveButtonDisabled]}
                  onPress={handleAdd}
                  disabled={!newHabitTitle.trim()}
                >
                  <Text style={styles.saveButtonText}>Add Habit</Text>
                </TouchableOpacity>
              </View>
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
  emptyState: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center' as const,
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
  habitsContainer: {
    gap: 16,
  },
  habitCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row' as const,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  habitCardCompleted: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderColor: 'rgba(78, 205, 196, 0.3)',
  },
  habitIcon: {
    marginRight: 16,
    justifyContent: 'center' as const,
  },
  habitContent: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  habitTitleCompleted: {
    color: '#B8C6DB',
  },
  habitDescription: {
    fontSize: 14,
    color: '#B8C6DB',
    marginBottom: 12,
  },
  habitMeta: {
    flexDirection: 'row' as const,
    gap: 10,
    alignItems: 'center' as const,
  },
  timeBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'capitalize' as const,
  },
  streakBadge: {
    backgroundColor: 'rgba(255, 230, 109, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFE66D',
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
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#B8C6DB',
    marginBottom: 10,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  timeSelector: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 10,
    marginBottom: 24,
  },
  timeButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
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
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});

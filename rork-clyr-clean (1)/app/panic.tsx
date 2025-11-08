import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, ScrollView } from 'react-native';
import { useRecovery } from '@/contexts/RecoveryContext';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { X, RefreshCw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { breathingExercise, panicButtonQuotes, distractionActivities } from '@/constants/quotes';

export default function PanicScreen() {
  const router = useRouter();
  const { incrementPanicButton } = useRecovery();
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [randomQuote] = useState(() => panicButtonQuotes[Math.floor(Math.random() * panicButtonQuotes.length)]);
  
  const breathCircleScale = useRef(new Animated.Value(0.8)).current;
  const breathCircleOpacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    incrementPanicButton();
  }, []);

  useEffect(() => {
    if (isBreathing) {
      runBreathingCycle();
    }
  }, [isBreathing, breathingPhase]);

  const runBreathingCycle = () => {
    const currentStep = breathingExercise.steps[breathingPhase];
    setCountdown(currentStep.duration);

    const animations = breathingPhase === 0 
      ? [
          Animated.timing(breathCircleScale, {
            toValue: 1.2,
            duration: currentStep.duration * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(breathCircleOpacity, {
            toValue: 1,
            duration: currentStep.duration * 1000,
            useNativeDriver: true,
          }),
        ]
      : breathingPhase === 2
      ? [
          Animated.timing(breathCircleScale, {
            toValue: 0.8,
            duration: currentStep.duration * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(breathCircleOpacity, {
            toValue: 0.6,
            duration: currentStep.duration * 1000,
            useNativeDriver: true,
          }),
        ]
      : [];

    if (animations.length > 0) {
      Animated.parallel(animations).start();
    }

    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setBreathingPhase((prev) => {
            const next = (prev + 1) % breathingExercise.steps.length;
            return next;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleStartBreathing = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsBreathing(true);
    setBreathingPhase(0);
  };

  const handleStopBreathing = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsBreathing(false);
    setBreathingPhase(0);
    breathCircleScale.setValue(0.8);
    breathCircleOpacity.setValue(0.6);
  };

  const handleClose = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const currentStep = breathingExercise.steps[breathingPhase];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />
      
      <LinearGradient
        colors={['#1A1A2E', '#16213E', '#0F3460']}
        style={styles.gradient}
      >
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <X size={28} color="#FFF" />
        </TouchableOpacity>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>You're Going To Be Okay</Text>
            <Text style={styles.quote}>"{randomQuote}"</Text>
          </View>

          <View style={styles.breathingSection}>
            <Text style={styles.sectionTitle}>Breathing Exercise</Text>
            <Text style={styles.sectionDescription}>{breathingExercise.description}</Text>

            <View style={styles.breathingContainer}>
              <Animated.View
                style={[
                  styles.breathingCircle,
                  {
                    transform: [{ scale: breathCircleScale }],
                    opacity: breathCircleOpacity,
                  },
                ]}
              >
                {isBreathing && (
                  <>
                    <Text style={styles.breathingPhase}>{currentStep.phase}</Text>
                    <Text style={styles.breathingCountdown}>{countdown}</Text>
                    <Text style={styles.breathingInstruction}>{currentStep.instruction}</Text>
                  </>
                )}
                {!isBreathing && (
                  <Text style={styles.breathingStart}>Tap to Start</Text>
                )}
              </Animated.View>
            </View>

            {!isBreathing ? (
              <TouchableOpacity style={styles.startButton} onPress={handleStartBreathing}>
                <Text style={styles.startButtonText}>Start Breathing</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.stopButton} onPress={handleStopBreathing}>
                <RefreshCw size={20} color="#FFF" />
                <Text style={styles.stopButtonText}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.activitiesSection}>
            <Text style={styles.sectionTitle}>Distraction Activities</Text>
            <Text style={styles.sectionDescription}>Try one of these right now</Text>
            <View style={styles.activitiesGrid}>
              {distractionActivities.map((activity) => (
                <View key={activity.id} style={styles.activityCard}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityDescription}>{activity.description}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  gradient: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute' as const,
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 100,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center' as const,
  },
  quote: {
    fontSize: 18,
    color: '#4ECDC4',
    textAlign: 'center' as const,
    fontStyle: 'italic' as const,
    fontWeight: '500' as const,
    paddingHorizontal: 20,
  },
  breathingSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#B8C6DB',
    marginBottom: 24,
  },
  breathingContainer: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 40,
  },
  breathingCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    borderWidth: 3,
    borderColor: '#4ECDC4',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  breathingPhase: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#4ECDC4',
    marginBottom: 8,
  },
  breathingCountdown: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  breathingInstruction: {
    fontSize: 14,
    color: '#B8C6DB',
    textAlign: 'center' as const,
    paddingHorizontal: 20,
  },
  breathingStart: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  startButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center' as const,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1A1A2E',
  },
  stopButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center' as const,
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    gap: 8,
  },
  stopButtonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  activitiesSection: {
    marginBottom: 40,
  },
  activitiesGrid: {
    gap: 12,
  },
  activityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: '#B8C6DB',
  },
});

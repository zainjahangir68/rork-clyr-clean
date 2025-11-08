import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Animated, Modal } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { X, Gamepad2, Dumbbell, Play, CheckCircle, Timer, Wind } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

type TabType = 'games' | 'exercises';

export default function StruggleScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('games');
  
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [gameType, setGameType] = useState<'tap' | 'memory' | 'focus' | null>(null);
  const [gameTimeLeft, setGameTimeLeft] = useState(60);
  const [memoryCards, setMemoryCards] = useState<{ id: number; value: string; flipped: boolean; matched: boolean }[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [focusTarget, setFocusTarget] = useState({ x: 50, y: 50 });
  
  const [exerciseActive, setExerciseActive] = useState<string | null>(null);
  const [exerciseTimeLeft, setExerciseTimeLeft] = useState(0);
  const [breathingPhase, setBreathingPhase] = useState(0);
  const breathCircleScale = useRef(new Animated.Value(0.8)).current;
  
  const [motivationIndex, setMotivationIndex] = useState(0);
  const motivationOpacity = useRef(new Animated.Value(1)).current;

  const motivationQuotes = [
    "Stay calm, stay focused — you've got this.",
    "Every urge passes. Breathe deeply and move forward.",
    "Refocus. Reset. Rise.",
    "You're stronger than this moment.",
    "One choice at a time — you're winning.",
    "The urge is temporary. Your strength is permanent.",
  ];

  const [showGameResult, setShowGameResult] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(motivationOpacity, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(motivationOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
      
      setMotivationIndex((prev) => (prev + 1) % motivationQuotes.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [motivationOpacity, motivationQuotes.length]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isGameActive && gameTimeLeft > 0) {
      interval = setInterval(() => {
        setGameTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGameActive, gameTimeLeft]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (exerciseActive && exerciseTimeLeft > 0) {
      interval = setInterval(() => {
        setExerciseTimeLeft(prev => {
          if (prev <= 1) {
            completeExercise();
            return 0;
          }
          return prev - 1;
        });
        
        if (exerciseActive === 'breathing') {
          const phases = [
            { name: 'Breathe In', duration: 4, scale: 1.3 },
            { name: 'Hold', duration: 4, scale: 1.3 },
            { name: 'Breathe Out', duration: 6, scale: 0.8 },
          ];
          
          const totalDuration = phases.reduce((sum: number, p) => sum + p.duration, 0);
          const currentPhaseIndex = Math.floor((exerciseTimeLeft % totalDuration) / phases[0].duration);
          
          setBreathingPhase(prevPhase => {
            if (currentPhaseIndex !== prevPhase) {
              const targetScale = phases[currentPhaseIndex]?.scale || 1;
              Animated.timing(breathCircleScale, {
                toValue: targetScale,
                duration: phases[currentPhaseIndex]?.duration * 1000 || 4000,
                useNativeDriver: true,
              }).start();
              return currentPhaseIndex;
            }
            return prevPhase;
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [exerciseActive, exerciseTimeLeft, breathCircleScale]);

  const startGame = (type: 'tap' | 'memory' | 'focus') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setGameType(type);
    setGameScore(0);
    setGameTimeLeft(type === 'memory' ? 90 : 60);
    setIsGameActive(true);

    if (type === 'memory') {
      initializeMemoryGame();
    } else if (type === 'focus') {
      moveFocusTarget();
    }
  };

  const initializeMemoryGame = () => {
    const symbols = ['🌟', '🎯', '💪', '🔥', '⚡', '🌈', '🎨', '🚀'];
    const cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5).map((value, index) => ({
      id: index,
      value,
      flipped: false,
      matched: false,
    }));
    setMemoryCards(cards);
  };

  const handleCardFlip = (cardId: number) => {
    if (selectedCards.length === 2) return;
    if (memoryCards[cardId].matched || memoryCards[cardId].flipped) return;

    const updatedCards = memoryCards.map(card =>
      card.id === cardId ? { ...card, flipped: true } : card
    );
    setMemoryCards(updatedCards);

    const newSelected = [...selectedCards, cardId];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      if (memoryCards[first].value === memoryCards[second].value) {
        setTimeout(() => {
          setMemoryCards(prev => prev.map(card =>
            card.id === first || card.id === second ? { ...card, matched: true } : card
          ));
          setGameScore(prev => prev + 10);
          setSelectedCards([]);
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }, 500);
      } else {
        setTimeout(() => {
          setMemoryCards(prev => prev.map(card =>
            card.id === first || card.id === second ? { ...card, flipped: false } : card
          ));
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  const handleTapGame = () => {
    if (!isGameActive || gameType !== 'tap') return;
    setGameScore(prev => prev + 1);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const moveFocusTarget = () => {
    setFocusTarget({
      x: Math.random() * 70 + 15,
      y: Math.random() * 70 + 15,
    });
  };

  const handleFocusHit = () => {
    if (!isGameActive || gameType !== 'focus') return;
    setGameScore(prev => prev + 5);
    moveFocusTarget();
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const endGame = () => {
    setIsGameActive(false);
    setShowGameResult(true);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const closeGameResult = () => {
    setShowGameResult(false);
    setGameType(null);
    setGameScore(0);
  };

  const startExercise = (type: string, duration: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setExerciseActive(type);
    setExerciseTimeLeft(duration);
    if (type === 'breathing') {
      setBreathingPhase(0);
      breathCircleScale.setValue(0.8);
    }
  };

  const completeExercise = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setExerciseActive(null);
  };

  const handleClose = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const handleTabChange = (tab: TabType) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveTab(tab);
  };

  const renderGamesTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabDescription}>
        Redirect your attention with quick, engaging games that help you regain control.
      </Text>

      {!isGameActive && !gameType && (
        <View style={styles.gamesGrid}>
          <TouchableOpacity style={styles.gameCard} onPress={() => startGame('tap')}>
            <LinearGradient colors={['#4ECDC4', '#44A08D']} style={styles.gameCardGradient}>
              <Gamepad2 size={40} color="#FFF" />
              <Text style={styles.gameCardTitle}>Tap Reflex</Text>
              <Text style={styles.gameCardDesc}>Tap as fast as you can in 60 seconds</Text>
              <View style={styles.playButton}>
                <Play size={20} color="#FFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gameCard} onPress={() => startGame('memory')}>
            <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.gameCardGradient}>
              <Gamepad2 size={40} color="#FFF" />
              <Text style={styles.gameCardTitle}>Memory Match</Text>
              <Text style={styles.gameCardDesc}>Find matching pairs</Text>
              <View style={styles.playButton}>
                <Play size={20} color="#FFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gameCard} onPress={() => startGame('focus')}>
            <LinearGradient colors={['#F093FB', '#F5576C']} style={styles.gameCardGradient}>
              <Gamepad2 size={40} color="#FFF" />
              <Text style={styles.gameCardTitle}>Focus Challenge</Text>
              <Text style={styles.gameCardDesc}>Hit the moving targets</Text>
              <View style={styles.playButton}>
                <Play size={20} color="#FFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {isGameActive && gameType === 'tap' && (
        <View style={styles.activeGameContainer}>
          <Text style={styles.gameTimer}>Time: {gameTimeLeft}s</Text>
          <Text style={styles.gameScoreText}>Score: {gameScore}</Text>
          <TouchableOpacity style={styles.tapGameArea} onPress={handleTapGame}>
            <Text style={styles.tapGameText}>TAP!</Text>
          </TouchableOpacity>
        </View>
      )}

      {isGameActive && gameType === 'memory' && (
        <View style={styles.activeGameContainer}>
          <Text style={styles.gameTimer}>Time: {gameTimeLeft}s</Text>
          <Text style={styles.gameScoreText}>Score: {gameScore}</Text>
          <View style={styles.memoryGrid}>
            {memoryCards.map((card, index) => (
              <TouchableOpacity
                key={`memory-card-${card.id}-${index}`}
                style={[
                  styles.memoryCard,
                  card.flipped || card.matched ? styles.memoryCardFlipped : styles.memoryCardHidden
                ]}
                onPress={() => handleCardFlip(card.id)}
                disabled={card.matched}
              >
                <Text style={styles.memoryCardText}>
                  {card.flipped || card.matched ? card.value : '?'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {isGameActive && gameType === 'focus' && (
        <View style={styles.activeGameContainer}>
          <Text style={styles.gameTimer}>Time: {gameTimeLeft}s</Text>
          <Text style={styles.gameScoreText}>Score: {gameScore}</Text>
          <View style={styles.focusGameArea}>
            <TouchableOpacity
              style={[
                styles.focusTarget,
                { left: `${focusTarget.x}%`, top: `${focusTarget.y}%` }
              ]}
              onPress={handleFocusHit}
            >
              <Text style={styles.focusTargetText}>🎯</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  const renderMotivation = () => (
    <Animated.View style={[styles.motivationContainer, { opacity: motivationOpacity }]}>
      <Text style={styles.motivationText}>{motivationQuotes[motivationIndex]}</Text>
    </Animated.View>
  );

  const renderExercisesTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabDescription}>
        Reset your body and mind with quick physical and breathing exercises.
      </Text>

      <View style={styles.exercisesGrid}>
        <TouchableOpacity
          style={styles.exerciseCard}
          onPress={() => startExercise('pushups', 60)}
          disabled={exerciseActive !== null}
        >
          <Dumbbell size={32} color="#4ECDC4" />
          <Text style={styles.exerciseTitle}>10 Push-ups</Text>
          <Text style={styles.exerciseDesc}>Build strength, redirect energy</Text>
          {exerciseActive === 'pushups' ? (
            <View style={styles.exerciseActiveTimer}>
              <Timer size={20} color="#FFE66D" />
              <Text style={styles.exerciseTimerText}>{exerciseTimeLeft}s</Text>
            </View>
          ) : (
            <View style={styles.exerciseStartButton}>
              <Text style={styles.exerciseStartText}>Start</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.exerciseCard}
          onPress={() => startExercise('breathing', 90)}
          disabled={exerciseActive !== null}
        >
          <Wind size={32} color="#667EEA" />
          <Text style={styles.exerciseTitle}>Deep Breathing</Text>
          <Text style={styles.exerciseDesc}>90 seconds of calm breathing</Text>
          {exerciseActive === 'breathing' ? (
            <View style={styles.breathingContainer}>
              <Animated.View style={[styles.breathingCircle, { transform: [{ scale: breathCircleScale }] }]}>
                <Text style={styles.breathingPhaseText}>
                  {['Breathe In', 'Hold', 'Breathe Out'][breathingPhase] || 'Breathe'}
                </Text>
                <Text style={styles.breathingTimerText}>{exerciseTimeLeft}s</Text>
              </Animated.View>
            </View>
          ) : (
            <View style={styles.exerciseStartButton}>
              <Text style={styles.exerciseStartText}>Start</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.exerciseCard}
          onPress={() => startExercise('walk', 120)}
          disabled={exerciseActive !== null}
        >
          <Dumbbell size={32} color="#F5576C" />
          <Text style={styles.exerciseTitle}>Quick Walk</Text>
          <Text style={styles.exerciseDesc}>2 minutes of movement</Text>
          {exerciseActive === 'walk' ? (
            <View style={styles.exerciseActiveTimer}>
              <Timer size={20} color="#FFE66D" />
              <Text style={styles.exerciseTimerText}>{exerciseTimeLeft}s</Text>
            </View>
          ) : (
            <View style={styles.exerciseStartButton}>
              <Text style={styles.exerciseStartText}>Start</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.exerciseCard}
          onPress={() => startExercise('splash', 30)}
          disabled={exerciseActive !== null}
        >
          <Dumbbell size={32} color="#44A08D" />
          <Text style={styles.exerciseTitle}>Cold Water Splash</Text>
          <Text style={styles.exerciseDesc}>Instant alertness boost</Text>
          {exerciseActive === 'splash' ? (
            <View style={styles.exerciseActiveTimer}>
              <Timer size={20} color="#FFE66D" />
              <Text style={styles.exerciseTimerText}>{exerciseTimeLeft}s</Text>
            </View>
          ) : (
            <View style={styles.exerciseStartButton}>
              <Text style={styles.exerciseStartText}>Start</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {exerciseActive && (
        <View style={styles.exerciseCompleteMessage}>
          <CheckCircle size={24} color="#4ECDC4" />
          <Text style={styles.exerciseCompleteText}>
            {exerciseActive === 'breathing'
              ? 'Follow the breathing circle...'
              : `Keep going! ${exerciseTimeLeft}s remaining`}
          </Text>
        </View>
      )}
    </View>
  );



  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />

      <LinearGradient colors={['#667EEA', '#764BA2', '#F093FB']} style={styles.gradient}>
        <View style={{ paddingTop: insets.top, backgroundColor: 'transparent' }} />
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <X size={28} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Overcome the Urge</Text>
          <Text style={styles.subtitle}>Feeling tempted? Let&apos;s take action — right now.</Text>
        </View>

        {renderMotivation()}

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'games' && styles.tabButtonActive]}
            onPress={() => handleTabChange('games')}
          >
            <Gamepad2 size={24} color={activeTab === 'games' ? '#FFF' : '#B8C6DB'} />
            <Text style={[styles.tabButtonText, activeTab === 'games' && styles.tabButtonTextActive]}>
              Play a Game
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'exercises' && styles.tabButtonActive]}
            onPress={() => handleTabChange('exercises')}
          >
            <Dumbbell size={24} color={activeTab === 'exercises' ? '#FFF' : '#B8C6DB'} />
            <Text style={[styles.tabButtonText, activeTab === 'exercises' && styles.tabButtonTextActive]}>
              Do Exercises
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'games' && (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {renderGamesTab()}
          </ScrollView>
        )}
        {activeTab === 'exercises' && (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {renderExercisesTab()}
          </ScrollView>
        )}
      </LinearGradient>

      <Modal visible={showGameResult} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <CheckCircle size={60} color="#4ECDC4" />
            <Text style={styles.modalTitle}>You Did It!</Text>
            <Text style={styles.modalScore}>Final Score: {gameScore}</Text>
            <Text style={styles.modalMessage}>
              The urge fades when your focus changes — you just proved it.
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={closeGameResult}>
              <Text style={styles.modalButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667EEA',
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center' as const,
    fontWeight: '500' as const,
  },
  tabsContainer: {
    flexDirection: 'row' as const,
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center' as const,
    gap: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#B8C6DB',
    textAlign: 'center' as const,
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  tabContent: {
    gap: 20,
  },
  tabDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center' as const,
    marginBottom: 10,
    lineHeight: 24,
  },
  gamesGrid: {
    gap: 16,
  },
  gameCard: {
    borderRadius: 20,
    overflow: 'hidden' as const,
  },
  gameCardGradient: {
    padding: 24,
    alignItems: 'center' as const,
    gap: 12,
  },
  gameCardTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  gameCardDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center' as const,
  },
  playButton: {
    marginTop: 8,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  activeGameContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 24,
    gap: 16,
  },
  gameTimer: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFE66D',
    textAlign: 'center' as const,
  },
  gameScoreText: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'center' as const,
  },
  tapGameArea: {
    backgroundColor: 'rgba(78, 205, 196, 0.3)',
    borderRadius: 16,
    padding: 60,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 3,
    borderColor: '#4ECDC4',
  },
  tapGameText: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  memoryGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
    justifyContent: 'center' as const,
  },
  memoryCard: {
    width: 70,
    height: 70,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  memoryCardHidden: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  memoryCardFlipped: {
    backgroundColor: 'rgba(78, 205, 196, 0.5)',
  },
  memoryCardText: {
    fontSize: 32,
  },
  focusGameArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    height: 300,
    position: 'relative' as const,
  },
  focusTarget: {
    position: 'absolute' as const,
    width: 50,
    height: 50,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  focusTargetText: {
    fontSize: 40,
  },
  exercisesGrid: {
    gap: 16,
  },
  exerciseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center' as const,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  exerciseTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  exerciseDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center' as const,
  },
  exerciseStartButton: {
    backgroundColor: 'rgba(78, 205, 196, 0.3)',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 8,
  },
  exerciseStartText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  exerciseActiveTimer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginTop: 8,
  },
  exerciseTimerText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFE66D',
  },
  breathingContainer: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: 16,
  },
  breathingCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(78, 205, 196, 0.3)',
    borderWidth: 3,
    borderColor: '#4ECDC4',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
  },
  breathingPhaseText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  breathingTimerText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  exerciseCompleteMessage: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  exerciseCompleteText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  motivationContainer: {
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  motivationText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    textAlign: 'center' as const,
    lineHeight: 28,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'rgba(22, 33, 62, 0.95)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center' as const,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.3)',
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  modalScore: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: '#4ECDC4',
  },
  modalMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center' as const,
    lineHeight: 24,
  },
  modalButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginTop: 16,
  },
  modalButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#0F2027',
  },
});

import { View, Text, StyleSheet, ScrollView, Animated, Dimensions, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useRecovery } from '@/contexts/RecoveryContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Award } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import AchievementCard3D from '@/components/AchievementCard3D';

const { width, height } = Dimensions.get('window');

interface ConfettiPiece {
  id: number;
  x: number;
  y: Animated.Value;
  rotation: Animated.Value;
  color: string;
  size: number;
  drift: Animated.Value;
}

export default function AchievementsScreen() {
  const { achievements, getDaysSince, points } = useRecovery();
  const daysSince = getDaysSince();
  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const previousUnlockedCount = useRef(achievements.filter(a => a.unlocked).length);
  const celebrationScale = useRef(new Animated.Value(0)).current;
  const celebrationOpacity = useRef(new Animated.Value(0)).current;
  
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const confettiColors = ['#4ECDC4', '#FFE66D', '#FF9A76', '#95E1D3', '#9D84B7', '#FF6B6B'];

  useEffect(() => {
    if (unlockedCount > previousUnlockedCount.current) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      triggerCelebration();
    }
    previousUnlockedCount.current = unlockedCount;
  }, [unlockedCount, celebrationScale, celebrationOpacity]);

  const triggerCelebration = () => {
    setShowCelebration(true);
    triggerConfetti();
    
    Animated.parallel([
      Animated.spring(celebrationScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(celebrationOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(celebrationScale, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(celebrationOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowCelebration(false);
        celebrationScale.setValue(0);
        celebrationOpacity.setValue(0);
      });
    }, 2000);
  };

  const triggerConfetti = () => {
    const pieces: ConfettiPiece[] = [];
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width;
      const y = new Animated.Value(-50);
      const rotation = new Animated.Value(0);
      const drift = new Animated.Value(0);
      const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      const size = Math.random() * 10 + 6;

      pieces.push({ id: i, x, y, rotation, color, size, drift });

      Animated.parallel([
        Animated.timing(y, {
          toValue: height + 100,
          duration: 3000 + Math.random() * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: Math.random() > 0.5 ? 720 : -720,
          duration: 3000 + Math.random() * 1000,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(drift, {
            toValue: (Math.random() - 0.5) * 100,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(drift, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
    setConfettiPieces(pieces);
    setTimeout(() => setConfettiPieces([]), 4000);
  };
  
  const milestoneAchievements = [
    { 
      id: '7-day', 
      title: 'First Victory', 
      days: 7, 
      unlocked: daysSince >= 7, 
      color: '#4ECDC4', 
      tier: 'bronze' as const,
      date: daysSince >= 7 ? new Date(new Date(achievements.find(a => a.id === 'streak-7')?.unlockedAt || Date.now()).getTime()).toLocaleDateString() : null 
    },
    { 
      id: '30-day', 
      title: 'Building Strength', 
      days: 30, 
      unlocked: daysSince >= 30, 
      color: '#FFE66D', 
      tier: 'silver' as const,
      date: daysSince >= 30 ? new Date(new Date(achievements.find(a => a.id === 'streak-30')?.unlockedAt || Date.now()).getTime()).toLocaleDateString() : null 
    },
    { 
      id: '90-day', 
      title: 'Rewired Mind', 
      days: 90, 
      unlocked: daysSince >= 90, 
      color: '#FF9A76', 
      tier: 'gold' as const,
      date: daysSince >= 90 ? new Date().toLocaleDateString() : null 
    },
    { 
      id: '180-day', 
      title: 'Mastery', 
      days: 180, 
      unlocked: daysSince >= 180, 
      color: '#95E1D3', 
      tier: 'diamond' as const,
      date: daysSince >= 180 ? new Date().toLocaleDateString() : null 
    },
    { 
      id: '365-day', 
      title: 'Freedom', 
      days: 365, 
      unlocked: daysSince >= 365, 
      color: '#9D84B7', 
      tier: 'legendary' as const,
      date: daysSince >= 365 ? new Date().toLocaleDateString() : null 
    },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Achievements',
          headerStyle: { backgroundColor: '#1A1A2E' },
          headerTintColor: '#FFFFFF',
          headerShadowVisible: false,
        }} 
      />
      
      <LinearGradient
        colors={['#1A1A2E', '#16213E', '#0F3460']}
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Award size={48} color="#FFE66D" />
            </View>
            <Text style={styles.title}>Your Milestones</Text>
            <Text style={styles.subtitle}>
              {unlockedCount} of {achievements.length} unlocked • {points} pts
            </Text>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${(unlockedCount / achievements.length) * 100}%` }
                ]} 
              />
            </View>
          </View>

          <View style={styles.achievementsContainer}>
            <Text style={styles.sectionTitle}>3D Collectible Cards</Text>
            <Text style={styles.sectionSubtitle}>Tap unlocked cards to see them rotate</Text>
            <View style={styles.cardsContainer}>
              {milestoneAchievements.map((milestone, index) => (
                <AchievementCard3D
                  key={`milestone-achievement-${milestone.id}-${index}`}
                  title={milestone.title}
                  days={milestone.days}
                  unlocked={milestone.unlocked}
                  color={milestone.color}
                  date={milestone.date}
                  tier={milestone.tier}
                />
              ))}
            </View>
          </View>

          <View style={styles.motivationSection}>
            <Text style={styles.motivationText}>
              Keep going! Each day brings you closer to your next achievement.
            </Text>
          </View>
        </ScrollView>

        {showCelebration && (
          <Animated.View
            style={[
              styles.celebrationContainer,
              {
                opacity: celebrationOpacity,
                transform: [{ scale: celebrationScale }],
              },
            ]}
          >
            <LinearGradient
              colors={['rgba(26, 26, 46, 0.95)', 'rgba(22, 33, 62, 0.95)']}
              style={styles.celebrationBox}
            >
              <View style={styles.celebrationIcon}>
                <Award size={60} color="#FFE66D" />
              </View>
              <Text style={styles.celebrationTitle}>Achievement Unlocked!</Text>
              <Text style={styles.celebrationSubtitle}>Your new card is ready to collect</Text>
            </LinearGradient>
          </Animated.View>
        )}

        {confettiPieces.map((piece) => (
          <Animated.View
            key={`confetti-${piece.id}`}
            style={[
              styles.confetti,
              {
                left: piece.x,
                width: piece.size,
                height: piece.size,
                backgroundColor: piece.color,
                transform: [
                  { translateY: piece.y },
                  { translateX: piece.drift },
                  {
                    rotate: piece.rotation.interpolate({
                      inputRange: [0, 720],
                      outputRange: ['0deg', '720deg'],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center' as const,
    marginBottom: 30,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#B8C6DB',
    marginBottom: 20,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden' as const,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
  },
  achievementsContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  milestonesGrid: {
    gap: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#B8C6DB',
    marginBottom: 20,
    textAlign: 'center' as const,
  },
  milestoneCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center' as const,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  milestoneCardLocked: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed' as const,
  },
  milestoneCardUnlocked: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(78, 205, 196, 0.4)',
    borderStyle: 'solid' as const,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  cardContent: {
    width: '100%',
    alignItems: 'center' as const,
  },
  cardBadge: {
    position: 'absolute' as const,
    top: -10,
    right: -10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  cardBadgeText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  lockOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 12,
  },
  lockIconWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 16,
    borderRadius: 50,
  },
  lockText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  shimmerOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden' as const,
  },
  shimmer: {
    width: 100,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  milestoneIconContainer: {
    marginBottom: 16,
  },
  milestoneTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#8A8A9D',
    marginBottom: 16,
    textAlign: 'center' as const,
  },
  progressSection: {
    width: '100%',
    gap: 8,
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden' as const,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#B8C6DB',
    textAlign: 'center' as const,
  },
  milestoneBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  milestoneBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  milestoneBadgeLocked: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  milestoneBadgeTextLocked: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#5A5A7D',
  },
  motivationSection: {
    backgroundColor: 'rgba(255, 230, 109, 0.1)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 230, 109, 0.3)',
  },
  motivationText: {
    fontSize: 16,
    color: '#FFE66D',
    textAlign: 'center' as const,
    fontWeight: '500' as const,
  },
  confetti: {
    position: 'absolute' as const,
    borderRadius: 2,
  },
  cardsContainer: {
    gap: 20,
  },
  celebrationContainer: {
    position: 'absolute' as const,
    top: '40%',
    left: 30,
    right: 30,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    zIndex: 100,
  },
  celebrationBox: {
    width: '100%',
    padding: 30,
    borderRadius: 24,
    alignItems: 'center' as const,
    gap: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 230, 109, 0.3)',
  },
  celebrationIcon: {
    marginBottom: 8,
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#FFE66D',
    textAlign: 'center' as const,
  },
  celebrationSubtitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#B8C6DB',
    textAlign: 'center' as const,
  },
});

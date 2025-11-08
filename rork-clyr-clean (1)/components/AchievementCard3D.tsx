import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Star, Trophy, Award, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface AchievementCard3DProps {
  title: string;
  days: number;
  unlocked: boolean;
  color: string;
  date?: string | null;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond' | 'legendary';
}

const tierConfig = {
  bronze: {
    name: 'Bronze Clyr Card',
    icon: Shield,
    accentColor: '#CD7F32',
    shimmerColors: ['rgba(205, 127, 50, 0.8)', 'rgba(255, 215, 0, 0.4)', 'rgba(205, 127, 50, 0.8)'] as const,
  },
  silver: {
    name: 'Silver Clyr Card',
    icon: Star,
    accentColor: '#C0C0C0',
    shimmerColors: ['rgba(192, 192, 192, 0.8)', 'rgba(255, 255, 255, 0.6)', 'rgba(192, 192, 192, 0.8)'] as const,
  },
  gold: {
    name: 'Gold Clyr Card',
    icon: Trophy,
    accentColor: '#FFD700',
    shimmerColors: ['rgba(255, 215, 0, 1)', 'rgba(255, 255, 255, 0.8)', 'rgba(255, 215, 0, 1)'] as const,
  },
  diamond: {
    name: 'Diamond Clyr Card',
    icon: Award,
    accentColor: '#B9F2FF',
    shimmerColors: ['rgba(185, 242, 255, 1)', 'rgba(255, 255, 255, 1)', 'rgba(185, 242, 255, 1)'] as const,
  },
  legendary: {
    name: 'Legendary Clyr Card',
    icon: Sparkles,
    accentColor: '#9D84B7',
    shimmerColors: ['rgba(157, 132, 183, 1)', 'rgba(255, 215, 0, 0.8)', 'rgba(255, 105, 180, 0.8)', 'rgba(157, 132, 183, 1)'] as const,
  },
};

export default function AchievementCard3D({ title, days, unlocked, color, date, tier }: AchievementCard3DProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const [isRotating, setIsRotating] = useState(false);

  const config = tierConfig[tier];
  const Icon = config.icon;

  useEffect(() => {
    if (unlocked) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.5,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [unlocked, shimmerAnim, glowAnim]);

  const handlePress = () => {
    if (!unlocked || isRotating) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsRotating(true);
    Animated.sequence([
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsRotating(false);
    });
  };

  const rotateY = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const shimmerPosition = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: [0, 0.8, 0.8, 0],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  return (
    <TouchableOpacity
      activeOpacity={unlocked ? 0.9 : 1}
      onPress={handlePress}
      disabled={!unlocked}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.cardContainer,
          unlocked && {
            shadowColor: config.accentColor,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: glowOpacity,
            shadowRadius: 20,
            elevation: 15,
          },
          {
            transform: [
              { perspective: 1000 },
              { rotateY },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={
            unlocked
              ? [config.accentColor, color, '#1A1A2E']
              : ['rgba(90, 90, 125, 0.3)', 'rgba(40, 40, 60, 0.3)', 'rgba(26, 26, 46, 0.5)']
          }
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {unlocked && (
            <Animated.View
              style={[
                styles.shimmerOverlay,
                {
                  transform: [{ translateX: shimmerPosition }],
                  opacity: shimmerOpacity,
                },
              ]}
            >
              <LinearGradient
                colors={config.shimmerColors}
                style={styles.shimmerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </Animated.View>
          )}

          <View style={styles.cardHeader}>
            <Text style={[styles.seriesText, unlocked && { color: config.accentColor }]}>
              Clyr Achievement Series
            </Text>
          </View>

          <View style={styles.cardBody}>
            <Animated.View
              style={[
                styles.iconContainer,
                unlocked && {
                  shadowColor: config.accentColor,
                  shadowOpacity: glowOpacity,
                  shadowRadius: 15,
                },
              ]}
            >
              <Icon
                size={80}
                color={unlocked ? config.accentColor : '#5A5A7D'}
                strokeWidth={2}
              />
            </Animated.View>

            <View style={styles.badgeContainer}>
              <View style={[styles.daysBadge, { backgroundColor: unlocked ? config.accentColor : '#5A5A7D' }]}>
                <Text style={styles.daysBadgeText}>{days}D</Text>
              </View>
            </View>

            <Text style={[styles.cardTitle, unlocked && { color: config.accentColor }]}>
              {title}
            </Text>

            <Text style={[styles.tierName, unlocked && { color: '#FFFFFF' }]}>
              {config.name}
            </Text>
          </View>

          <View style={styles.cardFooter}>
            {unlocked && date ? (
              <Text style={styles.unlockedDate}>Earned {date}</Text>
            ) : (
              <Text style={styles.lockedText}>{days - Math.floor(days)} days remaining</Text>
            )}
          </View>

          {unlocked && (
            <View style={styles.holographicOverlay}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.1)', 'transparent', 'rgba(255, 255, 255, 0.05)']}
                style={styles.holoGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </View>
          )}

          <View style={styles.borderFrame} />
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    alignItems: 'center' as const,
  },
  cardContainer: {
    width: width - 60,
    height: 380,
    borderRadius: 20,
    overflow: 'hidden' as const,
  },
  cardGradient: {
    width: '100%',
    height: '100%',
    padding: 24,
    position: 'relative' as const,
  },
  shimmerOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: -100,
    width: 200,
    height: '100%',
    zIndex: 10,
  },
  shimmerGradient: {
    width: '100%',
    height: '100%',
    transform: [{ skewX: '-15deg' }],
  },
  cardHeader: {
    alignItems: 'center' as const,
    marginBottom: 20,
  },
  seriesText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#5A5A7D',
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
  },
  cardBody: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 16,
  },
  iconContainer: {
    padding: 20,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  badgeContainer: {
    position: 'absolute' as const,
    top: 10,
    right: 10,
  },
  daysBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  daysBadgeText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#5A5A7D',
    textAlign: 'center' as const,
  },
  tierName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#5A5A7D',
    textAlign: 'center' as const,
    letterSpacing: 1,
  },
  cardFooter: {
    alignItems: 'center' as const,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  unlockedDate: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#B8C6DB',
  },
  lockedText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#5A5A7D',
  },
  holographicOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  holoGradient: {
    width: '100%',
    height: '100%',
  },
  borderFrame: {
    position: 'absolute' as const,
    top: 12,
    left: 12,
    right: 12,
    bottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    zIndex: 3,
  },
});

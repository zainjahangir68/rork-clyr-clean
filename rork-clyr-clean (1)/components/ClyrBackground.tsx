import React, { useEffect, useRef, useMemo, useState, memo } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface ClyrBackgroundProps {
  children: React.ReactNode;
  variant?: 'default' | 'light' | 'evening';
  calmingMode?: boolean;
}

const BUBBLE_COUNT = 6;
const SHOOTING_STAR_COUNT = 3;
const STAR_COUNT = 40;
const NEBULA_COUNT = 4;

const ClyrBackground = memo(function ClyrBackground({ children, variant = 'default', calmingMode = true }: ClyrBackgroundProps) {
  const [animationsReady, setAnimationsReady] = useState(false);
  const gradientAnim = useRef(new Animated.Value(0)).current;
  const breathingAnim = useRef(new Animated.Value(0)).current;
  const bubbleAnims = useRef<Animated.Value[]>(
    Array.from({ length: BUBBLE_COUNT }, () => new Animated.Value(0))
  ).current;
  const shootingStarAnims = useRef<Animated.Value[]>(
    Array.from({ length: SHOOTING_STAR_COUNT }, () => new Animated.Value(0))
  ).current;
  const starTwinkleAnims = useRef<Animated.Value[]>(
    Array.from({ length: STAR_COUNT }, () => new Animated.Value(0))
  ).current;
  const nebulaAnims = useRef<Animated.Value[]>(
    Array.from({ length: NEBULA_COUNT }, () => new Animated.Value(0))
  ).current;

  const bubbles = useMemo(
    () =>
      Array.from({ length: BUBBLE_COUNT }, (_, i) => ({
        id: i,
        left: Math.random() * width,
        startY: height + Math.random() * 300,
        size: 150 + Math.random() * 250,
        duration: 30000 + Math.random() * 20000,
        delay: Math.random() * 15000,
      })),
    []
  );

  const shootingStars = useMemo(
    () =>
      Array.from({ length: SHOOTING_STAR_COUNT }, (_, i) => ({
        id: i,
        startX: Math.random() * width,
        startY: Math.random() * (height * 0.4),
        length: 80 + Math.random() * 120,
        duration: 1800 + Math.random() * 1200,
        delay: Math.random() * 8000,
      })),
    []
  );

  const stars = useMemo(
    () =>
      Array.from({ length: STAR_COUNT }, (_, i) => ({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height * 0.7,
        size: 1 + Math.random() * 2,
        duration: 2000 + Math.random() * 3000,
        delay: Math.random() * 5000,
      })),
    []
  );

  const nebulae = useMemo(
    () =>
      Array.from({ length: NEBULA_COUNT }, (_, i) => ({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height * 0.6,
        size: 200 + Math.random() * 300,
        duration: 20000 + Math.random() * 10000,
        delay: Math.random() * 8000,
      })),
    []
  );

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setAnimationsReady(true);

      const gradient = Animated.loop(
        Animated.sequence([
          Animated.timing(gradientAnim, {
            toValue: 1,
            duration: 15000,
            useNativeDriver: false,
          }),
          Animated.timing(gradientAnim, {
            toValue: 2,
            duration: 15000,
            useNativeDriver: false,
          }),
          Animated.timing(gradientAnim, {
            toValue: 3,
            duration: 15000,
            useNativeDriver: false,
          }),
          Animated.timing(gradientAnim, {
            toValue: 0,
            duration: 15000,
            useNativeDriver: false,
          }),
        ])
      );
      gradient.start();

      if (calmingMode) {
        const breathing = Animated.loop(
          Animated.sequence([
            Animated.timing(breathingAnim, {
              toValue: 1,
              duration: 8000,
              useNativeDriver: true,
            }),
            Animated.timing(breathingAnim, {
              toValue: 0,
              duration: 8000,
              useNativeDriver: true,
            }),
          ])
        );
        breathing.start();
      }

      bubbleAnims.forEach((anim, i) => {
        const bubble = bubbles[i];
        Animated.loop(
          Animated.sequence([
            Animated.delay(bubble.delay),
            Animated.timing(anim, {
              toValue: 1,
              duration: bubble.duration,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        ).start();
      });

      shootingStarAnims.forEach((anim, i) => {
        const star = shootingStars[i];
        Animated.loop(
          Animated.sequence([
            Animated.delay(star.delay),
            Animated.timing(anim, {
              toValue: 1,
              duration: star.duration,
              useNativeDriver: true,
            }),
            Animated.delay(6000 + Math.random() * 4000),
            Animated.timing(anim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        ).start();
      });

      starTwinkleAnims.forEach((anim, i) => {
        const star = stars[i];
        Animated.loop(
          Animated.sequence([
            Animated.delay(star.delay),
            Animated.timing(anim, {
              toValue: 1,
              duration: star.duration,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: star.duration,
              useNativeDriver: true,
            }),
          ])
        ).start();
      });

      nebulaAnims.forEach((anim, i) => {
        const nebula = nebulae[i];
        Animated.loop(
          Animated.sequence([
            Animated.delay(nebula.delay),
            Animated.timing(anim, {
              toValue: 1,
              duration: nebula.duration,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: nebula.duration,
              useNativeDriver: true,
            }),
          ])
        ).start();
      });
    }, 300);

    return () => {
      clearTimeout(startTimer);
      gradientAnim.stopAnimation();
      breathingAnim.stopAnimation();
      bubbleAnims.forEach((anim) => anim.stopAnimation());
      shootingStarAnims.forEach((anim) => anim.stopAnimation());
      starTwinkleAnims.forEach((anim) => anim.stopAnimation());
      nebulaAnims.forEach((anim) => anim.stopAnimation());
    };
  }, [gradientAnim, breathingAnim, bubbleAnims, bubbles, calmingMode, shootingStarAnims, shootingStars, starTwinkleAnims, stars, nebulaAnims, nebulae]);

  const gradientColors = gradientAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: ['#0E172A', '#1A2744', '#2B3C5F', '#1A2744'],
  });

  const breathingScale = breathingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.03],
  });

  const breathingOpacity = breathingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.05, 0.1],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.gradient,
          { backgroundColor: animationsReady ? gradientColors : '#0E172A' },
        ]}
      >
        {animationsReady && nebulae.map((nebula, i) => {
          const anim = nebulaAnims[i];
          const opacity = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.15, 0.3],
          });

          return (
            <Animated.View
              key={`nebula-${nebula.id}`}
              style={[
                styles.nebula,
                {
                  left: nebula.x - nebula.size / 2,
                  top: nebula.y - nebula.size / 2,
                  width: nebula.size,
                  height: nebula.size,
                  opacity,
                },
              ]}
            />
          );
        })}

        {animationsReady && stars.map((star, i) => {
          const anim = starTwinkleAnims[i];
          const opacity = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.2, 1],
          });

          return (
            <Animated.View
              key={`star-${star.id}`}
              style={[
                styles.star,
                {
                  left: star.x,
                  top: star.y,
                  width: star.size,
                  height: star.size,
                  opacity,
                },
              ]}
            />
          );
        })}

        {animationsReady && shootingStars.map((star, i) => {
          const anim = shootingStarAnims[i];
          const translateX = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, star.length * 2],
          });
          const translateY = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, star.length],
          });
          const opacity = anim.interpolate({
            inputRange: [0, 0.3, 0.7, 1],
            outputRange: [0, 1, 1, 0],
          });

          return (
            <Animated.View
              key={`shooting-star-${star.id}`}
              style={[
                styles.shootingStar,
                {
                  left: star.startX,
                  top: star.startY,
                  width: star.length,
                  transform: [{ translateX }, { translateY }],
                  opacity,
                },
              ]}
            />
          );
        })}

        {animationsReady && bubbles.map((bubble, i) => {
          const anim = bubbleAnims[i];
          const translateY = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [bubble.startY, -200],
          });
          const scale = anim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [1, 1.12, 1],
          });
          const baseOpacity = anim.interpolate({
            inputRange: [0, 0.15, 0.85, 1],
            outputRange: [0, 0.08, 0.08, 0],
          });
          const opacity = calmingMode ? Animated.multiply(baseOpacity, breathingOpacity.interpolate({
            inputRange: [0.08, 0.18],
            outputRange: [0.8, 1.2],
          })) : baseOpacity;

          return (
            <Animated.View
              key={bubble.id}
              style={[
                styles.bubble,
                {
                  left: bubble.left,
                  width: bubble.size,
                  height: bubble.size,
                  transform: [
                    { translateY },
                    { scale: calmingMode ? Animated.multiply(scale, breathingScale) : scale },
                  ],
                  opacity: opacity,
                },
              ]}
            />
          );
        })}

        {children}
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  bubble: {
    position: 'absolute' as const,
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 60,
  },
  star: {
    position: 'absolute' as const,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
  },
  shootingStar: {
    position: 'absolute' as const,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    shadowColor: '#3EC5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    transform: [{ rotate: '-45deg' }],
  },
  nebula: {
    position: 'absolute' as const,
    borderRadius: 1000,
    backgroundColor: 'rgba(62, 140, 255, 0.15)',
    shadowColor: '#3E8CFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 80,
  },
});

export default ClyrBackground;

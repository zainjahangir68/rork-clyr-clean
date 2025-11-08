import React, { useEffect, useRef, useState, memo } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, Text, Easing, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface ShieldBadgeProps {
  onPress: () => void;
  isCheckedIn: boolean;
  disabled?: boolean;
}

const ShieldBadge = memo(function ShieldBadge({ onPress, isCheckedIn, disabled }: ShieldBadgeProps) {
  const breathingAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const orbScaleAnim = useRef(new Animated.Value(1)).current;
  const ringSpeedAnim = useRef(new Animated.Value(1)).current;
  const intensityAnim = useRef(new Animated.Value(1)).current;
  const ringRotateAnim = useRef(new Animated.Value(0)).current;
  const activeGlowAnim = useRef(new Animated.Value(0)).current;
  const swirlRotateAnim = useRef(new Animated.Value(0)).current;
  const swirlRotateAnim2 = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const tapSwirlAnim = useRef(new Animated.Value(0)).current;
  const tapGlowAnim = useRef(new Animated.Value(0)).current;
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathingAnim, {
          toValue: 1.04,
          duration: 3500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breathingAnim, {
          toValue: 1,
          duration: 3500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [breathingAnim]);

  useEffect(() => {
    Animated.loop(
      Animated.timing(ringRotateAnim, {
        toValue: 1,
        duration: isCheckedIn ? 6000 : 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [ringRotateAnim, isCheckedIn]);

  useEffect(() => {
    if (isCheckedIn) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(activeGlowAnim, {
            toValue: 1,
            duration: 2500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(activeGlowAnim, {
            toValue: 0.7,
            duration: 2500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.timing(swirlRotateAnim, {
          toValue: 1,
          duration: 12000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.timing(swirlRotateAnim2, {
          toValue: 1,
          duration: 18000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      const shimmerLoop = Animated.loop(
        Animated.sequence([
          Animated.delay(10000),
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
      shimmerLoop.start();
    }
  }, [isCheckedIn, activeGlowAnim, swirlRotateAnim, swirlRotateAnim2, shimmerAnim]);

  const handlePress = () => {
    if (!disabled && !isCheckedIn && !hasAnimated) {
      setHasAnimated(true);
      
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      Animated.parallel([
        Animated.sequence([
          Animated.timing(orbScaleAnim, {
            toValue: 1.08,
            duration: 150,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(orbScaleAnim, {
            toValue: 1,
            duration: 250,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(ringSpeedAnim, {
            toValue: 3,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(ringSpeedAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ]),
        Animated.sequence([
          Animated.timing(intensityAnim, {
            toValue: 1.5,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(intensityAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
          }),
        ]),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(tapSwirlAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(tapGlowAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(100),
          Animated.timing(tapGlowAnim, {
            toValue: 0,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        waveAnim.setValue(0);
        glowAnim.setValue(0);
        tapSwirlAnim.setValue(0);
      });
      
      onPress();
    }
  };

  const waveScale = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.2],
  });

  const waveOpacity = waveAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0.7, 0.4, 0],
  });

  const glowIntensity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  const ringRotate = ringRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const activeGlowOpacity = activeGlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  const swirlRotation = swirlRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const swirlRotation2 = swirlRotateAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  const tapSwirlOpacity = tapSwirlAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 1, 1],
  });

  const tapGlowScale = tapGlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  const tapGlowOpacity = tapGlowAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.8, 0],
  });

  const shimmerPosition = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.6, 0],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={handlePress}
      disabled={disabled || isCheckedIn}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.orbContainer,
          {
            transform: [
              { scale: breathingAnim },
              { scale: orbScaleAnim },
            ],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.waveEffect,
            {
              transform: [{ scale: waveScale }],
              opacity: waveOpacity,
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(166, 246, 255, 0.6)', 'rgba(0, 198, 255, 0.3)', 'transparent']}
            style={styles.waveGradient}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.rotatingRing,
            {
              transform: [{ rotate: ringRotate }],
              opacity: isCheckedIn ? 0.7 : 0.5,
            },
          ]}
        >
          <View style={styles.ringSegment1}>
            <LinearGradient
              colors={isCheckedIn ? ['rgba(166, 246, 255, 0.9)', 'transparent'] : ['rgba(0, 159, 253, 0.7)', 'transparent']}
              style={styles.ringGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.glowLayer,
            {
              opacity: isCheckedIn ? activeGlowOpacity : glowIntensity,
            },
          ]}
        >
          <LinearGradient
            colors={
              isCheckedIn
                ? ['rgba(166, 246, 255, 0.5)', 'rgba(0, 198, 255, 0.3)']
                : ['rgba(0, 159, 253, 0.4)', 'rgba(42, 42, 114, 0.3)']
            }
            style={styles.glowGradient}
          />
        </Animated.View>

        {isCheckedIn && (
          <Animated.View
            style={[
              styles.perimeterRing,
              {
                opacity: activeGlowOpacity,
              },
            ]}
          >
            <View style={styles.perimeterRingInner} />
          </Animated.View>
        )}

        {!isCheckedIn && (
          <Animated.View
            style={[
              styles.tapGlowRing,
              {
                opacity: tapGlowOpacity,
                transform: [{ scale: tapGlowScale }],
              },
            ]}
          >
            <LinearGradient
              colors={['rgba(0, 229, 255, 0.8)', 'rgba(90, 0, 255, 0.6)', 'rgba(212, 106, 255, 0.4)', 'transparent']}
              style={styles.tapGlowGradient}
            />
          </Animated.View>
        )}

        <View style={styles.orbMain}>
          {isCheckedIn ? (
            <>
              <Animated.View
                style={[
                  styles.swirlLayer,
                  {
                    transform: [{ rotate: swirlRotation }],
                  },
                ]}
              >
                <LinearGradient
                  colors={['#00E5FF', '#007BFF', '#5A00FF', '#D46AFF', '#00E5FF']}
                  style={styles.swirlGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  locations={[0, 0.25, 0.5, 0.75, 1]}
                />
              </Animated.View>

              <Animated.View
                style={[
                  styles.swirlLayer2,
                  {
                    transform: [{ rotate: swirlRotation2 }],
                    opacity: 0.6,
                  },
                ]}
              >
                <LinearGradient
                  colors={['transparent', '#007BFF', 'transparent', '#D46AFF', 'transparent']}
                  style={styles.swirlGradient}
                  start={{ x: 1, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  locations={[0, 0.25, 0.5, 0.75, 1]}
                />
              </Animated.View>

              <Animated.View
                style={[
                  styles.swirlLayer3,
                  {
                    transform: [{ rotate: swirlRotation }],
                    opacity: 0.5,
                  },
                ]}
              >
                <LinearGradient
                  colors={['#5A00FF', 'transparent', '#00E5FF', 'transparent', '#5A00FF']}
                  style={styles.swirlGradient}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  locations={[0, 0.25, 0.5, 0.75, 1]}
                />
              </Animated.View>

              <View style={styles.glassOverlay}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.25)', 'transparent', 'rgba(0, 0, 0, 0.1)']}
                  style={styles.glassGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                />
              </View>

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
                  colors={['transparent', 'rgba(255, 255, 255, 0.8)', 'transparent']}
                  style={styles.shimmerGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </Animated.View>

              <View style={styles.textContainer}>
                <Text style={styles.checkedInText}>Clyr Mode: ON</Text>
              </View>
            </>
          ) : (
            <>
              <Animated.View
                style={[
                  styles.tapSwirlContainer,
                  {
                    opacity: tapSwirlOpacity,
                  },
                ]}
              >
                <Animated.View
                  style={[
                    styles.tapSwirlLayer,
                    {
                      transform: [{ rotate: swirlRotation }],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={['#00E5FF', '#007BFF', '#5A00FF', '#D46AFF', '#00E5FF']}
                    style={styles.tapSwirlGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    locations={[0, 0.25, 0.5, 0.75, 1]}
                  />
                </Animated.View>

                <Animated.View
                  style={[
                    styles.tapSwirlLayer,
                    {
                      transform: [{ rotate: swirlRotation2 }],
                      opacity: 0.7,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={['transparent', '#007BFF', 'transparent', '#D46AFF', 'transparent']}
                    style={styles.tapSwirlGradient}
                    start={{ x: 1, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    locations={[0, 0.25, 0.5, 0.75, 1]}
                  />
                </Animated.View>
              </Animated.View>

              <LinearGradient
                colors={['#009FFD', '#2A2A72', '#00C6FF']}
                style={styles.orbGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.glassOverlay}>
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.3)', 'transparent', 'rgba(0, 0, 0, 0.1)']}
                    style={styles.glassGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  />
                </View>

                <View style={styles.textContainer}>
                  <Text style={styles.stayingClyrText}>Staying CLYR</Text>
                </View>
              </LinearGradient>
            </>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginVertical: 20,
  },
  orbContainer: {
    position: 'relative' as const,
    width: 240,
    height: 240,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  waveEffect: {
    position: 'absolute' as const,
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  waveGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 120,
  },
  rotatingRing: {
    position: 'absolute' as const,
    width: 270,
    height: 270,
    borderRadius: 135,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  ringSegment1: {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    borderRadius: 135,
    overflow: 'hidden' as const,
  },
  ringGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 135,
    borderWidth: 3,
    borderColor: 'rgba(166, 246, 255, 0.4)',
  },
  glowLayer: {
    position: 'absolute' as const,
    width: 290,
    height: 290,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 145,
  },
  perimeterRing: {
    position: 'absolute' as const,
    width: 250,
    height: 250,
    borderRadius: 125,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  perimeterRingInner: {
    width: '100%',
    height: '100%',
    borderRadius: 125,
    borderWidth: 3,
    borderColor: 'rgba(166, 246, 255, 0.8)',
    shadowColor: '#A6F6FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 15,
  },
  orbMain: {
    width: 220,
    height: 220,
    borderRadius: 110,
    overflow: 'hidden' as const,
    shadowColor: '#009FFD',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 20,
    position: 'relative' as const,
  },
  swirlLayer: {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    borderRadius: 110,
  },
  swirlLayer2: {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    borderRadius: 110,
  },
  swirlLayer3: {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    borderRadius: 110,
  },
  tapGlowRing: {
    position: 'absolute' as const,
    width: 300,
    height: 300,
    borderRadius: 150,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  tapGlowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 150,
  },
  tapSwirlContainer: {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    borderRadius: 110,
    zIndex: 1,
  },
  tapSwirlLayer: {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    borderRadius: 110,
  },
  tapSwirlGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 110,
  },
  swirlGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 110,
  },
  orbGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    position: 'relative' as const,
  },
  glassOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  glassGradient: {
    width: '100%',
    height: '100%',
  },
  shimmerOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: -150,
    width: 300,
    height: '100%',
    zIndex: 6,
  },
  shimmerGradient: {
    width: '100%',
    height: '100%',
    transform: [{ skewX: '-20deg' }],
  },
  textContainer: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    zIndex: 10,
  },
  stayingClyrText: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 1,
    textShadowColor: 'rgba(166, 246, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    ...Platform.select({
      web: {
        userSelect: 'none',
      } as any,
    }),
  },
  checkedInText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(128, 223, 255, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
    ...Platform.select({
      web: {
        userSelect: 'none',
      } as any,
    }),
  },
});

export default ShieldBadge;

import { StyleSheet, Animated, Image } from 'react-native';
import React, { useEffect, useRef, memo } from 'react';

const ClyrHeader = memo(function ClyrHeader() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const breathingAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(breathingAnim, {
          toValue: 1.03,
          duration: 6000,
          useNativeDriver: true,
        }),
        Animated.timing(breathingAnim, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, breathingAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: breathingAnim }],
        },
      ]}
    >
      <Image
        source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/9guzu6svii13o6vw9jhiq' }}
        style={styles.logo}
        resizeMode="contain"
      />
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingTop: 40,
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  logo: {
    width: '90%',
    maxWidth: 450,
    aspectRatio: 2.5,
  },
});

export default ClyrHeader;

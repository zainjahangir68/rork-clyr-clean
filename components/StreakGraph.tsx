import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface StreakGraphProps {
  daysSince: number;
  data: number[];
}

export default function StreakGraph({ daysSince, data }: StreakGraphProps) {
  const animValues = useRef(data.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = animValues.map((anim, index) =>
      Animated.timing(anim, {
        toValue: data[index] || 0,
        duration: 800,
        delay: index * 50,
        useNativeDriver: false,
      })
    );
    Animated.stagger(50, animations).start();
  }, [data, animValues]);

  const maxValue = Math.max(...data, 1);

  return (
    <View style={styles.container}>
      <View style={styles.graphContainer}>
        {data.map((value, index) => {
          const heightPercent = (value / maxValue) * 100;
          const animatedHeight = animValues[index].interpolate({
            inputRange: [0, maxValue],
            outputRange: ['0%', '100%'],
          });

          return (
            <View key={index} style={styles.barWrapper}>
              <Animated.View
                style={[
                  styles.bar,
                  {
                    height: animatedHeight,
                    opacity: 0.3 + (heightPercent / 100) * 0.7,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    marginBottom: 16,
  },
  graphContainer: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
    justifyContent: 'space-between' as const,
    gap: 4,
  },
  barWrapper: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end' as const,
    alignItems: 'center' as const,
  },
  bar: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    minHeight: 3,
    shadowColor: '#A9F0FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});

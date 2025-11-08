import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const FACTS = [
  "Studies suggest frequent porn use can lower motivation and focus over time.",
  "Many users report that porn changes what they find attractive in real life.",
  "Research links excessive porn to increased anxiety and depression symptoms.",
  "Overuse may desensitise the brain's reward system, similar to addictive behaviours.",
  "Some people struggle with maintaining real relationships due to unrealistic expectations.",
  "Heavy use can rewire dopamine pathways, making it harder to feel satisfaction from normal life.",
  "Exposure to extreme content can gradually shift personal sexual boundaries.",
  "Cutting back has been associated with more confidence and mental clarity.",
  "Compulsive consumption can be tied to loneliness and isolation.",
  "Real recovery stories show that quitting helps people regain energy and purpose.",
];

const FloatingFactsDisplay = () => {
  const [currentFact, setCurrentFact] = useState('');
  const [factPosition, setFactPosition] = useState({ x: 0, y: 0 });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateXAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getRandomPosition = () => {
    const padding = 40;
    const maxX = width * 0.6;
    const maxY = height * 0.5;
    
    return {
      x: padding + Math.random() * maxX,
      y: padding + Math.random() * maxY,
    };
  };

  const getRandomFact = () => {
    return FACTS[Math.floor(Math.random() * FACTS.length)];
  };

  const showFact = useCallback(() => {
    const newFact = getRandomFact();
    const position = getRandomPosition();
    
    setCurrentFact(newFact);
    setFactPosition(position);

    fadeAnim.setValue(0);
    translateXAnim.setValue(0);
    translateYAnim.setValue(0);

    const driftX = Math.random() > 0.5 ? 30 + Math.random() * 20 : -(30 + Math.random() * 20);
    const driftY = -(20 + Math.random() * 30);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(translateXAnim, {
          toValue: driftX * 0.3,
          duration: 6000,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: driftY * 0.3,
          duration: 6000,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1000 + Math.random() * 2000),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(translateXAnim, {
          toValue: driftX,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: driftY,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      const nextDelay = 10000 + Math.random() * 10000;
      timeoutRef.current = setTimeout(showFact, nextDelay);
    });
  }, [fadeAnim, translateXAnim, translateYAnim]);

  useEffect(() => {
    const initialDelay = 3000 + Math.random() * 5000;
    timeoutRef.current = setTimeout(showFact, initialDelay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      fadeAnim.stopAnimation();
      translateXAnim.stopAnimation();
      translateYAnim.stopAnimation();
    };
  }, [fadeAnim, translateXAnim, translateYAnim, showFact]);

  if (!currentFact) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View
        style={[
          styles.factContainer,
          {
            left: factPosition.x,
            top: factPosition.y,
            opacity: fadeAnim,
            transform: [
              { translateX: translateXAnim },
              { translateY: translateYAnim },
            ],
          },
        ]}
      >
        <Text style={styles.factText}>{currentFact}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  factContainer: {
    position: 'absolute' as const,
    maxWidth: width * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  factText: {
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '500' as const,
    textAlign: 'center' as const,
  },
});

export default FloatingFactsDisplay;

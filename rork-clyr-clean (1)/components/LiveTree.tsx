import { View, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef, useMemo } from 'react';
import Svg, { Circle, Path, Line } from 'react-native-svg';

interface LiveTreeProps {
  daysSince: number;
  size?: 'small' | 'large';
  growthPercent?: number;
}

export default function LiveTree({ daysSince, size = 'small', growthPercent = 0 }: LiveTreeProps) {
  const growthAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const leafAnim1 = useRef(new Animated.Value(0)).current;
  const leafAnim2 = useRef(new Animated.Value(0)).current;

  const growthStage = useMemo(() => {
    if (daysSince === 0) return 'seed';
    if (daysSince < 3) return 'sprout';
    if (daysSince < 7) return 'sapling';
    if (daysSince < 30) return 'young-tree';
    if (daysSince < 90) return 'mature-tree';
    return 'full-tree';
  }, [daysSince]);

  const growthProgress = useMemo(() => {
    const baseProgress = (() => {
      if (daysSince === 0) return 0;
      if (daysSince < 3) return (daysSince / 3) * 0.2;
      if (daysSince < 7) return 0.2 + ((daysSince - 3) / 4) * 0.2;
      if (daysSince < 30) return 0.4 + ((daysSince - 7) / 23) * 0.3;
      if (daysSince < 90) return 0.7 + ((daysSince - 30) / 60) * 0.2;
      return Math.min(1, 0.9 + ((daysSince - 90) / 100) * 0.1);
    })();
    
    return Math.min(1, baseProgress + (growthPercent / 100) * 0.1);
  }, [daysSince, growthPercent]);

  useEffect(() => {
    Animated.timing(growthAnim, {
      toValue: growthProgress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [growthProgress]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (daysSince >= 3) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(leafAnim1, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(leafAnim1, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(leafAnim2, {
            toValue: 1,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(leafAnim2, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [daysSince]);

  const renderTree = () => {
    const sizeMultiplier = size === 'large' ? 2 : 1;
    
    if (growthStage === 'seed') {
      return (
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Svg width={80 * sizeMultiplier} height={80 * sizeMultiplier} viewBox="0 0 80 80">
            <Circle cx="40" cy="50" r="12" fill="#8B4513" opacity="0.8" />
            <Circle cx="40" cy="48" r="8" fill="#A0522D" />
            <Path d="M 38 45 Q 40 40 42 45" stroke="#654321" strokeWidth="2" fill="none" />
          </Svg>
        </Animated.View>
      );
    }

    if (growthStage === 'sprout') {
      return (
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Svg width={100 * sizeMultiplier} height={100 * sizeMultiplier} viewBox="0 0 100 100">
            <Line x1="50" y1="70" x2="50" y2="50" stroke="#4ECDC4" strokeWidth="3" />
            <Circle cx="50" cy="45" r="6" fill="#95E1D3" />
            <Path d="M 50 45 Q 55 40 50 35 Q 45 40 50 45" fill="#4ECDC4" />
            <Circle cx="50" cy="72" r="10" fill="#8B4513" />
          </Svg>
        </Animated.View>
      );
    }

    if (growthStage === 'sapling') {
      return (
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Svg width={120 * sizeMultiplier} height={140 * sizeMultiplier} viewBox="0 0 120 140">
            <Line x1="60" y1="110" x2="60" y2="50" stroke="#4ECDC4" strokeWidth="4" />
            
            <Path d="M 60 60 Q 75 55 80 60 Q 75 65 60 60" fill="#95E1D3" />
            <Path d="M 60 70 Q 45 65 40 70 Q 45 75 60 70" fill="#95E1D3" />
            
            <Path d="M 60 50 Q 65 45 60 40 Q 55 45 60 50" fill="#4ECDC4" />
            <Path d="M 60 55 Q 65 50 60 45 Q 55 50 60 55" fill="#4ECDC4" />
            
            <Circle cx="60" cy="112" r="12" fill="#8B4513" />
          </Svg>
        </Animated.View>
      );
    }

    if (growthStage === 'young-tree') {
      return (
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Svg width={140 * sizeMultiplier} height={160 * sizeMultiplier} viewBox="0 0 140 160">
            <Line x1="70" y1="130" x2="70" y2="60" stroke="#8B4513" strokeWidth="6" />
            <Line x1="70" y1="90" x2="55" y2="85" stroke="#A0522D" strokeWidth="3" />
            <Line x1="70" y1="100" x2="85" y2="95" stroke="#A0522D" strokeWidth="3" />
            
            <Circle cx="70" cy="45" r="30" fill="#4ECDC4" opacity="0.3" />
            <Circle cx="60" cy="50" r="20" fill="#4ECDC4" opacity="0.5" />
            <Circle cx="80" cy="50" r="20" fill="#95E1D3" opacity="0.5" />
            <Circle cx="70" cy="35" r="22" fill="#4ECDC4" />
            
            <Path d="M 55 85 Q 50 80 45 85 Q 50 90 55 85" fill="#95E1D3" />
            <Path d="M 85 95 Q 90 90 95 95 Q 90 100 85 95" fill="#95E1D3" />
            
            <Circle cx="70" cy="132" r="14" fill="#8B4513" opacity="0.8" />
          </Svg>
        </Animated.View>
      );
    }

    if (growthStage === 'mature-tree') {
      return (
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Svg width={160 * sizeMultiplier} height={180 * sizeMultiplier} viewBox="0 0 160 180">
            <Line x1="80" y1="150" x2="80" y2="70" stroke="#8B4513" strokeWidth="8" />
            <Line x1="80" y1="100" x2="60" y2="90" stroke="#A0522D" strokeWidth="4" />
            <Line x1="80" y1="110" x2="100" y2="100" stroke="#A0522D" strokeWidth="4" />
            <Line x1="80" y1="90" x2="65" y2="85" stroke="#A0522D" strokeWidth="4" />
            <Line x1="80" y1="120" x2="95" y2="115" stroke="#A0522D" strokeWidth="4" />
            
            <Circle cx="80" cy="50" r="40" fill="#4ECDC4" opacity="0.4" />
            <Circle cx="60" cy="60" r="28" fill="#4ECDC4" opacity="0.6" />
            <Circle cx="100" cy="60" r="28" fill="#95E1D3" opacity="0.6" />
            <Circle cx="80" cy="35" r="30" fill="#4ECDC4" />
            <Circle cx="70" cy="55" r="25" fill="#4ECDC4" />
            <Circle cx="90" cy="55" r="25" fill="#95E1D3" />
            
            <Path d="M 60 90 Q 55 85 50 90 Q 55 95 60 90" fill="#95E1D3" />
            <Path d="M 100 100 Q 105 95 110 100 Q 105 105 100 100" fill="#95E1D3" />
            <Path d="M 65 85 Q 60 80 55 85 Q 60 90 65 85" fill="#4ECDC4" />
            <Path d="M 95 115 Q 100 110 105 115 Q 100 120 95 115" fill="#4ECDC4" />
            
            <Circle cx="80" cy="152" r="16" fill="#8B4513" />
          </Svg>
        </Animated.View>
      );
    }

    return (
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <Svg width={180 * sizeMultiplier} height={200 * sizeMultiplier} viewBox="0 0 180 200">
          <Line x1="90" y1="170" x2="90" y2="80" stroke="#8B4513" strokeWidth="10" />
          <Line x1="90" y1="110" x2="65" y2="100" stroke="#A0522D" strokeWidth="5" />
          <Line x1="90" y1="120" x2="115" y2="110" stroke="#A0522D" strokeWidth="5" />
          <Line x1="90" y1="100" x2="70" y2="95" stroke="#A0522D" strokeWidth="5" />
          <Line x1="90" y1="130" x2="110" y2="125" stroke="#A0522D" strokeWidth="5" />
          <Line x1="90" y1="140" x2="75" y2="138" stroke="#A0522D" strokeWidth="4" />
          <Line x1="90" y1="150" x2="105" y2="148" stroke="#A0522D" strokeWidth="4" />
          
          <Circle cx="90" cy="55" r="45" fill="#4ECDC4" opacity="0.5" />
          <Circle cx="65" cy="70" r="32" fill="#4ECDC4" opacity="0.7" />
          <Circle cx="115" cy="70" r="32" fill="#95E1D3" opacity="0.7" />
          <Circle cx="90" cy="40" r="35" fill="#4ECDC4" />
          <Circle cx="75" cy="60" r="28" fill="#4ECDC4" />
          <Circle cx="105" cy="60" r="28" fill="#95E1D3" />
          <Circle cx="85" cy="75" r="20" fill="#4ECDC4" />
          <Circle cx="95" cy="75" r="20" fill="#95E1D3" />
          
          <Path d="M 65 100 Q 60 95 55 100 Q 60 105 65 100" fill="#95E1D3" />
          <Path d="M 115 110 Q 120 105 125 110 Q 120 115 115 110" fill="#95E1D3" />
          <Path d="M 70 95 Q 65 90 60 95 Q 65 100 70 95" fill="#4ECDC4" />
          <Path d="M 110 125 Q 115 120 120 125 Q 115 130 110 125" fill="#4ECDC4" />
          <Path d="M 75 138 Q 70 133 65 138 Q 70 143 75 138" fill="#95E1D3" />
          <Path d="M 105 148 Q 110 143 115 148 Q 110 153 105 148" fill="#95E1D3" />
          
          <Circle cx="90" cy="172" r="18" fill="#8B4513" />
          
          <Circle cx="75" cy="50" r="4" fill="#FFE66D" opacity="0.8" />
          <Circle cx="100" cy="45" r="4" fill="#FFE66D" opacity="0.8" />
          <Circle cx="85" cy="65" r="4" fill="#FFE66D" opacity="0.8" />
        </Svg>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.treeContainer}>
        {renderTree()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 20,
  },
  treeContainer: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
});

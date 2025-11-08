import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useRecovery } from '@/contexts/RecoveryContext';

interface Question {
  id: number;
  question: string;
  type: 'scale' | 'yesno' | 'frequency';
  options?: string[];
}

const questions: Question[] = [
  { id: 1, question: 'How often do you relapse?', type: 'frequency', options: ['Daily', 'Weekly', 'Monthly', 'Rarely'] },
  { id: 2, question: 'Have you tried to quit before?', type: 'yesno' },
  { id: 3, question: 'How much time do you spend on it daily?', type: 'scale', options: ['0-30min', '30min-1hr', '1-2hrs', '2+ hrs'] },
  { id: 4, question: 'Does it affect your energy?', type: 'scale', options: ['Not at all', 'Slightly', 'Moderately', 'Severely'] },
  { id: 5, question: 'Does it affect your focus?', type: 'scale', options: ['Not at all', 'Slightly', 'Moderately', 'Severely'] },
  { id: 6, question: 'Do you feel in control?', type: 'yesno' },
  { id: 7, question: 'Does it affect relationships?', type: 'scale', options: ['No', 'Somewhat', 'Yes', 'Severely'] },
  { id: 8, question: 'How long have you been struggling?', type: 'frequency', options: ['Months', '1-2 years', '3-5 years', '5+ years'] },
  { id: 9, question: 'Do you experience shame after?', type: 'yesno' },
  { id: 10, question: 'Does it interfere with work/studies?', type: 'scale', options: ['Never', 'Sometimes', 'Often', 'Always'] },
  { id: 11, question: 'Have you tried therapy or support?', type: 'yesno' },
  { id: 12, question: 'Do you have triggers you recognize?', type: 'yesno' },
  { id: 13, question: 'How motivated are you to change?', type: 'scale', options: ['Low', 'Medium', 'High', 'Desperate'] },
  { id: 14, question: 'Do you feel hopeless about quitting?', type: 'yesno' },
  { id: 15, question: 'Are you ready to commit today?', type: 'yesno' },
];

export default function OnboardingScreen() {
  const [currentQuestion, setCurrentQuestion] = useState(-1);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showAnalyzing, setShowAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showCommitment, setShowCommitment] = useState(false);
  const [analyzingTextIndex, setAnalyzingTextIndex] = useState(0);
  const router = useRouter();
  const { completeOnboarding } = useRecovery();
  const insets = useSafeAreaInsets();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentQuestion, showResult, showCommitment, showAnalyzing]);

  useEffect(() => {
    if (showAnalyzing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      const texts = [
        'Analyzing your responses…',
        'Calculating your risk level…',
        'Mapping your control patterns…',
      ];

      const interval = setInterval(() => {
        setAnalyzingTextIndex(prev => (prev + 1) % texts.length);
      }, 1000);

      const timer = setTimeout(() => {
        clearInterval(interval);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
        fadeAnim.setValue(0);
        slideAnim.setValue(50);
        scaleAnim.setValue(0.8);
        setTimeout(() => {
          setShowAnalyzing(false);
          setShowResult(true);
        }, 300);
      }, 3000);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [showAnalyzing]);

  const handleAnswer = (value: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setAnswers(prev => ({ ...prev, [currentQuestion + 1]: value }));

    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    scaleAnim.setValue(0.8);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setShowAnalyzing(true);
      }
    }, 150);
  };

  const calculateSeverity = () => {
    const total = Object.values(answers).reduce((sum, val) => sum + val, 0);
    const avg = total / questions.length;
    
    if (avg >= 2.5) return 'severe';
    if (avg >= 1.5) return 'moderate';
    return 'mild';
  };

  const getSeverityMessage = () => {
    const severity = calculateSeverity();
    switch (severity) {
      case 'severe':
        return {
          title: "It's controlling you.",
          message: "You've tried before. You've slipped again. You already know how this ends unless you commit. Let's end the cycle now.",
        };
      case 'moderate':
        return {
          title: "You're in deeper than you think.",
          message: "You've started to lose control, but you still have a choice. It's not too late — commit now before it takes more from you.",
        };
      case 'mild':
        return {
          title: "You're aware. That's powerful.",
          message: "This is your chance to stop before it grows. You have control — let's build on that and create lasting change.",
        };
    }
  };

  const handleCommit = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    completeOnboarding();
    router.replace('/(tabs)');
  };

  if (currentQuestion === -1) {
    return (
      <LinearGradient colors={['#000000', '#1a0a0f', '#0a0a0a']} style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Animated.View
          style={[
            styles.openingContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.openingText}>Be honest.</Text>
          <Text style={styles.openingTextBold}>How deep are you in?</Text>
          
          <Pressable
            style={styles.startButton}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              fadeAnim.setValue(0);
              slideAnim.setValue(50);
              scaleAnim.setValue(0.8);
              setTimeout(() => setCurrentQuestion(0), 150);
            }}
          >
            <Text style={styles.startButtonText}>Let&apos;s find out</Text>
          </Pressable>
        </Animated.View>
      </LinearGradient>
    );
  }

  if (showAnalyzing) {
    const analyzingTexts = [
      'Analyzing your responses…',
      'Calculating your risk level…',
      'Mapping your control patterns…',
    ];

    return (
      <LinearGradient colors={['#000000', '#0a0a0a', '#000000']} style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Animated.View
          style={[
            styles.analyzingContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Text style={styles.analyzingText}>{analyzingTexts[analyzingTextIndex]}</Text>
          
          <View style={styles.progressBarWrapper}>
            <View style={styles.progressBarAnimated} />
          </View>
        </Animated.View>
      </LinearGradient>
    );
  }

  if (showCommitment) {
    return (
      <LinearGradient colors={['#0a0a0a', '#1a0515', '#000000']} style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Animated.View
          style={[
            styles.commitmentContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.commitmentTitle}>Start today — or go back to excuses.</Text>
          <Text style={styles.commitmentSubtitle}>
            No free trial. No fake hope. Commit and change your life.
          </Text>
          
          <Text style={styles.commitmentText}>
            This app will help you track your progress, build new habits, and give you tools when you need them most.
          </Text>

          <Text style={styles.commitmentText}>
            But tools are useless without commitment.
          </Text>

          <Pressable
            style={styles.commitButton}
            onPress={handleCommit}
          >
            <Text style={styles.commitButtonText}>Start Today</Text>
          </Pressable>

          <Pressable
            style={styles.laterButton}
            onPress={() => {
              fadeAnim.setValue(0);
              scaleAnim.setValue(0.8);
              setTimeout(() => {
                setShowCommitment(false);
                setCurrentQuestion(-1);
                setAnswers({});
                setShowResult(false);
                setShowAnalyzing(false);
              }, 150);
            }}
          >
            <Text style={styles.laterButtonText}>Maybe Later</Text>
          </Pressable>

          <Text style={styles.commitmentFooter}>
            Your journey starts now.
          </Text>
        </Animated.View>
      </LinearGradient>
    );
  }

  if (showResult) {
    const { title, message } = getSeverityMessage();

    return (
      <LinearGradient colors={['#0a0a0a', '#150a15', '#000000']} style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Animated.View
          style={[
            styles.resultContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.resultTitle}>{title}</Text>
          <Text style={styles.resultMessage}>{message}</Text>

          <View style={styles.divider} />

          <Text style={styles.resultFooter}>
            The tools are here. The plan is ready.
          </Text>
          <Text style={styles.resultFooter}>
            All that&apos;s missing is your decision.
          </Text>

          <Pressable
            style={styles.nextButton}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              fadeAnim.setValue(0);
              scaleAnim.setValue(0.8);
              setTimeout(() => setShowCommitment(true), 150);
            }}
          >
            <Text style={styles.nextButtonText}>Continue &rarr;</Text>
          </Pressable>
        </Animated.View>
      </LinearGradient>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <LinearGradient colors={['#000000', '#0a0a0a', '#1a0a0f']} style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      <Animated.View
        style={[
          styles.questionContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.questionNumber}>
          {currentQuestion + 1} / {questions.length}
        </Text>
        
        <Text style={styles.questionText}>{question.question}</Text>

        <View style={styles.optionsContainer}>
          {question.type === 'yesno' ? (
            <>
              <Pressable
                style={styles.optionButton}
                onPress={() => handleAnswer(3)}
              >
                <Text style={styles.optionText}>Yes</Text>
              </Pressable>
              <Pressable
                style={styles.optionButton}
                onPress={() => handleAnswer(0)}
              >
                <Text style={styles.optionText}>No</Text>
              </Pressable>
            </>
          ) : question.options ? (
            question.options.map((option, index) => (
              <Pressable
                key={index}
                style={styles.optionButton}
                onPress={() => handleAnswer(index)}
              >
                <Text style={styles.optionText}>{option}</Text>
              </Pressable>
            ))
          ) : (
            [1, 2, 3, 4, 5].map(num => (
              <Pressable
                key={num}
                style={styles.scaleButton}
                onPress={() => handleAnswer(num - 1)}
              >
                <Text style={styles.scaleText}>{num}</Text>
              </Pressable>
            ))
          )}
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  openingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  openingText: {
    fontSize: 32,
    fontWeight: '300' as const,
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 2,
  },
  openingTextBold: {
    fontSize: 48,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 60,
    letterSpacing: 1,
  },
  startButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600' as const,
    letterSpacing: 1,
  },
  progressBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  questionContainer: {
    width: '100%',
    alignItems: 'center',
  },
  questionNumber: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 30,
    letterSpacing: 2,
    fontWeight: '500' as const,
  },
  questionText: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 60,
    lineHeight: 40,
    letterSpacing: 0.5,
  },
  optionsContainer: {
    width: '100%',
    gap: 15,
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
  },
  scaleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    minWidth: 70,
  },
  scaleText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600' as const,
  },
  resultContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  resultTitle: {
    fontSize: 36,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 44,
    letterSpacing: 0.5,
  },
  resultMessage: {
    fontSize: 18,
    fontWeight: '400' as const,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 50,
    letterSpacing: 0.3,
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginVertical: 30,
  },
  resultFooter: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  nextButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 30,
    marginTop: 40,
  },
  nextButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  commitmentContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  commitmentTitle: {
    fontSize: 38,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  commitmentSubtitle: {
    fontSize: 20,
    fontWeight: '500' as const,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 50,
    letterSpacing: 0.5,
  },
  commitmentText: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 25,
    letterSpacing: 0.3,
  },
  commitButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 50,
    borderRadius: 30,
    marginTop: 30,
  },
  commitButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  commitmentFooter: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginTop: 40,
    letterSpacing: 1,
  },
  analyzingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzingText: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 0.5,
  },
  progressBarWrapper: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarAnimated: {
    height: '100%',
    width: '70%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  laterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  laterButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
});

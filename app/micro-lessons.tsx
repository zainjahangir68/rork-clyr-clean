import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { GraduationCap, ArrowLeft, CheckCircle2, Lock, Award } from 'lucide-react-native';
import { useRecovery } from '@/contexts/RecoveryContext';
import { microLessonsData } from '@/constants/microLessons';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';

export default function MicroLessonsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { completedLessons, completeLesson } = useRecovery();
  
  const [selectedLesson, setSelectedLesson] = useState<typeof microLessonsData[0] | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const isLessonCompleted = (lessonId: string) => {
    return completedLessons.some(l => l.lessonId === lessonId);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'triggers': return '#FF9A76';
      case 'habits': return '#4ECDC4';
      case 'neuroscience': return '#9D84B7';
      case 'psychology': return '#95E1D3';
      case 'techniques': return '#FFE66D';
      default: return '#8A8A9D';
    }
  };

  const handleStartLesson = (lesson: typeof microLessonsData[0]) => {
    setSelectedLesson(lesson);
    setQuizAnswer(null);
    setShowResult(false);
  };

  const handleQuizSubmit = () => {
    if (quizAnswer === null || !selectedLesson) return;
    
    const isCorrect = quizAnswer === selectedLesson.quiz.correctAnswer;
    
    if (Platform.OS !== 'web') {
      if (isCorrect) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    }
    
    setShowResult(true);
    
    if (!isLessonCompleted(selectedLesson.id)) {
      completeLesson(selectedLesson.id, isCorrect);
    }
  };

  const handleClose = () => {
    setSelectedLesson(null);
    setQuizAnswer(null);
    setShowResult(false);
  };

  const completedCount = completedLessons.length;
  const totalCount = microLessonsData.length;

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: false,
        }} 
      />
      
      <LinearGradient
        colors={['#0F2027', '#203A43', '#2C5364']}
        style={styles.gradient}
      >
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Micro-Lessons</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.intro}>
            <GraduationCap size={48} color="#4ECDC4" />
            <Text style={styles.introTitle}>Learn & Grow</Text>
            <Text style={styles.introText}>
              Short interactive lessons on recovery and habit formation
            </Text>
          </View>

          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>Your Progress</Text>
            <Text style={styles.progressValue}>{completedCount} / {totalCount} Completed</Text>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${(completedCount / totalCount) * 100}%` }
                ]} 
              />
            </View>
          </View>

          <View style={styles.lessonsContainer}>
            {microLessonsData.map((lesson) => {
              const isCompleted = isLessonCompleted(lesson.id);
              const categoryColor = getCategoryColor(lesson.category);

              return (
                <TouchableOpacity
                  key={lesson.id}
                  style={[styles.lessonCard, isCompleted && styles.lessonCardCompleted]}
                  onPress={() => handleStartLesson(lesson)}
                  activeOpacity={0.7}
                >
                  <View style={styles.lessonHeader}>
                    <View style={[styles.categoryBadge, { backgroundColor: `${categoryColor}20` }]}>
                      <Text style={[styles.categoryText, { color: categoryColor }]}>
                        {lesson.category}
                      </Text>
                    </View>
                    {isCompleted ? (
                      <CheckCircle2 size={24} color="#4ECDC4" fill="#4ECDC4" />
                    ) : (
                      <Lock size={24} color="#8A8A9D" />
                    )}
                  </View>

                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  <Text style={styles.lessonDescription}>{lesson.description}</Text>

                  <View style={styles.lessonMeta}>
                    <Text style={styles.duration}>{lesson.duration}</Text>
                    <View style={styles.pointsBadge}>
                      <Award size={14} color="#FFE66D" />
                      <Text style={styles.pointsText}>+{lesson.pointsReward}pts</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <Modal
          visible={selectedLesson !== null}
          transparent
          animationType="slide"
          onRequestClose={handleClose}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
              <ScrollView 
                style={styles.modalScroll}
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {selectedLesson && (
                  <>
                    <View style={styles.modalHeader}>
                      <View style={styles.modalTitleContainer}>
                        <Text style={styles.modalTitle}>{selectedLesson.title}</Text>
                        <TouchableOpacity 
                          style={styles.closeButton}
                          onPress={handleClose}
                        >
                          <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={[
                        styles.categoryBadge, 
                        { backgroundColor: `${getCategoryColor(selectedLesson.category)}20` }
                      ]}>
                        <Text style={[
                          styles.categoryText, 
                          { color: getCategoryColor(selectedLesson.category) }
                        ]}>
                          {selectedLesson.category}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.contentSection}>
                      <Text style={styles.contentText}>{selectedLesson.content}</Text>
                    </View>

                    <View style={styles.quizSection}>
                      <Text style={styles.quizTitle}>Quick Quiz</Text>
                      <Text style={styles.quizQuestion}>{selectedLesson.quiz.question}</Text>

                      <View style={styles.optionsContainer}>
                        {selectedLesson.quiz.options.map((option, index) => (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.optionButton,
                              quizAnswer === index && styles.optionButtonSelected,
                              showResult && index === selectedLesson.quiz.correctAnswer && styles.optionButtonCorrect,
                              showResult && quizAnswer === index && quizAnswer !== selectedLesson.quiz.correctAnswer && styles.optionButtonWrong,
                            ]}
                            onPress={() => !showResult && setQuizAnswer(index)}
                            disabled={showResult}
                          >
                            <Text style={[
                              styles.optionText,
                              quizAnswer === index && styles.optionTextSelected,
                            ]}>
                              {option}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      {showResult && (
                        <View style={styles.resultContainer}>
                          <Text style={[
                            styles.resultTitle,
                            { color: quizAnswer === selectedLesson.quiz.correctAnswer ? '#4ECDC4' : '#FF9A76' }
                          ]}>
                            {quizAnswer === selectedLesson.quiz.correctAnswer ? '✓ Correct!' : '✗ Not quite'}
                          </Text>
                          <Text style={styles.resultExplanation}>
                            {selectedLesson.quiz.explanation}
                          </Text>
                        </View>
                      )}

                      {!showResult ? (
                        <TouchableOpacity
                          style={[styles.submitButton, quizAnswer === null && styles.submitButtonDisabled]}
                          onPress={handleQuizSubmit}
                          disabled={quizAnswer === null}
                        >
                          <Text style={styles.submitButtonText}>Submit Answer</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={styles.completeButton}
                          onPress={handleClose}
                        >
                          <Text style={styles.completeButtonText}>
                            {isLessonCompleted(selectedLesson.id) ? 'Close' : 'Complete Lesson'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F2027',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  intro: {
    alignItems: 'center' as const,
    marginBottom: 30,
  },
  introTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  introText: {
    fontSize: 16,
    color: '#B8C6DB',
    textAlign: 'center' as const,
    lineHeight: 24,
  },
  progressCard: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.3)',
  },
  progressTitle: {
    fontSize: 16,
    color: '#B8C6DB',
    marginBottom: 8,
  },
  progressValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#4ECDC4',
    marginBottom: 16,
  },
  progressBarContainer: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 5,
    overflow: 'hidden' as const,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 5,
  },
  lessonsContainer: {
    gap: 16,
  },
  lessonCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  lessonCardCompleted: {
    backgroundColor: 'rgba(78, 205, 196, 0.08)',
    borderColor: 'rgba(78, 205, 196, 0.2)',
  },
  lessonHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  lessonDescription: {
    fontSize: 14,
    color: '#B8C6DB',
    lineHeight: 20,
    marginBottom: 16,
  },
  lessonMeta: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  duration: {
    fontSize: 13,
    color: '#8A8A9D',
    fontWeight: '500' as const,
  },
  pointsBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    backgroundColor: 'rgba(255, 230, 109, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFE66D',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 24,
  },
  modalHeader: {
    marginBottom: 24,
  },
  modalTitleContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    flex: 1,
    marginRight: 16,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  contentSection: {
    marginBottom: 32,
  },
  contentText: {
    fontSize: 16,
    color: '#B8C6DB',
    lineHeight: 26,
  },
  quizSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#4ECDC4',
    marginBottom: 16,
  },
  quizQuestion: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600' as const,
    marginBottom: 20,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonSelected: {
    borderColor: '#4ECDC4',
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
  },
  optionButtonCorrect: {
    borderColor: '#4ECDC4',
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
  },
  optionButtonWrong: {
    borderColor: '#FF6B6B',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  optionText: {
    fontSize: 15,
    color: '#B8C6DB',
    lineHeight: 22,
  },
  optionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  resultContainer: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.2)',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  resultExplanation: {
    fontSize: 15,
    color: '#B8C6DB',
    lineHeight: 22,
  },
  submitButton: {
    backgroundColor: '#4ECDC4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center' as const,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  completeButton: {
    backgroundColor: '#4ECDC4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center' as const,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});

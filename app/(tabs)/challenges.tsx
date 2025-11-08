import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useRecovery } from '@/contexts/RecoveryContext';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle2, Circle, Zap, Trophy, Target, Calendar } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';

export default function ChallengesScreen() {
  const { challenges, completeChallenge, points, getDaysSince } = useRecovery();
  
  const currentStreak = getDaysSince();
  const today = new Date().toISOString().split('T')[0];
  const dailyChallenges = challenges.filter(c => c.type === 'daily' && c.date === today);
  const milestoneChallenges = challenges.filter(c => c.type === 'milestone');
  
  const completedDaily = dailyChallenges.filter(c => c.completed).length;
  const totalPointsToday = dailyChallenges.reduce((sum, c) => sum + (c.completed ? c.pointsReward : 0), 0);

  const handleComplete = (challengeId: string, isCompleted: boolean) => {
    if (!isCompleted) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      completeChallenge(challengeId);
    }
  };

  const getMilestoneProgress = (targetDays: number): number => {
    return Math.min((currentStreak / targetDays) * 100, 100);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Challenges',
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
              <Zap size={48} color="#FFE66D" fill="#FFE66D" />
            </View>
            <Text style={styles.title}>Challenges</Text>
            <Text style={styles.subtitle}>Complete tasks to earn rewards</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Trophy size={24} color="#4ECDC4" />
              <Text style={styles.statValue}>{points}</Text>
              <Text style={styles.statLabel}>Total Points</Text>
            </View>
            <View style={styles.statBox}>
              <CheckCircle2 size={24} color="#FFE66D" />
              <Text style={styles.statValue}>{completedDaily}/{dailyChallenges.length}</Text>
              <Text style={styles.statLabel}>Daily Tasks</Text>
            </View>
            <View style={styles.statBox}>
              <Calendar size={24} color="#FF9A76" />
              <Text style={styles.statValue}>{currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Target size={24} color="#4ECDC4" />
              <Text style={styles.sectionTitle}>Milestone Challenges</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Long-term goals to achieve</Text>
            
            {milestoneChallenges.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No milestone challenges yet</Text>
              </View>
            ) : (
              milestoneChallenges.map((challenge, index) => {
                const progress = challenge.targetDays ? getMilestoneProgress(challenge.targetDays) : 0;
                const isCompleted = challenge.completed || (challenge.targetDays && currentStreak >= challenge.targetDays);
                
                return (
                  <View
                    key={`milestone-${challenge.id}-${index}`}
                    style={[
                      styles.milestoneCard,
                      isCompleted && styles.milestoneCardCompleted
                    ]}
                  >
                    <View style={styles.milestoneHeader}>
                      <View style={styles.milestoneIcon}>
                        {isCompleted ? (
                          <CheckCircle2 size={28} color="#4ECDC4" fill="#4ECDC4" />
                        ) : (
                          <Target size={28} color="#FFE66D" />
                        )}
                      </View>
                      <View style={styles.milestoneContent}>
                        <Text style={[
                          styles.milestoneTitle,
                          isCompleted && styles.milestoneTitleCompleted
                        ]}>
                          {challenge.title}
                        </Text>
                        <Text style={[
                          styles.milestoneDescription,
                          isCompleted && styles.milestoneDescriptionCompleted
                        ]}>
                          {challenge.description}
                        </Text>
                      </View>
                      <View style={styles.milestoneReward}>
                        <Zap size={18} color="#FFE66D" fill="#FFE66D" />
                        <Text style={styles.rewardText}>{challenge.pointsReward}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.progressSection}>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill,
                            { width: `${progress}%` },
                            isCompleted && styles.progressFillCompleted
                          ]} 
                        />
                      </View>
                      <View style={styles.progressLabels}>
                        <Text style={styles.progressText}>
                          {currentStreak} / {challenge.targetDays || 0} days
                        </Text>
                        <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
                      </View>
                    </View>
                    
                    {isCompleted && (
                      <View style={styles.completedBadge}>
                        <CheckCircle2 size={16} color="#4ECDC4" />
                        <Text style={styles.completedText}>Completed!</Text>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Zap size={24} color="#FFE66D" />
              <Text style={styles.sectionTitle}>Today's Challenges</Text>
            </View>
            
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabelText}>Daily Progress</Text>
                <Text style={styles.progressValue}>
                  {dailyChallenges.length > 0 
                    ? Math.round((completedDaily / dailyChallenges.length) * 100) 
                    : 0}%
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { 
                      width: dailyChallenges.length > 0 
                        ? `${(completedDaily / dailyChallenges.length) * 100}%` 
                        : '0%' 
                    }
                  ]} 
                />
              </View>
            </View>

            {dailyChallenges.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No challenges available today</Text>
              </View>
            ) : (
              dailyChallenges.map((challenge, index) => (
                <TouchableOpacity
                  key={`daily-challenge-${challenge.id}-${index}`}
                  style={[
                    styles.challengeCard,
                    challenge.completed && styles.challengeCardCompleted
                  ]}
                  onPress={() => handleComplete(challenge.id, challenge.completed)}
                  activeOpacity={challenge.completed ? 1 : 0.7}
                  disabled={challenge.completed}
                >
                  <View style={styles.challengeIcon}>
                    {challenge.completed ? (
                      <CheckCircle2 size={32} color="#4ECDC4" fill="#4ECDC4" />
                    ) : (
                      <Circle size={32} color="#8A8A9D" />
                    )}
                  </View>
                  
                  <View style={styles.challengeContent}>
                    <Text style={[
                      styles.challengeTitle,
                      challenge.completed && styles.challengeTitleCompleted
                    ]}>
                      {challenge.title}
                    </Text>
                    <Text style={[
                      styles.challengeDescription,
                      challenge.completed && styles.challengeDescriptionCompleted
                    ]}>
                      {challenge.description}
                    </Text>
                    
                    <View style={styles.pointsBadge}>
                      <Zap size={14} color="#FFE66D" fill="#FFE66D" />
                      <Text style={styles.pointsText}>+{challenge.pointsReward} points</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          {completedDaily === dailyChallenges.length && dailyChallenges.length > 0 && (
            <View style={styles.completionCard}>
              <LinearGradient
                colors={['#4ECDC4', '#44A08D']}
                style={styles.completionGradient}
              >
                <Trophy size={40} color="#FFFFFF" />
                <Text style={styles.completionTitle}>All Done!</Text>
                <Text style={styles.completionText}>
                  You've completed all challenges for today. Earned {totalPointsToday} points!
                </Text>
              </LinearGradient>
            </View>
          )}

          <View style={styles.motivationSection}>
            <Text style={styles.motivationText}>
              Every challenge completed is a step forward. Keep building momentum!
            </Text>
          </View>
        </ScrollView>
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
  },
  statsRow: {
    flexDirection: 'row' as const,
    gap: 12,
    marginBottom: 30,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#B8C6DB',
    fontWeight: '500' as const,
    textAlign: 'center' as const,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#B8C6DB',
    marginBottom: 16,
  },
  milestoneCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  milestoneCardCompleted: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderColor: 'rgba(78, 205, 196, 0.3)',
  },
  milestoneHeader: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 16,
  },
  milestoneIcon: {
    marginRight: 12,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  milestoneTitleCompleted: {
    color: '#4ECDC4',
  },
  milestoneDescription: {
    fontSize: 14,
    color: '#B8C6DB',
  },
  milestoneDescriptionCompleted: {
    color: '#95E1D3',
  },
  milestoneReward: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    backgroundColor: 'rgba(255, 230, 109, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFE66D',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden' as const,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFE66D',
    borderRadius: 4,
  },
  progressFillCompleted: {
    backgroundColor: '#4ECDC4',
  },
  progressLabels: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  progressText: {
    fontSize: 12,
    color: '#B8C6DB',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#4ECDC4',
  },
  completedBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start' as const,
  },
  completedText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#4ECDC4',
  },
  progressHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  progressLabelText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#B8C6DB',
  },
  progressValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#4ECDC4',
  },
  progressBarContainer: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 5,
    overflow: 'hidden' as const,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 5,
  },
  challengeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row' as const,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  challengeCardCompleted: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderColor: 'rgba(78, 205, 196, 0.3)',
  },
  challengeIcon: {
    marginRight: 16,
    justifyContent: 'center' as const,
  },
  challengeContent: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  challengeTitleCompleted: {
    color: '#B8C6DB',
    textDecorationLine: 'line-through' as const,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#B8C6DB',
    marginBottom: 12,
  },
  challengeDescriptionCompleted: {
    color: '#8A8A9D',
  },
  pointsBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    backgroundColor: 'rgba(255, 230, 109, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start' as const,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFE66D',
  },
  emptyState: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 40,
    borderRadius: 16,
    alignItems: 'center' as const,
  },
  emptyText: {
    fontSize: 16,
    color: '#8A8A9D',
    textAlign: 'center' as const,
  },
  completionCard: {
    marginBottom: 30,
    borderRadius: 20,
    overflow: 'hidden' as const,
  },
  completionGradient: {
    padding: 30,
    alignItems: 'center' as const,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  completionText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center' as const,
    lineHeight: 24,
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
    lineHeight: 24,
  },
});

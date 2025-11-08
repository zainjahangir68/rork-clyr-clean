import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useRecovery } from '@/contexts/RecoveryContext';
import { ArrowLeft, Sparkles, TrendingUp } from 'lucide-react-native';
import LiveTree from '@/components/LiveTree';
import { useMemo } from 'react';

export default function TreeDetailScreen() {
  const router = useRouter();
  const { getDaysSince, challenges, achievements, completedLessons } = useRecovery();
  
  const days = getDaysSince();
  
  const growthLevel = useMemo(() => {
    const completedChallenges = challenges.filter(c => c.completed).length;
    const unlockedAchievements = achievements.filter(a => a.unlocked).length;
    const lessonsCount = completedLessons.length;
    
    const baseProgress = Math.min(100, (days / 100) * 50);
    const challengeProgress = Math.min(20, (completedChallenges / 10) * 20);
    const achievementProgress = Math.min(20, (unlockedAchievements / 10) * 20);
    const lessonProgress = Math.min(10, (lessonsCount / 6) * 10);
    
    return Math.min(100, baseProgress + challengeProgress + achievementProgress + lessonProgress);
  }, [days, challenges, achievements, completedLessons]);

  const growthStage = useMemo(() => {
    if (days === 0) return 'Seed';
    if (days < 3) return 'Sprout';
    if (days < 7) return 'Sapling';
    if (days < 30) return 'Young Tree';
    if (days < 90) return 'Mature Tree';
    return 'Full Tree';
  }, [days]);

  const nextMilestone = useMemo(() => {
    if (days < 3) return { days: 3, name: 'Sprout' };
    if (days < 7) return { days: 7, name: 'Sapling' };
    if (days < 30) return { days: 30, name: 'Young Tree' };
    if (days < 90) return { days: 90, name: 'Mature Tree' };
    return { days: 365, name: 'Majestic Tree' };
  }, [days]);

  const tips = [
    'Complete daily challenges to help your tree grow',
    'Stay streaked for 7 days to see visible leaf growth',
    'Earn achievements to unlock new branches',
    'Every completed lesson adds nutrients to your tree',
    'Your tree reflects your commitment and growth',
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Your Growth Tree',
          headerStyle: { backgroundColor: '#0F2027' },
          headerTintColor: '#FFFFFF',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <LinearGradient
        colors={['#0F2027', '#1A3A2E', '#2C5364']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <View style={styles.treeDisplayContainer}>
            <LinearGradient
              colors={['rgba(78, 205, 196, 0.1)', 'rgba(149, 225, 211, 0.05)']}
              style={styles.treeCard}
            >
              <LiveTree daysSince={days} size="large" />
            </LinearGradient>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Growth Stage</Text>
              <Text style={styles.statValue}>{growthStage}</Text>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Overall Growth</Text>
                <Text style={styles.progressPercent}>{Math.round(growthLevel)}%</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <LinearGradient
                  colors={['#4ECDC4', '#95E1D3']}
                  style={[styles.progressBar, { width: `${growthLevel}%` }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.milestoneSection}>
              <View style={styles.milestoneHeader}>
                <TrendingUp size={20} color="#4ECDC4" />
                <Text style={styles.milestoneTitle}>Next Milestone</Text>
              </View>
              <Text style={styles.milestoneText}>
                {nextMilestone.days - days} days until {nextMilestone.name}
              </Text>
            </View>
          </View>

          <View style={styles.contributorsCard}>
            <Text style={styles.contributorsTitle}>Growth Contributions</Text>
            
            <View style={styles.contributorRow}>
              <View style={styles.contributorDot} />
              <Text style={styles.contributorLabel}>Clean days streak</Text>
              <Text style={styles.contributorValue}>{days} days</Text>
            </View>

            <View style={styles.contributorRow}>
              <View style={[styles.contributorDot, { backgroundColor: '#FFE66D' }]} />
              <Text style={styles.contributorLabel}>Challenges completed</Text>
              <Text style={styles.contributorValue}>{challenges.filter(c => c.completed).length}</Text>
            </View>

            <View style={styles.contributorRow}>
              <View style={[styles.contributorDot, { backgroundColor: '#FF9A76' }]} />
              <Text style={styles.contributorLabel}>Achievements unlocked</Text>
              <Text style={styles.contributorValue}>{achievements.filter(a => a.unlocked).length}</Text>
            </View>

            <View style={styles.contributorRow}>
              <View style={[styles.contributorDot, { backgroundColor: '#9D84B7' }]} />
              <Text style={styles.contributorLabel}>Lessons completed</Text>
              <Text style={styles.contributorValue}>{completedLessons.length}</Text>
            </View>
          </View>

          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Sparkles size={20} color="#FFE66D" />
              <Text style={styles.tipsTitle}>Growth Tips</Text>
            </View>
            {tips.map((tip, index) => (
              <View key={index} style={styles.tipRow}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#667EEA', '#764BA2']}
              style={styles.closeButtonGradient}
            >
              <Text style={styles.closeButtonText}>Back to Dashboard</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
  treeDisplayContainer: {
    marginBottom: 24,
  },
  treeCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.3)',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 20,
  },
  statRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 20,
  },
  statLabel: {
    fontSize: 16,
    color: '#B8C6DB',
    fontWeight: '500' as const,
  },
  statValue: {
    fontSize: 22,
    color: '#4ECDC4',
    fontWeight: '700' as const,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 14,
    color: '#B8C6DB',
    fontWeight: '500' as const,
  },
  progressPercent: {
    fontSize: 16,
    color: '#4ECDC4',
    fontWeight: '700' as const,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    overflow: 'hidden' as const,
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 20,
  },
  milestoneSection: {
    gap: 8,
  },
  milestoneHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  milestoneTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  milestoneText: {
    fontSize: 14,
    color: '#B8C6DB',
    marginLeft: 28,
  },
  contributorsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 20,
  },
  contributorsTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  contributorRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  contributorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ECDC4',
    marginRight: 12,
  },
  contributorLabel: {
    flex: 1,
    fontSize: 14,
    color: '#B8C6DB',
  },
  contributorValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  tipsCard: {
    backgroundColor: 'rgba(255, 230, 109, 0.08)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 230, 109, 0.2)',
    marginBottom: 24,
  },
  tipsHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700' as const,
  },
  tipRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 10,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFE66D',
    marginTop: 6,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#B8C6DB',
    lineHeight: 20,
  },
  closeButton: {
    borderRadius: 16,
    overflow: 'hidden' as const,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  closeButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center' as const,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});

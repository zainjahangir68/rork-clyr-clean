import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useRecovery } from '@/contexts/RecoveryContext';
import { Stack } from 'expo-router';
import { TrendingUp, Calendar, Award, Zap, Target, BarChart3 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const { 
    getDaysSince, 
    longestStreak, 
    totalResets,
    panicButtonCount,
    points,
    achievements,
    challenges,
    journalEntries,
    moodEntries,
  } = useRecovery();

  const currentStreak = getDaysSince();
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;
  const totalAchievements = achievements.length;
  const completedChallenges = challenges.filter(c => c.completed).length;

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const challengesByDay = last7Days.map(date => {
    return challenges.filter(c => c.date === date && c.completed).length;
  });

  const maxChallenges = Math.max(...challengesByDay, 1);

  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });

  const moodByDay = last30Days.map(date => {
    const moodsOnDay = moodEntries.filter(m => m.date.split('T')[0] === date);
    if (moodsOnDay.length === 0) return null;
    const avgMood = moodsOnDay.reduce((sum, m) => sum + m.mood, 0) / moodsOnDay.length;
    return avgMood;
  });

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Analytics & Progress', headerShown: true }} />
      
      <LinearGradient colors={['#0F2027', '#203A43', '#2C5364']} style={styles.gradient}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Streak Overview</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <TrendingUp size={28} color="#4ECDC4" />
                <Text style={styles.statNumber}>{currentStreak}</Text>
                <Text style={styles.statLabel}>Current Streak</Text>
              </View>
              <View style={styles.statCard}>
                <Award size={28} color="#FFE66D" />
                <Text style={styles.statNumber}>{longestStreak}</Text>
                <Text style={styles.statLabel}>Longest Streak</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <View style={styles.achievementCard}>
              <View style={styles.achievementProgress}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${(unlockedAchievements / totalAchievements) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.achievementText}>
                  {unlockedAchievements} / {totalAchievements} Unlocked
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Activity</Text>
            <View style={styles.chartCard}>
              <View style={styles.chart}>
                {challengesByDay.map((count, index) => {
                  const height = (count / maxChallenges) * 100;
                  return (
                    <View key={index} style={styles.barContainer}>
                      <View style={styles.barWrapper}>
                        <View 
                          style={[
                            styles.bar, 
                            { height: `${Math.max(height, 10)}%` }
                          ]} 
                        />
                      </View>
                      <Text style={styles.barLabel}>
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'][index]}
                      </Text>
                    </View>
                  );
                })}
              </View>
              <Text style={styles.chartSubtext}>Challenges completed per day</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Total Stats</Text>
            <View style={styles.totalStatsGrid}>
              <View style={styles.totalStatCard}>
                <Zap size={24} color="#FF9A76" />
                <Text style={styles.totalStatNumber}>{panicButtonCount}</Text>
                <Text style={styles.totalStatLabel}>Urges Resisted</Text>
              </View>
              <View style={styles.totalStatCard}>
                <Target size={24} color="#9D84B7" />
                <Text style={styles.totalStatNumber}>{completedChallenges}</Text>
                <Text style={styles.totalStatLabel}>Challenges Done</Text>
              </View>
              <View style={styles.totalStatCard}>
                <BarChart3 size={24} color="#95E1D3" />
                <Text style={styles.totalStatNumber}>{points}</Text>
                <Text style={styles.totalStatLabel}>Total Points</Text>
              </View>
              <View style={styles.totalStatCard}>
                <Calendar size={24} color="#4ECDC4" />
                <Text style={styles.totalStatNumber}>{journalEntries.length}</Text>
                <Text style={styles.totalStatLabel}>Journal Entries</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recovery Journey</Text>
            <View style={styles.journeyCard}>
              <View style={styles.journeyRow}>
                <Text style={styles.journeyLabel}>Days Clean:</Text>
                <Text style={styles.journeyValue}>{currentStreak}</Text>
              </View>
              <View style={styles.journeyRow}>
                <Text style={styles.journeyLabel}>Total Resets:</Text>
                <Text style={styles.journeyValue}>{totalResets}</Text>
              </View>
              <View style={styles.journeyRow}>
                <Text style={styles.journeyLabel}>Success Rate:</Text>
                <Text style={styles.journeyValue}>
                  {totalResets > 0 
                    ? Math.round((currentStreak / (currentStreak + totalResets)) * 100)
                    : 100}%
                </Text>
              </View>
            </View>
          </View>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row' as const,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center' as const,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#B8C6DB',
    textAlign: 'center' as const,
  },
  achievementCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  achievementProgress: {
    gap: 12,
  },
  progressBar: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 6,
  },
  achievementText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    textAlign: 'center' as const,
  },
  chartCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  chart: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-end' as const,
    height: 150,
    marginBottom: 16,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'flex-end' as const,
    gap: 8,
  },
  barWrapper: {
    flex: 1,
    width: '70%',
    justifyContent: 'flex-end' as const,
  },
  bar: {
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
    minHeight: 10,
  },
  barLabel: {
    fontSize: 12,
    color: '#B8C6DB',
    fontWeight: '600' as const,
  },
  chartSubtext: {
    fontSize: 14,
    color: '#B8C6DB',
    textAlign: 'center' as const,
  },
  totalStatsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 16,
  },
  totalStatCard: {
    width: (width - 56) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center' as const,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  totalStatNumber: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  totalStatLabel: {
    fontSize: 12,
    color: '#B8C6DB',
    textAlign: 'center' as const,
  },
  journeyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  journeyRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  journeyLabel: {
    fontSize: 16,
    color: '#B8C6DB',
  },
  journeyValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});

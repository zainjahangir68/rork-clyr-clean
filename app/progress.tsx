import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Platform, Alert } from 'react-native';
import { useRecovery } from '@/contexts/RecoveryContext';
import { Stack, useRouter } from 'expo-router';
import { TrendingUp, Calendar, Award, Zap, Target, BarChart3, BookOpen, Heart, Download, CheckCircle2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const router = useRouter();
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
    savedFeedItems,
    completedLessons,
  } = useRecovery();

  const [exportMessage, setExportMessage] = useState('');

  const currentStreak = getDaysSince();
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;
  const totalAchievements = achievements.length;
  const completedChallenges = challenges.filter(c => c.completed).length;
  const totalChallenges = challenges.length;

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      date: d.toISOString().split('T')[0],
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()],
    };
  });

  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });

  const challengesByDay = last7Days.map(({ date }) => {
    return challenges.filter(c => c.date === date && c.completed).length;
  });

  const maxChallenges = Math.max(...challengesByDay, 1);

  const moodByDay = last30Days.map(date => {
    const moodsOnDay = moodEntries.filter(m => m.date.split('T')[0] === date);
    if (moodsOnDay.length === 0) return null;
    const avgMood = moodsOnDay.reduce((sum, m) => sum + m.mood, 0) / moodsOnDay.length;
    return avgMood;
  });

  const avgMood = moodByDay.filter(m => m !== null).length > 0
    ? moodByDay.filter(m => m !== null).reduce((sum, m) => sum! + m!, 0) / moodByDay.filter(m => m !== null).length
    : 0;

  const getWeeklySummary = () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    
    const weekChallenges = challenges.filter(c => {
      const cDate = new Date(c.date);
      return cDate >= weekStart && c.completed;
    });

    const weekArticles = savedFeedItems.length;
    
    return {
      daysClean: Math.min(currentStreak, 7),
      pointsEarned: weekChallenges.reduce((sum, c) => sum + c.pointsReward, 0),
      articlesRead: weekArticles,
      challengesCompleted: weekChallenges.length,
    };
  };

  const weeklySummary = getWeeklySummary();

  const handleExportProgress = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    const progressData = `
📊 Recovery Progress Report
━━━━━━━━━━━━━━━━━━━━━

Current Streak: ${currentStreak} days
Longest Streak: ${longestStreak} days
Total Points: ${points}

🏆 Achievements: ${unlockedAchievements}/${totalAchievements} unlocked
✅ Challenges: ${completedChallenges}/${totalChallenges} completed
📖 Journal Entries: ${journalEntries.length}
📚 Articles Saved: ${savedFeedItems.length}
🎓 Lessons Completed: ${completedLessons.length}

Weekly Summary:
• Days Clean: ${weeklySummary.daysClean}/7
• Points Earned: ${weeklySummary.pointsEarned}
• Articles Read: ${weeklySummary.articlesRead}
• Challenges Done: ${weeklySummary.challengesCompleted}

Keep going strong! 💪
    `.trim();

    setExportMessage('Progress snapshot ready to share!');
    setTimeout(() => setExportMessage(''), 3000);
    
    console.log('Progress Export:', progressData);
    
    Alert.alert(
      'Progress Snapshot',
      progressData,
      [
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  const streakTimeline = last30Days.map(date => {
    const dayIndex = last30Days.indexOf(date);
    const streakDayNumber = currentStreak - (29 - dayIndex);
    return streakDayNumber > 0 ? 1 : 0;
  });

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Progress & Stats',
          headerShown: true,
          headerStyle: { backgroundColor: '#1A1A2E' },
          headerTintColor: '#FFFFFF',
        }} 
      />
      
      <LinearGradient colors={['#0F2027', '#203A43', '#2C5364']} style={styles.gradient}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Weekly Summary</Text>
              <TouchableOpacity onPress={handleExportProgress} style={styles.exportButton}>
                <Download size={18} color="#4ECDC4" />
                <Text style={styles.exportText}>Export</Text>
              </TouchableOpacity>
            </View>
            {exportMessage ? (
              <Text style={styles.exportMessage}>{exportMessage}</Text>
            ) : null}
            <View style={styles.summaryCard}>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Calendar size={24} color="#4ECDC4" />
                  <Text style={styles.summaryNumber}>{weeklySummary.daysClean}/7</Text>
                  <Text style={styles.summaryLabel}>Days Sober</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Zap size={24} color="#FFE66D" />
                  <Text style={styles.summaryNumber}>{weeklySummary.pointsEarned}</Text>
                  <Text style={styles.summaryLabel}>Points Earned</Text>
                </View>
                <View style={styles.summaryItem}>
                  <BookOpen size={24} color="#FF9A76" />
                  <Text style={styles.summaryNumber}>{weeklySummary.articlesRead}</Text>
                  <Text style={styles.summaryLabel}>Articles Read</Text>
                </View>
                <View style={styles.summaryItem}>
                  <CheckCircle2 size={24} color="#95E1D3" />
                  <Text style={styles.summaryNumber}>{weeklySummary.challengesCompleted}</Text>
                  <Text style={styles.summaryLabel}>Challenges</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Streak Timeline (30 Days)</Text>
            <View style={styles.timelineCard}>
              <View style={styles.timeline}>
                {streakTimeline.map((active, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.timelineDot,
                      active ? styles.timelineDotActive : styles.timelineDotInactive
                    ]} 
                  />
                ))}
              </View>
              <View style={styles.timelineLabels}>
                <Text style={styles.timelineLabel}>30 days ago</Text>
                <Text style={styles.timelineLabel}>Today</Text>
              </View>
            </View>
          </View>

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
            <Text style={styles.sectionTitle}>Challenge Completion</Text>
            <View style={styles.challengeCard}>
              <View style={styles.challengeProgress}>
                <View style={styles.progressCircle}>
                  <Text style={styles.progressPercentage}>
                    {totalChallenges > 0 ? Math.round((completedChallenges / totalChallenges) * 100) : 0}%
                  </Text>
                  <Text style={styles.progressLabel}>Complete</Text>
                </View>
                <View style={styles.challengeStats}>
                  <Text style={styles.challengeStatText}>
                    Completed: <Text style={styles.challengeStatValue}>{completedChallenges}</Text>
                  </Text>
                  <Text style={styles.challengeStatText}>
                    Total: <Text style={styles.challengeStatValue}>{totalChallenges}</Text>
                  </Text>
                  <Text style={styles.challengeStatText}>
                    Remaining: <Text style={styles.challengeStatValue}>{totalChallenges - completedChallenges}</Text>
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Activity (Last 7 Days)</Text>
            <View style={styles.chartCard}>
              <View style={styles.chart}>
                {challengesByDay.map((count, index) => {
                  const height = maxChallenges > 0 ? (count / maxChallenges) * 100 : 0;
                  return (
                    <View key={index} style={styles.barContainer}>
                      <View style={styles.barWrapper}>
                        <View 
                          style={[
                            styles.bar, 
                            { height: `${Math.max(height, 5)}%` }
                          ]} 
                        >
                          <Text style={styles.barCount}>{count}</Text>
                        </View>
                      </View>
                      <Text style={styles.barLabel}>
                        {last7Days[index].day}
                      </Text>
                    </View>
                  );
                })}
              </View>
              <Text style={styles.chartSubtext}>Challenges completed per day</Text>
            </View>
          </View>

          {moodEntries.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mood Trend (30 Days)</Text>
              <View style={styles.moodCard}>
                <View style={styles.moodChart}>
                  {moodByDay.map((mood, index) => {
                    if (mood === null) return <View key={index} style={styles.moodBarEmpty} />;
                    const height = (mood / 10) * 100;
                    return (
                      <View key={index} style={styles.moodBarContainer}>
                        <View style={[styles.moodBar, { height: `${height}%` }]} />
                      </View>
                    );
                  })}
                </View>
                <View style={styles.moodSummary}>
                  <Heart size={20} color="#FF9A76" />
                  <Text style={styles.moodAvgText}>
                    Average Mood: <Text style={styles.moodAvgValue}>{avgMood.toFixed(1)}/10</Text>
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All-Time Stats</Text>
            <View style={styles.totalStatsGrid}>
              <View style={styles.totalStatCard}>
                <Zap size={24} color="#FF9A76" />
                <Text style={styles.totalStatNumber}>{panicButtonCount}</Text>
                <Text style={styles.totalStatLabel}>Urges Resisted</Text>
              </View>
              <View style={styles.totalStatCard}>
                <Target size={24} color="#9D84B7" />
                <Text style={styles.totalStatNumber}>{completedChallenges}</Text>
                <Text style={styles.totalStatLabel}>Challenges</Text>
              </View>
              <View style={styles.totalStatCard}>
                <BarChart3 size={24} color="#95E1D3" />
                <Text style={styles.totalStatNumber}>{points}</Text>
                <Text style={styles.totalStatLabel}>Total Points</Text>
              </View>
              <View style={styles.totalStatCard}>
                <BookOpen size={24} color="#4ECDC4" />
                <Text style={styles.totalStatNumber}>{journalEntries.length}</Text>
                <Text style={styles.totalStatLabel}>Journal Entries</Text>
              </View>
              <View style={styles.totalStatCard}>
                <Award size={24} color="#FFE66D" />
                <Text style={styles.totalStatNumber}>{unlockedAchievements}</Text>
                <Text style={styles.totalStatLabel}>Achievements</Text>
              </View>
              <View style={styles.totalStatCard}>
                <BookOpen size={24} color="#FF9A76" />
                <Text style={styles.totalStatNumber}>{savedFeedItems.length}</Text>
                <Text style={styles.totalStatLabel}>Saved Articles</Text>
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
              <View style={styles.journeyRow}>
                <Text style={styles.journeyLabel}>Best Streak:</Text>
                <Text style={styles.journeyValue}>{longestStreak} days</Text>
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
  sectionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  exportButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.4)',
  },
  exportText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#4ECDC4',
  },
  exportMessage: {
    fontSize: 14,
    color: '#4ECDC4',
    textAlign: 'center' as const,
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  summaryGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 16,
  },
  summaryItem: {
    width: (width - 76) / 2,
    alignItems: 'center' as const,
    gap: 8,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#B8C6DB',
    textAlign: 'center' as const,
  },
  timelineCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  timeline: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 12,
  },
  timelineDot: {
    width: (width - 80) / 30,
    height: 24,
    borderRadius: 4,
  },
  timelineDotActive: {
    backgroundColor: '#4ECDC4',
  },
  timelineDotInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  timelineLabels: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
  timelineLabel: {
    fontSize: 12,
    color: '#B8C6DB',
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
  challengeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  challengeProgress: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 24,
  },
  progressCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    borderWidth: 4,
    borderColor: '#4ECDC4',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  progressLabel: {
    fontSize: 12,
    color: '#B8C6DB',
  },
  challengeStats: {
    flex: 1,
    gap: 8,
  },
  challengeStatText: {
    fontSize: 16,
    color: '#B8C6DB',
  },
  challengeStatValue: {
    fontWeight: '700' as const,
    color: '#FFFFFF',
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
    width: '80%',
    justifyContent: 'flex-end' as const,
  },
  bar: {
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
    minHeight: 20,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  barCount: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#0F2027',
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
  moodCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  moodChart: {
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
    height: 100,
    marginBottom: 16,
    gap: 2,
  },
  moodBarContainer: {
    flex: 1,
    justifyContent: 'flex-end' as const,
  },
  moodBar: {
    backgroundColor: '#FF9A76',
    borderRadius: 2,
    minHeight: 4,
  },
  moodBarEmpty: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
  },
  moodSummary: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
  },
  moodAvgText: {
    fontSize: 16,
    color: '#B8C6DB',
  },
  moodAvgValue: {
    fontWeight: '700' as const,
    color: '#FFFFFF',
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

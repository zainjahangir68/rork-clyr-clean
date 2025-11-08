import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useRecovery } from '@/contexts/RecoveryContext';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, Target, Calendar, Award } from 'lucide-react-native';
import { useMemo } from 'react';

export default function TrackerScreen() {
  const { getDaysSince, longestStreak, goals, achievements, startDate } = useRecovery();
  const currentStreak = getDaysSince();

  const weeklyData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const dayDate = new Date();
      dayDate.setDate(dayDate.getDate() - i);
      const daysSinceStart = Math.floor((dayDate.getTime() - new Date(startDate || Date.now()).getTime()) / (1000 * 60 * 60 * 24));
      const hasData = daysSinceStart >= 0;
      data.push({
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayDate.getDay()],
        value: hasData ? 1 : 0,
        date: dayDate,
      });
    }
    return data;
  }, [startDate]);

  const monthlyProgress = useMemo(() => {
    const weeks = [];
    const today = new Date();
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (i * 7 + 6));
      const daysSinceStart = Math.floor((today.getTime() - new Date(startDate || Date.now()).getTime()) / (1000 * 60 * 60 * 24));
      const weekDays = Math.min(7, Math.max(0, daysSinceStart - (i * 7)));
      weeks.push({
        label: `Week ${4 - i}`,
        days: weekDays,
        percentage: (weekDays / 7) * 100,
      });
    }
    return weeks;
  }, [startDate]);

  const activeGoals = goals.filter(g => !g.isCompleted);
  const completedGoals = goals.filter(g => g.isCompleted);
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Habit Tracker',
          headerStyle: { backgroundColor: '#1A1A2E' },
          headerTintColor: '#FFFFFF',
          headerShadowVisible: false,
          presentation: 'modal',
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
            <TrendingUp size={48} color="#4ECDC4" />
            <Text style={styles.title}>Your Progress</Text>
            <Text style={styles.subtitle}>Detailed tracking & insights</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <TrendingUp size={24} color="#4ECDC4" />
              </View>
              <Text style={styles.statValue}>{currentStreak}</Text>
              <Text style={styles.statLabel}>Current Streak</Text>
              <Text style={styles.statUnit}>days</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Award size={24} color="#FFE66D" />
              </View>
              <Text style={styles.statValue}>{longestStreak}</Text>
              <Text style={styles.statLabel}>Longest Streak</Text>
              <Text style={styles.statUnit}>days</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Calendar size={24} color="#4ECDC4" />
              <Text style={styles.sectionTitle}>Weekly View</Text>
            </View>
            <View style={styles.chartContainer}>
              <View style={styles.weeklyChart}>
                {weeklyData.map((day, index) => (
                  <View key={index} style={styles.dayColumn}>
                    <View style={styles.barContainer}>
                      <View 
                        style={[
                          styles.bar,
                          day.value > 0 && styles.barActive
                        ]} 
                      />
                    </View>
                    <Text style={styles.dayLabel}>{day.day}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.chartCaption}>
                Last 7 days of your journey
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={24} color="#4ECDC4" />
              <Text style={styles.sectionTitle}>Monthly Progress</Text>
            </View>
            <View style={styles.monthlyContainer}>
              {monthlyProgress.map((week, index) => (
                <View key={index} style={styles.weekRow}>
                  <Text style={styles.weekLabel}>{week.label}</Text>
                  <View style={styles.progressBarBg}>
                    <View 
                      style={[
                        styles.progressBarFill,
                        { width: `${week.percentage}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.weekValue}>{week.days}/7</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Target size={24} color="#4ECDC4" />
              <Text style={styles.sectionTitle}>Goals Overview</Text>
            </View>
            <View style={styles.goalsContainer}>
              <View style={styles.goalsSummary}>
                <View style={styles.goalSummaryItem}>
                  <Text style={styles.goalSummaryValue}>{activeGoals.length}</Text>
                  <Text style={styles.goalSummaryLabel}>Active</Text>
                </View>
                <View style={styles.goalSummaryDivider} />
                <View style={styles.goalSummaryItem}>
                  <Text style={styles.goalSummaryValue}>{completedGoals.length}</Text>
                  <Text style={styles.goalSummaryLabel}>Completed</Text>
                </View>
                <View style={styles.goalSummaryDivider} />
                <View style={styles.goalSummaryItem}>
                  <Text style={styles.goalSummaryValue}>{unlockedAchievements}</Text>
                  <Text style={styles.goalSummaryLabel}>Achievements</Text>
                </View>
              </View>

              {activeGoals.length === 0 && completedGoals.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>
                    No goals set yet. Set your first goal to track your progress!
                  </Text>
                </View>
              ) : (
                <>
                  {activeGoals.slice(0, 3).map((goal) => {
                    const progress = (currentStreak / goal.targetDays) * 100;
                    return (
                      <View key={goal.id} style={styles.goalCard}>
                        <Text style={styles.goalTitle}>{goal.title}</Text>
                        <View style={styles.goalProgress}>
                          <View style={styles.goalProgressBar}>
                            <View 
                              style={[
                                styles.goalProgressFill,
                                { width: `${Math.min(progress, 100)}%` }
                              ]} 
                            />
                          </View>
                          <Text style={styles.goalProgressText}>
                            {currentStreak}/{goal.targetDays} days
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </>
              )}
            </View>
          </View>

          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Keep Going!</Text>
            <Text style={styles.insightText}>
              You&apos;re building a strong foundation. Every day counts toward your transformation.
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
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#B8C6DB',
  },
  statsGrid: {
    flexDirection: 'row' as const,
    gap: 16,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statIconContainer: {
    marginBottom: 12,
  },
  statValue: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#B8C6DB',
    marginBottom: 2,
  },
  statUnit: {
    fontSize: 12,
    color: '#8A8A9D',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  chartContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  weeklyChart: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-end' as const,
    height: 120,
    marginBottom: 16,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center' as const,
    gap: 8,
  },
  barContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end' as const,
    alignItems: 'center' as const,
  },
  bar: {
    width: 30,
    height: '30%',
    backgroundColor: 'rgba(138, 138, 157, 0.3)',
    borderRadius: 6,
  },
  barActive: {
    height: '100%',
    backgroundColor: '#4ECDC4',
  },
  dayLabel: {
    fontSize: 12,
    color: '#B8C6DB',
    fontWeight: '600' as const,
  },
  chartCaption: {
    fontSize: 12,
    color: '#8A8A9D',
    textAlign: 'center' as const,
  },
  monthlyContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 16,
  },
  weekRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  weekLabel: {
    fontSize: 14,
    color: '#B8C6DB',
    width: 60,
    fontWeight: '600' as const,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden' as const,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
  },
  weekValue: {
    fontSize: 14,
    color: '#4ECDC4',
    width: 40,
    textAlign: 'right' as const,
    fontWeight: '700' as const,
  },
  goalsContainer: {
    gap: 16,
  },
  goalsSummary: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  goalSummaryItem: {
    alignItems: 'center' as const,
  },
  goalSummaryValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#4ECDC4',
    marginBottom: 4,
  },
  goalSummaryLabel: {
    fontSize: 12,
    color: '#B8C6DB',
  },
  goalSummaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  goalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  goalProgress: {
    gap: 8,
  },
  goalProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden' as const,
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 3,
  },
  goalProgressText: {
    fontSize: 12,
    color: '#B8C6DB',
  },
  emptyState: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center' as const,
  },
  emptyText: {
    fontSize: 14,
    color: '#8A8A9D',
    textAlign: 'center' as const,
    lineHeight: 22,
  },
  insightCard: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.3)',
  },
  insightTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#4ECDC4',
    marginBottom: 12,
  },
  insightText: {
    fontSize: 16,
    color: '#B8C6DB',
    lineHeight: 24,
  },
});

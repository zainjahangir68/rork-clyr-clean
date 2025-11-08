import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useRecovery } from '@/contexts/RecoveryContext';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Calendar, AlertCircle, RotateCcw, TrendingUp, BookmarkCheck } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function ProfileScreen() {
  const { getDaysSince, getHoursSince, panicButtonCount, totalResets, longestStreak, resetProgress, startDate, savedFeedItems } = useRecovery();

  const handleReset = () => {
    Alert.alert(
      'Reset Progress?',
      'This will reset your streak counter. Your achievements will be locked again, but you can unlock them as you progress. Are you sure you want to continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            resetProgress();
          },
        },
      ]
    );
  };

  const formatDate = (isoDate: string | null) => {
    if (!isoDate) return 'Unknown';
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const daysSince = getDaysSince();
  const hoursSince = getHoursSince();

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Profile',
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
            <View style={styles.avatarContainer}>
              <User size={48} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Your Journey</Text>
            <Text style={styles.subtitle}>Keep pushing forward</Text>
          </View>

          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Statistics</Text>
            
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <TrendingUp size={24} color="#4ECDC4" />
                <Text style={styles.statTitle}>Current Streak</Text>
              </View>
              <Text style={styles.statValue}>{daysSince} days</Text>
              <Text style={styles.statSubvalue}>{hoursSince} hours</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <TrendingUp size={24} color="#44A08D" />
                <Text style={styles.statTitle}>Longest Streak</Text>
              </View>
              <Text style={styles.statValue}>{longestStreak} days</Text>
              <Text style={styles.statSubvalue}>Personal best</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <AlertCircle size={24} color="#FFE66D" />
                <Text style={styles.statTitle}>Times Resisted</Text>
              </View>
              <Text style={styles.statValue}>{panicButtonCount}</Text>
              <Text style={styles.statSubvalue}>Panic button uses</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Calendar size={24} color="#B8C6DB" />
                <Text style={styles.statTitle}>Journey Started</Text>
              </View>
              <Text style={styles.statDate}>{formatDate(startDate)}</Text>
            </View>

            {totalResets > 0 && (
              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <RotateCcw size={24} color="#FF6B6B" />
                  <Text style={styles.statTitle}>Previous Attempts</Text>
                </View>
                <Text style={styles.statValue}>{totalResets}</Text>
                <Text style={styles.statSubvalue}>Each attempt is progress</Text>
              </View>
            )}
          </View>

          <View style={styles.savedSection}>
            <View style={styles.sectionHeader}>
              <BookmarkCheck size={24} color="#4ECDC4" />
              <Text style={styles.sectionTitle}>Saved Articles</Text>
            </View>
            <View style={styles.savedCountCard}>
              <Text style={styles.savedCount}>{savedFeedItems.length}</Text>
              <Text style={styles.savedLabel}>articles saved for later</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>About Recovery</Text>
            <Text style={styles.infoText}>
              Recovery is a personal journey, and relapses can happen. If you need to reset your counter, 
              remember that each attempt teaches you something new. Progress is not linear, and you are 
              still moving forward.
            </Text>
          </View>

          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <RotateCcw size={20} color="#FF6B6B" />
            <Text style={styles.resetButtonText}>Reset Progress</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Remember: You are stronger than you think</Text>
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
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#4ECDC4',
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#B8C6DB',
  },
  statsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  savedSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 16,
  },
  savedCountCard: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.3)',
  },
  savedCount: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: '#4ECDC4',
    marginBottom: 4,
  },
  savedLabel: {
    fontSize: 14,
    color: '#B8C6DB',
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#B8C6DB',
  },
  statValue: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statSubvalue: {
    fontSize: 14,
    color: '#8A8A9D',
  },
  statDate: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500' as const,
  },
  infoSection: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.3)',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#4ECDC4',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#B8C6DB',
    lineHeight: 22,
  },
  resetButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    marginBottom: 30,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FF6B6B',
  },
  footer: {
    alignItems: 'center' as const,
  },
  footerText: {
    fontSize: 14,
    color: '#B8C6DB',
    textAlign: 'center' as const,
    fontStyle: 'italic' as const,
  },
});

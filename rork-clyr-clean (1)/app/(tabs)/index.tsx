import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { useRecovery } from '@/contexts/RecoveryContext';
import { useRouter } from 'expo-router';
import { TrendingUp, Zap, Trophy, Edit3, RotateCcw, MessageCircle, Brain, ListTodo, Activity, Heart, MessageSquare, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import LiveTree from '@/components/LiveTree';
import ClyrBackground from '@/components/ClyrBackground';
import StreakGraph from '@/components/StreakGraph';
import ClyrTheme from '@/constants/colors';
import ShieldBadge from '@/components/ShieldBadge';
import ClyrHeader from '@/components/ClyrHeader';
import FloatingFactsDisplay from '@/components/FloatingFactsDisplay';
import { forumPostsData } from '@/constants/forumPosts';

export default function HomeScreen() {
  const router = useRouter();
  const { 
    getDaysSince, 
    getHoursSince, 
    getMinutesSince, 
    panicButtonCount, 
    points, 
    challenges, 
    isLoading,
    resetProgress,
    setStartDateManually,
    makePledge,
    getTodayPledge,
    pledgeEntries,
    treeGrowthPercent,
  } = useRecovery();
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDays, setEditDays] = useState('0');
  const hasPledged = getTodayPledge();

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
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
  }, [pulseAnim]);

  const handleCommitmentPress = useCallback(() => {
    if (!hasPledged) {
      makePledge();
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }, [hasPledged, makePledge]);

  const handleStrugglePress = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    router.push('/struggle');
  }, [scaleAnim, router]);

  const handleReset = () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure you want to reset your streak? This will record your current streak as your longest.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            resetProgress();
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
          }
        },
      ]
    );
  };

  const handleEditStreak = () => {
    setEditDays(getDaysSince().toString());
    setShowEditModal(true);
  };

  const saveEditedStreak = () => {
    const days = parseInt(editDays, 10);
    if (isNaN(days) || days < 0) {
      Alert.alert('Invalid Input', 'Please enter a valid number of days.');
      return;
    }
    const newStartDate = new Date();
    newStartDate.setDate(newStartDate.getDate() - days);
    setStartDateManually(newStartDate.toISOString());
    setShowEditModal(false);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const days = getDaysSince();
  const hours = getHoursSince() % 24;
  const minutes = getMinutesSince() % 60;
  
  const today = new Date().toISOString().split('T')[0];
  const todayChallenges = challenges.filter(c => c.date === today);
  const completedChallenges = todayChallenges.filter(c => c.completed).length;

  const getMilestone = () => {
    if (days < 3) return { next: 3, progress: (days / 3) * 100 };
    if (days < 7) return { next: 7, progress: ((days - 3) / 4) * 100 + 33.33 };
    if (days < 30) return { next: 30, progress: ((days - 7) / 23) * 100 + 66.67 };
    if (days < 90) return { next: 90, progress: ((days - 30) / 60) * 100 + 90 };
    return { next: days + 1, progress: 100 };
  };
  
  const milestone = getMilestone();

  const last7DaysData = useMemo(() => {
    const data: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const hasPledge = pledgeEntries.some(p => p.date === dateStr);
      data.push(hasPledge ? 1 : 0);
    }
    return data;
  }, [pledgeEntries]);



  if (isLoading) {
    return (
      <ClyrBackground>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </ClyrBackground>
    );
  }

  return (
    <ClyrBackground>
      <FloatingFactsDisplay />
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        <ClyrHeader />

        <View style={styles.mainActionsContainer}>
          <ShieldBadge
            onPress={handleCommitmentPress}
            isCheckedIn={hasPledged}
            disabled={hasPledged}
          />

          <Animated.View style={[styles.struggleButtonWrapper, { transform: [{ scale: pulseAnim }] }]}>
            <TouchableOpacity
              style={styles.struggleButton}
              onPress={handleStrugglePress}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['rgba(255, 107, 107, 0.95)', 'rgba(238, 90, 111, 0.95)']}
                style={styles.struggleGradient}
              >
                <View style={styles.glowRing} />
                <Text style={styles.struggleMainText}>Struggling Right Now?</Text>
                <Text style={styles.struggleSubText}>Get immediate support</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={styles.streakContainer}>
          <View style={styles.streakCard}>
            <View style={styles.streakHeader}>
              <Text style={styles.streakLabel}>Your Clean Streak</Text>
              <View style={styles.streakActions}>
                <TouchableOpacity onPress={handleEditStreak} style={styles.iconButton}>
                  <Edit3 size={15} color={ClyrTheme.accent} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleReset} style={styles.iconButton}>
                  <RotateCcw size={15} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.streakTimeDisplay}>
              <Text style={styles.streakDaysText}>{days}</Text>
              <Text style={styles.streakDaysLabel}>days clean</Text>
              <Text style={styles.streakTimeText}>
                {hours}h {minutes}m
              </Text>
            </View>

            <StreakGraph daysSince={days} data={last7DaysData} />

            <View style={styles.milestoneContainer}>
              <View style={styles.milestoneHeader}>
                <Text style={styles.milestoneLabel}>Next milestone: {milestone.next} days</Text>
                <Text style={styles.milestonePercent}>{Math.round(milestone.progress)}%</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <LinearGradient
                  colors={[ClyrTheme.accent, ClyrTheme.accentLight]}
                  style={[styles.progressBar, { width: `${milestone.progress}%` }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
            </View>
          </View>
          
          <Text style={styles.affirmationText}>
            Each day without relapse strengthens your mind.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.treeSection}
          onPress={() => router.push('/tree-detail')}
          activeOpacity={0.85}
        >
          <View style={styles.treeCard}>
            <View style={styles.treeHeader}>
              <Text style={styles.treeLabel}>Your Growth Tree</Text>
              <Text style={styles.treeTapHint}>Tap for details →</Text>
            </View>
            <LiveTree daysSince={days} size="small" growthPercent={treeGrowthPercent} />
          </View>
        </TouchableOpacity>

        <View style={styles.statsContainer}>
          <TouchableOpacity style={styles.statCard} onPress={() => router.push('/tracker')}>
            <TrendingUp size={26} color={ClyrTheme.accent} />
            <Text style={styles.statNumber}>{days}</Text>
            <Text style={styles.statLabel}>Days Strong</Text>
          </TouchableOpacity>
          <View style={styles.statCard}>
            <Zap size={26} color="#FFE66D" />
            <Text style={styles.statNumber}>{panicButtonCount}</Text>
            <Text style={styles.statLabel}>Urges Resisted</Text>
          </View>
        </View>
        
        <View style={styles.quickStats}>
          <View style={styles.quickStatItem}>
            <Trophy size={20} color={ClyrTheme.accent} />
            <Text style={styles.quickStatValue}>{points}</Text>
            <Text style={styles.quickStatLabel}>Points</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStatItem}>
            <Zap size={20} color="#FFE66D" />
            <Text style={styles.quickStatValue}>{completedChallenges}/{todayChallenges.length}</Text>
            <Text style={styles.quickStatLabel}>Daily Challenges</Text>
          </View>
        </View>

        <View style={styles.rewardsPreviewSection}>
          <View style={styles.rewardsHeader}>
            <Text style={styles.rewardsTitle}>Next Rewards</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/achievements')}>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rewardsScroll}>
            {[
              { days: 7, title: 'First Victory', color: ClyrTheme.accent, unlocked: days >= 7 },
              { days: 30, title: 'Building Strength', color: '#FFE66D', unlocked: days >= 30 },
              { days: 90, title: 'Rewired Mind', color: '#FF9A76', unlocked: days >= 90 },
            ].map((reward) => {
              const progress = reward.unlocked ? 100 : (days / reward.days) * 100;
              return (
                <TouchableOpacity
                  key={reward.days}
                  style={[
                    styles.rewardPreviewCard,
                    reward.unlocked && styles.rewardPreviewCardUnlocked,
                  ]}
                  onPress={() => router.push('/(tabs)/achievements')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.rewardContent, !reward.unlocked && { opacity: 0.5 }]}>
                    <View style={[styles.rewardDayBadge, { backgroundColor: reward.color }]}>
                      <Text style={styles.rewardDayText}>{reward.days}D</Text>
                    </View>
                    <Text style={[styles.rewardTitle, reward.unlocked && { color: reward.color }]}>
                      {reward.title}
                    </Text>
                    {!reward.unlocked && (
                      <View style={styles.rewardProgressContainer}>
                        <View style={styles.rewardProgressBar}>
                          <View
                            style={[
                              styles.rewardProgressFill,
                              { width: `${Math.min(progress, 100)}%`, backgroundColor: reward.color },
                            ]}
                          />
                        </View>
                        <Text style={styles.rewardDaysLeft}>{reward.days - days}d remaining</Text>
                      </View>
                    )}
                    {reward.unlocked && (
                      <View style={[styles.rewardUnlockedBadge, { borderColor: reward.color }]}>
                        <Text style={[styles.rewardUnlockedText, { color: reward.color }]}>Unlocked ✓</Text>
                      </View>
                    )}
                  </View>
                  {!reward.unlocked && (
                    <View style={styles.rewardLockOverlay}>
                      <View style={styles.rewardLockIcon}>
                        <Text style={styles.lockEmoji}>🔒</Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.quickAccessSection}>
          <Text style={styles.quickAccessTitle}>Quick Access</Text>
          <View style={styles.quickAccessGrid}>
            <TouchableOpacity style={styles.quickAccessCard} onPress={() => router.push('/community-chat')}>
              <LinearGradient
                colors={['rgba(73, 169, 255, 0.2)', 'rgba(73, 169, 255, 0.05)']}
                style={styles.quickAccessGradient}
              >
                <MessageCircle size={28} color={ClyrTheme.accent} />
                <Text style={styles.quickAccessLabel}>Community</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAccessCard} onPress={() => router.push('/ai-chat')}>
              <LinearGradient
                colors={['rgba(46, 201, 201, 0.2)', 'rgba(46, 201, 201, 0.05)']}
                style={styles.quickAccessGradient}
              >
                <Brain size={28} color={ClyrTheme.accentLight} />
                <Text style={styles.quickAccessLabel}>AI Coach</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAccessCard} onPress={() => router.push('/todos')}>
              <LinearGradient
                colors={['rgba(255, 230, 109, 0.2)', 'rgba(255, 230, 109, 0.05)']}
                style={styles.quickAccessGradient}
              >
                <ListTodo size={28} color="#FFE66D" />
                <Text style={styles.quickAccessLabel}>To-Do</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAccessCard} onPress={() => router.push('/progress')}>
              <LinearGradient
                colors={['rgba(125, 211, 255, 0.2)', 'rgba(125, 211, 255, 0.05)']}
                style={styles.quickAccessGradient}
              >
                <Activity size={28} color={ClyrTheme.aquaLight} />
                <Text style={styles.quickAccessLabel}>Progress</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.communitySection}>
          <View style={styles.communitySectionHeader}>
            <Text style={styles.communitySectionTitle}>Community Forum</Text>
            <TouchableOpacity onPress={() => router.push('/community-chat')}>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.forumPostsContainer}>
            {forumPostsData.slice(0, 3).map((post) => (
              <TouchableOpacity
                key={post.id}
                style={styles.forumPostCard}
                onPress={() => router.push('/community-chat')}
                activeOpacity={0.8}
              >
                <View style={styles.forumPostHeader}>
                  <View style={styles.forumPostUser}>
                    <View style={styles.userAvatar}>
                      <User size={16} color={ClyrTheme.accent} />
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={styles.username}>{post.username}</Text>
                      <Text style={styles.timestamp}>{post.timestamp}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.forumPostTitle}>{post.title}</Text>
                <Text style={styles.forumPostContent} numberOfLines={2}>{post.content}</Text>
                <View style={styles.forumPostFooter}>
                  <View style={styles.forumStat}>
                    <MessageSquare size={14} color="#8A8A9D" />
                    <Text style={styles.forumStatText}>{post.replies}</Text>
                  </View>
                  <View style={styles.forumStat}>
                    <Heart size={14} color="#8A8A9D" />
                    <Text style={styles.forumStatText}>{post.likes}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>


      </ScrollView>

      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Streak</Text>
            <Text style={styles.modalSubtitle}>Enter number of days:</Text>
            <TextInput
              style={styles.modalInput}
              value={editDays}
              onChangeText={setEditDays}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={ClyrTheme.textSecondary}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={saveEditedStreak}
              >
                <LinearGradient
                  colors={[ClyrTheme.accent, ClyrTheme.accentLight]}
                  style={styles.modalButtonGradient}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextSave]}>Save</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ClyrBackground>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  loadingText: {
    color: '#EAF4FF',
    fontSize: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  mainActionsContainer: {
    gap: 12,
    marginBottom: 24,
    alignItems: 'center' as const,
  },
  struggleButtonWrapper: {
    marginTop: 4,
  },
  struggleButton: {
    borderRadius: 24,
    overflow: 'hidden' as const,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  struggleGradient: {
    paddingVertical: 26,
    paddingHorizontal: 24,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    position: 'relative' as const,
  },
  glowRing: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  struggleMainText: {
    fontSize: 21,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'center' as const,
    zIndex: 1,
  },
  struggleSubText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    zIndex: 1,
  },
  streakContainer: {
    marginBottom: 24,
  },
  streakCard: {
    backgroundColor: ClyrTheme.cardBackground,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: ClyrTheme.cardBorder,
    marginBottom: 16,
    shadowColor: ClyrTheme.skyGlow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  streakHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 20,
  },
  streakLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
    opacity: 0.9,
  },
  streakActions: {
    flexDirection: 'row' as const,
    gap: 10,
  },
  iconButton: {
    padding: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
  },
  streakTimeDisplay: {
    alignItems: 'center' as const,
    marginBottom: 24,
  },
  streakDaysText: {
    fontSize: 72,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    lineHeight: 80,
    textShadowColor: 'rgba(62, 197, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  streakDaysLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 2,
    marginBottom: 8,
    opacity: 0.9,
  },
  streakTimeText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '500' as const,
    opacity: 0.8,
  },
  milestoneContainer: {
    gap: 10,
  },
  milestoneHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  milestoneLabel: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500' as const,
    opacity: 0.9,
  },
  milestonePercent: {
    fontSize: 14,
    color: ClyrTheme.accent,
    fontWeight: '700' as const,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 5,
    overflow: 'hidden' as const,
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  affirmationText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500' as const,
    fontStyle: 'italic' as const,
    textAlign: 'center' as const,
    paddingHorizontal: 20,
    lineHeight: 22,
    opacity: 0.8,
  },
  treeSection: {
    marginBottom: 24,
  },
  treeCard: {
    backgroundColor: ClyrTheme.cardBackground,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: ClyrTheme.cardBorder,
    shadowColor: ClyrTheme.skyGlow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
  },
  treeHeader: {
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  treeLabel: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 6,
    opacity: 0.95,
  },
  treeTapHint: {
    fontSize: 12,
    color: ClyrTheme.accent,
    fontWeight: '600' as const,
  },
  statsContainer: {
    flexDirection: 'row' as const,
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: ClyrTheme.cardBackground,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: ClyrTheme.cardBorder,
    gap: 8,
    shadowColor: ClyrTheme.skyGlow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  statNumber: {
    fontSize: 34,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    opacity: 0.95,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center' as const,
    fontWeight: '500' as const,
    opacity: 0.8,
  },
  quickStats: {
    backgroundColor: ClyrTheme.cardBackground,
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: ClyrTheme.cardBorder,
    marginBottom: 24,
  },
  quickStatItem: {
    alignItems: 'center' as const,
    gap: 6,
  },
  quickStatValue: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    opacity: 0.95,
  },
  quickStatLabel: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  quickStatDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  quickAccessSection: {
    marginBottom: 24,
  },
  quickAccessTitle: {
    fontSize: 19,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 16,
    opacity: 0.95,
  },
  quickAccessGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
    justifyContent: 'space-between' as const,
  },
  quickAccessCard: {
    width: '48%',
    borderRadius: 18,
    overflow: 'hidden' as const,
  },
  quickAccessGradient: {
    padding: 22,
    alignItems: 'center' as const,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 18,
    shadowColor: ClyrTheme.skyGlow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  quickAccessLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    opacity: 0.95,
  },
  communitySection: {
    marginBottom: 24,
  },
  communitySectionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  communitySectionTitle: {
    fontSize: 19,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    opacity: 0.95,
  },
  forumPostsContainer: {
    gap: 12,
  },
  forumPostCard: {
    backgroundColor: ClyrTheme.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: ClyrTheme.cardBorder,
    gap: 10,
  },
  forumPostHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  forumPostUser: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(73, 169, 255, 0.15)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: 'rgba(73, 169, 255, 0.3)',
  },
  userInfo: {
    gap: 2,
  },
  username: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    opacity: 0.95,
  },
  timestamp: {
    fontSize: 11,
    color: '#8A8A9D',
  },
  forumPostTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  forumPostContent: {
    fontSize: 13,
    color: '#B8C6DB',
    lineHeight: 18,
  },
  forumPostFooter: {
    flexDirection: 'row' as const,
    gap: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  forumStat: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  forumStatText: {
    fontSize: 12,
    color: '#8A8A9D',
    fontWeight: '500' as const,
  },

  rewardsPreviewSection: {
    marginBottom: 24,
  },
  rewardsHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  rewardsTitle: {
    fontSize: 19,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    opacity: 0.95,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: ClyrTheme.accent,
  },
  rewardsScroll: {
    gap: 12,
    paddingRight: 20,
  },
  rewardPreviewCard: {
    width: 170,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderStyle: 'dashed' as const,
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  rewardPreviewCardUnlocked: {
    borderColor: 'rgba(73, 169, 255, 0.4)',
    borderStyle: 'solid' as const,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: ClyrTheme.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  rewardContent: {
    alignItems: 'center' as const,
    gap: 10,
  },
  rewardDayBadge: {
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 4,
  },
  rewardDayText: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#8A8A9D',
    textAlign: 'center' as const,
    lineHeight: 20,
  },
  rewardProgressContainer: {
    width: '100%',
    gap: 6,
    marginTop: 4,
  },
  rewardProgressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 3,
    overflow: 'hidden' as const,
  },
  rewardProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  rewardDaysLeft: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: ClyrTheme.textSecondary,
    textAlign: 'center' as const,
  },
  rewardUnlockedBadge: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    marginTop: 4,
  },
  rewardUnlockedText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  rewardLockOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  rewardLockIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    padding: 14,
    borderRadius: 32,
  },
  lockEmoji: {
    fontSize: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 20,
  },
  modalContent: {
    backgroundColor: ClyrTheme.primary,
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: ClyrTheme.cardBorder,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center' as const,
    opacity: 0.95,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center' as const,
    opacity: 0.85,
  },
  modalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    padding: 18,
    fontSize: 18,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    marginBottom: 26,
    textAlign: 'center' as const,
  },
  modalButtons: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden' as const,
  },
  modalButtonCancel: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    padding: 16,
    alignItems: 'center' as const,
  },
  modalButtonSave: {
    overflow: 'hidden' as const,
  },
  modalButtonGradient: {
    padding: 16,
    alignItems: 'center' as const,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  modalButtonTextSave: {
    color: '#FFFFFF',
    fontWeight: '700' as const,
  },
});

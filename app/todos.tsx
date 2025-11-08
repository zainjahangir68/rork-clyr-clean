import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Platform, Animated } from 'react-native';
import { useRecovery } from '@/contexts/RecoveryContext';
import { Stack, useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Sparkles, TreeDeciduous, RefreshCw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import ClyrTheme from '@/constants/colors';

export default function TodosScreen() {
  const router = useRouter();
  const { todoItems, addTodoItem, toggleTodoItem, deleteTodoItem, treeGrowthPercent, resetDailyTodos } = useRecovery();
  const [newTodo, setNewTodo] = useState('');
  const [showCompletionBanner, setShowCompletionBanner] = useState(false);
  const growthAnim = useRef(new Animated.Value(0)).current;
  const bannerAnim = useRef(new Animated.Value(0)).current;

  const today = new Date().toISOString().split('T')[0];
  const dailyTodos = todoItems.filter(t => t.type === 'daily' && t.date === today);
  const customTodos = todoItems.filter(t => t.type === 'custom');

  const completedDaily = dailyTodos.filter(t => t.completed).length;
  const totalDaily = dailyTodos.length;
  const allDailyCompleted = totalDaily > 0 && completedDaily === totalDaily;

  useEffect(() => {
    if (allDailyCompleted && !showCompletionBanner) {
      setShowCompletionBanner(true);
      Animated.sequence([
        Animated.timing(bannerAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(bannerAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => setShowCompletionBanner(false));

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }, [allDailyCompleted, showCompletionBanner]);

  useEffect(() => {
    Animated.spring(growthAnim, {
      toValue: treeGrowthPercent / 100,
      useNativeDriver: false,
      friction: 8,
    }).start();
  }, [treeGrowthPercent]);

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      addTodoItem(newTodo.trim());
      setNewTodo('');
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const handleToggleTodo = (todoId: string) => {
    toggleTodoItem(todoId);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleDeleteTodo = (todoId: string) => {
    Alert.alert(
      'Delete To-Do',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteTodoItem(todoId);
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          },
        },
      ]
    );
  };

  const handleResetDaily = () => {
    Alert.alert(
      'Refresh Daily Tasks',
      'This will generate new daily tasks. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Refresh',
          onPress: () => {
            resetDailyTodos();
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          },
        },
      ]
    );
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'mindfulness':
        return '🧘';
      case 'physical':
        return '💪';
      case 'learning':
        return '📚';
      case 'reflection':
        return '✍️';
      case 'social':
        return '💬';
      default:
        return '✨';
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Daily Focus', headerShown: true }} />
      
      <LinearGradient colors={['#0F2027', '#203A43', '#2C5364']} style={styles.gradient}>
        <View style={styles.content}>
          <TouchableOpacity 
            style={styles.treeGrowthCard}
            onPress={() => router.push('/tree-detail')}
            activeOpacity={0.85}
          >
            <View style={styles.treeGrowthHeader}>
              <View style={styles.treeGrowthInfo}>
                <TreeDeciduous size={24} color={ClyrTheme.accent} />
                <View>
                  <Text style={styles.treeGrowthTitle}>Tree Growth</Text>
                  <Text style={styles.treeGrowthSubtitle}>Tap to view your tree</Text>
                </View>
              </View>
              <Text style={styles.treeGrowthPercent}>{Math.round(treeGrowthPercent)}%</Text>
            </View>
            <View style={styles.treeProgressBarContainer}>
              <Animated.View
                style={[
                  styles.treeProgressBar,
                  {
                    width: growthAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              >
                <LinearGradient
                  colors={[ClyrTheme.accent, ClyrTheme.accentLight]}
                  style={styles.treeProgressGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </Animated.View>
            </View>
            {treeGrowthPercent >= 100 && (
              <View style={styles.treeBloomBadge}>
                <Sparkles size={16} color="#FFE66D" />
                <Text style={styles.treeBloomText}>Your tree is blooming! 🌸</Text>
              </View>
            )}
          </TouchableOpacity>

          {showCompletionBanner && (
            <Animated.View
              style={[
                styles.completionBanner,
                {
                  opacity: bannerAnim,
                  transform: [
                    {
                      translateY: bannerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-50, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(78, 205, 196, 0.95)', 'rgba(73, 169, 255, 0.95)']}
                style={styles.completionGradient}
              >
                <Sparkles size={24} color="#FFFFFF" />
                <Text style={styles.completionText}>Daily Completed! 🎉</Text>
              </LinearGradient>
            </Animated.View>
          )}

          <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
            {dailyTodos.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Daily Tasks</Text>
                  <View style={styles.dailyProgress}>
                    <Text style={styles.dailyProgressText}>
                      {completedDaily}/{totalDaily}
                    </Text>
                    <TouchableOpacity onPress={handleResetDaily} style={styles.refreshButton}>
                      <RefreshCw size={16} color={ClyrTheme.accent} />
                    </TouchableOpacity>
                  </View>
                </View>
                {dailyTodos.map((todo) => (
                  <View
                    key={todo.id}
                    style={[styles.todoCard, todo.completed && styles.todoCardCompleted]}
                  >
                    <TouchableOpacity
                      style={styles.todoContent}
                      onPress={() => handleToggleTodo(todo.id)}
                    >
                      {todo.completed ? (
                        <CheckCircle2 size={24} color={ClyrTheme.accent} />
                      ) : (
                        <Circle size={24} color={ClyrTheme.accent} />
                      )}
                      <View style={styles.todoTextContainer}>
                        <View style={styles.todoTitleRow}>
                          <Text style={styles.categoryIcon}>{getCategoryIcon(todo.category)}</Text>
                          <Text
                            style={[styles.todoText, todo.completed && styles.todoTextCompleted]}
                          >
                            {todo.title}
                          </Text>
                        </View>
                        <View style={styles.treeGrowthBadge}>
                          <TreeDeciduous size={12} color={ClyrTheme.accentLight} />
                          <Text style={styles.treeGrowthBadgeText}>+{todo.treeGrowth}%</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>My Tasks</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Add a custom task..."
                  placeholderTextColor="#8A8A9D"
                  value={newTodo}
                  onChangeText={setNewTodo}
                  onSubmitEditing={handleAddTodo}
                  returnKeyType="done"
                />
                <TouchableOpacity style={styles.addButton} onPress={handleAddTodo}>
                  <Plus size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {customTodos.length > 0 ? (
                customTodos.map((todo) => (
                  <View
                    key={todo.id}
                    style={[styles.todoCard, todo.completed && styles.todoCardCompleted]}
                  >
                    <TouchableOpacity
                      style={styles.todoContent}
                      onPress={() => handleToggleTodo(todo.id)}
                    >
                      {todo.completed ? (
                        <CheckCircle2 size={24} color={ClyrTheme.accent} />
                      ) : (
                        <Circle size={24} color={ClyrTheme.accent} />
                      )}
                      <View style={styles.todoTextContainer}>
                        <Text
                          style={[styles.todoText, todo.completed && styles.todoTextCompleted]}
                        >
                          {todo.title}
                        </Text>
                        <View style={styles.treeGrowthBadge}>
                          <TreeDeciduous size={12} color={ClyrTheme.accentLight} />
                          <Text style={styles.treeGrowthBadgeText}>+{todo.treeGrowth}%</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteTodo(todo.id)}>
                      <Trash2 size={20} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No custom tasks yet</Text>
                  <Text style={styles.emptySubtext}>Add your own tasks above</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
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
  content: {
    flex: 1,
    padding: 20,
  },
  treeGrowthCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  treeGrowthHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  treeGrowthInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  treeGrowthTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  treeGrowthSubtitle: {
    fontSize: 12,
    color: ClyrTheme.accent,
    fontWeight: '600' as const,
  },
  treeGrowthPercent: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: ClyrTheme.accent,
  },
  treeProgressBarContainer: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 6,
    overflow: 'hidden' as const,
  },
  treeProgressBar: {
    height: '100%',
  },
  treeProgressGradient: {
    flex: 1,
    borderRadius: 6,
  },
  treeBloomBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginTop: 12,
    padding: 10,
    backgroundColor: 'rgba(255, 230, 109, 0.15)',
    borderRadius: 10,
  },
  treeBloomText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFE66D',
  },
  completionBanner: {
    position: 'absolute' as const,
    top: 20,
    left: 20,
    right: 20,
    zIndex: 1000,
    borderRadius: 16,
    overflow: 'hidden' as const,
    shadowColor: ClyrTheme.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  completionGradient: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 12,
    padding: 20,
  },
  completionText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
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
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  dailyProgress: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  dailyProgressText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: ClyrTheme.accent,
  },
  refreshButton: {
    padding: 6,
    backgroundColor: 'rgba(73, 169, 255, 0.15)',
    borderRadius: 8,
  },
  inputContainer: {
    flexDirection: 'row' as const,
    gap: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  addButton: {
    backgroundColor: ClyrTheme.accent,
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  todoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  todoCardCompleted: {
    opacity: 0.6,
  },
  todoContent: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  todoTextContainer: {
    flex: 1,
    gap: 6,
  },
  todoTitleRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  categoryIcon: {
    fontSize: 18,
  },
  todoText: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through' as const,
    color: '#B8C6DB',
  },
  treeGrowthBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    alignSelf: 'flex-start' as const,
    backgroundColor: 'rgba(78, 205, 196, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  treeGrowthBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: ClyrTheme.accentLight,
  },
  emptyState: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#B8C6DB',
  },
});

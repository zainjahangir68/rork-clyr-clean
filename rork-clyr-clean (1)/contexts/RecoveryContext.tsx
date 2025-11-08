import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useMemo } from 'react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'streak' | 'challenge' | 'community' | 'knowledge' | 'journal' | 'mood' | 'points' | 'lesson' | 'habit';
  requirement?: number;
  unlocked: boolean;
  unlockedAt?: string;
  pointsReward: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  pointsReward: number;
  completed: boolean;
  completedAt?: string;
  type: 'daily' | 'milestone';
  date: string;
  targetDays?: number;
  progress?: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetDays: number;
  createdAt: string;
  completedAt?: string;
  isCompleted: boolean;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood?: 'great' | 'good' | 'okay' | 'struggling' | 'difficult';
  aiSuggestion?: string;
}

export interface HabitItem {
  id: string;
  title: string;
  description?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'anytime';
  completedDates: string[];
  createdAt: string;
}

export interface MoodEntry {
  id: string;
  date: string;
  mood: number;
  energy: number;
  focus: number;
  notes?: string;
}

export interface CompletedLesson {
  lessonId: string;
  completedAt: string;
  quizScore: boolean;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconType: string;
  unlockedAt?: string;
  category: 'streak' | 'challenge' | 'community' | 'knowledge' | 'points';
}

export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  type: 'daily' | 'custom';
  category?: 'mindfulness' | 'physical' | 'learning' | 'reflection' | 'social';
  treeGrowth: number;
  date?: string;
}

export interface PledgeEntry {
  date: string;
  timestamp: string;
}

export interface RecoveryData {
  startDate: string;
  panicButtonCount: number;
  totalResets: number;
  achievements: Achievement[];
  points: number;
  longestStreak: number;
  challenges: Challenge[];
  goals: Goal[];
  savedFeedItems: string[];
  likedFeedItems: string[];
  journalEntries: JournalEntry[];
  habitItems: HabitItem[];
  moodEntries: MoodEntry[];
  completedLessons: CompletedLesson[];
  badges: Badge[];
  onboardingCompleted: boolean;
  todoItems: TodoItem[];
  pledgeEntries: PledgeEntry[];
  treeGrowthPercent: number;
}

const STORAGE_KEY = 'recovery_data';

const defaultAchievements: Achievement[] = [
  { id: 'streak-1', title: 'First Streak', description: '1 day clean', type: 'streak', requirement: 1, unlocked: false, pointsReward: 10 },
  { id: 'streak-3', title: '3-Day Warrior', description: '3 days clean', type: 'streak', requirement: 3, unlocked: false, pointsReward: 30 },
  { id: 'streak-7', title: 'Week Champion', description: '7 days clean', type: 'streak', requirement: 7, unlocked: false, pointsReward: 50 },
  { id: 'streak-30', title: 'Monthly Master', description: '30 days clean', type: 'streak', requirement: 30, unlocked: false, pointsReward: 200 },
  
  { id: 'challenge-first', title: 'Getting Started', description: 'Complete first challenge', type: 'challenge', unlocked: false, pointsReward: 15 },
  { id: 'challenge-streak-7', title: 'Committed', description: 'Complete 7-day challenge streak', type: 'challenge', unlocked: false, pointsReward: 75 },
  
  { id: 'journal-first', title: 'Reflective Beginner', description: 'Write first journal entry', type: 'journal', unlocked: false, pointsReward: 10 },
  { id: 'journal-10', title: 'Thoughtful Writer', description: 'Write 10 journal entries', type: 'journal', unlocked: false, pointsReward: 50 },
  
  { id: 'knowledge-first', title: 'Knowledge Seeker', description: 'Read first article', type: 'knowledge', unlocked: false, pointsReward: 10 },
  { id: 'knowledge-read-3', title: 'Avid Reader', description: 'Read 3 articles', type: 'knowledge', requirement: 3, unlocked: false, pointsReward: 20 },
  { id: 'knowledge-bookmark', title: 'Curator', description: 'Bookmark 5 articles', type: 'knowledge', unlocked: false, pointsReward: 25 },
  
  { id: 'lesson-first', title: 'Eager Learner', description: 'Complete first micro-lesson', type: 'lesson', unlocked: false, pointsReward: 20 },
  { id: 'lesson-all', title: 'Scholar', description: 'Complete all micro-lessons', type: 'lesson', unlocked: false, pointsReward: 100 },
  
  { id: 'mood-first', title: 'Self-Aware', description: 'Log first mood entry', type: 'mood', unlocked: false, pointsReward: 10 },
  { id: 'mood-week', title: 'Mood Tracker', description: 'Log mood for 7 consecutive days', type: 'mood', unlocked: false, pointsReward: 40 },
  
  { id: 'habit-first', title: 'Habit Builder', description: 'Create first habit', type: 'habit', unlocked: false, pointsReward: 10 },
  { id: 'habit-streak', title: 'Consistency King', description: 'Complete habit for 7 days', type: 'habit', unlocked: false, pointsReward: 50 },
  
  { id: 'points-50', title: 'Rising Star', description: 'Earn 50 points', type: 'points', requirement: 50, unlocked: false, pointsReward: 0 },
  { id: 'points-100', title: 'Shining Star', description: 'Earn 100 points', type: 'points', requirement: 100, unlocked: false, pointsReward: 0 },
  { id: 'points-500', title: 'Super Star', description: 'Earn 500 points', type: 'points', requirement: 500, unlocked: false, pointsReward: 0 },
];

export const [RecoveryProvider, useRecovery] = createContextHook(() => {
  const [startDate, setStartDate] = useState<string | null>(null);
  const [panicButtonCount, setPanicButtonCount] = useState(0);
  const [totalResets, setTotalResets] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>(defaultAchievements);
  const [points, setPoints] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [savedFeedItems, setSavedFeedItems] = useState<string[]>([]);
  const [likedFeedItems, setLikedFeedItems] = useState<string[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [habitItems, setHabitItems] = useState<HabitItem[]>([]);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [completedLessons, setCompletedLessons] = useState<CompletedLesson[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
  const [pledgeEntries, setPledgeEntries] = useState<PledgeEntry[]>([]);
  const [treeGrowthPercent, setTreeGrowthPercent] = useState(0);

  const dataQuery = useQuery({
    queryKey: ['recoveryData'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data: RecoveryData = JSON.parse(stored);
          return data;
        }
        const initialData: RecoveryData = {
          startDate: new Date().toISOString(),
          panicButtonCount: 0,
          totalResets: 0,
          achievements: defaultAchievements,
          points: 0,
          longestStreak: 0,
          challenges: [],
          goals: [],
          savedFeedItems: [],
          likedFeedItems: [],
          journalEntries: [],
          habitItems: [],
          moodEntries: [],
          completedLessons: [],
          badges: [],
          onboardingCompleted: false,
          todoItems: [],
          pledgeEntries: [],
          treeGrowthPercent: 0,
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
        return initialData;
      } catch (error) {
        console.error('Error loading recovery data:', error);
        return {
          startDate: new Date().toISOString(),
          panicButtonCount: 0,
          totalResets: 0,
          achievements: defaultAchievements,
          points: 0,
          longestStreak: 0,
          challenges: [],
          goals: [],
          savedFeedItems: [],
          likedFeedItems: [],
          journalEntries: [],
          habitItems: [],
          moodEntries: [],
          completedLessons: [],
          badges: [],
          onboardingCompleted: false,
          todoItems: [],
          pledgeEntries: [],
          treeGrowthPercent: 0,
        };
      }
    },
    staleTime: Infinity,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: RecoveryData) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    },
  });

  const { mutate: saveData } = saveMutation;

  useEffect(() => {
    if (dataQuery.data) {
      setStartDate(dataQuery.data.startDate);
      setPanicButtonCount(dataQuery.data.panicButtonCount);
      setTotalResets(dataQuery.data.totalResets);
      setAchievements(dataQuery.data.achievements);
      setPoints(dataQuery.data.points || 0);
      setLongestStreak(dataQuery.data.longestStreak || 0);
      setChallenges(dataQuery.data.challenges || []);
      setGoals(dataQuery.data.goals || []);
      setSavedFeedItems(dataQuery.data.savedFeedItems || []);
      setLikedFeedItems(dataQuery.data.likedFeedItems || []);
      setJournalEntries(dataQuery.data.journalEntries || []);
      setHabitItems(dataQuery.data.habitItems || []);
      setMoodEntries(dataQuery.data.moodEntries || []);
      setCompletedLessons(dataQuery.data.completedLessons || []);
      setBadges(dataQuery.data.badges || []);
      setOnboardingCompleted(dataQuery.data.onboardingCompleted || false);
      setTodoItems(dataQuery.data.todoItems || []);
      setPledgeEntries(dataQuery.data.pledgeEntries || []);
      setTreeGrowthPercent(dataQuery.data.treeGrowthPercent || 0);
    }
  }, [dataQuery.data]);

  const persistData = useCallback(() => {
    if (!startDate) return;
    saveData({
      startDate,
      panicButtonCount,
      totalResets,
      achievements,
      points,
      longestStreak,
      challenges,
      goals,
      savedFeedItems,
      likedFeedItems,
      journalEntries,
      habitItems,
      moodEntries,
      completedLessons,
      badges,
      onboardingCompleted,
      todoItems,
      pledgeEntries,
      treeGrowthPercent,
    });
  }, [startDate, panicButtonCount, totalResets, achievements, points, longestStreak, challenges, goals, savedFeedItems, likedFeedItems, journalEntries, habitItems, moodEntries, completedLessons, badges, onboardingCompleted, todoItems, pledgeEntries, treeGrowthPercent, saveData]);

  const checkAchievements = useCallback(() => {
    if (!startDate) return;

    const daysSince = Math.floor((Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
    let hasChanges = false;
    let pointsToAdd = 0;

    const updatedAchievements = achievements.map(achievement => {
      if (achievement.unlocked) return achievement;

      let shouldUnlock = false;

      switch (achievement.type) {
        case 'streak':
          shouldUnlock = achievement.requirement !== undefined && daysSince >= achievement.requirement;
          break;
        case 'challenge':
          if (achievement.id === 'challenge-first') {
            shouldUnlock = challenges.some(c => c.completed);
          } else if (achievement.id === 'challenge-streak-7') {
            const last7Days = Array.from({ length: 7 }, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - i);
              return d.toISOString().split('T')[0];
            });
            shouldUnlock = last7Days.every(date => 
              challenges.some(c => c.date === date && c.completed)
            );
          }
          break;
        case 'journal':
          if (achievement.id === 'journal-first') {
            shouldUnlock = journalEntries.length >= 1;
          } else if (achievement.id === 'journal-10') {
            shouldUnlock = journalEntries.length >= 10;
          }
          break;
        case 'knowledge':
          if (achievement.id === 'knowledge-first') {
            shouldUnlock = likedFeedItems.length >= 1 || savedFeedItems.length >= 1;
          } else if (achievement.id === 'knowledge-bookmark') {
            shouldUnlock = savedFeedItems.length >= 5;
          } else if (achievement.id === 'knowledge-read-3') {
            shouldUnlock = likedFeedItems.length >= 3 || savedFeedItems.length >= 3;
          }
          break;
        case 'lesson':
          if (achievement.id === 'lesson-first') {
            shouldUnlock = completedLessons.length >= 1;
          } else if (achievement.id === 'lesson-all') {
            shouldUnlock = completedLessons.length >= 6;
          }
          break;
        case 'mood':
          if (achievement.id === 'mood-first') {
            shouldUnlock = moodEntries.length >= 1;
          } else if (achievement.id === 'mood-week') {
            const last7Days = Array.from({ length: 7 }, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - i);
              return d.toISOString().split('T')[0];
            });
            shouldUnlock = last7Days.every(date => 
              moodEntries.some(m => m.date.split('T')[0] === date)
            );
          }
          break;
        case 'habit':
          if (achievement.id === 'habit-first') {
            shouldUnlock = habitItems.length >= 1;
          } else if (achievement.id === 'habit-streak') {
            shouldUnlock = habitItems.some(habit => habit.completedDates.length >= 7);
          }
          break;
        case 'points':
          shouldUnlock = achievement.requirement !== undefined && points >= achievement.requirement;
          break;
      }

      if (shouldUnlock) {
        hasChanges = true;
        pointsToAdd += achievement.pointsReward;
        return {
          ...achievement,
          unlocked: true,
          unlockedAt: new Date().toISOString(),
        };
      }
      return achievement;
    });

    if (hasChanges) {
      setAchievements(updatedAchievements);
      setPoints(p => p + pointsToAdd);
    }
  }, [startDate, achievements, challenges, journalEntries, savedFeedItems, likedFeedItems, completedLessons, moodEntries, habitItems, points]);

  useEffect(() => {
    if (startDate) {
      checkAchievements();
    }
  }, [startDate, challenges.length, journalEntries.length, savedFeedItems.length, likedFeedItems.length, completedLessons.length, moodEntries.length, habitItems.length, points]);

  useEffect(() => {
    if (startDate && !dataQuery.isLoading) {
      const timeoutId = setTimeout(() => {
        persistData();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [startDate, panicButtonCount, totalResets, achievements, points, longestStreak, challenges, goals, savedFeedItems, likedFeedItems, journalEntries, habitItems, moodEntries, completedLessons, badges, onboardingCompleted, todoItems, pledgeEntries, treeGrowthPercent, dataQuery.isLoading, persistData]);

  const incrementPanicButton = useCallback(() => {
    const newCount = panicButtonCount + 1;
    const bonusPoints = 5;
    setPanicButtonCount(newCount);
    setPoints(p => p + bonusPoints);
  }, [panicButtonCount]);

  const getDaysSince = useCallback((): number => {
    if (!startDate) return 0;
    return Math.floor((Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
  }, [startDate]);

  const getHoursSince = useCallback((): number => {
    if (!startDate) return 0;
    return Math.floor((Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60));
  }, [startDate]);

  const getMinutesSince = useCallback((): number => {
    if (!startDate) return 0;
    return Math.floor((Date.now() - new Date(startDate).getTime()) / (1000 * 60));
  }, [startDate]);

  const resetProgress = useCallback(() => {
    const currentDays = getDaysSince();
    const newLongestStreak = Math.max(longestStreak, currentDays);
    const newStartDate = new Date().toISOString();
    const newResets = totalResets + 1;
    const resetAchievements = defaultAchievements;
    
    setStartDate(newStartDate);
    setTotalResets(newResets);
    setAchievements(resetAchievements);
    setLongestStreak(newLongestStreak);
  }, [totalResets, longestStreak, getDaysSince]);

  const completeChallenge = useCallback((challengeId: string) => {
    setChallenges(prev => {
      const updated = prev.map(c => 
        c.id === challengeId && !c.completed
          ? { ...c, completed: true, completedAt: new Date().toISOString() }
          : c
      );
      const challenge = updated.find(c => c.id === challengeId);
      const wasCompleted = prev.find(c => c.id === challengeId)?.completed;
      if (challenge && !wasCompleted) {
        setPoints(p => p + challenge.pointsReward);
      }
      return updated;
    });
  }, []);

  const addGoal = useCallback((title: string, description: string, targetDays: number) => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      title,
      description,
      targetDays,
      createdAt: new Date().toISOString(),
      isCompleted: false,
    };
    setGoals(prev => [...prev, newGoal]);
  }, []);

  const toggleSaveFeedItem = useCallback((itemId: string) => {
    setSavedFeedItems(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  }, []);

  const toggleLikeFeedItem = useCallback((itemId: string) => {
    setLikedFeedItems(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  }, []);

  const addJournalEntry = useCallback((content: string, mood?: JournalEntry['mood']) => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      content,
      mood,
    };
    setJournalEntries(prev => [newEntry, ...prev]);
    setPoints(p => p + 10);
  }, []);

  const addHabit = useCallback((title: string, description?: string, timeOfDay?: HabitItem['timeOfDay']) => {
    const newHabit: HabitItem = {
      id: Date.now().toString(),
      title,
      description,
      timeOfDay,
      completedDates: [],
      createdAt: new Date().toISOString(),
    };
    setHabitItems(prev => [...prev, newHabit]);
  }, []);

  const toggleHabitCompletion = useCallback((habitId: string, date: string) => {
    setHabitItems(prev => prev.map(habit => {
      if (habit.id !== habitId) return habit;
      
      const dateStr = date.split('T')[0];
      const isCompleted = habit.completedDates.includes(dateStr);
      
      if (isCompleted) {
        return {
          ...habit,
          completedDates: habit.completedDates.filter(d => d !== dateStr),
        };
      } else {
        setPoints(p => p + 5);
        return {
          ...habit,
          completedDates: [...habit.completedDates, dateStr],
        };
      }
    }));
  }, []);

  const addMoodEntry = useCallback((mood: number, energy: number, focus: number, notes?: string) => {
    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      mood,
      energy,
      focus,
      notes,
    };
    setMoodEntries(prev => [newEntry, ...prev]);
    setPoints(p => p + 5);
  }, []);

  const completeLesson = useCallback((lessonId: string, quizScore: boolean) => {
    const alreadyCompleted = completedLessons.some(l => l.lessonId === lessonId);
    if (!alreadyCompleted) {
      const newLesson: CompletedLesson = {
        lessonId,
        completedAt: new Date().toISOString(),
        quizScore,
      };
      setCompletedLessons(prev => [...prev, newLesson]);
      setPoints(p => p + (quizScore ? 25 : 15));
    }
  }, [completedLessons]);

  const completeOnboarding = useCallback(() => {
    setOnboardingCompleted(true);
  }, []);

  const setStartDateManually = useCallback((newDate: string) => {
    setStartDate(newDate);
  }, []);

  const addTodoItem = useCallback((title: string, type: 'daily' | 'custom' = 'custom', category?: TodoItem['category'], treeGrowth: number = 1) => {
    const newTodo: TodoItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      completed: false,
      createdAt: new Date().toISOString(),
      type,
      category,
      treeGrowth,
      date: type === 'daily' ? new Date().toISOString().split('T')[0] : undefined,
    };
    setTodoItems(prev => [...prev, newTodo]);
  }, []);

  const toggleTodoItem = useCallback((todoId: string) => {
    setTodoItems(prev => prev.map(todo => {
      if (todo.id !== todoId) return todo;
      if (todo.completed) {
        setTreeGrowthPercent(p => Math.max(0, p - todo.treeGrowth));
        return { ...todo, completed: false, completedAt: undefined };
      } else {
        setPoints(p => p + 5);
        setTreeGrowthPercent(p => Math.min(100, p + todo.treeGrowth));
        return { ...todo, completed: true, completedAt: new Date().toISOString() };
      }
    }));
  }, []);

  const deleteTodoItem = useCallback((todoId: string) => {
    setTodoItems(prev => prev.filter(todo => todo.id !== todoId));
  }, []);

  const makePledge = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const hasToday = pledgeEntries.some(p => p.date === today);
    if (!hasToday) {
      const newPledge: PledgeEntry = {
        date: today,
        timestamp: new Date().toISOString(),
      };
      setPledgeEntries(prev => [...prev, newPledge]);
      setPoints(p => p + 10);
    }
  }, [pledgeEntries]);

  const getTodayPledge = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return pledgeEntries.some(p => p.date === today);
  }, [pledgeEntries]);

  const generateDailyTodos = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const hasTodayTodos = todoItems.some(t => t.type === 'daily' && t.date === today);
    
    if (hasTodayTodos) return;

    const daysSince = getDaysSince();
    const journalCount = journalEntries.length;
    const moodCount = moodEntries.length;
    const lessonCount = completedLessons.length;
    const habitCount = habitItems.length;

    const todoPool: Array<{ title: string; category: TodoItem['category']; treeGrowth: number }> = [
      { title: 'Journal for 5 minutes', category: 'reflection', treeGrowth: 2 },
      { title: 'Go for a 15-minute walk', category: 'physical', treeGrowth: 2 },
      { title: 'Read an article from Learn section', category: 'learning', treeGrowth: 1 },
      { title: 'Meditate for 10 minutes', category: 'mindfulness', treeGrowth: 2 },
      { title: 'Reflect on today\'s progress', category: 'reflection', treeGrowth: 1 },
      { title: 'Log your mood', category: 'mindfulness', treeGrowth: 1 },
      { title: 'Complete a micro-lesson', category: 'learning', treeGrowth: 2 },
      { title: 'Check in with community', category: 'social', treeGrowth: 1 },
      { title: 'Do 20 push-ups or stretches', category: 'physical', treeGrowth: 2 },
      { title: 'Write down 3 things you\'re grateful for', category: 'reflection', treeGrowth: 1 },
    ];

    let selectedTodos = [...todoPool];

    if (journalCount < 3) {
      selectedTodos = selectedTodos.filter(t => t.category !== 'reflection');
      selectedTodos.push({ title: 'Journal for 5 minutes', category: 'reflection', treeGrowth: 2 });
    }

    if (moodCount < 5) {
      selectedTodos.push({ title: 'Log your mood', category: 'mindfulness', treeGrowth: 1 });
    }

    if (lessonCount < 3) {
      selectedTodos.push({ title: 'Complete a micro-lesson', category: 'learning', treeGrowth: 2 });
    }

    if (habitCount < 2) {
      selectedTodos.push({ title: 'Create a new healthy habit', category: 'physical', treeGrowth: 1 });
    }

    const shuffled = selectedTodos.sort(() => 0.5 - Math.random());
    const dailyTodos = shuffled.slice(0, daysSince < 7 ? 3 : daysSince < 30 ? 4 : 5);

    dailyTodos.forEach(todo => {
      addTodoItem(todo.title, 'daily', todo.category, todo.treeGrowth);
    });
  }, [todoItems, getDaysSince, journalEntries.length, moodEntries.length, completedLessons.length, habitItems.length, addTodoItem]);

  const resetDailyTodos = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setTodoItems(prev => prev.filter(t => !(t.type === 'daily' && t.date !== today)));
    generateDailyTodos();
  }, [generateDailyTodos]);

  useEffect(() => {
    if (startDate) {
      generateDailyTodos();
    }
  }, [startDate]);

  useEffect(() => {
    if (!startDate) return;

    const today = new Date().toISOString().split('T')[0];
    const hasToday = challenges.some(c => c.date === today && c.type === 'daily');
    const hasMilestones = challenges.some(c => c.type === 'milestone');
    
    const newChallenges: Challenge[] = [];

    if (!hasToday) {
      const dailyChallenges: Challenge[] = [
        { id: `${today}-1`, title: 'Meditate for 5 minutes', description: 'Take time to breathe and center yourself', pointsReward: 10, completed: false, type: 'daily', date: today },
        { id: `${today}-2`, title: 'Write in your journal', description: 'Reflect on your journey and feelings', pointsReward: 10, completed: false, type: 'daily', date: today },
        { id: `${today}-3`, title: 'Exercise for 15 minutes', description: 'Physical activity helps mental strength', pointsReward: 15, completed: false, type: 'daily', date: today },
        { id: `${today}-4`, title: 'Read a knowledge article', description: 'Learn something new about recovery', pointsReward: 10, completed: false, type: 'daily', date: today },
        { id: `${today}-5`, title: 'Log your mood', description: 'Track how you are feeling today', pointsReward: 10, completed: false, type: 'daily', date: today },
      ];
      newChallenges.push(...dailyChallenges);
    }

    if (!hasMilestones) {
      const milestoneChallenges: Challenge[] = [
        { id: 'milestone-7', title: '7-Day Warrior', description: 'Achieve a 7-day clean streak', pointsReward: 100, completed: false, type: 'milestone', date: today, targetDays: 7, progress: 0 },
        { id: 'milestone-30', title: '30-Day Champion', description: 'Reach 30 days of sobriety', pointsReward: 500, completed: false, type: 'milestone', date: today, targetDays: 30, progress: 0 },
        { id: 'milestone-90', title: '90-Day Legend', description: 'Complete the full 90-day reboot', pointsReward: 2000, completed: false, type: 'milestone', date: today, targetDays: 90, progress: 0 },
      ];
      newChallenges.push(...milestoneChallenges);
    }

    if (newChallenges.length > 0) {
      setChallenges(prev => [...prev, ...newChallenges]);
    }
  }, [startDate, challenges]);

  return useMemo(() => ({
    startDate,
    panicButtonCount,
    totalResets,
    achievements,
    points,
    longestStreak,
    challenges,
    goals,
    savedFeedItems,
    likedFeedItems,
    journalEntries,
    habitItems,
    moodEntries,
    completedLessons,
    badges,
    onboardingCompleted,
    todoItems,
    pledgeEntries,
    incrementPanicButton,
    resetProgress,
    getDaysSince,
    getHoursSince,
    getMinutesSince,
    completeChallenge,
    addGoal,
    toggleSaveFeedItem,
    toggleLikeFeedItem,
    addJournalEntry,
    addHabit,
    toggleHabitCompletion,
    addMoodEntry,
    completeLesson,
    completeOnboarding,
    setStartDateManually,
    addTodoItem,
    toggleTodoItem,
    deleteTodoItem,
    makePledge,
    getTodayPledge,
    generateDailyTodos,
    resetDailyTodos,
    treeGrowthPercent,
    isLoading: dataQuery.isLoading,
  }), [
    startDate, panicButtonCount, totalResets, achievements, points, longestStreak, 
    challenges, goals, savedFeedItems, likedFeedItems, journalEntries, habitItems, 
    moodEntries, completedLessons, badges, onboardingCompleted, todoItems, pledgeEntries, treeGrowthPercent, incrementPanicButton, resetProgress, 
    getDaysSince, getHoursSince, getMinutesSince, completeChallenge, addGoal, 
    toggleSaveFeedItem, toggleLikeFeedItem, addJournalEntry, addHabit, 
    toggleHabitCompletion, addMoodEntry, completeLesson, completeOnboarding, setStartDateManually, 
    addTodoItem, toggleTodoItem, deleteTodoItem, makePledge, getTodayPledge, generateDailyTodos, resetDailyTodos, dataQuery.isLoading
  ]);
});

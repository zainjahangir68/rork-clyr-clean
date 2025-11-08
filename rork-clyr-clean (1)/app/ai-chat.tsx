import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Animated } from 'react-native';
import { Stack } from 'expo-router';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Wind, Gamepad2, Heart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { useRecovery } from '@/contexts/RecoveryContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: 'wind' | 'gamepad' | 'heart';
  prompt: string;
}

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const createAnimation = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const anim1 = createAnimation(dot1, 0);
    const anim2 = createAnimation(dot2, 200);
    const anim3 = createAnimation(dot3, 400);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={[styles.messageCard, styles.assistantMessage]}>
      <View style={styles.messageHeader}>
        <Bot size={20} color="#FFE66D" />
        <Text style={styles.messageRole}>AI Coach</Text>
      </View>
      <View style={styles.typingContainer}>
        <Animated.Text style={[styles.typingText, { opacity: dot1 }]}>●</Animated.Text>
        <Animated.Text style={[styles.typingText, { opacity: dot2 }]}>●</Animated.Text>
        <Animated.Text style={[styles.typingText, { opacity: dot3 }]}>●</Animated.Text>
      </View>
    </View>
  );
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'breathe',
    label: 'Breathe',
    icon: 'wind',
    prompt: "I need help with breathing exercises right now"
  },
  {
    id: 'distract',
    label: 'Distract Me',
    icon: 'gamepad',
    prompt: "I need a distraction or activity to shift my focus"
  },
  {
    id: 'remind',
    label: 'Remind Me Why',
    icon: 'heart',
    prompt: "Remind me why I chose to quit and my reasons for staying clean"
  }
];

export default function AIChatScreen() {
  const [input, setInput] = useState('');
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnims = useRef<{ [key: string]: Animated.Value }>({});
  const lastActivityTimeRef = useRef<number>(Date.now());
  
  const recovery = useRecovery();

  const getPersonalizedContext = useCallback(() => {
    const daysSince = recovery.getDaysSince();
    const todayTodos = recovery.todoItems.filter(t => 
      t.type === 'daily' && 
      t.date === new Date().toISOString().split('T')[0]
    );
    const completedTodos = todayTodos.filter(t => t.completed).length;
    const totalTodos = todayTodos.length;
    const recentJournalEntry = recovery.journalEntries[0];
    const recentMoodEntry = recovery.moodEntries[0];
    
    return {
      daysSince,
      completedTodos,
      totalTodos,
      hasJournaledRecently: recentJournalEntry && 
        (Date.now() - new Date(recentJournalEntry.date).getTime()) < 86400000,
      recentMood: recentMoodEntry?.mood,
      points: recovery.points,
    };
  }, [recovery]);

  const buildSystemPrompt = () => {
    const context = getPersonalizedContext();
    
    let contextualInfo = '';
    if (context.daysSince > 0) {
      contextualInfo += `\nUser context: The user has been Clyr for ${context.daysSince} day${context.daysSince !== 1 ? 's' : ''}. `;
    }
    if (context.completedTodos > 0 && context.totalTodos > 0) {
      contextualInfo += `They've completed ${context.completedTodos} of ${context.totalTodos} daily tasks today. `;
    }
    if (context.points > 0) {
      contextualInfo += `They've earned ${context.points} total points. `;
    }
    if (context.hasJournaledRecently) {
      contextualInfo += `They journaled recently. `;
    }
    
    return `You are a professional recovery support coach for an addiction recovery app called CLYR. Your role is to provide empathetic, evidence-based support to users recovering from addiction.${contextualInfo}

Key guidelines:
- Maintain a calm, professional, and non-judgmental tone
- Users may express strong emotions like "I'm horny", "I'm tempted", "I need relief" - respond with empathy and practical guidance
- Normalize urges as part of recovery: "Urges pass when you shift focus"
- Keep responses VERY concise (2-4 sentences MAX) followed by actionable suggestions
- ALWAYS offer 2-3 specific suggestions after your empathetic response
- Suggestions should include: breathing exercises, journaling, physical activity (walks, push-ups), using the Panic Button, reading from Knowledge Feed, or talking to the Community
- Never include explicit or sexual content
- Focus on immediate redirection and coping strategies
- Occasionally mention the user's progress naturally when relevant (e.g., "You've been Clyr for ${context.daysSince} days - that's progress worth protecting")
- If the user has completed tasks today, acknowledge their momentum

Response format:
1. Acknowledge their feelings briefly (1 sentence)
2. Provide brief encouragement (1 sentence)
3. List 2-3 specific actions they can take RIGHT NOW

Example:
"That feeling is intense right now, and it's okay. The urge will pass when you shift focus. Here's what you can do:

• Take a 5-minute walk or do 10 push-ups
• Write in your Journal about what triggered this
• Read an article from Knowledge Feed

Which sounds best?"`;
  };

  const [messages, setMessages] = useState<{
    id: string;
    role: 'user' | 'assistant';
    parts: { type: 'text'; text: string }[];
  }[]>([]);

  const sendMessage = async (text: string) => {
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      parts: [{ type: 'text' as const, text }],
    };
    setMessages(prev => [...prev, userMsg]);
    
    setTimeout(() => {
      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        role: 'assistant' as const,
        parts: [{ type: 'text' as const, text: "I understand you're reaching out. Remember: urges are temporary. Try taking a few deep breaths, go for a short walk, or write in your journal. You're stronger than this moment. What helps you most right now?" }],
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1500);
  };

  useEffect(() => {
    const convertedMessages: Message[] = messages
      .map((m, idx) => {
        let textContent = m.parts
          .filter(p => p.type === 'text')
          .map(p => (p.type === 'text' ? p.text : ''))
          .join(' ')
          .trim();

        if (m.role === 'user') {
          const promptMarkers = [
            'You are a professional recovery support coach',
            'Key guidelines:',
            'Response format:',
            'User context:',
          ];
          
          for (const marker of promptMarkers) {
            if (textContent.includes(marker)) {
              const lines = textContent.split('\n');
              let userMessageStart = -1;
              
              for (let i = lines.length - 1; i >= 0; i--) {
                const line = lines[i].trim();
                if (line && !line.startsWith('•') && !line.includes(marker) && 
                    !line.includes('guidelines') && !line.includes('Example:') &&
                    !line.includes('Which') && line.length < 200) {
                  userMessageStart = i;
                  break;
                }
              }
              
              if (userMessageStart > 0) {
                textContent = lines.slice(userMessageStart).join('\n').trim();
              } else {
                const lastSentences = textContent.split('.').slice(-2).join('.').trim();
                if (lastSentences && lastSentences.length < 200) {
                  textContent = lastSentences;
                }
              }
              break;
            }
          }
        }

        return {
          id: m.id || `msg-${idx}`,
          role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: textContent || 'Processing...',
          timestamp: new Date().toISOString(),
        };
      })
      .filter(m => m.content && m.content !== 'Processing...' && m.content.length > 0);
    
    setLocalMessages(convertedMessages);
    setIsTyping(false);
    
    convertedMessages.forEach(msg => {
      if (!fadeAnims.current[msg.id]) {
        fadeAnims.current[msg.id] = new Animated.Value(0);
        Animated.timing(fadeAnims.current[msg.id], {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    });
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (textToSend) {
      setInput('');
      setIsTyping(true);
      setShowQuickActions(false);
      lastActivityTimeRef.current = Date.now();
      
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const systemPrompt = buildSystemPrompt();
      const messageToSend = messages.length === 0 
        ? `${systemPrompt}\n\n${textToSend}`
        : textToSend;

      await sendMessage(messageToSend);

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    handleSend(action.prompt);
  };

  useEffect(() => {
    if (messages.length === 0) {
      const context = getPersonalizedContext();
      let greeting = `Hi! I'm your recovery support coach. `;
      
      if (context.daysSince > 0) {
        greeting += `You've been Clyr for ${context.daysSince} day${context.daysSince !== 1 ? 's' : ''} - that's real progress. `;
      }
      
      if (context.completedTodos > 0) {
        greeting += `You've already completed ${context.completedTodos} task${context.completedTodos !== 1 ? 's' : ''} today - keep that momentum going! `;
      }
      
      greeting += `\n\nFeeling tempted or struggling? Use the quick actions below or tell me what's on your mind. Remember: urges are temporary, and you have the strength to overcome them.\n\nYou're not alone in this journey.`;
      
      if (!fadeAnims.current['welcome']) {
        fadeAnims.current['welcome'] = new Animated.Value(0);
      }
      
      const welcomeMsg = {
        id: 'welcome',
        role: 'assistant' as const,
        content: greeting,
        timestamp: new Date().toISOString(),
      };
      setLocalMessages([welcomeMsg]);
      
      Animated.timing(fadeAnims.current['welcome'], {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [messages.length, getPersonalizedContext]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'AI Support Chat', headerShown: true }} />
      
      <LinearGradient colors={['#0F2027', '#203A43', '#2C5364']} style={styles.gradient}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={100}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {localMessages.map(message => {
              const fadeAnim = fadeAnims.current[message.id] || new Animated.Value(1);
              return (
                <Animated.View
                  key={message.id}
                  style={[
                    styles.messageCard,
                    message.role === 'user' ? styles.userMessage : styles.assistantMessage,
                    { opacity: fadeAnim },
                  ]}
                >
                  <View style={styles.messageHeader}>
                    {message.role === 'user' ? (
                      <User size={20} color="#4ECDC4" />
                    ) : (
                      <Bot size={20} color="#FFE66D" />
                    )}
                    <Text style={styles.messageRole}>
                      {message.role === 'user' ? 'You' : 'AI Coach'}
                    </Text>
                  </View>
                  <Text style={styles.messageText}>{message.content}</Text>
                </Animated.View>
              );
            })}
            {isTyping && <TypingIndicator />}
            {showQuickActions && localMessages.length > 0 && (
              <View style={styles.quickActionsContainer}>
                <Text style={styles.quickActionsTitle}>Quick Support:</Text>
                <View style={styles.quickActionsGrid}>
                  {QUICK_ACTIONS.map(action => (
                    <TouchableOpacity
                      key={action.id}
                      style={styles.quickActionButton}
                      onPress={() => handleQuickAction(action)}
                    >
                      {action.icon === 'wind' && <Wind size={20} color="#4ECDC4" />}
                      {action.icon === 'gamepad' && <Gamepad2 size={20} color="#4ECDC4" />}
                      {action.icon === 'heart' && <Heart size={20} color="#4ECDC4" />}
                      <Text style={styles.quickActionText}>{action.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ask me anything..."
              placeholderTextColor="#8A8A9D"
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => handleSend()}
              returnKeyType="send"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
              onPress={() => handleSend()}
              disabled={!input.trim()}
            >
              <Send size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },
  messageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  userMessage: {
    backgroundColor: 'rgba(78, 205, 196, 0.15)',
    borderColor: 'rgba(78, 205, 196, 0.3)',
    alignSelf: 'flex-end' as const,
    maxWidth: '85%',
  },
  assistantMessage: {
    backgroundColor: 'rgba(255, 230, 109, 0.1)',
    borderColor: 'rgba(255, 230, 109, 0.2)',
    alignSelf: 'flex-start' as const,
    maxWidth: '85%',
  },
  messageHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 8,
  },
  messageRole: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#B8C6DB',
    textTransform: 'uppercase' as const,
  },
  messageText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  typingContainer: {
    flexDirection: 'row' as const,
    gap: 6,
    alignItems: 'center' as const,
  },
  typingText: {
    fontSize: 20,
    color: '#FFE66D',
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: 'row' as const,
    padding: 20,
    gap: 12,
    backgroundColor: 'rgba(15, 32, 39, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#4ECDC4',
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(78, 205, 196, 0.3)',
    opacity: 0.5,
  },
  quickActionsContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.3)',
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#B8C6DB',
    marginBottom: 12,
    textTransform: 'uppercase' as const,
  },
  quickActionsGrid: {
    flexDirection: 'row' as const,
    gap: 10,
    flexWrap: 'wrap' as const,
  },
  quickActionButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    backgroundColor: 'rgba(78, 205, 196, 0.15)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.4)',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#4ECDC4',
  },
});

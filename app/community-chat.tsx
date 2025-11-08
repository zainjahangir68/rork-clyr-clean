import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, KeyboardAvoidingView, Modal, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageCircle, Send, Heart, MessageSquare, Users, Plus, X, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { threadRepliesData } from '@/constants/threadReplies';

interface ForumThread {
  id: string;
  title: string;
  author: string;
  content: string;
  category: 'motivation' | 'progress' | 'tips' | 'support';
  replies: number;
  likes: number;
  timestamp: string;
}

interface DirectChat {
  id: string;
  userName: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

export default function CommunityChatScreen() {
  const [activeTab, setActiveTab] = useState<'forum' | 'chat'>('forum');
  const [showNewThread, setShowNewThread] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ForumThread['category']>('motivation');
  const [showThreadDetail, setShowThreadDetail] = useState(false);
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);
  const [replyText, setReplyText] = useState('');
  
  const [showChatDetail, setShowChatDetail] = useState(false);
  const [selectedChat, setSelectedChat] = useState<DirectChat | null>(null);
  const [messageText, setMessageText] = useState('');
  const [showAllReplies, setShowAllReplies] = useState(false);

  const [forumThreads, setForumThreads] = useState<ForumThread[]>([
    {
      id: '1',
      title: 'Day 30! I finally made it',
      author: 'hamzakhan3',
      content: 'After many relapses, I finally hit 30 days. The key was staying busy and avoiding triggers. You can do this!',
      category: 'progress',
      replies: 12,
      likes: 45,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '2',
      title: 'Best strategies to overcome urges?',
      author: 'tobywilson321',
      content: 'What works for you when you feel an urge? Looking for practical tips.',
      category: 'tips',
      replies: 28,
      likes: 67,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: '3',
      title: 'Feeling really motivated today',
      author: 'lwayne453',
      content: 'Day 7 and I feel amazing. Energy is up, focus is better. Keep going everyone!',
      category: 'motivation',
      replies: 18,
      likes: 89,
      timestamp: new Date(Date.now() - 10800000).toISOString(),
    },
    {
      id: '4',
      title: 'Anyone else notice better sleep?',
      author: 'sl4ke765',
      content: 'I\'m on day 15 and my sleep quality has improved so much. No more late night scrolling. Waking up feeling refreshed for the first time in years.',
      category: 'progress',
      replies: 34,
      likes: 102,
      timestamp: new Date(Date.now() - 14400000).toISOString(),
    },
    {
      id: '5',
      title: 'Relapsed but learned something important',
      author: 'marcus_r92',
      content: 'Broke my 22 day streak yesterday but I realized my trigger was boredom. Now I know what to watch out for. Don\'t give up if you relapse, just learn from it.',
      category: 'support',
      replies: 41,
      likes: 78,
      timestamp: new Date(Date.now() - 18000000).toISOString(),
    },
    {
      id: '6',
      title: 'Gym routine changed my life',
      author: 'jayden_h07',
      content: 'Started lifting weights 5 days a week and it\'s been the best decision. Helps with discipline, confidence, and keeps my mind occupied. Plus the gains are real 💪',
      category: 'tips',
      replies: 52,
      likes: 143,
      timestamp: new Date(Date.now() - 21600000).toISOString(),
    },
    {
      id: '7',
      title: 'How do you deal with social media triggers?',
      author: 'alex_m456',
      content: 'Instagram and TikTok keep showing me triggering content even though I\'m not searching for it. Thinking about deleting them. What have you guys done?',
      category: 'tips',
      replies: 37,
      likes: 91,
      timestamp: new Date(Date.now() - 25200000).toISOString(),
    },
    {
      id: '8',
      title: '100 DAYS CLEAN! Life update',
      author: 'dev_chronicles',
      content: 'Hit triple digits today. Lost 15lbs, got promoted at work, started dating someone amazing. This journey literally transformed my entire life. If you\'re reading this and struggling - it gets better. Much better.',
      category: 'motivation',
      replies: 67,
      likes: 234,
      timestamp: new Date(Date.now() - 28800000).toISOString(),
    },
  ]);

  const [directChats, setDirectChats] = useState<DirectChat[]>([
    {
      id: '1',
      userName: 'AccountabilityBuddy42',
      lastMessage: 'How are you holding up today?',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      unread: 2,
    },
    {
      id: '2',
      userName: 'RecoveryCaptain',
      lastMessage: 'Thanks for the support yesterday!',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      unread: 0,
    },
  ]);

  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'AccountabilityBuddy42',
      content: 'Hey! How are you doing today?',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isOwn: false,
    },
    {
      id: '2',
      sender: 'You',
      content: 'Doing great! Day 5 and feeling strong.',
      timestamp: new Date(Date.now() - 3000000).toISOString(),
      isOwn: true,
    },
    {
      id: '3',
      sender: 'AccountabilityBuddy42',
      content: 'That\'s awesome! Keep it up!',
      timestamp: new Date(Date.now() - 2400000).toISOString(),
      isOwn: false,
    },
  ]);

  const handleCreateThread = () => {
    if (!newThreadTitle.trim() || !newThreadContent.trim()) {
      Alert.alert('Missing Info', 'Please enter both title and content.');
      return;
    }

    const newThread: ForumThread = {
      id: Date.now().toString(),
      title: newThreadTitle,
      author: 'You',
      content: newThreadContent,
      category: selectedCategory,
      replies: 0,
      likes: 0,
      timestamp: new Date().toISOString(),
    };

    setForumThreads([newThread, ...forumThreads]);
    setNewThreadTitle('');
    setNewThreadContent('');
    setShowNewThread(false);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    
    setReplyText('');
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert('Reply Posted', 'Your reply has been posted!');
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'You',
      content: messageText,
      timestamp: new Date().toISOString(),
      isOwn: true,
    };

    setChatMessages([...chatMessages, newMessage]);
    setMessageText('');
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleThreadPress = (thread: ForumThread) => {
    setSelectedThread(thread);
    setShowThreadDetail(true);
  };

  const handleChatPress = (chat: DirectChat) => {
    setSelectedChat(chat);
    setShowChatDetail(true);
  };

  const getCategoryColor = (category: ForumThread['category']) => {
    switch (category) {
      case 'motivation': return '#FFE66D';
      case 'progress': return '#4ECDC4';
      case 'tips': return '#FF9A76';
      case 'support': return '#A78BFA';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Community', headerShown: true }} />

      <LinearGradient colors={['#0F2027', '#203A43', '#2C5364']} style={styles.gradient}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'forum' && styles.tabActive]}
            onPress={() => {
              setActiveTab('forum');
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
          >
            <MessageSquare size={20} color={activeTab === 'forum' ? '#4ECDC4' : '#8A8A9D'} />
            <Text style={[styles.tabText, activeTab === 'forum' && styles.tabTextActive]}>
              Forum
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'chat' && styles.tabActive]}
            onPress={() => {
              setActiveTab('chat');
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
          >
            <MessageCircle size={20} color={activeTab === 'chat' ? '#4ECDC4' : '#8A8A9D'} />
            <Text style={[styles.tabText, activeTab === 'chat' && styles.tabTextActive]}>
              Direct Chat
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'forum' ? (
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Forum Threads</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowNewThread(true)}
              >
                <Plus size={20} color="#FFF" />
                <Text style={styles.addButtonText}>New Thread</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              {forumThreads.map(thread => (
                <TouchableOpacity
                  key={thread.id}
                  style={styles.threadCard}
                  onPress={() => handleThreadPress(thread)}
                >
                  <View style={styles.threadHeader}>
                    <View style={[styles.categoryBadge, { backgroundColor: `${getCategoryColor(thread.category)}20`, borderColor: getCategoryColor(thread.category) }]}>
                      <Text style={[styles.categoryText, { color: getCategoryColor(thread.category) }]}>
                        {thread.category}
                      </Text>
                    </View>
                    <Text style={styles.threadTime}>{formatTimestamp(thread.timestamp)}</Text>
                  </View>

                  <Text style={styles.threadTitle}>{thread.title}</Text>
                  <Text style={styles.threadAuthor}>by {thread.author}</Text>
                  <Text style={styles.threadContent} numberOfLines={2}>{thread.content}</Text>

                  <View style={styles.threadFooter}>
                    <View style={styles.threadStat}>
                      <Heart size={16} color="#FF6B6B" />
                      <Text style={styles.threadStatText}>{thread.likes}</Text>
                    </View>
                    <View style={styles.threadStat}>
                      <MessageSquare size={16} color="#4ECDC4" />
                      <Text style={styles.threadStatText}>{thread.replies} replies</Text>
                    </View>
                    <ChevronRight size={18} color="#8A8A9D" style={{ marginLeft: 'auto' as const }} />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Direct Messages</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => Alert.alert('Coming Soon', 'Start a new conversation by matching with an accountability partner.')}
              >
                <Users size={20} color="#FFF" />
                <Text style={styles.addButtonText}>Find Partner</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              {directChats.map(chat => (
                <TouchableOpacity
                  key={chat.id}
                  style={styles.chatCard}
                  onPress={() => handleChatPress(chat)}
                >
                  <View style={styles.chatAvatar}>
                    <Users size={24} color="#4ECDC4" />
                  </View>
                  <View style={styles.chatContent}>
                    <Text style={styles.chatUserName}>{chat.userName}</Text>
                    <Text style={styles.chatLastMessage} numberOfLines={1}>{chat.lastMessage}</Text>
                  </View>
                  <View style={styles.chatMeta}>
                    <Text style={styles.chatTime}>{formatTimestamp(chat.timestamp)}</Text>
                    {chat.unread > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{chat.unread}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </LinearGradient>

      <Modal
        visible={showNewThread}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNewThread(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Thread</Text>
              <TouchableOpacity onPress={() => setShowNewThread(false)}>
                <X size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Category</Text>
            <View style={styles.categorySelector}>
              {(['motivation', 'progress', 'tips', 'support'] as ForumThread['category'][]).map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryOption,
                    selectedCategory === cat && { backgroundColor: `${getCategoryColor(cat)}30`, borderColor: getCategoryColor(cat) }
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[styles.categoryOptionText, selectedCategory === cat && { color: getCategoryColor(cat) }]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Thread title..."
              placeholderTextColor="#8A8A9D"
              value={newThreadTitle}
              onChangeText={setNewThreadTitle}
            />

            <Text style={styles.label}>Content</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Share your thoughts..."
              placeholderTextColor="#8A8A9D"
              value={newThreadContent}
              onChangeText={setNewThreadContent}
              multiline
              numberOfLines={6}
            />

            <TouchableOpacity style={styles.createButton} onPress={handleCreateThread}>
              <Text style={styles.createButtonText}>Create Thread</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showThreadDetail}
        animationType="slide"
        onRequestClose={() => setShowThreadDetail(false)}
      >
        <View style={styles.detailContainer}>
          <LinearGradient colors={['#0F2027', '#203A43', '#2C5364']} style={styles.gradient}>
            <View style={styles.detailHeader}>
              <TouchableOpacity onPress={() => setShowThreadDetail(false)}>
                <X size={28} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.detailHeaderTitle}>Thread</Text>
              <View style={{ width: 28 }} />
            </View>

            {selectedThread && (
              <ScrollView style={styles.detailScroll} contentContainerStyle={styles.detailScrollContent}>
                <View style={styles.detailThreadCard}>
                  <View style={[styles.categoryBadge, { backgroundColor: `${getCategoryColor(selectedThread.category)}20`, borderColor: getCategoryColor(selectedThread.category) }]}>
                    <Text style={[styles.categoryText, { color: getCategoryColor(selectedThread.category) }]}>
                      {selectedThread.category}
                    </Text>
                  </View>
                  <Text style={styles.detailThreadTitle}>{selectedThread.title}</Text>
                  <Text style={styles.threadAuthor}>by {selectedThread.author} • {formatTimestamp(selectedThread.timestamp)}</Text>
                  <Text style={styles.detailThreadContent}>{selectedThread.content}</Text>

                  <View style={styles.detailThreadFooter}>
                    <TouchableOpacity style={styles.detailActionButton}>
                      <Heart size={20} color="#FF6B6B" />
                      <Text style={styles.detailActionText}>{selectedThread.likes} Likes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.detailActionButton}>
                      <MessageSquare size={20} color="#4ECDC4" />
                      <Text style={styles.detailActionText}>{selectedThread.replies} Replies</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.repliesHeader}>
                  <Text style={styles.repliesTitle}>Replies ({selectedThread.replies})</Text>
                  {threadRepliesData[selectedThread.id] && threadRepliesData[selectedThread.id].length > 5 && (
                    <TouchableOpacity
                      style={styles.viewAllButton}
                      onPress={() => {
                        setShowAllReplies(!showAllReplies);
                        if (Platform.OS !== 'web') {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                      }}
                    >
                      <Text style={styles.viewAllButtonText}>
                        {showAllReplies ? 'Show Less' : `View All ${threadRepliesData[selectedThread.id].length}`}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                {threadRepliesData[selectedThread.id]?.slice(0, showAllReplies ? undefined : 5).map(reply => (
                  <View key={reply.id} style={styles.replyCard}>
                    <Text style={styles.replyAuthor}>{reply.author} • {reply.timestamp}</Text>
                    <Text style={styles.replyContent}>
                      {reply.content}
                    </Text>
                  </View>
                ))}
                {!threadRepliesData[selectedThread.id] && (
                  <View style={styles.replyCard}>
                    <Text style={styles.replyContent}>No replies yet. Be the first to comment!</Text>
                  </View>
                )}
              </ScrollView>
            )}

            <View style={styles.replyInputContainer}>
              <TextInput
                style={styles.replyInput}
                placeholder="Write a reply..."
                placeholderTextColor="#8A8A9D"
                value={replyText}
                onChangeText={setReplyText}
                multiline
              />
              <TouchableOpacity
                style={[styles.sendButton, !replyText.trim() && styles.sendButtonDisabled]}
                onPress={handleSendReply}
                disabled={!replyText.trim()}
              >
                <Send size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>

      <Modal
        visible={showChatDetail}
        animationType="slide"
        onRequestClose={() => setShowChatDetail(false)}
      >
        <View style={styles.detailContainer}>
          <LinearGradient colors={['#0F2027', '#203A43', '#2C5364']} style={styles.gradient}>
            <View style={styles.detailHeader}>
              <TouchableOpacity onPress={() => setShowChatDetail(false)}>
                <X size={28} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.detailHeaderTitle}>{selectedChat?.userName || 'Chat'}</Text>
              <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.chatDetailScroll} contentContainerStyle={styles.chatDetailScrollContent}>
              {chatMessages.map(msg => (
                <View
                  key={msg.id}
                  style={[styles.messageCard, msg.isOwn ? styles.messageCardOwn : styles.messageCardOther]}
                >
                  <Text style={styles.messageSender}>{msg.sender}</Text>
                  <Text style={styles.messageContent}>{msg.content}</Text>
                  <Text style={styles.messageTime}>{formatTimestamp(msg.timestamp)}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.replyInputContainer}>
              <TextInput
                style={styles.replyInput}
                placeholder="Type a message..."
                placeholderTextColor="#8A8A9D"
                value={messageText}
                onChangeText={setMessageText}
              />
              <TouchableOpacity
                style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
                onPress={handleSendMessage}
                disabled={!messageText.trim()}
              >
                <Send size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>
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
  tabContainer: {
    flexDirection: 'row' as const,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 8,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabActive: {
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#8A8A9D',
  },
  tabTextActive: {
    color: '#4ECDC4',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  addButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    backgroundColor: '#4ECDC4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  threadCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  threadHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  categoryBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
  },
  threadTime: {
    fontSize: 12,
    color: '#8A8A9D',
  },
  threadTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFF',
    marginBottom: 6,
  },
  threadAuthor: {
    fontSize: 13,
    color: '#8A8A9D',
    marginBottom: 10,
  },
  threadContent: {
    fontSize: 15,
    color: '#B8C6DB',
    lineHeight: 22,
    marginBottom: 12,
  },
  threadFooter: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  threadStat: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  threadStatText: {
    fontSize: 14,
    color: '#B8C6DB',
  },
  chatCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  chatAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
  },
  chatContent: {
    flex: 1,
  },
  chatUserName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFF',
    marginBottom: 4,
  },
  chatLastMessage: {
    fontSize: 14,
    color: '#B8C6DB',
  },
  chatMeta: {
    alignItems: 'flex-end' as const,
  },
  chatTime: {
    fontSize: 12,
    color: '#8A8A9D',
    marginBottom: 6,
  },
  unreadBadge: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center' as const,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end' as const,
  },
  modalContent: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#B8C6DB',
    marginBottom: 8,
    textTransform: 'uppercase' as const,
  },
  categorySelector: {
    flexDirection: 'row' as const,
    gap: 8,
    marginBottom: 20,
  },
  categoryOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center' as const,
  },
  categoryOptionText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#8A8A9D',
    textTransform: 'uppercase' as const,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 20,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top' as const,
  },
  createButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center' as const,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  detailContainer: {
    flex: 1,
    backgroundColor: '#0F2027',
  },
  detailHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailHeaderTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  detailScroll: {
    flex: 1,
  },
  detailScrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  detailThreadCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  detailThreadTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#FFF',
    marginTop: 12,
    marginBottom: 8,
  },
  detailThreadContent: {
    fontSize: 16,
    color: '#B8C6DB',
    lineHeight: 24,
    marginTop: 12,
  },
  detailThreadFooter: {
    flexDirection: 'row' as const,
    gap: 16,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailActionButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  detailActionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  repliesHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  repliesTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  viewAllButton: {
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  viewAllButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#4ECDC4',
  },
  replyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  replyAuthor: {
    fontSize: 13,
    color: '#8A8A9D',
    marginBottom: 8,
  },
  replyContent: {
    fontSize: 15,
    color: '#B8C6DB',
    lineHeight: 22,
  },
  replyInputContainer: {
    flexDirection: 'row' as const,
    padding: 16,
    gap: 12,
    backgroundColor: 'rgba(15, 32, 39, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  replyInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFF',
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
  chatDetailScroll: {
    flex: 1,
  },
  chatDetailScrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  messageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    maxWidth: '80%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  messageCardOwn: {
    alignSelf: 'flex-end' as const,
    backgroundColor: 'rgba(78, 205, 196, 0.15)',
    borderColor: 'rgba(78, 205, 196, 0.3)',
  },
  messageCardOther: {
    alignSelf: 'flex-start' as const,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#8A8A9D',
    marginBottom: 6,
    textTransform: 'uppercase' as const,
  },
  messageContent: {
    fontSize: 16,
    color: '#FFF',
    lineHeight: 22,
    marginBottom: 6,
  },
  messageTime: {
    fontSize: 11,
    color: '#8A8A9D',
    alignSelf: 'flex-end' as const,
  },
});

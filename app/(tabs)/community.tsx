import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image, Linking, TextInput } from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Headphones, BookOpen, FileText, ExternalLink, ShoppingCart, Search } from 'lucide-react-native';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { podcastsData } from '@/constants/podcasts';
import { booksData } from '@/constants/books';
import { knowledgeFeedData } from '@/constants/knowledgeFeed';

export default function LearnScreen() {
  const [activeTab, setActiveTab] = useState<'podcasts' | 'books' | 'articles'>('podcasts');
  const [searchQuery, setSearchQuery] = useState('');

  const handleTabChange = (tab: 'podcasts' | 'books' | 'articles') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveTab(tab);
  };

  const handleOpenLink = (url: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Linking.openURL(url);
  };

  const filteredPodcasts = podcastsData.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.host.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBooks = booksData.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredArticles = knowledgeFeedData.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.author?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Learn',
          headerStyle: { backgroundColor: '#1A1A2E' },
          headerTintColor: '#FFFFFF',
          headerShadowVisible: false,
        }} 
      />
      
      <LinearGradient
        colors={['#1A1A2E', '#16213E', '#0F3460']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Educational Library</Text>
          <Text style={styles.subtitle}>Podcasts, books, and articles to support your recovery</Text>
          
          <View style={styles.searchContainer}>
            <Search size={20} color="#8A8A9D" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor="#8A8A9D"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'podcasts' && styles.tabActive]}
              onPress={() => handleTabChange('podcasts')}
            >
              <Headphones size={20} color={activeTab === 'podcasts' ? '#4ECDC4' : '#8A8A9D'} />
              <Text style={[styles.tabText, activeTab === 'podcasts' && styles.tabTextActive]}>Podcasts</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'books' && styles.tabActive]}
              onPress={() => handleTabChange('books')}
            >
              <BookOpen size={20} color={activeTab === 'books' ? '#4ECDC4' : '#8A8A9D'} />
              <Text style={[styles.tabText, activeTab === 'books' && styles.tabTextActive]}>Books</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'articles' && styles.tabActive]}
              onPress={() => handleTabChange('articles')}
            >
              <FileText size={20} color={activeTab === 'articles' ? '#4ECDC4' : '#8A8A9D'} />
              <Text style={[styles.tabText, activeTab === 'articles' && styles.tabTextActive]}>Articles</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'podcasts' && (
            <View style={styles.contentContainer}>
              {filteredPodcasts.map((podcast) => (
                <TouchableOpacity
                  key={podcast.id}
                  style={styles.card}
                  onPress={() => podcast.episodeUrl && handleOpenLink(podcast.episodeUrl)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: podcast.imageUrl }} style={styles.podcastImage} />
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{podcast.title}</Text>
                    <Text style={styles.cardAuthor}>By {podcast.host}</Text>
                    <Text style={styles.cardDescription} numberOfLines={3}>{podcast.description}</Text>
                    {podcast.episodeUrl && (
                      <View style={styles.linkButton}>
                        <ExternalLink size={16} color="#4ECDC4" />
                        <Text style={styles.linkText}>Listen Now</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {activeTab === 'books' && (
            <View style={styles.contentContainer}>
              {filteredBooks.map((book) => (
                <View key={book.id} style={styles.card}>
                  <Image source={{ uri: book.coverUrl }} style={styles.bookCover} />
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{book.title}</Text>
                    <Text style={styles.cardAuthor}>By {book.author}</Text>
                    <Text style={styles.cardDescription} numberOfLines={3}>{book.description}</Text>
                    <TouchableOpacity
                      style={styles.purchaseButton}
                      onPress={() => handleOpenLink(book.purchaseUrl)}
                    >
                      <ShoppingCart size={16} color="#FFFFFF" />
                      <Text style={styles.purchaseText}>View on Amazon</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'articles' && (
            <View style={styles.contentContainer}>
              {filteredArticles.map((article) => (
                <TouchableOpacity
                  key={article.id}
                  style={styles.card}
                  onPress={() => article.readMoreUrl && handleOpenLink(article.readMoreUrl)}
                  activeOpacity={0.8}
                >
                  {article.imageUrl && (
                    <Image source={{ uri: article.imageUrl }} style={styles.articleImage} />
                  )}
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{article.title}</Text>
                    {article.author && (
                      <Text style={styles.cardAuthor}>By {article.author}</Text>
                    )}
                    <Text style={styles.cardDescription} numberOfLines={4}>{article.summary}</Text>
                    {article.readMoreUrl && (
                      <View style={styles.linkButton}>
                        <ExternalLink size={16} color="#4ECDC4" />
                        <Text style={styles.linkText}>Read More</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
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
    padding: 20,
    paddingBottom: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#B8C6DB',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row' as const,
    gap: 8,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 6,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabActive: {
    backgroundColor: 'rgba(78, 205, 196, 0.15)',
    borderColor: 'rgba(78, 205, 196, 0.3)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#8A8A9D',
  },
  tabTextActive: {
    color: '#4ECDC4',
  },
  statsRow: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  statBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statText: {
    color: '#B8C6DB',
    fontSize: 13,
    fontWeight: '600' as const,
  },
  feedContainer: {
    gap: 20,
  },
  articleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden' as const,
  },
  articleImage: {
    width: '100%',
    height: 180,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  articleContent: {
    padding: 16,
  },
  categoryRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 12,
  },
  categoryTag: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
  },
  aiTag: {
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.4)',
  },
  aiTagText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#A78BFA',
    textTransform: 'uppercase' as const,
  },
  articleTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 26,
  },
  authorText: {
    fontSize: 13,
    color: '#8A8A9D',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 15,
    color: '#B8C6DB',
    lineHeight: 22,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: '#B8C6DB',
    fontWeight: '500' as const,
  },
  actionTextActive: {
    color: '#4ECDC4',
  },
  readMoreButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    marginLeft: 'auto' as const,
    backgroundColor: 'rgba(78, 205, 196, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  readMoreText: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '600' as const,
  },
  footerNote: {
    marginTop: 32,
    padding: 16,
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.2)',
  },
  footerText: {
    fontSize: 14,
    color: '#B8C6DB',
    textAlign: 'center' as const,
  },
  contentContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden' as const,
  },
  podcastImage: {
    width: '100%',
    height: 180,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  bookCover: {
    width: '100%',
    height: 240,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 6,
    lineHeight: 24,
  },
  cardAuthor: {
    fontSize: 13,
    color: '#8A8A9D',
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 14,
    color: '#B8C6DB',
    lineHeight: 20,
    marginBottom: 12,
  },
  linkButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    alignSelf: 'flex-start' as const,
  },
  linkText: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '600' as const,
  },
  purchaseButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    backgroundColor: '#4ECDC4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  purchaseText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});

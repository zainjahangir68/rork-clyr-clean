import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform, Image, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, Bookmark, Heart, ExternalLink, ArrowLeft, Filter, Sparkles, FileText, X } from 'lucide-react-native';
import { useRecovery } from '@/contexts/RecoveryContext';
import { knowledgeFeedData, KnowledgeFeedItem } from '@/constants/knowledgeFeed';
import * as Haptics from 'expo-haptics';
import { useState, useMemo } from 'react';



type CategoryFilter = 'all' | 'mindset' | 'science' | 'motivation' | 'success-stories' | 'practical';

export default function KnowledgeFeedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { savedFeedItems, likedFeedItems, toggleSaveFeedItem, toggleLikeFeedItem } = useRecovery();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeFeedItem | null>(null);

  const filteredData = useMemo(() => {
    if (selectedCategory === 'all') {
      return knowledgeFeedData;
    }
    return knowledgeFeedData.filter(item => item.category === selectedCategory);
  }, [selectedCategory]);

  const handleLike = (itemId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleLikeFeedItem(itemId);
  };

  const handleBookmark = (itemId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    toggleSaveFeedItem(itemId);
  };

  const handleReadMore = (item: KnowledgeFeedItem) => {
    if (item.fullContent) {
      setSelectedArticle(item);
    } else if (item.readMoreUrl) {
      Linking.openURL(item.readMoreUrl);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'research': return '#4ECDC4';
      case 'book': return '#FFE66D';
      case 'blog': return '#FF6B6B';
      case 'article': return '#95E1D3';
      case 'embedded': return '#9D84B7';
      case 'ai-summary': return '#FF9A76';
      default: return '#B8C6DB';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'mindset': return '#FFE66D';
      case 'science': return '#4ECDC4';
      case 'motivation': return '#FF9A76';
      case 'success-stories': return '#95E1D3';
      case 'practical': return '#9D84B7';
      default: return '#B8C6DB';
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getTypeLabel = (type: string) => {
    if (type === 'ai-summary') return 'AI Summary';
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const categories: CategoryFilter[] = ['all', 'mindset', 'science', 'motivation', 'success-stories', 'practical'];

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: false,
        }} 
      />
      
      <LinearGradient
        colors={['#0F2027', '#203A43', '#2C5364']}
        style={styles.gradient}
      >
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Knowledge Feed</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.intro}>
            <BookOpen size={48} color="#4ECDC4" />
            <Text style={styles.introTitle}>Daily Magazine</Text>
            <Text style={styles.introText}>
              Educational content about recovery, mindset, and healthy habits
            </Text>
          </View>

          <View style={styles.filterSection}>
            <View style={styles.filterHeader}>
              <Filter size={18} color="#B8C6DB" />
              <Text style={styles.filterTitle}>Categories</Text>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterChip,
                    selectedCategory === category && styles.filterChipActive,
                    selectedCategory === category && { 
                      borderColor: getCategoryColor(category),
                      backgroundColor: `${getCategoryColor(category)}20` 
                    }
                  ]}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setSelectedCategory(category);
                  }}
                >
                  <Text style={[
                    styles.filterChipText,
                    selectedCategory === category && styles.filterChipTextActive,
                    selectedCategory === category && { color: getCategoryColor(category) }
                  ]}>
                    {getCategoryLabel(category)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.feedContainer}>
            {filteredData.map((item) => {
              const isLiked = likedFeedItems.includes(item.id);
              const isSaved = savedFeedItems.includes(item.id);
              const typeColor = getTypeColor(item.type);
              const categoryColor = getCategoryColor(item.category);

              return (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.feedCard}
                  activeOpacity={0.9}
                  onPress={() => {
                    if (item.fullContent) {
                      handleReadMore(item);
                    }
                  }}
                >
                  {item.imageUrl && (
                    <View style={styles.cardImageContainer}>
                      <Image 
                        source={{ uri: item.imageUrl }} 
                        style={styles.cardImage}
                        resizeMode="cover"
                      />
                      <LinearGradient
                        colors={['transparent', 'rgba(15, 32, 39, 0.8)', 'rgba(15, 32, 39, 0.95)']}
                        style={styles.imageGradient}
                      />
                      {item.isAISummary && (
                        <View style={styles.aiIndicator}>
                          <Sparkles size={14} color="#FF9A76" />
                          <Text style={styles.aiIndicatorText}>AI</Text>
                        </View>
                      )}
                    </View>
                  )}
                  
                  <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                      <View style={styles.badgeContainer}>
                        <View style={[styles.typeBadge, { backgroundColor: `${typeColor}25`, borderColor: `${typeColor}50` }]}>
                          <Text style={[styles.typeText, { color: typeColor }]}>
                            {getTypeLabel(item.type)}
                          </Text>
                        </View>
                        <View style={[styles.categoryBadge, { backgroundColor: `${categoryColor}20` }]}>
                          <Text style={[styles.categoryText, { color: categoryColor }]}>
                            {getCategoryLabel(item.category)}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.cardActions}>
                        <TouchableOpacity 
                          onPress={() => handleLike(item.id)}
                          style={styles.actionButton}
                        >
                          <Heart 
                            size={20} 
                            color={isLiked ? '#FF6B6B' : '#8A8A9D'}
                            fill={isLiked ? '#FF6B6B' : 'none'}
                          />
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          onPress={() => handleBookmark(item.id)}
                          style={styles.actionButton}
                        >
                          <Bookmark 
                            size={20} 
                            color={isSaved ? '#FFE66D' : '#8A8A9D'}
                            fill={isSaved ? '#FFE66D' : 'none'}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <Text style={styles.cardTitle}>{item.title}</Text>
                    
                    {item.author && (
                      <Text style={styles.cardAuthor}>by {item.author}</Text>
                    )}
                    
                    {item.source && (
                      <Text style={styles.cardSource}>{item.source}</Text>
                    )}

                    <Text style={styles.cardSummary} numberOfLines={4}>{item.summary}</Text>

                    {item.tags && item.tags.length > 0 && (
                      <View style={styles.tagsContainer}>
                        {item.tags.slice(0, 3).map((tag, idx) => (
                          <View key={idx} style={styles.tag}>
                            <Text style={styles.tagText}>#{tag}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    <TouchableOpacity 
                      style={[styles.readMoreButton, { 
                        backgroundColor: `${typeColor}15`,
                        borderColor: `${typeColor}30` 
                      }]}
                      onPress={() => handleReadMore(item)}
                    >
                      <Text style={[styles.readMoreText, { color: typeColor }]}>
                        {item.fullContent ? 'Read Full Article' : 'Open Source'}
                      </Text>
                      {item.fullContent ? (
                        <FileText size={16} color={typeColor} />
                      ) : (
                        <ExternalLink size={16} color={typeColor} />
                      )}
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.footer}>
            <BookOpen size={32} color="#FFE66D" />
            <Text style={styles.footerTitle}>Keep Learning</Text>
            <Text style={styles.footerText}>
              New content added daily. All sources are properly credited and linked.
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>

      <Modal
        visible={selectedArticle !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedArticle(null)}
      >
        {selectedArticle && (
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#0F2027', '#203A43', '#2C5364']}
              style={styles.modalGradient}
            >
              <View style={[styles.modalHeader, { paddingTop: insets.top + 20 }]}>
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={() => setSelectedArticle(null)}
                >
                  <X size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.modalHeaderTitle} numberOfLines={1}>Article</Text>
                <View style={styles.modalHeaderSpacer} />
              </View>

              <ScrollView 
                style={styles.modalScrollView}
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {selectedArticle.imageUrl && (
                  <Image 
                    source={{ uri: selectedArticle.imageUrl }} 
                    style={styles.modalImage}
                    resizeMode="cover"
                  />
                )}

                <View style={styles.modalContent}>
                  <View style={styles.modalBadges}>
                    <View style={[styles.typeBadge, { 
                      backgroundColor: `${getTypeColor(selectedArticle.type)}25`,
                      borderColor: `${getTypeColor(selectedArticle.type)}50` 
                    }]}>
                      <Text style={[styles.typeText, { color: getTypeColor(selectedArticle.type) }]}>
                        {getTypeLabel(selectedArticle.type)}
                      </Text>
                    </View>
                    <View style={[styles.categoryBadge, { 
                      backgroundColor: `${getCategoryColor(selectedArticle.category)}20` 
                    }]}>
                      <Text style={[styles.categoryText, { color: getCategoryColor(selectedArticle.category) }]}>
                        {getCategoryLabel(selectedArticle.category)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.modalTitle}>{selectedArticle.title}</Text>
                  
                  {selectedArticle.author && (
                    <Text style={styles.modalAuthor}>by {selectedArticle.author}</Text>
                  )}
                  
                  {selectedArticle.source && (
                    <Text style={styles.modalSource}>{selectedArticle.source}</Text>
                  )}

                  <View style={styles.modalDivider} />

                  <Text style={styles.modalSummary}>{selectedArticle.summary}</Text>

                  {selectedArticle.fullContent && (
                    <>
                      <View style={styles.modalDivider} />
                      <Text style={styles.modalFullContent}>{selectedArticle.fullContent}</Text>
                    </>
                  )}

                  {selectedArticle.readMoreUrl && (
                    <TouchableOpacity 
                      style={styles.modalReadMoreButton}
                      onPress={() => {
                        if (selectedArticle.readMoreUrl) {
                          Linking.openURL(selectedArticle.readMoreUrl);
                        }
                      }}
                    >
                      <Text style={styles.modalReadMoreText}>Read Full Source Article</Text>
                      <ExternalLink size={18} color="#4ECDC4" />
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            </LinearGradient>
          </View>
        )}
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
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  intro: {
    alignItems: 'center' as const,
    marginBottom: 30,
  },
  introTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  introText: {
    fontSize: 15,
    color: '#B8C6DB',
    textAlign: 'center' as const,
    lineHeight: 22,
    maxWidth: 300,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#B8C6DB',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  filterScroll: {
    gap: 8,
    paddingHorizontal: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  filterChipActive: {
    borderWidth: 2,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#8A8A9D',
  },
  filterChipTextActive: {
    fontWeight: '700' as const,
  },
  feedContainer: {
    gap: 20,
  },
  feedCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardImageContainer: {
    width: '100%',
    height: 200,
    position: 'relative' as const,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  aiIndicator: {
    position: 'absolute' as const,
    top: 12,
    right: 12,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    backgroundColor: 'rgba(255, 154, 118, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  aiIndicatorText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 16,
  },
  badgeContainer: {
    flexDirection: 'row' as const,
    gap: 8,
    flexWrap: 'wrap' as const,
    flex: 1,
    marginRight: 12,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  cardActions: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 10,
    lineHeight: 30,
  },
  cardAuthor: {
    fontSize: 14,
    color: '#4ECDC4',
    marginBottom: 4,
    fontStyle: 'italic' as const,
    fontWeight: '500' as const,
  },
  cardSource: {
    fontSize: 13,
    color: '#8A8A9D',
    marginBottom: 12,
  },
  cardSummary: {
    fontSize: 15,
    color: '#B8C6DB',
    lineHeight: 23,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#95E1D3',
    fontWeight: '500' as const,
  },
  readMoreButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  footer: {
    marginTop: 40,
    padding: 32,
    backgroundColor: 'rgba(255, 230, 109, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 230, 109, 0.3)',
    alignItems: 'center' as const,
  },
  footerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFE66D',
    marginTop: 12,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#FFE66D',
    textAlign: 'center' as const,
    lineHeight: 22,
    opacity: 0.9,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0F2027',
  },
  modalGradient: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center' as const,
  },
  modalHeaderSpacer: {
    width: 40,
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    paddingBottom: 40,
  },
  modalImage: {
    width: '100%',
    height: 300,
  },
  modalContent: {
    padding: 24,
  },
  modalBadges: {
    flexDirection: 'row' as const,
    gap: 8,
    flexWrap: 'wrap' as const,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 36,
  },
  modalAuthor: {
    fontSize: 16,
    color: '#4ECDC4',
    marginBottom: 6,
    fontStyle: 'italic' as const,
    fontWeight: '500' as const,
  },
  modalSource: {
    fontSize: 14,
    color: '#8A8A9D',
    marginBottom: 8,
  },
  modalDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 24,
  },
  modalSummary: {
    fontSize: 17,
    color: '#B8C6DB',
    lineHeight: 27,
    fontWeight: '400' as const,
  },
  modalFullContent: {
    fontSize: 16,
    color: '#B8C6DB',
    lineHeight: 26,
  },
  modalReadMoreButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 10,
    backgroundColor: 'rgba(78, 205, 196, 0.15)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.3)',
    marginTop: 24,
  },
  modalReadMoreText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#4ECDC4',
  },
});

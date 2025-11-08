export interface Podcast {
  id: string;
  title: string;
  host: string;
  description: string;
  imageUrl: string;
  episodeUrl?: string;
  category: 'mindset' | 'science' | 'motivation' | 'recovery';
}

export const podcastsData: Podcast[] = [
  {
    id: 'huberman-dopamine',
    title: 'Controlling Your Dopamine For Motivation, Focus & Satisfaction',
    host: 'Andrew Huberman',
    description: 'Dr. Andrew Huberman explains the science of dopamine and how to leverage it for sustained motivation and focus. Essential listening for understanding addiction and recovery.',
    imageUrl: 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=400&h=400&fit=crop',
    episodeUrl: 'https://www.youtube.com/watch?v=QmOF0crdyRU',
    category: 'science',
  },
  {
    id: 'porn-brain',
    title: 'Your Brain On Porn',
    host: 'Gary Wilson',
    description: 'Understanding the neuroscience of porn addiction and the rewiring process during recovery.',
    imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop',
    episodeUrl: 'https://www.youtube.com/watch?v=wSF82AwSDiU',
    category: 'science',
  },
  {
    id: 'psychology-addiction',
    title: 'The Psychology of Addiction',
    host: 'Dr. Gabor Maté',
    description: 'Deep dive into the roots of addiction, trauma, and the path to healing and recovery.',
    imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=400&fit=crop',
    episodeUrl: 'https://www.youtube.com/watch?v=BVg2bfqblGI',
    category: 'science',
  },
  {
    id: 'jocko-discipline',
    title: 'Discipline Equals Freedom',
    host: 'Jocko Willink',
    description: 'Former Navy SEAL Jocko Willink shares powerful insights on building discipline, overcoming weakness, and taking ownership of your life.',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
    episodeUrl: 'https://www.youtube.com/watch?v=N7Tm2q3n8H8',
    category: 'motivation',
  },
  {
    id: 'goggins-mindset',
    title: 'David Goggins: How to Build Immense Inner Strength',
    host: 'David Goggins',
    description: 'David Goggins discusses mental toughness, breaking through limitations, and building unbreakable willpower.',
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop',
    episodeUrl: 'https://www.youtube.com/watch?v=BvWB7B8tXK8',
    category: 'motivation',
  },
  {
    id: 'addiction-science',
    title: 'The Science of Addiction and Recovery',
    host: 'Dr. Anna Lembke',
    description: 'Stanford psychiatrist Dr. Anna Lembke explains the neuroscience of addiction, dopamine, and the path to recovery.',
    imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop',
    episodeUrl: 'https://www.youtube.com/watch?v=p3JLaF_4Tz8',
    category: 'science',
  },
];

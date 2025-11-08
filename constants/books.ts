export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  purchaseUrl: string;
  category: 'recovery' | 'neuroscience' | 'habits' | 'psychology';
}

export const booksData: Book[] = [
  {
    id: 'easypeasy-method',
    title: 'EasyPeasy Method (FREE)',
    author: 'Community Edited',
    description: 'A completely free, comprehensive guide adapted from Allen Carr\'s method. Thousands have used this to quit porn addiction. Available as a free PDF and online book.',
    coverUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300&h=450&fit=crop',
    purchaseUrl: 'https://easypeasymethod.org/',
    category: 'recovery',
  },
  {
    id: 'rational-recovery',
    title: 'Rational Recovery (FREE)',
    author: 'Jack Trimpey',
    description: 'The crash course on addiction recovery. A secular approach to beating addiction using AVRT (Addictive Voice Recognition Technique). Free online access.',
    coverUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300&h=450&fit=crop',
    purchaseUrl: 'https://rational.org/index.php?id=1',
    category: 'recovery',
  },
  {
    id: 'breaking-the-cycle',
    title: 'Breaking the Cycle (FREE PDF)',
    author: 'George Collins',
    description: 'Free workbook for sexual addiction recovery. Practical exercises and strategies for understanding triggers and building healthy patterns.',
    coverUrl: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=300&h=450&fit=crop',
    purchaseUrl: 'https://archive.org/details/breakingthecycle0000coll',
    category: 'recovery',
  },
  {
    id: 'think-and-grow-rich',
    title: 'Think and Grow Rich (FREE)',
    author: 'Napoleon Hill',
    description: 'Classic self-improvement book about harnessing desire and building mental discipline. Public domain - free to read online.',
    coverUrl: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=450&fit=crop',
    purchaseUrl: 'https://www.gutenberg.org/ebooks/73597',
    category: 'psychology',
  },
  {
    id: 'as-a-man-thinketh',
    title: 'As a Man Thinketh (FREE)',
    author: 'James Allen',
    description: 'Short, powerful book on the power of thoughts and self-mastery. A timeless classic on personal transformation available free online.',
    coverUrl: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=300&h=450&fit=crop',
    purchaseUrl: 'https://www.gutenberg.org/ebooks/4507',
    category: 'psychology',
  },
  {
    id: 'your-brain-on-porn',
    title: 'Your Brain on Porn',
    author: 'Gary Wilson',
    description: 'The definitive book on internet pornography addiction and recovery. Explains the neuroscience behind addiction and provides a roadmap for rewiring your brain.',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=450&fit=crop',
    purchaseUrl: 'https://www.amazon.com/Your-Brain-Porn-Pornography-Addiction/dp/0993775586',
    category: 'neuroscience',
  },
  {
    id: 'atomic-habits',
    title: 'Atomic Habits',
    author: 'James Clear',
    description: 'The proven framework for building good habits and breaking bad ones. Essential for anyone serious about lasting change.',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=450&fit=crop',
    purchaseUrl: 'https://www.amazon.com/Atomic-Habits-Proven-Build-Break/dp/0735211299',
    category: 'habits',
  },
  {
    id: 'dopamine-nation',
    title: 'Dopamine Nation',
    author: 'Dr. Anna Lembke',
    description: 'Finding balance in the age of indulgence. A psychiatrist explores how our endless pursuit of pleasure is making us miserable.',
    coverUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300&h=450&fit=crop',
    purchaseUrl: 'https://www.amazon.com/Dopamine-Nation-Finding-Balance-Indulgence/dp/152474672X',
    category: 'neuroscience',
  },
  {
    id: 'cant-hurt-me',
    title: "Can't Hurt Me",
    author: 'David Goggins',
    description: 'Master your mind and defy the odds. An ex-Navy SEAL shares his incredible journey and strategies for building mental toughness.',
    coverUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=450&fit=crop',
    purchaseUrl: 'https://www.amazon.com/Cant-Hurt-Me-Master-Your/dp/1544512287',
    category: 'psychology',
  },
  {
    id: 'the-porn-trap',
    title: 'The Porn Trap',
    author: 'Wendy Maltz & Larry Maltz',
    description: 'The essential guide to overcoming problems caused by pornography. Compassionate, research-based approach to recovery.',
    coverUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=300&h=450&fit=crop',
    purchaseUrl: 'https://www.amazon.com/Porn-Trap-Essential-Overcoming-Pornography/dp/0061231878',
    category: 'recovery',
  },
  {
    id: 'power-of-habit',
    title: 'The Power of Habit',
    author: 'Charles Duhigg',
    description: 'Why we do what we do in life and business. Understand the science of habits and how to transform them.',
    coverUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop',
    purchaseUrl: 'https://www.amazon.com/Power-Habit-What-Life-Business/dp/081298160X',
    category: 'habits',
  },
  {
    id: 'man-search-for-meaning',
    title: "Man's Search for Meaning",
    author: 'Viktor E. Frankl',
    description: 'A Holocaust survivor shares profound insights on finding purpose and meaning in suffering. Life-changing perspective.',
    coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=450&fit=crop',
    purchaseUrl: 'https://www.amazon.com/Mans-Search-Meaning-Viktor-Frankl/dp/080701429X',
    category: 'psychology',
  },
  {
    id: 'integrity-restored',
    title: 'Integrity Restored',
    author: 'Peter Kleponis',
    description: 'Helping men overcome porn addiction through faith-based recovery principles and practical strategies.',
    coverUrl: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=300&h=450&fit=crop',
    purchaseUrl: 'https://www.amazon.com/Integrity-Restored-Helping-Overcome-Pornography/dp/1612788386',
    category: 'recovery',
  },
];

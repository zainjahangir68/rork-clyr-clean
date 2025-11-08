export interface Quiz {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface MicroLesson {
  id: string;
  title: string;
  description: string;
  content: string;
  duration: string;
  category: 'triggers' | 'habits' | 'neuroscience' | 'psychology' | 'techniques';
  quiz: Quiz;
  pointsReward: number;
}

export const microLessonsData: MicroLesson[] = [
  {
    id: 'ml1',
    title: '3 Ways to Avoid Relapse in First 7 Days',
    description: 'Critical strategies for surviving the hardest week',
    duration: '5 min',
    category: 'techniques',
    content: `The first week is the most challenging because your brain is still heavily wired for the old behavior. Here are three essential strategies:

**1. Eliminate Easy Access**
Remove all bookmarks, apps, and easy paths to content. Install website blockers. Make accessing content require multiple difficult steps. Every barrier gives your rational brain time to intervene.

**2. Never Be Alone and Bored**
This combination is deadly in early recovery. When alone, stay in public spaces (coffee shops, libraries). When bored, have a prepared list of engaging activities. The urge + opportunity combo must be broken.

**3. The 15-Minute Rule**
When an urge hits, commit to waiting just 15 minutes before acting. During those 15 minutes, change your environment: go outside, call someone, do pushups. Most urges peak and subside within this window.

Remember: the first 7 days are not representative of your entire journey. They're the hardest part. Each day after gets progressively easier.`,
    quiz: {
      question: 'What makes the first 7 days particularly challenging?',
      options: [
        'Lack of motivation',
        'Brain is still heavily wired for old behavior',
        'Too much free time',
        'Peer pressure',
      ],
      correctAnswer: 1,
      explanation: 'The brain is still strongly wired for the old behavior patterns. Neural pathways take time to weaken and new ones take time to strengthen.',
    },
    pointsReward: 20,
  },
  {
    id: 'ml2',
    title: 'How Dopamine Affects Motivation',
    description: 'Understanding your brain\'s reward system',
    duration: '7 min',
    category: 'neuroscience',
    content: `Dopamine is often called the "pleasure chemical," but that's a misunderstanding. It's actually the "motivation and wanting" chemical.

**The Dopamine Loop:**
1. Anticipation of reward → Dopamine spike → Motivation to act
2. Getting reward → Brief satisfaction → Dopamine drops
3. Seeking next reward → Cycle repeats

**Porn and Dopamine:**
Porn provides unlimited novelty and escalation, creating massive dopamine spikes. Over time, your brain:
- Reduces dopamine receptors (desensitization)
- Requires more intense stimuli for same effect
- Finds normal pleasures less satisfying

**The Recovery Process:**
When you stop, dopamine receptors begin to heal. Initially, nothing feels rewarding (flatline period). But gradually:
- Receptors increase in number
- Normal activities become pleasurable again
- Natural motivation returns

This is why early recovery feels difficult - your brain is recalibrating to find pleasure in normal life again.`,
    quiz: {
      question: 'What is dopamine primarily responsible for?',
      options: [
        'Only pleasure and happiness',
        'Motivation and reward anticipation',
        'Memory formation',
        'Physical coordination',
      ],
      correctAnswer: 1,
      explanation: 'Dopamine is primarily about motivation and wanting, not just pleasure. It drives us to seek rewards.',
    },
    pointsReward: 25,
  },
  {
    id: 'ml3',
    title: 'Identifying Your Personal Triggers',
    description: 'Map your unique vulnerability patterns',
    duration: '6 min',
    category: 'triggers',
    content: `Triggers are specific cues that activate cravings. Everyone has unique triggers, but they fall into categories:

**Emotional Triggers:**
- Stress and anxiety
- Loneliness and isolation
- Boredom and restlessness
- Depression and sadness
- Even positive emotions (celebration, excitement)

**Environmental Triggers:**
- Specific locations (bedroom, bathroom)
- Times of day (late night, early morning)
- Devices (phone in bed, laptop alone)
- Situations (hotel rooms, home alone)

**Physical Triggers:**
- Fatigue and low energy
- Physical arousal
- Hunger (low blood sugar affects willpower)
- Pain or discomfort

**The Trigger-Urge-Action Chain:**
Trigger → Urge → Action (old pattern)

**Breaking the Chain:**
Trigger → Urge → NEW Response (healthy coping)

Create your personal trigger map: Keep a journal for one week noting when urges occur and what preceded them. Patterns will emerge. Then, prepare specific counter-actions for each trigger.

Example: "When I feel stressed (trigger) and get an urge, I will immediately do 20 pushups and call a friend (new response)."`,
    quiz: {
      question: 'What should you do when you identify a trigger?',
      options: [
        'Try to avoid all situations',
        'Prepare specific counter-actions for each trigger',
        'Ignore it and hope it goes away',
        'Only work on emotional triggers',
      ],
      correctAnswer: 1,
      explanation: 'The most effective approach is to prepare specific, actionable counter-responses for each identified trigger.',
    },
    pointsReward: 20,
  },
  {
    id: 'ml4',
    title: 'The Science of Habit Formation',
    description: 'How to build lasting change',
    duration: '8 min',
    category: 'habits',
    content: `Habits are the brain's way of saving energy. Once a behavior becomes habitual, it requires minimal willpower.

**The Habit Loop:**
1. **Cue:** Trigger that initiates the behavior
2. **Routine:** The behavior itself
3. **Reward:** The benefit you get from the behavior

**Why Porn Became a Habit:**
Cue (stress/boredom) → Routine (porn) → Reward (temporary relief/pleasure)

This loop repeated hundreds of times, creating a neural superhighway in your brain.

**Creating New Habits:**
You can't just delete old habits - you must replace them:

Cue (stress/boredom) → NEW Routine (exercise/meditation) → Reward (feeling better)

**The 66-Day Rule:**
Research shows it takes an average of 66 days for a new behavior to become automatic. This is why the 90-day reboot works - you're literally rewiring your brain.

**Keys to Successful Habit Change:**
1. **Make it obvious:** Clear cues for new habits
2. **Make it attractive:** Pair with immediate rewards
3. **Make it easy:** Start incredibly small
4. **Make it satisfying:** Track and celebrate progress

Remember: You're not fighting willpower forever. You're building new neural pathways that will eventually become automatic.`,
    quiz: {
      question: 'How long does it take on average for a new behavior to become automatic?',
      options: [
        '21 days',
        '30 days',
        '66 days',
        '90 days',
      ],
      correctAnswer: 2,
      explanation: 'Research by Dr. Phillippa Lally found that it takes an average of 66 days for a new behavior to become automatic.',
    },
    pointsReward: 25,
  },
  {
    id: 'ml5',
    title: 'Understanding the Flatline Phase',
    description: 'Why you might feel worse before feeling better',
    duration: '6 min',
    category: 'psychology',
    content: `The "flatline" is a temporary phase many experience during recovery. Understanding it helps you not panic when it happens.

**What is Flatline?**
A period of low energy, reduced libido, brain fog, and emotional numbness. It typically occurs days to weeks into recovery.

**Why Does it Happen?**
Your brain is recalibrating. For months or years, it received artificially high dopamine from porn. Now it's learning to:
- Regulate dopamine normally
- Find pleasure in everyday activities
- Restore natural arousal patterns

During this adjustment, your brain temporarily "undershoots" - producing less dopamine than normal.

**Common Flatline Symptoms:**
- Low motivation and energy
- Reduced or absent libido
- Difficulty concentrating
- Feeling emotionally numb
- Lack of enjoyment in activities

**Important Truths:**
1. **Flatline is temporary** - usually lasts 2-6 weeks
2. **It's a sign of healing** - your brain is rewiring
3. **It doesn't mean something's wrong** - it's expected
4. **It will end** - and you'll feel better than before

**How to Handle Flatline:**
- Don't test if things are "working" (no checking)
- Maintain your routine even when unmotivated
- Exercise, even when you don't feel like it
- Remember: This phase proves your brain is healing

Many report feeling better than ever once they emerge from flatline. Your brain needed this reset.`,
    quiz: {
      question: 'What does the flatline phase indicate?',
      options: [
        'Something is wrong with recovery',
        'You should give up',
        'Your brain is healing and recalibrating',
        'You need medication',
      ],
      correctAnswer: 2,
      explanation: 'Flatline is a normal and expected sign that your brain is healing and recalibrating its dopamine systems.',
    },
    pointsReward: 20,
  },
  {
    id: 'ml6',
    title: 'Mindfulness for Urge Management',
    description: 'Observe urges without acting on them',
    duration: '7 min',
    category: 'techniques',
    content: `Mindfulness is the practice of observing your experience without judgment. It's incredibly powerful for managing urges.

**The Traditional Approach (Doesn't Work):**
Urge arrives → Fight it → Suppress it → It grows stronger → Eventually give in

**The Mindfulness Approach:**
Urge arrives → Observe it → Allow it to be there → It peaks → It naturally subsides

**How to Practice Urge Surfing:**

1. **Notice the urge:** "I'm having an urge right now."

2. **Get curious:** Where do you feel it in your body? Stomach? Chest? What does it feel like? Tension? Heat? Pressure?

3. **Breathe:** Take slow, deep breaths. Don't try to make the urge go away - just breathe with it.

4. **Watch it change:** Urges are like waves. They build, peak, then naturally subside. This usually takes 15-30 minutes.

5. **Don't engage with thoughts:** Your mind will offer justifications ("just once," "I deserve this"). Notice these thoughts like clouds passing by. Don't debate them.

**The Science:**
When you observe an urge without acting on it, you prove to your brain that:
- Urges are temporary
- You can tolerate discomfort
- Acting isn't necessary

Each time you successfully surf an urge, you weaken that neural pathway.

**Practice Exercise:**
Next time you have an urge, set a timer for 15 minutes. Use that time to observe the sensations in your body. Notice how it changes. This alone can reduce the urge significantly.`,
    quiz: {
      question: 'How long does an urge typically take to peak and subside naturally?',
      options: [
        '5-10 minutes',
        '15-30 minutes',
        '1-2 hours',
        'Several hours',
      ],
      correctAnswer: 1,
      explanation: 'Urges typically peak and naturally subside within 15-30 minutes when you don\'t act on them or fight them.',
    },
    pointsReward: 25,
  },
];

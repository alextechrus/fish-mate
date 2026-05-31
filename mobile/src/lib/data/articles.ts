// src/lib/data/articles.ts
export interface NewsItem {
  id: string;
  title: string;
  source: string;
  date: string;
  imageUrl: string;
  category: string;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  category: 'Care Tips' | 'Tank Builds' | 'Species Spotlight' | 'Equipment';
  readMinutes: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export const newsItems: NewsItem[] = [
  {
    id: 'n-1',
    title: 'New Study Shows Planted Tanks Reduce Fish Stress by 40%',
    source: 'Aquarium Science Weekly',
    date: 'May 28, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=600&q=80',
    category: 'Research',
  },
  {
    id: 'n-2',
    title: 'Top 10 Beginner Fish for 2026',
    source: 'FishKeeping World',
    date: 'May 25, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=600&q=80',
    category: 'Guides',
  },
  {
    id: 'n-3',
    title: 'The Rise of Nano Reefs: How Small Tanks Are Changing the Hobby',
    source: 'Reef2Reef',
    date: 'May 22, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1596884812882-e41edf2cbd9b?w=600&q=80',
    category: 'Trends',
  },
  {
    id: 'n-4',
    title: 'Aquascape Contest Winners Announced — Stunning Results',
    source: 'ADA News',
    date: 'May 19, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80',
    category: 'Events',
  },
  {
    id: 'n-5',
    title: 'Water Quality Testing: What Every Fishkeeper Needs to Know',
    source: 'Practical Fishkeeping',
    date: 'May 15, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=600&q=80',
    category: 'Care',
  },
  {
    id: 'n-6',
    title: 'Breeding Discus: A Comprehensive Beginner\'s Guide',
    source: 'Discus World',
    date: 'May 12, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1523395243481-163f8f6155ab?w=600&q=80',
    category: 'Breeding',
  },
];

export const articles: Article[] = [
  {
    id: 'a-1',
    title: 'How to Cycle Your Tank the Right Way',
    summary: 'The nitrogen cycle is the foundation of a healthy aquarium. Learn how to establish beneficial bacteria safely.',
    category: 'Care Tips',
    readMinutes: 5,
  },
  {
    id: 'a-2',
    title: 'Building Your First 50-Gallon Community Tank',
    summary: 'A step-by-step walkthrough from choosing a stand to stocking your first fish.',
    category: 'Tank Builds',
    readMinutes: 8,
  },
  {
    id: 'a-3',
    title: 'Betta Fish: Myths vs Reality',
    summary: 'Bettas are more complex than most people think. Discover their true care requirements.',
    category: 'Species Spotlight',
    readMinutes: 4,
  },
  {
    id: 'a-4',
    title: 'Canister vs Hang-on-Back Filters: Which Is Right for You?',
    summary: 'An honest comparison of the two most popular filtration methods for home aquariums.',
    category: 'Equipment',
    readMinutes: 6,
  },
  {
    id: 'a-5',
    title: 'CO2 Injection for Planted Tanks: Getting Started',
    summary: 'Pressurised CO2 transforms a good planted tank into a great one. Here\'s what you need.',
    category: 'Equipment',
    readMinutes: 7,
  },
];

export const faqs: FAQ[] = [
  {
    id: 'f-1',
    question: 'How long does it take to cycle a new tank?',
    answer: 'A fishless cycle typically takes 4–6 weeks. You\'re waiting for beneficial bacteria (Nitrosomonas and Nitrobacter) to establish on your filter media. Add ammonia, test daily, and the cycle is complete when you see 0 ammonia, 0 nitrite, and rising nitrate.',
  },
  {
    id: 'f-2',
    question: 'How often should I do water changes?',
    answer: 'A 25–30% water change every week is the standard recommendation for most community tanks. Heavily stocked tanks may need more frequent changes. Always treat tap water with a dechlorinator like Seachem Prime before adding it to your tank.',
  },
  {
    id: 'f-3',
    question: 'Why are my fish at the surface gasping?',
    answer: 'Surface gasping usually indicates low dissolved oxygen. Common causes include: poor surface agitation, overcrowding, high temperatures (warm water holds less O2), or ammonia/nitrite poisoning. Check your water parameters immediately and increase surface movement.',
  },
  {
    id: 'f-4',
    question: 'Can I keep a betta with other fish?',
    answer: 'Bettas can coexist with the right tankmates. Avoid fin-nippers (tiger barbs), other bettas, and fish with bright flowing fins. Good companions include corydoras, snails, and small peaceful tetras. Always have a backup plan if your betta is aggressive.',
  },
  {
    id: 'f-5',
    question: 'What is "new tank syndrome"?',
    answer: 'New tank syndrome is a spike in ammonia and nitrite that occurs in an uncycled aquarium. Fish waste produces ammonia, which is toxic. Without established bacteria to convert it, fish can die within days. The solution is cycling the tank before adding fish.',
  },
  {
    id: 'f-6',
    question: 'How do I know if my fish are compatible?',
    answer: 'Consider: water type (freshwater vs saltwater), temperature range, pH, temperament, tank zone (top/middle/bottom swimmers), and size. Aggressive fish will bully peaceful ones. Use FishMate\'s compatibility checker to get instant results for any two species.',
  },
];

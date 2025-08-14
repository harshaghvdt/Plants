// Content moderation for agriculture and environment related posts
export interface ContentValidationResult {
  isValid: boolean;
  reason?: string;
  suggestions?: string[];
  category?: 'agriculture' | 'environment' | 'unrelated';
  confidence: number;
}

// Keywords and phrases related to agriculture
const AGRICULTURE_KEYWORDS = [
  // Plants and Crops
  'plant', 'crop', 'seed', 'sapling', 'seedling', 'germination', 'harvest', 'yield',
  'fertilizer', 'pesticide', 'irrigation', 'watering', 'soil', 'compost', 'mulch',
  'garden', 'farm', 'greenhouse', 'hydroponics', 'aquaponics', 'vertical farming',
  
  // Plant Care
  'watering', 'pruning', 'repotting', 'transplanting', 'propagation', 'cutting',
  'grafting', 'pollination', 'photosynthesis', 'nutrients', 'sunlight', 'shade',
  'temperature', 'humidity', 'ventilation', 'disease', 'pest', 'weed',
  
  // Plant Types
  'tree', 'shrub', 'herb', 'vegetable', 'fruit', 'flower', 'succulent', 'cactus',
  'indoor plant', 'outdoor plant', 'tropical', 'temperate', 'annual', 'perennial',
  'biennial', 'evergreen', 'deciduous',
  
  // Agriculture Practices
  'organic farming', 'sustainable agriculture', 'permaculture', 'biodynamic farming',
  'crop rotation', 'companion planting', 'cover cropping', 'no-till farming',
  'precision agriculture', 'smart farming', 'urban farming', 'community garden',
  
  // Plant Health
  'plant health', 'growth', 'development', 'blooming', 'fruiting', 'wilting',
  'yellowing', 'browning', 'root rot', 'leaf spot', 'powdery mildew', 'aphids',
  'spider mites', 'fungus', 'bacteria', 'virus',
  
  // Gardening Tools
  'trowel', 'pruner', 'watering can', 'hose', 'rake', 'hoe', 'shovel', 'wheelbarrow',
  'garden bed', 'planter', 'pot', 'trellis', 'stake', 'netting', 'row cover'
];

// Keywords and phrases related to environment
const ENVIRONMENT_KEYWORDS = [
  // Climate and Weather
  'climate', 'weather', 'temperature', 'rainfall', 'drought', 'flood', 'storm',
  'global warming', 'climate change', 'carbon footprint', 'greenhouse gases',
  'emissions', 'renewable energy', 'solar', 'wind', 'hydroelectric',
  
  // Ecosystems and Biodiversity
  'ecosystem', 'biodiversity', 'wildlife', 'habitat', 'conservation', 'preservation',
  'endangered species', 'native species', 'invasive species', 'pollination',
  'bees', 'butterflies', 'birds', 'insects', 'microorganisms',
  
  // Natural Resources
  'water', 'air', 'soil', 'forest', 'ocean', 'river', 'lake', 'mountain',
  'desert', 'grassland', 'wetland', 'marsh', 'swamp', 'coral reef',
  
  // Environmental Issues
  'pollution', 'deforestation', 'desertification', 'soil erosion', 'water pollution',
  'air pollution', 'plastic waste', 'recycling', 'waste management', 'landfill',
  'ocean acidification', 'ocean warming', 'melting ice', 'sea level rise',
  
  // Sustainability
  'sustainable', 'eco-friendly', 'green', 'organic', 'natural', 'renewable',
  'biodegradable', 'compostable', 'zero waste', 'circular economy',
  'reduce', 'reuse', 'recycle', 'upcycle', 'repurpose',
  
  // Environmental Actions
  'plant trees', 'clean up', 'restore', 'protect', 'conserve', 'educate',
  'awareness', 'activism', 'petition', 'volunteer', 'donate', 'support'
];

// Keywords that indicate unrelated content
const UNRELATED_KEYWORDS = [
  // Politics and Controversy
  'politics', 'political', 'election', 'vote', 'democrat', 'republican',
  'liberal', 'conservative', 'left', 'right', 'protest', 'rally',
  
  // Entertainment and Celebrity
  'celebrity', 'actor', 'actress', 'singer', 'movie', 'film', 'tv show',
  'television', 'music', 'concert', 'award', 'red carpet', 'gossip',
  
  // Sports (non-nature related)
  'football', 'basketball', 'baseball', 'soccer', 'tennis', 'golf',
  'olympics', 'championship', 'tournament', 'team', 'player', 'coach',
  
  // Technology (non-environment related)
  'smartphone', 'computer', 'laptop', 'gaming', 'video game', 'app',
  'software', 'programming', 'coding', 'artificial intelligence', 'AI',
  
  // Business and Finance
  'stock market', 'investment', 'trading', 'cryptocurrency', 'bitcoin',
  'business', 'company', 'corporation', 'profit', 'revenue', 'marketing',
  
  // Personal Life (unrelated)
  'dating', 'relationship', 'marriage', 'divorce', 'family drama',
  'personal problems', 'complaints', 'rants', 'gossip'
];

// Content validation function
export function validateContent(content: string): ContentValidationResult {
  const lowerContent = content.toLowerCase();
  const words = lowerContent.split(/\s+/);
  
  // Count agriculture and environment related words
  let agricultureScore = 0;
  let environmentScore = 0;
  let unrelatedScore = 0;
  
  // Check for agriculture keywords
  AGRICULTURE_KEYWORDS.forEach(keyword => {
    if (lowerContent.includes(keyword.toLowerCase())) {
      agricultureScore += 1;
    }
  });
  
  // Check for environment keywords
  ENVIRONMENT_KEYWORDS.forEach(keyword => {
    if (lowerContent.includes(keyword.toLowerCase())) {
      environmentScore += 1;
    }
  });
  
  // Check for unrelated keywords
  UNRELATED_KEYWORDS.forEach(keyword => {
    if (lowerContent.includes(keyword.toLowerCase())) {
      unrelatedScore += 1;
    }
  });
  
  // Calculate total score and confidence
  const totalRelevant = agricultureScore + environmentScore;
  const totalScore = totalRelevant + unrelatedScore;
  const confidence = totalScore > 0 ? totalRelevant / totalScore : 0;
  
  // Determine category and validity
  let category: 'agriculture' | 'environment' | 'unrelated';
  let isValid = false;
  let reason: string | undefined;
  let suggestions: string[] | undefined;
  
  if (agricultureScore > environmentScore && agricultureScore > 0) {
    category = 'agriculture';
    isValid = true;
  } else if (environmentScore > agricultureScore && environmentScore > 0) {
    category = 'environment';
    isValid = true;
  } else if (totalRelevant === 0) {
    category = 'unrelated';
    isValid = false;
    reason = 'Content does not appear to be related to agriculture or environment.';
    suggestions = [
      'Share about your plants, garden, or farming experiences',
      'Discuss environmental topics, climate, or sustainability',
      'Post about wildlife, ecosystems, or natural resources',
      'Share gardening tips, plant care, or agricultural practices'
    ];
  } else if (unrelatedScore > totalRelevant) {
    category = 'unrelated';
    isValid = false;
    reason = 'Content contains too many unrelated topics.';
    suggestions = [
      'Focus on agriculture or environment related content',
      'Remove unrelated topics and keywords',
      'Keep posts focused on plants, nature, or sustainability'
    ];
  } else {
    category = 'unrelated';
    isValid = false;
    reason = 'Content needs more agriculture or environment focus.';
    suggestions = [
      'Add more plant, garden, or nature related content',
      'Include specific agricultural or environmental details',
      'Focus on sustainability, conservation, or plant care'
    ];
  }
  
  // Additional validation rules
  if (content.length < 10) {
    isValid = false;
    reason = 'Content is too short. Please provide more details about your agriculture or environment topic.';
    suggestions = [
      'Describe your plant or garden in detail',
      'Explain the environmental issue you want to discuss',
      'Share specific agricultural practices or tips'
    ];
  }
  
  // Check for excessive unrelated content
  if (unrelatedScore > 3 && unrelatedScore > totalRelevant) {
    isValid = false;
    reason = 'Content contains too many unrelated topics that overshadow the agriculture/environment content.';
    suggestions = [
      'Focus primarily on plants, gardening, or environmental topics',
      'Remove or minimize unrelated content',
      'Ensure agriculture/environment is the main focus'
    ];
  }
  
  return {
    isValid,
    reason,
    suggestions,
    category,
    confidence: Math.round(confidence * 100)
  };
}

// Content suggestions for agriculture
export function getAgricultureSuggestions(): string[] {
  return [
    "Just planted my first tomato seedlings! Any tips for healthy growth? 🌱",
    "My monstera is getting brown spots. Could it be overwatering or a pest issue? 🍃",
    "Started composting kitchen waste for my garden. The soil quality has improved so much! ♻️",
    "Built a raised garden bed this weekend. Ready to grow organic vegetables! 🥬",
    "My indoor herb garden is thriving! Fresh basil, mint, and rosemary year-round 🌿",
    "Learning about companion planting. Tomatoes with basil and marigolds - nature's pest control! 🍅",
    "The bees are loving my wildflower garden! Supporting pollinators one flower at a time 🐝",
    "Harvested my first batch of microgreens. So much nutrition in such small plants! 🌱",
    "My succulent collection is growing! These drought-resistant plants are perfect for beginners 🌵",
    "Started a community garden project. Growing food and building community together 👥"
  ];
}

// Content suggestions for environment
export function getEnvironmentSuggestions(): string[] {
  return [
    "Planted 10 native trees in my neighborhood today! Every tree helps fight climate change 🌳",
    "Switched to reusable shopping bags and water bottles. Small changes, big impact! ♻️",
    "The local river cleanup was a success! Removed 50+ bags of plastic waste 🚮",
    "Started a backyard composting system. Reducing waste and creating rich soil 🌱",
    "My solar panels are generating more energy than expected! Renewable energy is the future ☀️",
    "Joined a local environmental group. Together we can make a difference! 🤝",
    "The wildlife in my garden has increased since I stopped using pesticides 🦋",
    "Learning about sustainable living. Every eco-friendly choice matters 🌍",
    "My rain garden is helping prevent local flooding while supporting native plants 🌧️",
    "Teaching my kids about environmental conservation. They're the future stewards of our planet 👶"
  ];
}

// Content filtering for posts
export function filterPostContent(content: string): ContentValidationResult {
  const validation = validateContent(content);
  
  // Additional post-specific rules
  if (validation.isValid) {
    // Check for excessive hashtags or mentions
    const hashtagCount = (content.match(/#/g) || []).length;
    const mentionCount = (content.match(/@/g) || []).length;
    
    if (hashtagCount > 5) {
      validation.isValid = false;
      validation.reason = 'Too many hashtags. Please limit to 5 or fewer.';
      validation.suggestions = ['Focus on meaningful content rather than hashtags', 'Use 3-5 relevant hashtags'];
    }
    
    if (mentionCount > 3) {
      validation.isValid = false;
      validation.reason = 'Too many mentions. Please limit to 3 or fewer.';
      validation.suggestions = ['Focus on your content rather than tagging many users', 'Use mentions sparingly and meaningfully'];
    }
  }
  
  return validation;
}

// Get content category for display
export function getContentCategoryDisplay(category: string): string {
  switch (category) {
    case 'agriculture':
      return '🌱 Agriculture & Gardening';
    case 'environment':
      return '🌍 Environment & Sustainability';
    case 'unrelated':
      return '❌ Unrelated Content';
    default:
      return '📝 General';
  }
}

// Content quality score (0-100)
export function getContentQualityScore(content: string): number {
  const validation = validateContent(content);
  let score = validation.confidence;
  
  // Bonus points for good content
  if (content.length > 100) score += 10;
  if (content.length > 200) score += 5;
  if (content.includes('🌱') || content.includes('🌍') || content.includes('♻️')) score += 5;
  
  // Penalty for poor content
  if (content.length < 20) score -= 20;
  if (validation.category === 'unrelated') score -= 30;
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

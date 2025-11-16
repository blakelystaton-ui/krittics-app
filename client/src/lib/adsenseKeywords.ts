// Utility to generate dynamic AdSense keywords based on user interests

const GENRE_KEYWORDS_MAP: Record<string, string[]> = {
  "Action": ["action movies", "adventure films", "thriller", "superhero", "blockbuster"],
  "Comedy": ["comedy films", "funny movies", "humor", "stand-up", "sitcom"],
  "Drama": ["drama movies", "emotional films", "award-winning", "character-driven"],
  "Horror": ["horror movies", "scary films", "thriller", "suspense", "supernatural"],
  "Sci-Fi": ["science fiction", "sci-fi movies", "futuristic", "space adventure", "technology"],
  "Romance": ["romantic movies", "love stories", "date night", "relationship films"],
  "Documentary": ["documentary films", "real stories", "educational", "non-fiction"],
  "Animation": ["animated movies", "family films", "cartoons", "anime"],
  "Thriller": ["thriller movies", "suspense films", "mystery", "psychological"],
  "Family": ["family movies", "kids films", "wholesome entertainment", "all-ages"],
};

export function generateAdKeywords(userInterests: string[] | null): string {
  if (!userInterests || userInterests.length === 0) {
    return "movies, streaming, entertainment, video on demand, films";
  }

  const keywords = new Set<string>();
  
  // Add generic base keywords
  keywords.add("movies");
  keywords.add("streaming");
  keywords.add("entertainment");
  
  // Add interest-specific keywords
  userInterests.forEach(interest => {
    const genreKeywords = GENRE_KEYWORDS_MAP[interest];
    if (genreKeywords) {
      genreKeywords.forEach(keyword => keywords.add(keyword));
    }
  });

  // Convert to comma-separated string (limit to first 15 keywords for meta tag)
  return Array.from(keywords).slice(0, 15).join(", ");
}

export function injectAdKeywordsMeta(keywords: string) {
  // Update or create meta keywords tag
  let metaKeywords = document.querySelector('meta[name="keywords"]');
  if (!metaKeywords) {
    metaKeywords = document.createElement('meta');
    metaKeywords.setAttribute('name', 'keywords');
    document.head.appendChild(metaKeywords);
  }
  metaKeywords.setAttribute('content', keywords);
}

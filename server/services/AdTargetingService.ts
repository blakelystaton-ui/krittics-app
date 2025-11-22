/**
 * AdTargetingService.ts
 * 
 * Interest-based ad targeting system
 * Matches user interests with ad keywords to serve personalized ads
 */

export interface AdTargetingConfig {
  defaultAdTag?: string;
  interestAdTags?: Record<string, string>;
}

export class AdTargetingService {
  private config: AdTargetingConfig;

  // Interest-to-ad-keyword mapping
  // Maps user hobby interests to Google Ad Manager targeting keywords
  private static readonly INTEREST_AD_KEYWORDS: Record<string, string[]> = {
    "Sports": ["sports", "fitness", "athletic", "soccer", "basketball", "football"],
    "Cars": ["automotive", "vehicles", "cars", "racing", "auto"],
    "Outdoors": ["outdoor", "camping", "hiking", "nature", "adventure"],
    "Gaming": ["gaming", "video-games", "esports", "console", "pc-gaming"],
    "Music": ["music", "concert", "audio", "headphones", "streaming"],
    "Travel": ["travel", "vacation", "hotels", "flights", "tourism"],
    "Cooking": ["cooking", "recipes", "kitchen", "food", "culinary"],
    "Fitness": ["fitness", "workout", "gym", "health", "exercise"],
    "Fashion": ["fashion", "clothing", "style", "apparel", "beauty"],
    "Tech": ["technology", "gadgets", "electronics", "innovation", "software"],
    "Photography": ["photography", "camera", "photo", "imaging", "lens"],
    "Art": ["art", "creative", "design", "artistic", "gallery"],
    "Books": ["books", "reading", "literature", "publishing", "authors"],
    "Foodie": ["food", "dining", "restaurant", "cuisine", "gourmet"],
    "Animals": ["pets", "animals", "wildlife", "veterinary", "pet-care"],
  };

  constructor(config: AdTargetingConfig = {}) {
    this.config = {
      defaultAdTag: config.defaultAdTag || process.env.VITE_AD_TAG_URL || 
        "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpremidpostpod&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&impl=s&cmsid=496&vid=short_onecue&correlator=",
      interestAdTags: config.interestAdTags || {},
    };
  }

  /**
   * Get targeted ad tag URL based on user's interests
   * 
   * Strategy:
   * 1. If user has interests, try to match with ad inventory
   * 2. If multiple matches, rotate randomly
   * 3. If no match, fall back to default ad tag
   * 
   * @param userInterests - Array of user's hobby interests
   * @param movieAdTag - Optional per-movie ad tag override
   * @returns Ad tag URL to use for this user/movie
   */
  getTargetedAdTag(userInterests?: string[], movieAdTag?: string): string {
    // Priority 1: Movie-specific ad tag
    if (movieAdTag) {
      return movieAdTag;
    }

    // Priority 2: Interest-based targeting
    if (userInterests && userInterests.length > 0) {
      const matchingAdTags: string[] = [];

      for (const interest of userInterests) {
        const adTag = this.config.interestAdTags?.[interest];
        if (adTag) {
          matchingAdTags.push(adTag);
        }
      }

      // If we found matching ad tags, rotate randomly
      if (matchingAdTags.length > 0) {
        const randomIndex = Math.floor(Math.random() * matchingAdTags.length);
        return matchingAdTags[randomIndex];
      }
    }

    // Priority 3: Default ad tag (with interest keywords appended)
    return this.enhanceDefaultAdTag(userInterests);
  }

  /**
   * Enhance default ad tag with interest-based custom parameters
   * Appends user interests as targeting keywords to Google Ad Manager URL
   * 
   * @param userInterests - Array of user's interests
   * @returns Enhanced ad tag URL with custom parameters
   */
  private enhanceDefaultAdTag(userInterests?: string[]): string {
    const baseAdTag = this.config.defaultAdTag!;

    // If no interests or ad tag doesn't support custom params, return as-is
    if (!userInterests || userInterests.length === 0 || !baseAdTag.includes('cust_params=')) {
      return baseAdTag;
    }

    // Convert interests to ad keywords
    const keywords = userInterests
      .flatMap(interest => AdTargetingService.INTEREST_AD_KEYWORDS[interest] || [])
      .slice(0, 5) // Limit to 5 keywords for URL length
      .join(',');

    // Append to existing custom parameters
    if (keywords) {
      const separator = baseAdTag.endsWith('&') ? '' : '&';
      return `${baseAdTag}${separator}cust_params=interests%3D${encodeURIComponent(keywords)}`;
    }

    return baseAdTag;
  }

  /**
   * Get ad keywords for AdSense/banner ads
   * Returns comma-separated keywords for interest-based targeting
   * 
   * @param userInterests - Array of user's interests
   * @returns Comma-separated ad keywords
   */
  getAdKeywords(userInterests?: string[]): string {
    if (!userInterests || userInterests.length === 0) {
      return "movies, entertainment, streaming";
    }

    const keywords = userInterests
      .flatMap(interest => AdTargetingService.INTEREST_AD_KEYWORDS[interest] || [])
      .slice(0, 10) // AdSense supports up to 10 keywords
      .join(', ');

    return keywords || "movies, entertainment, streaming";
  }
}

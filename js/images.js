/** Category → curated photography library (static assets) */
export const IMAGE_LIBRARY = {
  bakery: "assets/images/bakery.jpg",
  coffee: "assets/images/coffee.jpg",
  dining: "assets/images/dining.jpg",
  tech: "assets/images/tech.jpg",
  health: "assets/images/health.jpg",
  hotel: "assets/images/hotel.jpg",
  fitness: "assets/images/fitness.jpg",
  fashion: "assets/images/fashion.jpg",
  architecture: "assets/images/architecture.jpg",
  spa: "assets/images/spa.jpg",
  creative: "assets/images/creative.jpg",
  finance: "assets/images/finance.jpg",
  logistics: "assets/images/logistics.jpg",
  education: "assets/images/education.jpg",
  outdoor: "assets/images/outdoor.jpg",
  craft: "assets/images/craft.jpg",
};

const CATEGORY_MAP = {
  "Food & Beverage": ["dining", "bakery", "coffee", "dining"],
  "Health & Wellness": ["health", "spa", "health", "fitness"],
  Technology: ["tech", "creative", "tech", "finance"],
  "Professional Services": ["finance", "craft", "creative", "architecture"],
  Retail: ["fashion", "craft", "fashion", "hotel"],
  "Creative Studio": ["creative", "craft", "architecture", "creative"],
  "Home Services": ["architecture", "craft", "hotel", "architecture"],
  Education: ["education", "creative", "education", "craft"],
  "Travel & Hospitality": ["hotel", "outdoor", "hotel", "dining"],
  Finance: ["finance", "tech", "finance", "architecture"],
  "Real Estate": ["architecture", "hotel", "architecture", "finance"],
  Automotive: ["logistics", "tech", "logistics", "outdoor"],
  "Beauty & Spa": ["spa", "fashion", "spa", "health"],
  Fitness: ["fitness", "outdoor", "fitness", "health"],
  Legal: ["finance", "craft", "finance", "architecture"],
  Nonprofit: ["outdoor", "education", "creative", "outdoor"],
  Entertainment: ["creative", "hotel", "dining", "creative"],
  Construction: ["architecture", "craft", "logistics", "architecture"],
  Agriculture: ["outdoor", "bakery", "outdoor", "dining"],
  Logistics: ["logistics", "tech", "logistics", "architecture"],
};

/**
 * Resolve a set of images for a landing page.
 * @param {{ category: string, id: number, type?: string, name?: string }} page
 */
export function imagesForPage(page) {
  const keys = CATEGORY_MAP[page.category] || ["creative", "architecture", "hotel", "craft"];
  // type-based tweaks
  const type = (page.type || "").toLowerCase();
  let primaryKey = keys[page.id % keys.length];
  if (type.includes("bakery") || type.includes("bread")) primaryKey = "bakery";
  else if (type.includes("coffee") || type.includes("roast")) primaryKey = "coffee";
  else if (type.includes("seafood") || type.includes("restaurant") || type.includes("pasta") || type.includes("bbq") || type.includes("kitchen") || type.includes("market")) primaryKey = "dining";
  else if (type.includes("hotel") || type.includes("inn") || type.includes("stay") || type.includes("retreat")) primaryKey = "hotel";
  else if (type.includes("gym") || type.includes("pilates") || type.includes("climb") || type.includes("run")) primaryKey = "fitness";
  else if (type.includes("spa") || type.includes("salon") || type.includes("tattoo")) primaryKey = "spa";
  else if (type.includes("saas") || type.includes("software") || type.includes("api") || type.includes("cloud") || type.includes("devtools") || type.includes("analytics") || type.includes("ai")) primaryKey = "tech";

  const secondary = keys.filter((k) => k !== primaryKey);
  const galleryKeys = [
    primaryKey,
    secondary[0] || "creative",
    secondary[1] || "architecture",
    secondary[2] || "craft",
  ];

  return {
    hero: IMAGE_LIBRARY[primaryKey],
    feature: galleryKeys.map((k) => IMAGE_LIBRARY[k]),
    gallery: galleryKeys.map((k) => IMAGE_LIBRARY[k]),
    cta: IMAGE_LIBRARY[secondary[0] || primaryKey],
    key: primaryKey,
  };
}

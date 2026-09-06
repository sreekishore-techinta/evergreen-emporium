import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

// ─── Local assets (used as fallback / packaging mockups) ─────────
import microbesImage from "@/assets/evergreen-microbes.jpg";
import fertilizerImage from "@/assets/evergreen-fertilizer.jpg";
import compostImage from "@/assets/evergreen-compost.jpg";
import cocopeatImage from "@/assets/evergreen-cocopeat.jpg";

// ─── Unsplash backdrops — unique, high-quality, per product ──────
// These are used as the product card background when no real
// packaging photo is hosted yet. Replace with actual product
// photography URLs as they become available.
const IMG = {
  pseudomonas:
    "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&q=85&auto=format&fit=crop",
  vam:
    "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800&q=85&auto=format&fit=crop",
  azospirillum:
    "https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?w=800&q=85&auto=format&fit=crop",
  paspoBacteria:
    "https://images.unsplash.com/photo-1585564648577-a64b30a3f7d9?w=800&q=85&auto=format&fit=crop",
  trichoderma:
    "https://images.unsplash.com/photo-1599686300821-42a9a38bb975?w=800&q=85&auto=format&fit=crop",
  vermicompost: compostImage,
  boneMeal:
    "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=85&auto=format&fit=crop",
  neemCake: fertilizerImage,
  fishAminoAcid:
    "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=800&q=85&auto=format&fit=crop",
  panchakaviyam:
    "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=85&auto=format&fit=crop",
  cocopeat: cocopeatImage,
  pottingMix:
    "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&q=85&auto=format&fit=crop",
};

// ─── Category constants ──────────────────────────────────────────
export const CATEGORY_BIO = "Bio & Microbial Solutions" as const;
export const CATEGORY_ORGANIC = "Organic Fertilizers & Plant Nutrition" as const;
export const CATEGORY_MEDIA = "Growing Media" as const;

export type ProductCategory =
  | typeof CATEGORY_BIO
  | typeof CATEGORY_ORGANIC
  | typeof CATEGORY_MEDIA;

export const ALL_CATEGORIES: ProductCategory[] = [
  CATEGORY_BIO,
  CATEGORY_ORGANIC,
  CATEGORY_MEDIA,
];

// ─── Product type ────────────────────────────────────────────────
export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  type: string;
  tagline: string;
  description: string;
  longDescription: string;
  benefits: string[];
  usage: string;
  price: number;           // editable — set to client's actual price
  weight: string;          // editable — set to client's actual pack size
  rating: number;
  applications: string[];
  image: string;
  badge?: string;          // e.g. "Export Quality", "Premium Quality"
};

// ─── Product catalogue ───────────────────────────────────────────
// All 12 products from the Evergreen Media / MEX PDF catalogue.
// Prices and weights are placeholders — update with actual values.
export const products: Product[] = [

  // ── BIO & MICROBIAL SOLUTIONS ──────────────────────────────────

  {
    id: "pseudomonas",
    name: "Pseudomonas",
    category: CATEGORY_BIO,
    type: "Microbial Biofertilizer",
    tagline: "Protects roots, improves soil health, enhances nutrient absorption.",
    badge: "Premium Quality",
    description:
      "A premium microbial culture that protects roots from harmful pathogens, improves soil health, enhances nutrient absorption and promotes stronger, healthier plant growth.",
    longDescription:
      "Our Premium Quality Pseudomonas is a carefully selected microbial culture that works at the root zone to defend against soil-borne pathogens while simultaneously improving phosphorus availability. Use as part of a consistent soil-care routine for home gardens, nurseries and vegetable crops.",
    benefits: [
      "Promotes strong root growth",
      "Improves phosphorus availability",
      "100% natural & organic",
      "Protects against soil-borne pathogens",
      "Ready to use",
    ],
    usage:
      "Mix with soil or water and apply directly to the root zone. Use at transplanting or as a soil drench. Refer to pack label for dosage.",
    price: 499,
    weight: "1 kg",
    rating: 4.9,
    applications: ["Home Gardening", "Nurseries", "Vegetable Crops", "Organic Farming"],
    image: microbesImage,
  },

  {
    id: "vam",
    name: "VAM",
    category: CATEGORY_BIO,
    type: "Mycorrhizal Biofertilizer",
    tagline: "Vesicular Arbuscular Mycorrhiza — powerful root booster.",
    badge: "Premium Quality",
    description:
      "VAM (Vesicular Arbuscular Mycorrhiza) forms a beneficial partnership with plant roots, improving nutrient and water uptake, promoting vigorous root growth and increasing crop yield.",
    longDescription:
      "A natural biofertilizer that extends the root system's reach through symbiotic fungal networks. VAM improves phosphorus, zinc, copper and iron absorption, enhances drought tolerance, and protects roots from soil-borne pathogens. Suitable for all crops.",
    benefits: [
      "Promotes extensive root development",
      "Enhances phosphorus (P) availability and absorption",
      "Improves uptake of Zn, Cu, Fe and other micronutrients",
      "Improves water absorption and drought tolerance",
      "Protects roots from soil-borne pathogens",
      "Enhances flowering, fruiting and crop productivity",
      "Suitable for all crops",
    ],
    usage:
      "Apply close to the root zone at the time of sowing or transplanting. Follow dosage on pack label.",
    price: 599,
    weight: "1 kg",
    rating: 4.8,
    applications: ["Nurseries", "Fruit Crops", "Commercial Agriculture", "Vegetable Crops"],
    image: IMG.vam,
  },

  {
    id: "azospirillum",
    name: "Azospirillum",
    category: CATEGORY_BIO,
    type: "Nitrogen-Fixing Biofertilizer",
    tagline: "Natural nitrogen fixation for stronger, greener plants.",
    badge: "Premium Quality",
    description:
      "A premium Azospirillum biofertilizer that improves soil fertility through natural nitrogen fixation, promotes healthy root development and supports stronger, greener and more productive plants.",
    longDescription:
      "Azospirillum is a free-living nitrogen-fixing bacterium that colonises the root zone and makes atmospheric nitrogen available to plants naturally. It also produces growth-promoting hormones that stimulate root elongation and improve nutrient uptake — reducing dependence on synthetic nitrogen inputs.",
    benefits: [
      "Natural nitrogen fixer",
      "Improves soil fertility",
      "100% natural & organic",
      "Promotes healthy root growth",
      "Ready to use",
    ],
    usage:
      "Apply as a soil drench or mix into the root zone at planting. Follow dosage guidelines on pack.",
    price: 449,
    weight: "1 kg",
    rating: 4.7,
    applications: ["Vegetable Crops", "Organic Farming", "Commercial Agriculture", "Home Gardening"],
    image: IMG.azospirillum,
  },

  {
    id: "paspo-bacteria",
    name: "PASPO Bacteria",
    category: CATEGORY_BIO,
    type: "Phosphate-Solubilising Biofertilizer",
    tagline: "Unlocks soil phosphorus for stronger roots and better growth.",
    badge: "Premium Quality",
    description:
      "A premium Phosphobacteria that naturally unlocks phosphorus in the soil, enhances nutrient uptake, promotes strong root development and supports healthier, more productive plants.",
    longDescription:
      "PASPO Bacteria (Phosphate-Solubilising Bacteria) converts insoluble phosphorus in the soil into a plant-available form, dramatically improving phosphorus efficiency. This eco-friendly biofertilizer promotes stronger root systems and helps reduce the need for high phosphorus synthetic inputs.",
    benefits: [
      "Promotes strong root growth",
      "Improves phosphorus availability",
      "100% natural & organic",
      "Eco-friendly biofertilizer",
      "Ready to use",
    ],
    usage:
      "Mix with soil or apply as a soil drench near the root zone. Refer to pack label for dosage and timing.",
    price: 449,
    weight: "1 kg",
    rating: 4.7,
    applications: ["Vegetable Crops", "Fruit Crops", "Organic Farming", "Nurseries"],
    image: IMG.paspoBacteria,
  },

  {
    id: "trichoderma",
    name: "Trichoderma",
    category: CATEGORY_BIO,
    type: "Biofungicide / Soil Health",
    tagline: "Eco-friendly biofungicide that protects roots from soil-borne fungi.",
    badge: "Premium Quality",
    description:
      "A premium Trichoderma product that improves soil health, protects roots from harmful fungi, promotes strong root development and supports healthier, more productive plants.",
    longDescription:
      "Trichoderma is a naturally occurring beneficial fungus that colonises the root zone and actively outcompetes harmful soil-borne pathogens including Fusarium, Pythium and Rhizoctonia. It also enhances soil microbial activity, improves plant health and acts as an eco-friendly biofungicide with no chemical residues.",
    benefits: [
      "Enhances soil microbial activity",
      "Improves plant health",
      "100% natural & organic",
      "Protects against soil-borne fungi",
      "Eco-friendly biofungicide",
    ],
    usage:
      "Mix into soil at the time of planting or apply as a drench. Can also be used as a seed treatment. Refer to pack label for dosage.",
    price: 499,
    weight: "1 kg",
    rating: 4.8,
    applications: ["Nurseries", "Vegetable Crops", "Organic Farming", "Commercial Agriculture"],
    image: IMG.trichoderma,
  },

  // ── ORGANIC FERTILIZERS & PLANT NUTRITION ─────────────────────

  {
    id: "vermicompost",
    name: "Vermi Compost",
    category: CATEGORY_ORGANIC,
    type: "Organic Soil Conditioner",
    tagline: "Enriches soil with essential nutrients for thriving plants.",
    badge: "Premium Quality",
    description:
      "A premium organic soil enhancer that enriches the soil with essential nutrients, improves aeration and supports healthy root development for thriving plants.",
    longDescription:
      "Our premium Vermicompost is produced from carefully managed worm-casting processes, resulting in a dark, nutrient-rich organic conditioner. It improves soil structure, water retention, aeration and biological activity — making it the ideal foundation amendment for any growing system.",
    benefits: [
      "Improves soil fertility",
      "Rich in essential nutrients",
      "100% natural & organic",
      "Promotes strong root growth",
      "Ready to use",
    ],
    usage:
      "Mix into soil or growing media at a ratio of 20–30%. Apply as a top dressing or incorporate before planting. Suitable for all crops.",
    price: 399,
    weight: "5 kg",
    rating: 4.9,
    applications: ["Home Gardening", "Terrace Gardening", "Organic Farming", "Flowering Plants"],
    image: compostImage,
  },

  {
    id: "bone-meal",
    name: "Bone Meal Powder",
    category: CATEGORY_ORGANIC,
    type: "Organic Plant Nutrition",
    tagline: "Rich in NPK & micronutrients for vigorous flowering and fruiting.",
    badge: "Premium Quality",
    description:
      "A premium Bone Meal Powder that enriches the soil with essential nutrients, promotes vigorous root growth, enhances flowering and supports healthier, stronger plants.",
    longDescription:
      "Our Bone Meal Powder is a slow-release organic fertiliser rich in nitrogen, phosphorus, potassium and micronutrients. It provides a steady supply of nutrients over the growing season, making it ideal for use at planting and as a pre-bloom conditioner to support flowering and fruiting.",
    benefits: [
      "Rich in NPK & micronutrients",
      "Rich in essential nutrients",
      "100% natural & organic",
      "Promotes strong root growth",
      "Ready to use",
    ],
    usage:
      "Work into soil before planting or apply as a top dressing. Use in moderation alongside a balanced growing programme. Refer to pack label for dosage.",
    price: 299,
    weight: "2 kg",
    rating: 4.8,
    applications: ["Flowering Plants", "Fruit Crops", "Terrace Gardening", "Home Gardening"],
    image: IMG.boneMeal,
  },

  {
    id: "neem-cake",
    name: "Neem Cake Powder",
    category: CATEGORY_ORGANIC,
    type: "Botanical Soil Input & Pest Repellent",
    tagline: "Natural fertiliser and pest repellent for healthier, stronger plants.",
    badge: "Premium Quality",
    description:
      "A premium Neem Cake Powder that improves soil fertility, nourishes plants with essential nutrients, protects roots from soil pests and supports healthier, stronger plant growth.",
    longDescription:
      "Neem Cake Powder is the residue left after extracting neem oil, retaining the full spectrum of neem's active compounds. It acts simultaneously as an organic fertiliser and a natural pest repellent, improving soil fertility, suppressing nematodes and soil insects, and enhancing flowering and crop yield.",
    benefits: [
      "Natural fertiliser & pest repellent",
      "Rich in essential nutrients",
      "100% natural & organic",
      "Improves flowering & crop yield",
      "Ready to use",
    ],
    usage:
      "Incorporate into soil before planting or apply as a top dressing. Can be mixed with other organic inputs. Refer to pack label for dosage.",
    price: 279,
    weight: "2 kg",
    rating: 4.6,
    applications: ["Home Gardening", "Vegetable Crops", "Organic Farming", "Nurseries"],
    image: fertilizerImage,
  },

  {
    id: "fish-amino-acid",
    name: "Fish Amino Acid",
    category: CATEGORY_ORGANIC,
    type: "Natural Organic Fertilizer (Liquid)",
    tagline: "Meen Amilam — enriches soil, enhances growth, protects naturally.",
    badge: "Premium Quality",
    description:
      "Fish Amino Acid (Meen Amilam) is a natural organic fertiliser derived from fish and jaggery that enriches soil fertility, promotes root growth, enhances photosynthesis and satisfies most crop nutritional requirements.",
    longDescription:
      "Fish Amino Acid / Meen Amilam is an organic liquid fertiliser rich in amino acids, microorganisms and diverse nutrients. It increases soil fertility, maintains biomass of microorganisms and earthworms, promotes root growth, enhances photosynthesis (especially for seedlings), and extends the shelf life of vegetables, fruits and field crops. Suitable for all crops — vegetables, fruits, flowering plants and field crops.",
    benefits: [
      "Increases soil fertility and enriches soil nutrients",
      "Maintains soil microorganism biomass",
      "Promotes crop root growth and photosynthesis",
      "Enhances yield and quality",
      "Extends shelf life of produce",
      "Accelerates crop maturity",
      "100% organic — suitable for all crops",
    ],
    usage:
      "Foliar spray: dilute 2–5 ml per litre of water. Drip irrigation: use 500 ml per 1 litre in one acre of land with fertilisers. Seed treatment: mix 100 ml per 1 kg of seeds. Never use undiluted.",
    price: 349,
    weight: "1 Ltr",
    rating: 4.8,
    applications: ["Vegetables", "Fruits", "Flowering Plants", "Field Crops"],
    image: IMG.fishAminoAcid,
  },

  {
    id: "panchakaviyam",
    name: "Panchakaviyam",
    category: CATEGORY_ORGANIC,
    type: "Organic Liquid Manure / Repellant",
    tagline: "Ancient organic liquid manure for complete plant health.",
    badge: "Premium Quality",
    description:
      "An organic liquid manure and natural repellant made from cow milk, cow ghee, cow curd, cow dung, cow urine, tender coconut, sugarcane juice and riped banana. Promotes growth, enhances yield and energises naturally.",
    longDescription:
      "Panchakaviyam is a time-tested organic liquid formulation made from five cow-derived ingredients combined with tender coconut, sugarcane juice and riped banana. It promotes natural plant growth, enhances yield and quality, extends shelf life, accelerates crop maturity, improves soil health by boosting beneficial microbial activity, stimulates larger root production, enhances photosynthesis, and acts as a natural pest defence. Suitable for all crops — vegetables, fruits, flowering plants and field crops.",
    benefits: [
      "Promotes growth as a natural plant growth promoter",
      "Enhances yield and quality",
      "Extends shelf life",
      "Accelerates crop maturity",
      "Improves soil health and microbial activity",
      "Boosts photosynthesis",
      "Strengthens root systems",
      "Natural pest defence",
      "100% organic",
    ],
    usage:
      "Foliar spray: dilute 2 ml per 1 litre of water. Drip irrigation: use 500 ml per 1 litre in one acre of land with fertilisers. Seed treatment: mix 100 ml per 1 kg of seeds.",
    price: 349,
    weight: "1 Ltr",
    rating: 4.9,
    applications: ["Vegetables", "Fruits", "Flowering Plants", "Field Crops"],
    image: IMG.panchakaviyam,
  },

  // ── GROWING MEDIA ──────────────────────────────────────────────

  {
    id: "cocopeat",
    name: "Cocopeat",
    category: CATEGORY_MEDIA,
    type: "Compressed Coconut Coir — Export Quality",
    tagline: "Expands up to 75 litres of soil. Low EC. Enriched with Trichoderma.",
    badge: "Export Quality",
    description:
      "Premium-quality Cocopeat enriched with Trichoderma. Improves soil health, protects roots from harmful fungi, promotes robust root growth and supports healthier, more productive plants.",
    longDescription:
      "Our Export Quality Cocopeat is a compressed coconut coir block that expands up to 75 litres of growing medium. With low EC (electrical conductivity) and enriched with Trichoderma, it creates an ideal rooting environment — excellent water retention, superior aeration and natural fungal protection in one substrate.",
    benefits: [
      "Enriched with Trichoderma",
      "Improves soil health",
      "100% natural & organic",
      "Promotes strong root growth",
      "Supports healthy plant growth",
      "Expands up to 75 litres",
      "Low EC — safe for seedlings",
    ],
    usage:
      "Soak the block in water until fully expanded (~75 litres). Use directly as a growing medium or blend with soil and compost. Ideal for containers, seed trays and nursery beds.",
    price: 349,
    weight: "5 kg",
    rating: 4.8,
    applications: ["Home Gardening", "Terrace Gardening", "Nurseries", "Hydroponics"],
    image: cocopeatImage,
  },

  {
    id: "potting-mix",
    name: "Potting Mix",
    category: CATEGORY_MEDIA,
    type: "Premium 18-in-1 Growing Medium",
    tagline: "18-in-1 premium blend for 30–50% deeper roots and faster growth.",
    badge: "Premium Quality",
    description:
      "A premium quality Potting Mix — a perfect blend of natural ingredients that provides excellent aeration, water retention and nutrition for healthy plant growth.",
    longDescription:
      "Our premium Potting Mix is an 18-in-1 formulation combining the best natural growing ingredients. It is lightweight for easy handling, promotes 30–50% deeper root development, enhances faster growth through excellent aeration and water retention, and is 100% natural and organic. Ready to use straight from the bag.",
    benefits: [
      "Lightweight",
      "Enhances faster growth",
      "100% natural & organic",
      "30–50% deeper root development",
      "Ready to use",
      "18-in-1 premium blend",
    ],
    usage:
      "Fill containers or raised beds directly. Use as-is or blend with existing soil. Ideal for potted plants, terrace gardens, seedling trays and container growing.",
    price: 449,
    weight: "5 kg",
    rating: 4.9,
    applications: ["Home Gardening", "Terrace Gardening", "Nurseries", "Flowering Plants"],
    image: IMG.pottingMix,
  },
];

// ─── Cart / Store types ──────────────────────────────────────────
type CartLine = { id: string; quantity: number };
type StoreContextValue = {
  cart: CartLine[];
  wishlist: string[];
  addToCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  toggleWishlist: (id: string) => void;
  cartCount: number;
  cartTotal: number;
  isWishlisted: (id: string) => boolean;
};

const StoreContext = createContext<StoreContextValue | null>(null);

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>(() => readStorage("evergreen-cart", []));
  const [wishlist, setWishlist] = useState<string[]>(() =>
    readStorage("evergreen-wishlist", [])
  );

  useEffect(() => {
    window.localStorage.setItem("evergreen-cart", JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    window.localStorage.setItem("evergreen-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const value = useMemo<StoreContextValue>(() => {
    const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
    const cartTotal = cart.reduce(
      (sum, line) =>
        sum + (products.find((p) => p.id === line.id)?.price ?? 0) * line.quantity,
      0
    );
    return {
      cart,
      wishlist,
      cartCount,
      cartTotal,
      addToCart: (id) =>
        setCart((cur) =>
          cur.some((l) => l.id === id)
            ? cur.map((l) => (l.id === id ? { ...l, quantity: l.quantity + 1 } : l))
            : [...cur, { id, quantity: 1 }]
        ),
      updateQuantity: (id, quantity) =>
        setCart((cur) =>
          quantity < 1
            ? cur.filter((l) => l.id !== id)
            : cur.map((l) => (l.id === id ? { ...l, quantity } : l))
        ),
      removeFromCart: (id) => setCart((cur) => cur.filter((l) => l.id !== id)),
      toggleWishlist: (id) =>
        setWishlist((cur) =>
          cur.includes(id) ? cur.filter((i) => i !== id) : [...cur, id]
        ),
      isWishlisted: (id) => wishlist.includes(id),
    };
  }, [cart, wishlist]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

// ─── Convenience helpers ─────────────────────────────────────────
export function getProductsByCategory(category: ProductCategory) {
  return products.filter((p) => p.category === category);
}

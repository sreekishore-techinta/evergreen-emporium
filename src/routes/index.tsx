import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  Check,
  ChevronRight,
  Droplets,
  Leaf,
  Microscope,
  ShieldCheck,
  Sparkles,
  Sprout,
  Star,
  Sun,
  Zap,
} from "lucide-react";
import { useRef, useState } from "react";
import heroImage from "@/assets/evergreen-hero.jpg";
import homeHeroImage from "@/assets/home hero.png";
import storyImage from "@/assets/evergreen-story.jpg";
import { PremiumProductCard, SectionLabel } from "@/components/storefront";
import {
  CATEGORY_BIO,
  CATEGORY_MEDIA,
  CATEGORY_ORGANIC,
  products,
} from "@/lib/storefront";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Evergreen Media — Grow Better, Nourish Naturally" },
      {
        name: "description",
        content:
          "Premium agricultural solutions for healthier soil, stronger roots and thriving plants.",
      },
      { property: "og:title", content: "Evergreen Media — Grow Better, Nourish Naturally" },
      {
        property: "og:description",
        content:
          "Premium agricultural solutions for healthier soil, stronger roots and thriving plants.",
      },
    ],
  }),
  component: HomePage,
});

/* ─── Unsplash image URLs (unique per section) ─────────────────── */
const IMG = {
  // Hero — wide cinematic field with golden light
  hero: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=85&auto=format&fit=crop",
  // Brand intro — macro soil / roots
  brandIntro:
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=85&auto=format&fit=crop",
  // Categories
  biofertilizer:
    "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&q=80&auto=format&fit=crop",
  organicFert:
    "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80&auto=format&fit=crop",
  soilEnhancer:
    "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&q=80&auto=format&fit=crop",
  growingMedia:
    "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&q=80&auto=format&fit=crop",
  plantNutrition:
    "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80&auto=format&fit=crop",
  plantProtection:
    "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=800&q=80&auto=format&fit=crop",
  // Shop by need
  strongerRoots:
    "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=700&q=80&auto=format&fit=crop",
  betterSoil:
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=700&q=80&auto=format&fit=crop",
  naturalNutrition:
    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=700&q=80&auto=format&fit=crop",
  healthierGrowth:
    "https://images.unsplash.com/photo-1543257580-7269da773bf5?w=700&q=80&auto=format&fit=crop",
  floweringFruiting:
    "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=700&q=80&auto=format&fit=crop",
  // Agricultural journey — wide field
  journey:
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&q=85&auto=format&fit=crop",
  // Shop by application
  homeGarden:
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=75&auto=format&fit=crop",
  terraceGarden:
    "https://images.unsplash.com/photo-1531971589569-0d9370cbe1e5?w=600&q=75&auto=format&fit=crop",
  nursery:
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=75&auto=format&fit=crop",
  organicFarming:
    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&q=75&auto=format&fit=crop",
  vegCrops:
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=75&auto=format&fit=crop",
  fruitCrops:
    "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=600&q=75&auto=format&fit=crop",
  floweringPlants:
    "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=600&q=75&auto=format&fit=crop",
  commercialAg:
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=75&auto=format&fit=crop",
  // Process
  select:
    "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=700&q=80&auto=format&fit=crop",
  prepare:
    "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=700&q=80&auto=format&fit=crop",
  nurture:
    "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=700&q=80&auto=format&fit=crop",
  grow: "https://images.unsplash.com/photo-1543257580-7269da773bf5?w=700&q=80&auto=format&fit=crop",
  // Learn
  learnSoil:
    "https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?w=700&q=80&auto=format&fit=crop",
  learnNutrition:
    "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=700&q=80&auto=format&fit=crop",
  learnOrganic:
    "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=700&q=80&auto=format&fit=crop",
  // CTA — lush close-up
  cta: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1600&q=85&auto=format&fit=crop",
};

/* ─── Animation variants ────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: { duration: 0.65, delay: i * 0.08 },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ─── Reusable scroll-reveal wrapper ───────────────────────────── */
function Reveal({
  children,
  className = "",
  delay = 0,
  y = 28,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Gold divider ──────────────────────────────────────────────── */
function GoldLine() {
  return (
    <div
      className="h-px w-full"
      style={{
        background:
          "linear-gradient(90deg, transparent, oklch(0.64 0.09 77.6 / 35%), transparent)",
      }}
    />
  );
}

/* ══════════════════════════════════════════════════════════════════
   HOME PAGE
══════════════════════════════════════════════════════════════════ */
function HomePage() {
  return (
    <main className="bg-ivory text-ink overflow-x-hidden">
      <HeroSection />
      <BrandIntroSection />
      <CategoriesSection />
      <FeaturedProductsSection />
      <ShopByNeedSection />
      <WhyEvergreenSection />
      <ShopByApplicationSection />
      <ProcessStorySection />
      <LearnAndGrowSection />
      <CustomerStoriesSection />
      <FinalCtaSection />
    </main>
  );
}

/* ══════════════════════════════════════════════════════════════════
   1. HERO
══════════════════════════════════════════════════════════════════ */
function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const cardY = useTransform(scrollYProgress, [0, 1], ["0%", "6%"]);

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-[540px] h-[72vh] max-h-[740px] items-center justify-end overflow-hidden bg-forest-deep"
      aria-label="Hero"
    >
      {/* Background image — zoomed out, natural 2:1 panoramic framing */}
      <motion.div className="absolute inset-0" style={{ y: imgY }}>
        <img
          src={homeHeroImage}
          alt="Evergreen Media natural bio-fertilizers, living soil and thriving crops"
          width={1774}
          height={887}
          className="size-full object-cover object-[center_40%]"
          priority-fetch="high"
        />
      </motion.div>

      {/* Hero content container — cleanly aligned on the right side in compact size */}
      <div className="relative mx-auto w-full max-w-[1440px] px-6 sm:px-10 flex items-center justify-end z-10">
        <motion.div
          className="w-full max-w-[360px] sm:max-w-[390px] rounded-2xl border border-ivory/20 bg-forest-deep/80 p-5 sm:p-6 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.4)] flex flex-col items-start text-left"
          style={{ y: cardY }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/15 px-2.5 py-0.5 backdrop-blur-md">
            <span className="size-1.5 rounded-full bg-gold animate-pulse" />
            <span className="font-mono text-[8.5px] uppercase tracking-[0.24em] text-gold font-semibold">
              Evergreen Media · 100% Organic
            </span>
          </div>

          {/* Main headline — compact luxury typography */}
          <h1 className="mt-3 font-display font-medium text-2xl sm:text-3xl leading-[1.08] text-ivory tracking-tight">
            Grow Better.{" "}
            <span className="italic text-gold block sm:inline">Nourish Naturally.</span>
          </h1>

          {/* Subtext */}
          <p className="mt-2.5 text-xs leading-relaxed text-ivory/80 font-sans">
            Premium agricultural bio-solutions formulated with active microbial inoculants & organic nutrients for thriving plants.
          </p>

          {/* Compact CTAs — side by side */}
          <div className="mt-4 flex items-center gap-2.5 w-full">
            <Link
              to="/shop"
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-gold px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-forest-deep font-semibold transition-all hover:bg-ivory hover:shadow-md"
            >
              <span>Shop</span>
              <ArrowRight className="size-3" />
            </Link>
            <Link
              to="/categories"
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-ivory/30 bg-white/5 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ivory backdrop-blur-md transition-all hover:border-ivory hover:bg-white/15"
            >
              <span>Explore</span>
              <ArrowUpRight className="size-3" />
            </Link>
          </div>

          {/* Stats row — compact inline */}
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-ivory/15 pt-3.5 w-full">
            {[
              ["12+", "Formulations"],
              ["100%", "Organic"],
              ["All", "Crops & Soil"],
            ].map(([num, label]) => (
              <div key={label} className="flex flex-col">
                <span className="font-display text-lg font-medium text-gold leading-tight">
                  {num}
                </span>
                <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-ivory/60 font-medium">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════
   2. BRAND INTRODUCTION
══════════════════════════════════════════════════════════════════ */
function BrandIntroSection() {
  return (
    <section className="bg-ivory py-24 lg:py-36" aria-label="Brand introduction">
      <div className="mx-auto grid max-w-[1440px] grid-cols-12 items-center gap-x-8 gap-y-16 px-6 lg:px-10">
        {/* Left — editorial typography block */}
        <div className="col-span-12 lg:col-span-6">
          <Reveal>
            <SectionLabel index="01">The approach</SectionLabel>
          </Reveal>
          <Reveal delay={0.1}>
            <h2
              className="mt-5 font-display font-medium leading-[0.9] text-forest-deep"
              style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
            >
              Better Soil.
              <br />
              Stronger Roots.
              <br />
              <span className="italic text-gold">Healthier Growth.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-8 flex gap-6">
              <div className="h-full w-px bg-gold/35" />
              <p className="max-w-md text-sm leading-loose text-ink/65">
                We craft living inputs — microbial cultures, organic amenders and refined growing
                media — formulated so every plant starts from a healthier foundation. Each product
                in the Evergreen Media range is chosen for what it actually does to the soil, not
                for how it looks on a shelf.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.3}>
            <Link
              to="/shop"
              className="mt-8 inline-flex items-center gap-2 border-b border-gold pb-1 font-mono text-[10px] uppercase tracking-[0.25em] text-forest transition-all hover:gap-4 hover:text-gold"
            >
              Explore the range <ArrowRight className="size-3" />
            </Link>
          </Reveal>
        </div>

        {/* Right — large asymmetric image with floating label */}
        <div className="col-span-12 lg:col-span-5 lg:col-start-8">
          <Reveal delay={0.15} y={40} className="relative">
            <img
              src={IMG.brandIntro}
              alt="Young seedling emerging from rich dark soil in natural light"
              loading="lazy"
              width={1200}
              height={1500}
              className="aspect-[4/5] w-full object-cover"
              style={{ borderRadius: "min(1vw, 10px)" }}
            />
            {/* Floating caption card */}
            <motion.div
              className="absolute -bottom-5 -left-5 bg-forest-deep p-5 shadow-xl"
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-gold">
                Science + Nature
              </p>
              <p className="mt-1 font-display text-xl font-medium text-ivory">
                Living inputs for living soil.
              </p>
            </motion.div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════
   3. CATEGORIES
══════════════════════════════════════════════════════════════════ */
/* ─── 3 real product categories ────────────────────────────────── */
const CATEGORIES = [
  {
    name: CATEGORY_BIO,
    short: "Bio & Microbial",
    description: "Live cultures for living soil",
    image:
      "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&q=80&auto=format&fit=crop",
    tag: "01",
  },
  {
    name: CATEGORY_ORGANIC,
    short: "Organic Fertilizers",
    description: "Natural nutrition from soil to harvest",
    image:
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80&auto=format&fit=crop",
    tag: "02",
  },
  {
    name: CATEGORY_MEDIA,
    short: "Growing Media",
    description: "Premium root substrates",
    image:
      "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&q=80&auto=format&fit=crop",
    tag: "03",
  },
] as const;

function CategoryCard({
  cat,
  index,
  tall = false,
}: {
  cat: (typeof CATEGORIES)[number];
  index: number;
  tall?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      <Link
        to="/shop"
        className="group relative block overflow-hidden"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ borderRadius: "min(0.8vw, 8px)" }}
        aria-label={`Browse ${cat.name}`}
      >
        {/* Image */}
        <div className={`overflow-hidden ${tall ? "aspect-[3/4]" : "aspect-[4/3]"}`}>
          <motion.img
            src={cat.image}
            alt={`${cat.name} — ${cat.description}`}
            loading="lazy"
            width={800}
            height={tall ? 1067 : 600}
            className="size-full object-cover"
            animate={{ scale: hovered ? 1.07 : 1 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        {/* Bottom overlay */}
        <motion.div
          className="absolute inset-x-0 bottom-0 h-1/2"
          style={{
            background:
              "linear-gradient(to top, oklch(0.23 0.07 157.2 / 90%) 0%, transparent 100%)",
          }}
          animate={{ opacity: hovered ? 1 : 0.7 }}
          transition={{ duration: 0.3 }}
        />

        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 p-5">
          <div className="flex items-end justify-between">
            <div>
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-gold/80">
                {cat.tag}
              </span>
              <h3 className="mt-1 font-display text-xl font-medium text-ivory">{cat.short}</h3>
              <p className="mt-0.5 font-mono text-[9px] text-ivory/55">{cat.description}</p>
            </div>
            <motion.div
              className="flex size-8 shrink-0 items-center justify-center border border-ivory/30"
              animate={{
                rotate: hovered ? 45 : 0,
                borderColor: hovered
                  ? "oklch(0.64 0.09 77.6)"
                  : "oklch(0.956 0.023 89.9 / 30%)",
              }}
              transition={{ duration: 0.3 }}
            >
              <ArrowUpRight className="size-3.5 text-ivory" />
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function CategoriesSection() {
  return (
    <section className="bg-parchment py-24 lg:py-32" aria-label="Product categories">
      <GoldLine />
      <div className="mx-auto max-w-[1440px] px-6 pt-16 lg:px-10">
        {/* Header */}
        <div className="flex items-end justify-between">
          <Reveal>
            <div>
              <SectionLabel index="02">Categories</SectionLabel>
              <h2
                className="mt-4 font-display font-medium leading-tight text-forest-deep"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
              >
                Find your <span className="italic text-gold">foundation.</span>
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <Link
              to="/categories"
              className="hidden items-center gap-2 border-b border-forest/25 pb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-forest transition-all hover:gap-4 hover:text-gold sm:flex"
            >
              View all <ChevronRight className="size-3" />
            </Link>
          </Reveal>
        </div>

        {/* Grid — 3 categories, equal columns */}
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {CATEGORIES.map((cat, i) => (
            <CategoryCard key={cat.name} cat={cat} index={i} tall />
          ))}
        </div>
      </div>
      <GoldLine />
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════
   4. FEATURED PRODUCTS
══════════════════════════════════════════════════════════════════ */
function FeaturedProductsSection() {
  return (
    <section className="bg-ivory py-24 lg:py-32" aria-label="Featured products">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        {/* Header */}
        <div className="flex items-end justify-between">
          <Reveal>
            <div>
              <SectionLabel index="03">Featured products</SectionLabel>
              <h2
                className="mt-4 font-display font-medium leading-tight text-forest-deep"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
              >
                The <span className="italic text-gold">collection.</span>
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <Link
              to="/shop"
              className="hidden items-center gap-2 border-b border-forest/25 pb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-forest transition-all hover:gap-4 hover:text-gold sm:flex"
            >
              Shop all <ChevronRight className="size-3" />
            </Link>
          </Reveal>
        </div>

        {/* Product grid — first 4 from the real catalogue */}
        <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {products.slice(0, 4).map((product) => (
            <PremiumProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Bottom CTA */}
        <Reveal delay={0.2} className="mt-16 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 border border-forest/20 px-8 py-4 font-mono text-[10px] uppercase tracking-[0.25em] text-forest transition-all hover:border-forest hover:bg-forest hover:text-ivory"
          >
            View all products
            <ArrowRight className="size-3" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════
   5. SHOP BY NEED — PINTEREST BOTANICAL MOODBOARD
══════════════════════════════════════════════════════════════════ */
type NeedPin = {
  id: string;
  code: string;
  category: string;
  label: string;
  symptom: string;
  prescription: string;
  metric: string;
  image: string;
  aspect: string;
  badge: string;
  icon: typeof Sprout;
  productIds: string[];
};

const NEED_PINS: NeedPin[] = [
  {
    id: "stronger-roots",
    code: "PROTOCOL 01",
    category: "Roots & Foundation",
    label: "Deep Root Architecture",
    symptom: "Shallow root mass, transplant shock & sluggish seedling take-off",
    prescription:
      "Symbiotic mycorrhizal VAM fungal hyphae multiply root absorption surface area by up to 700%, while beneficial Pseudomonas inoculant shields tender roots from soil pathogens.",
    metric: "+700% Root Reach",
    badge: "🌱 Root Diagnosis",
    aspect: "aspect-[3/4]",
    image:
      "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800&q=80&auto=format&fit=crop",
    icon: Sprout,
    productIds: ["vam", "pseudomonas"],
  },
  {
    id: "soil-health",
    code: "PROTOCOL 02",
    category: "Soil Biology",
    label: "Living Soil Ecosystem",
    symptom: "Hard compacted clay, nutrient lockout & depleted microbial activity",
    prescription:
      "Re-establish the underground biological web with aged Vermi Compost castings, atmospheric nitrogen-fixing Azospirillum, and antagonistic Trichoderma fungi.",
    metric: "Living Humus Bed",
    badge: "🪨 Soil Diagnosis",
    aspect: "aspect-[4/5]",
    image:
      "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&q=80&auto=format&fit=crop",
    icon: Leaf,
    productIds: ["vermicompost", "trichoderma", "azospirillum"],
  },
  {
    id: "flowering-fruiting",
    code: "PROTOCOL 03",
    category: "Bloom & Harvest",
    label: "Prolific Blossom & Fruit Set",
    symptom: "Premature flower abortion, sparse blooms & underdeveloped fruit size",
    prescription:
      "Slow-release steamed Bone Meal delivers bio-available Phosphorus & Calcium, timed with traditional liquid Panchakaviyam to maximize bud count and sweetness.",
    metric: "Bio-Available Phosphorus",
    badge: "🥀 Flower Diagnosis",
    aspect: "aspect-[3/4]",
    image:
      "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=800&q=80&auto=format&fit=crop",
    icon: Star,
    productIds: ["bone-meal", "panchakaviyam"],
  },
  {
    id: "pest-defense",
    code: "PROTOCOL 04",
    category: "Natural Defense",
    label: "Bio-Shield & Root Defense",
    symptom: "Sucking pests, root nematodes, damping-off & fungal wilt pathogens",
    prescription:
      "Pure cold-pressed Neem Cake conditions soil while suppressing harmful nematodes, paired with antagonistic Pseudomonas to outcompete fungal mycelium.",
    metric: "100% Bio-Active Barrier",
    badge: "🐛 Pest & Pathogen Shield",
    aspect: "aspect-[4/5]",
    image:
      "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80&auto=format&fit=crop",
    icon: ShieldCheck,
    productIds: ["neem-cake", "pseudomonas"],
  },
  {
    id: "foliar-nutrition",
    code: "PROTOCOL 05",
    category: "Foliar Nutrition",
    label: "Rapid Foliar Green-Up",
    symptom: "Pale yellowing leaves, interveinal chlorosis & post-weather stress",
    prescription:
      "Cold-fermented Fish Amino Acid and Panchakaviyam deliver 17 essential L-amino acids directly through leaf stomata, spurring dark green chlorophyll within 48 hours.",
    metric: "Active Within 48 Hours",
    badge: "🍃 Chlorosis Diagnosis",
    aspect: "aspect-[3/4]",
    image:
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80&auto=format&fit=crop",
    icon: Sun,
    productIds: ["fish-amino-acid", "panchakaviyam"],
  },
  {
    id: "aeration-substrate",
    code: "PROTOCOL 06",
    category: "Roots & Foundation",
    label: "Aeration & Substrate Porosity",
    symptom: "Soggy waterlogged planters, anaerobic root suffocation & seedling decay",
    prescription:
      "Triple-washed low-EC Coco Peat blocks combined with premium enriched potting mix provide 4x hydration storage while ensuring 30% air porosity for delicate feeder roots.",
    metric: "4x Water Holding + Air",
    badge: "💧 Drainage & Aeration",
    aspect: "aspect-[4/5]",
    image:
      "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&q=80&auto=format&fit=crop",
    icon: Zap,
    productIds: ["cocopeat", "potting-mix"],
  },
];

const NEED_FILTER_TABS = [
  "All Needs",
  "Roots & Foundation",
  "Soil Biology",
  "Bloom & Harvest",
  "Natural Defense",
  "Foliar Nutrition",
] as const;

function ShopByNeedSection() {
  const [activeCategory, setActiveCategory] = useState<string>("All Needs");
  const [savedPins, setSavedPins] = useState<Set<string>>(new Set(["stronger-roots"]));
  const [onlySaved, setOnlySaved] = useState<boolean>(false);
  const [justSavedId, setJustSavedId] = useState<string | null>(null);

  const toggleSavePin = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedPins((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        setJustSavedId(id);
        setTimeout(() => setJustSavedId(null), 1800);
      }
      return next;
    });
  };

  const filteredPins = NEED_PINS.filter((pin) => {
    if (onlySaved) {
      return savedPins.has(pin.id);
    }
    if (activeCategory === "All Needs") return true;
    return pin.category === activeCategory;
  });

  return (
    <section
      className="relative bg-[#FCFAF7] py-28 text-ink lg:py-36 overflow-hidden border-y border-ink/8"
      aria-label="Shop by need"
    >
      {/* Subtle warm champagne ambient glow - no green */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full blur-[140px] opacity-10"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(197, 160, 89, 0.4) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1440px] px-6 lg:px-12">
        {/* ─── Header & Pinterest Board Introduction ─── */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 pb-12 border-b border-ink/10">
          <div className="max-w-2xl">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/15 px-3.5 py-1.5 backdrop-blur-md shadow-xs">
                <Sparkles className="size-3.5 text-gold animate-pulse" />
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink font-semibold">
                  (05) — Botanical Diagnosis Moodboard
                </span>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <h2
                className="mt-5 font-display font-medium leading-[0.92] text-ink tracking-tight"
                style={{ fontSize: "clamp(2.8rem, 5.5vw, 4.8rem)" }}
              >
                What do your plants{" "}
                <span className="italic text-gold block sm:inline">need today?</span>
              </h2>
            </Reveal>

            <Reveal delay={0.15}>
              <p className="mt-5 text-base leading-relaxed text-ink/70 max-w-xl font-sans">
                Explore our Pinterest-curated board of plant symptoms and organic prescriptions.
                Pin protocols to your garden plan and shop targeted bio-fertilizers formulated for
                every stage of life.
              </p>
            </Reveal>
          </div>

          {/* Board Counter & Saved Toggle Button */}
          <Reveal delay={0.2} className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setOnlySaved((prev) => !prev)}
              className={`group flex items-center gap-2.5 rounded-full px-5 py-2.5 text-xs font-mono uppercase tracking-[0.2em] transition-all duration-300 border ${
                onlySaved
                  ? "bg-ink text-ivory border-ink shadow-md"
                  : "bg-white text-ink border-ink/15 hover:border-gold hover:bg-white shadow-xs"
              }`}
            >
              <Bookmark className={`size-3.5 ${onlySaved ? "fill-ivory text-ivory" : "text-gold"}`} />
              <span>
                {onlySaved ? "Showing Garden Board" : `Garden Board (${savedPins.size})`}
              </span>
            </button>

            <Link
              to="/shop"
              className="flex items-center gap-2 rounded-full border border-ink/20 bg-white px-5 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-ink transition-all duration-300 hover:border-ink hover:bg-ink hover:text-ivory shadow-xs"
            >
              <span>Full Catalog</span>
              <ArrowUpRight className="size-3.5 text-gold" />
            </Link>
          </Reveal>
        </div>

        {/* ─── Pinterest Topic Pills / Filter Bar ─── */}
        {!onlySaved && (
          <div className="pt-8 pb-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
              <span className="text-ink/40 font-mono text-[10px] uppercase tracking-[0.2em] shrink-0 mr-2">
                Browse By:
              </span>
              {NEED_FILTER_TABS.map((tab) => {
                const isActive = activeCategory === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveCategory(tab)}
                    className={`relative shrink-0 rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] transition-all duration-300 ${
                      isActive
                        ? "bg-ink text-ivory font-semibold shadow-md"
                        : "bg-white border border-ink/10 text-ink/70 hover:border-ink/30 hover:text-ink hover:bg-white shadow-xs"
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Pinterest Staggered Masonry Pinboard ─── */}
        <div className="mt-8">
          {filteredPins.length === 0 ? (
            <div className="rounded-3xl border border-ink/10 bg-white/90 p-16 text-center backdrop-blur-md shadow-sm">
              <Bookmark className="mx-auto size-8 text-gold" />
              <h3 className="mt-4 font-display text-2xl text-ink">Your Garden Board is Empty</h3>
              <p className="mt-2 text-sm text-ink/60 max-w-md mx-auto">
                Click the bookmark icon on any protocol pin below to save your plants' customized
                routine.
              </p>
              <button
                onClick={() => setOnlySaved(false)}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 font-mono text-xs uppercase tracking-widest text-ivory hover:bg-gold hover:text-ink transition-all shadow-md"
              >
                Explore All Protocols
              </button>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6 [column-fill:_balance]">
              {filteredPins.map((pin) => {
                const IconComponent = pin.icon;
                const isSaved = savedPins.has(pin.id);
                const isJustSaved = justSavedId === pin.id;

                return (
                  <div
                    key={pin.id}
                    className="break-inside-avoid group relative flex flex-col rounded-3xl border border-ink/10 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-500 hover:border-gold/50 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(0,0,0,0.09)]"
                  >
                    {/* ── Media Header with Pinterest Save Button ── */}
                    <div className={`relative w-full ${pin.aspect} overflow-hidden bg-ivory-soft`}>
                      <img
                        src={pin.image}
                        alt={pin.label}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />

                      {/* Gentle bottom gradient for tag legibility */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 40%, rgba(0,0,0,0.55) 100%)",
                        }}
                      />

                      {/* Top Floating Bar: Diagnosis Symptom Tag & Pinterest Pin Button */}
                      <div className="absolute inset-x-0 top-0 p-4 flex items-center justify-between z-10">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/95 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.16em] text-ink backdrop-blur-md shadow-sm font-semibold">
                          {pin.badge}
                        </span>

                        {/* Pinterest Pin Button */}
                        <button
                          onClick={(e) => toggleSavePin(pin.id, e)}
                          title={isSaved ? "Remove from Garden Board" : "Save Pin to Garden Board"}
                          className={`size-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 shadow-md ${
                            isSaved
                              ? "bg-gold text-ink border border-gold scale-105"
                              : "bg-white/90 border border-black/10 text-ink hover:bg-gold hover:text-ink hover:border-gold hover:scale-110"
                          }`}
                        >
                          {isSaved ? (
                            <BookmarkCheck className="size-4.5" />
                          ) : (
                            <Bookmark className="size-4.5" />
                          )}
                        </button>
                      </div>

                      {/* Temporary Saved Tooltip */}
                      {isJustSaved && (
                        <div className="absolute top-16 right-4 z-20 rounded-lg bg-ink px-3 py-1 text-[11px] font-mono text-ivory font-semibold shadow-xl animate-fade-in">
                          Pinned to Garden!
                        </div>
                      )}

                      {/* Bottom Image Overlay Metric */}
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-white/95 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-ink backdrop-blur-md shadow-sm font-semibold">
                          <IconComponent className="size-3 text-gold" />
                          <span>{pin.metric}</span>
                        </div>
                      </div>
                    </div>

                    {/* ── Pin Content & Diagnostic Prescription ── */}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        {/* Protocol Code & Category */}
                        <div className="flex items-center justify-between text-gold font-mono text-[10px] uppercase tracking-[0.25em] font-semibold">
                          <span>{pin.code}</span>
                          <span className="text-ink/30">•</span>
                          <span className="text-ink/60">{pin.category}</span>
                        </div>

                        {/* Title */}
                        <h3 className="mt-2.5 font-display text-2xl font-medium leading-snug text-ink group-hover:text-gold transition-colors duration-300">
                          {pin.label}
                        </h3>

                        {/* Diagnosis breakdown */}
                        <div className="mt-4 space-y-3 text-xs leading-relaxed">
                          <div className="rounded-xl border border-ink/8 bg-[#FAF8F5] p-3">
                            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-gold font-semibold block mb-1">
                              Identified Symptom:
                            </span>
                            <p className="text-ink/75 italic">"{pin.symptom}"</p>
                          </div>

                          <div className="rounded-xl border border-ink/8 bg-white p-3 shadow-xs">
                            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink/50 font-semibold block mb-1">
                              Organic Prescription:
                            </span>
                            <p className="text-ink/85 leading-normal">{pin.prescription}</p>
                          </div>
                        </div>
                      </div>

                      {/* ── Pinterest E-Commerce "Shop This Pin" ── */}
                      <div className="mt-6 pt-5 border-t border-ink/10">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-gold font-semibold flex items-center gap-1.5">
                            <Sparkles className="size-3 text-gold" />
                            Matched Solutions ({pin.productIds.length})
                          </span>
                          <span className="text-[10px] font-mono text-ink/45">Shop Pin</span>
                        </div>

                        <div className="space-y-2">
                          {pin.productIds.map((id) => {
                            const p = products.find((pr) => pr.id === id);
                            if (!p) return null;
                            return (
                              <Link
                                key={id}
                                to="/product/$id"
                                params={{ id }}
                                className="group/item flex items-center justify-between rounded-xl border border-ink/10 bg-[#FAF8F5] px-3 py-2 text-left transition-all duration-300 hover:border-gold/60 hover:bg-white hover:translate-x-1 shadow-xs"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="size-8 rounded-lg overflow-hidden shrink-0 border border-ink/10 bg-ivory-soft">
                                    <img
                                      src={p.image}
                                      alt={p.name}
                                      className="size-full object-cover"
                                      loading="lazy"
                                    />
                                  </div>
                                  <div className="truncate">
                                    <p className="font-display text-sm font-medium text-ink truncate group-hover/item:text-gold transition-colors">
                                      {p.name}
                                    </p>
                                    <p className="font-mono text-[9px] text-ink/50 uppercase tracking-wider">
                                      {p.type} • {p.weight}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 pl-2 shrink-0">
                                  <span className="font-mono text-xs font-semibold text-ink">
                                    ₹{p.price}
                                  </span>
                                  <div className="size-5 rounded-full flex items-center justify-center bg-gold/15 text-ink group-hover/item:bg-gold transition-all">
                                    <ArrowUpRight className="size-3" />
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── Curated Agronomist Diagnostic Note & Consultation ─── */}
        <Reveal delay={0.2} className="mt-16">
          <div className="relative rounded-3xl border border-gold/30 bg-gradient-to-r from-white via-[#FCFAF7] to-white p-8 md:p-12 shadow-xl overflow-hidden">
            <div
              className="pointer-events-none absolute right-0 top-0 h-full w-1/3 bg-gold/5 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex items-start gap-5 max-w-2xl">
                <div className="size-12 rounded-2xl flex items-center justify-center bg-gold/15 border border-gold/40 text-gold shrink-0 mt-1">
                  <Leaf className="size-6 text-gold" />
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold font-semibold">
                    Free Agronomic Diagnosis Desk
                  </span>
                  <h3 className="mt-1 font-display text-2xl sm:text-3xl text-ink font-medium">
                    Unsure which formulation your garden needs?
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/70">
                    Share a photo of your leaf symptoms, potted soil, or crop stage. Our agronomists
                    will analyze your plants and formulate a biological nutrition chart free of charge.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 shrink-0">
                <Link
                  to="/shop"
                  className="flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 font-mono text-xs uppercase tracking-[0.22em] text-ivory font-semibold transition-all hover:bg-gold hover:text-ink hover:-translate-y-0.5 hover:shadow-xl shadow-md"
                >
                  <span>Explore All 12 Products</span>
                  <ArrowRight className="size-3.5" />
                </Link>
                <Link
                  to="/categories"
                  className="flex items-center gap-2 rounded-full border border-ink/20 bg-white px-7 py-3.5 font-mono text-xs uppercase tracking-[0.22em] text-ink transition-all hover:border-ink hover:bg-ink hover:text-ivory shadow-xs"
                >
                  <span>Crop Solutions</span>
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════
   6. WHY EVERGREEN MEDIA
══════════════════════════════════════════════════════════════════ */
const TRUST_PILLARS = [
  {
    icon: ShieldCheck,
    badgeId: "SPEC. 01 // QA",
    tag: "Batch Verified",
    title: "Premium Quality",
    subtitle: "Triple-Screened Material",
    body: "Every input in our range is selected for consistency, purity and real-world performance across diverse soil types.",
    chips: ["99.8% Purity", "ISO-Bio Standard"],
    barcode: "||| | |||| || | |||||",
    authCode: "QC-8824-A",
  },
  {
    icon: Sprout,
    badgeId: "SPEC. 02 // BIO",
    tag: "Whole-System",
    title: "Plant Focused",
    subtitle: "Rhizosphere Architecture",
    body: "We start with the plant's biological needs, then work backward — choosing inputs that support the entire living system.",
    chips: ["Root Bio-Web", "Symbiotic Link"],
    barcode: "| |||| | ||| |||| | |",
    authCode: "AGRI-9102-B",
  },
  {
    icon: Leaf,
    badgeId: "SPEC. 03 // ORG",
    tag: "100% Living",
    title: "Natural Approach",
    subtitle: "Zero Synthetic Residue",
    body: "Our range works with living soil biology, not against it. Zero synthetics. No shortcuts. Just considered natural inputs.",
    chips: ["Soil Microbes", "Non-Hazardous"],
    barcode: "|||| | | |||| || |||",
    authCode: "ECO-4418-C",
  },
  {
    icon: Microscope,
    badgeId: "SPEC. 04 // LAB",
    tag: "Field Benchmarked",
    title: "Quality Driven",
    subtitle: "Agronomist Approved",
    body: "From initial sourcing to formulation, rigorous quality is the uncompromised standard governing every product decision.",
    chips: ["Lab Analyzed", "Re-Tested"],
    barcode: "|| | ||||| | ||| |||",
    authCode: "LAB-7703-D",
  },
];

function WhyEvergreenSection() {
  return (
    <section className="bg-ivory py-24 lg:py-32" aria-label="Why Evergreen Media">
      <GoldLine />
      <div className="mx-auto max-w-[1440px] px-6 pt-16 lg:px-10">
        {/* Headline */}
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-6">
            <Reveal>
              <SectionLabel index="06">Why Evergreen Media</SectionLabel>
            </Reveal>
            <Reveal delay={0.1}>
              <h2
                className="mt-5 font-display font-medium leading-[0.9] text-forest-deep"
                style={{ fontSize: "clamp(2.8rem, 5.5vw, 5rem)" }}
              >
                Natural Solutions.
                <br />
                <span className="italic text-gold">Purposeful Growth.</span>
              </h2>
            </Reveal>
          </div>
          <div className="col-span-12 flex items-end lg:col-span-5 lg:col-start-8">
            <Reveal delay={0.2}>
              <p className="max-w-md text-sm leading-loose text-ink/60">
                The best growing outcomes come from understanding what the soil, root and plant
                actually need — and sourcing the most considered natural input for each stage.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Pillars as Luxury Name Badge Cards */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_PILLARS.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <Reveal key={pillar.title} delay={i * 0.1} className="h-full">
                <div className="group relative flex h-full flex-col justify-between rounded-3xl border border-gold/35 bg-gradient-to-b from-white via-[#FCFAF7] to-[#F7F4EE] p-6 sm:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all duration-500 hover:-translate-y-2 hover:border-gold hover:shadow-[0_20px_45px_rgba(197,160,89,0.2)] overflow-hidden">
                  
                  {/* Subtle Metallic Foil Shimmer sweep on hover */}
                  <div
                    className="pointer-events-none absolute -inset-full bg-gradient-to-r from-transparent via-white/50 to-transparent rotate-45 -translate-x-[150%] transition-transform duration-1000 ease-out group-hover:translate-x-[150%]"
                    aria-hidden="true"
                  />

                  {/* Top Badge Lanyard Punch-Hole & Clip Detail */}
                  <div className="relative mb-5 flex flex-col items-center">
                    {/* Metallic rivet clip */}
                    <div className="flex items-center gap-1.5 pb-2">
                      <div className="size-1.5 rounded-full bg-gold/70 shadow-xs" />
                      <div className="h-1 w-10 rounded-full bg-gradient-to-r from-gold/40 via-gold to-gold/40 shadow-xs" />
                      <div className="size-1.5 rounded-full bg-gold/70 shadow-xs" />
                    </div>
                    {/* Badge slot cutout with inner depth */}
                    <div className="h-1.5 w-12 rounded-full bg-ink/10 border border-ink/15 shadow-inner" />
                  </div>

                  <div>
                    {/* Badge Serial Header & Status Pill */}
                    <div className="flex items-center justify-between border-b border-ink/8 pb-3.5">
                      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold font-bold">
                        {pillar.badgeId}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-700/20 bg-emerald-50/80 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-emerald-800 font-semibold shadow-xs">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {pillar.tag}
                      </span>
                    </div>

                    {/* Badge Crest Emblem & Titles */}
                    <div className="mt-5 flex items-start gap-4">
                      <div className="relative size-12 shrink-0 rounded-2xl bg-gradient-to-br from-[#1E2E24] to-[#121C16] border border-gold/40 text-gold flex items-center justify-center shadow-md group-hover:scale-105 group-hover:border-gold transition-all duration-300">
                        <Icon className="size-5 text-gold" />
                        {/* Micro corner accent */}
                        <div className="absolute top-1 right-1 size-1 rounded-full bg-gold/70" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-display text-2xl font-medium leading-tight text-forest-deep group-hover:text-gold transition-colors duration-300">
                          {pillar.title}
                        </h3>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/50 font-semibold">
                          {pillar.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Body text */}
                    <p className="mt-4 text-xs sm:text-sm leading-relaxed text-ink/75 font-sans">
                      {pillar.body}
                    </p>

                    {/* Spec chips */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {pillar.chips.map((chip) => (
                        <span
                          key={chip}
                          className="rounded-md border border-ink/10 bg-white/80 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-ink/70"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Badge Footer: Barcode & Auth Seal */}
                  <div className="mt-6 pt-4 border-t border-dashed border-ink/15 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-mono text-[11px] tracking-[0.22em] text-ink/35 select-none font-bold">
                        {pillar.barcode}
                      </span>
                      <span className="font-mono text-[8px] uppercase tracking-widest text-ink/40">
                        AUTH {pillar.authCode}
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.2em] text-forest-deep font-semibold">
                      <ShieldCheck className="size-2.5 text-gold" />
                      <span>OFFICIAL</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
      <GoldLine />
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════
   8. SHOP BY APPLICATION
══════════════════════════════════════════════════════════════════ */
const APPLICATIONS = [
  { label: "Home Gardening", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=75&auto=format&fit=crop" },
  { label: "Terrace Gardening", image: "https://images.unsplash.com/photo-1531971589569-0d9370cbe1e5?w=600&q=75&auto=format&fit=crop" },
  { label: "Nurseries", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=75&auto=format&fit=crop" },
  { label: "Organic Farming", image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&q=75&auto=format&fit=crop" },
  { label: "Vegetable Crops", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=75&auto=format&fit=crop" },
  { label: "Fruit Crops", image: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=600&q=75&auto=format&fit=crop" },
  { label: "Flowering Plants", image: "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=600&q=75&auto=format&fit=crop" },
  { label: "Commercial Agriculture", image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=75&auto=format&fit=crop" },
];

function ShopByApplicationSection() {
  return (
    <section className="bg-parchment py-24 lg:py-32" aria-label="Shop by application">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        <Reveal className="text-center">
          <SectionLabel index="08">Shop by application</SectionLabel>
          <h2
            className="mx-auto mt-5 max-w-2xl font-display font-medium leading-tight text-forest-deep"
            style={{ fontSize: "clamp(2.4rem, 4.5vw, 4rem)" }}
          >
            Find the right solution for your{" "}
            <span className="italic text-gold">growing journey.</span>
          </h2>
        </Reveal>

        {/* Horizontal scroll grid */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-5">
          {APPLICATIONS.map((app, i) => (
            <motion.div
              key={app.label}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
            >
              <Link
                to="/shop"
                className="group relative block overflow-hidden"
                style={{ borderRadius: "min(0.6vw, 6px)" }}
                aria-label={`Shop for ${app.label}`}
              >
                <div className="aspect-square overflow-hidden">
                  <motion.img
                    src={app.image}
                    alt={app.label}
                    loading="lazy"
                    width={400}
                    height={400}
                    className="size-full object-cover"
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <motion.div
                  className="absolute inset-0 flex items-end p-4"
                  style={{
                    background:
                      "linear-gradient(to top, oklch(0.23 0.07 157.2 / 75%) 0%, transparent 60%)",
                  }}
                >
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ivory">
                    {app.label}
                  </span>
                </motion.div>
                {/* Hover arrow */}
                <motion.div
                  className="absolute right-3 top-3 flex size-6 items-center justify-center bg-gold"
                  initial={{ opacity: 0, scale: 0.7 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <ArrowUpRight className="size-3 text-forest-deep" />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════
   9. PROCESS STORY
══════════════════════════════════════════════════════════════════ */
const PROCESS_STEPS = [
  {
    label: "Select",
    step: "01",
    description: "Only ingredients that meet our quality benchmark make it into the range.",
    image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=700&q=80&auto=format&fit=crop",
  },
  {
    label: "Prepare",
    step: "02",
    description: "Carefully processed to preserve biological activity and nutrient integrity.",
    image: "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=700&q=80&auto=format&fit=crop",
  },
  {
    label: "Nurture",
    step: "03",
    description: "Applied at the right moment in your plant's growing cycle for best results.",
    image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=700&q=80&auto=format&fit=crop",
  },
  {
    label: "Grow",
    step: "04",
    description: "The outcome: a healthier soil profile, stronger roots and thriving plants.",
    image: "https://images.unsplash.com/photo-1543257580-7269da773bf5?w=700&q=80&auto=format&fit=crop",
  },
];

function ProcessStorySection() {
  const [active, setActive] = useState(0);

  return (
    <section className="bg-forest-deep py-24 text-ivory lg:py-32" aria-label="Our process">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        {/* Header */}
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-5">
            <Reveal>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold/70">
                (09) — Quality &amp; process
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2
                className="mt-5 font-display font-medium leading-[0.9] text-ivory"
                style={{ fontSize: "clamp(2.8rem, 5vw, 4.5rem)" }}
              >
                Care at <span className="italic text-gold">every stage.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-ivory/55">
                Quality isn't a final check — it's part of how we approach every decision from the
                beginning.
              </p>
            </Reveal>

            {/* Step selector */}
            <div className="mt-10 flex flex-col">
              {PROCESS_STEPS.map((step, i) => (
                <button
                  key={step.label}
                  onClick={() => setActive(i)}
                  className={`flex items-center gap-5 border-b py-5 text-left transition-all ${
                    active === i ? "border-gold" : "border-ivory/10"
                  }`}
                >
                  <span
                    className={`font-mono text-[22px] leading-none transition-colors ${
                      active === i ? "text-gold" : "text-ivory/20"
                    }`}
                  >
                    {step.step}
                  </span>
                  <div>
                    <p
                      className={`font-mono text-[11px] uppercase tracking-[0.25em] transition-colors ${
                        active === i ? "text-ivory" : "text-ivory/40"
                      }`}
                    >
                      {step.label}
                    </p>
                    {active === i && (
                      <motion.p
                        className="mt-1 text-xs text-ivory/55"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                      >
                        {step.description}
                      </motion.p>
                    )}
                  </div>
                  {active === i && (
                    <motion.div
                      className="ml-auto"
                      initial={{ x: -6, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                    >
                      <ArrowRight className="size-3.5 text-gold" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right image */}
          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <AnimatePresence mode="wait">
              <motion.img
                key={active}
                src={PROCESS_STEPS[active]!.image}
                alt={PROCESS_STEPS[active]!.label}
                loading="lazy"
                width={800}
                height={900}
                className="aspect-[4/5] w-full object-cover"
                style={{ borderRadius: "min(0.8vw, 8px)" }}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════
   10. LEARN & GROW
══════════════════════════════════════════════════════════════════ */
const ARTICLES = [
  {
    title: "Understanding Soil Health",
    excerpt:
      "The living ecosystem beneath your feet is the single most important factor in plant performance. Here's how to read and improve it.",
    tag: "Soil Science",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?w=700&q=80&auto=format&fit=crop",
  },
  {
    title: "Choosing the Right Plant Nutrition",
    excerpt:
      "Not all fertilisers are equal. This guide helps you match the right nutrient input to the right stage of your plant's life cycle.",
    tag: "Plant Nutrition",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=700&q=80&auto=format&fit=crop",
  },
  {
    title: "Organic Gardening Essentials",
    excerpt:
      "Building a thriving organic garden is about rhythm and observation. Start with these core principles and trusted natural inputs.",
    tag: "Organic Gardening",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=700&q=80&auto=format&fit=crop",
  },
];

function LearnAndGrowSection() {
  return (
    <section className="bg-ivory py-24 lg:py-32" aria-label="Learn and grow">
      <GoldLine />
      <div className="mx-auto max-w-[1440px] px-6 pt-16 lg:px-10">
        <div className="flex items-end justify-between">
          <Reveal>
            <div>
              <SectionLabel index="10">Knowledge</SectionLabel>
              <h2
                className="mt-4 font-display font-medium leading-tight text-forest-deep"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
              >
                Learn. Grow.{" "}
                <span className="italic text-gold">Thrive.</span>
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <Link
              to="/learn"
              className="hidden items-center gap-2 border-b border-forest/25 pb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-forest transition-all hover:gap-4 hover:text-gold sm:flex"
            >
              All articles <ChevronRight className="size-3" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.map((article, i) => (
            <Reveal key={article.title} delay={i * 0.1}>
              <Link to="/learn" className="group flex flex-col" aria-label={article.title}>
                <div className="overflow-hidden" style={{ borderRadius: "min(0.8vw, 8px)" }}>
                  <motion.img
                    src={article.image}
                    alt={article.title}
                    loading="lazy"
                    width={700}
                    height={467}
                    className="aspect-[3/2] w-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <div className="mt-5 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="bg-gold/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-gold">
                      {article.tag}
                    </span>
                    <span className="font-mono text-[9px] text-ink/35">{article.readTime}</span>
                  </div>
                  <h3 className="font-display text-xl font-medium leading-snug text-forest-deep transition-colors group-hover:text-gold">
                    {article.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-ink/55">{article.excerpt}</p>
                  <div className="mt-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-forest transition-all group-hover:gap-4 group-hover:text-gold">
                    Read article <ArrowRight className="size-3" />
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
      <GoldLine />
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════
   11. CUSTOMER STORIES
══════════════════════════════════════════════════════════════════ */
const TESTIMONIALS = [
  {
    quote:
      "The Pseudomonas culture made a noticeable difference to how my tomato seedlings established. The root ball looked genuinely healthier at transplant.",
    author: "Priya M.",
    role: "Home grower, Bengaluru",
    rating: 5,
  },
  {
    quote:
      "I've been using the Vermicompost and Cocopeat blend for my terrace garden for two seasons. The soil texture and moisture retention have improved significantly.",
    author: "Arjun S.",
    role: "Terrace gardener, Chennai",
    rating: 5,
  },
  {
    quote:
      "VAM with our nursery stock has been a reliable addition. Root development on transplants is consistently better compared to our previous approach.",
    author: "Kavitha R.",
    role: "Nursery owner, Coimbatore",
    rating: 5,
  },
];

function CustomerStoriesSection() {
  const [active, setActive] = useState(0);

  return (
    <section className="bg-parchment py-24 lg:py-32" aria-label="Customer stories">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        <Reveal className="text-center">
          <SectionLabel index="11">Grower stories</SectionLabel>
          <h2
            className="mx-auto mt-4 max-w-lg font-display font-medium leading-tight text-forest-deep"
            style={{ fontSize: "clamp(2.4rem, 4.5vw, 4rem)" }}
          >
            What growers are <span className="italic text-gold">saying.</span>
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <motion.div
                className={`flex h-full cursor-pointer flex-col justify-between border p-8 transition-all ${
                  active === i
                    ? "border-gold bg-ivory shadow-lg"
                    : "border-ink/10 bg-ivory/60 hover:border-ink/25"
                }`}
                onClick={() => setActive(i)}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.25 }}
              >
                {/* Stars */}
                <div className="flex gap-1">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="size-3 fill-gold text-gold" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="mt-5 font-display text-lg font-medium leading-snug text-forest-deep">
                  "{t.quote}"
                </blockquote>

                {/* Author */}
                <div className="mt-6 flex items-center gap-3 border-t border-ink/10 pt-5">
                  <div
                    className="flex size-8 items-center justify-center bg-forest text-ivory font-mono text-xs"
                    aria-hidden="true"
                  >
                    {t.author[0]}
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/80">
                      {t.author}
                    </p>
                    <p className="font-mono text-[9px] text-ink/40">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>

        {/* Pagination dots */}
        <div className="mt-8 flex justify-center gap-2">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-px transition-all ${
                active === i ? "w-8 bg-gold" : "w-4 bg-ink/25"
              }`}
              aria-label={`View testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════
   12. FINAL CTA
══════════════════════════════════════════════════════════════════ */
function FinalCtaSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      aria-label="Call to action"
    >
      {/* Parallax background */}
      <div className="relative h-[80vh] min-h-[520px] overflow-hidden">
        <motion.img
          src={IMG.cta}
          alt="Lush healthy crops growing in natural sunlight"
          loading="lazy"
          width={1600}
          height={900}
          className="size-full object-cover"
          style={{ y: imgY }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, oklch(0.23 0.07 157.2 / 75%) 0%, oklch(0.18 0.05 157.2 / 85%) 100%)",
          }}
        />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <Reveal>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-gold/70">
              (12) — Start here
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2
              className="mx-auto mt-5 max-w-3xl font-display font-medium leading-[0.88] text-ivory"
              style={{ fontSize: "clamp(3rem, 7vw, 7.5rem)" }}
            >
              Give your plants
              <br />
              <span className="italic text-gold">a better foundation.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-ivory/60">
              Explore the full Evergreen Media range — natural inputs for every stage of your
              growing journey.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
              <Link
                to="/shop"
                className="flex items-center gap-2 bg-gold px-8 py-4 font-mono text-[10px] uppercase tracking-[0.25em] text-forest-deep transition-all hover:bg-ivory hover:-translate-y-0.5 hover:shadow-xl"
              >
                Shop Products
                <ArrowRight className="size-3" />
              </Link>
              <Link
                to="/categories"
                className="flex items-center gap-2 border border-ivory/35 px-8 py-4 font-mono text-[10px] uppercase tracking-[0.25em] text-ivory transition-all hover:border-ivory hover:bg-ivory/10"
              >
                Explore Solutions
                <ArrowUpRight className="size-3" />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

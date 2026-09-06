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
  ChevronRight,
  Leaf,
  Microscope,
  ShieldCheck,
  Sprout,
  Star,
  Sun,
  Zap,
} from "lucide-react";
import { useRef, useState } from "react";
import heroImage from "@/assets/evergreen-hero.jpg";
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
    "https://images.unsplash.com/photo-1599686300821-42a9a38bb975?w=800&q=80&auto=format&fit=crop",
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
    "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4e1?w=700&q=80&auto=format&fit=crop",
  healthierGrowth:
    "https://images.unsplash.com/photo-1504198322253-cfa87a0ff60f?w=700&q=80&auto=format&fit=crop",
  floweringFruiting:
    "https://images.unsplash.com/photo-1490750967868-88df5691cc97?w=700&q=80&auto=format&fit=crop",
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
    "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4e1?w=600&q=75&auto=format&fit=crop",
  vegCrops:
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=75&auto=format&fit=crop",
  fruitCrops:
    "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=600&q=75&auto=format&fit=crop",
  floweringPlants:
    "https://images.unsplash.com/photo-1490750967868-88df5691cc97?w=600&q=75&auto=format&fit=crop",
  commercialAg:
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=75&auto=format&fit=crop",
  // Process
  select:
    "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=700&q=80&auto=format&fit=crop",
  prepare:
    "https://images.unsplash.com/photo-1599686300821-42a9a38bb975?w=700&q=80&auto=format&fit=crop",
  nurture:
    "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=700&q=80&auto=format&fit=crop",
  grow: "https://images.unsplash.com/photo-1504198322253-cfa87a0ff60f?w=700&q=80&auto=format&fit=crop",
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
      <AgriculturalJourneySection />
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
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.6], [0.52, 0.72]);

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-[100svh] items-end overflow-hidden"
      aria-label="Hero"
    >
      {/* Parallax image */}
      <motion.div className="absolute inset-0 scale-110" style={{ y: imgY }}>
        <img
          src={IMG.hero}
          alt="Sunlit agricultural field with rich green crops"
          width={1920}
          height={1080}
          className="size-full object-cover"
          priority-fetch="high"
        />
      </motion.div>

      {/* Gradient overlay */}
      <motion.div
        className="absolute inset-0"
        style={{
          opacity: overlayOpacity,
          background:
            "linear-gradient(160deg, oklch(0.23 0.07 157.2) 0%, oklch(0.18 0.05 157.2) 100%)",
        }}
      />

      {/* Bottom gradient for text legibility */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, oklch(0.23 0.07 157.2 / 85%) 0%, transparent 100%)",
        }}
      />

      {/* Floating organic detail — top right */}
      <motion.div
        className="absolute right-8 top-24 hidden lg:block"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex flex-col items-end gap-2 opacity-40">
          <div className="h-px w-16 bg-gold" />
          <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-gold">
            Natural
          </span>
          <Leaf className="size-4 text-gold" />
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 right-8 hidden flex-col items-center gap-3 lg:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <div className="h-12 w-px bg-ivory/25" />
        <span
          className="font-mono text-[9px] uppercase tracking-[0.35em] text-ivory/50"
          style={{ writingMode: "vertical-rl" }}
        >
          Scroll
        </span>
      </motion.div>

      {/* Hero text */}
      <motion.div
        className="relative mx-auto w-full max-w-[1440px] px-6 pb-16 lg:px-10 lg:pb-24"
        style={{ y: textY }}
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-4"
        >
          <div className="h-px w-10 bg-gold/70" />
          <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-gold">
            Evergreen Media · MEX
          </span>
        </motion.div>

        {/* Main headline */}
        <div className="mt-5 overflow-hidden">
          <motion.h1
            className="font-display font-medium leading-[0.88] text-ivory"
            style={{ fontSize: "clamp(3.8rem, 9.5vw, 9.5rem)" }}
            initial={{ opacity: 0, y: "60%" }}
            animate={{ opacity: 1, y: "0%" }}
            transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            Grow Better.
            <br />
            <span className="italic text-gold">Nourish Naturally.</span>
          </motion.h1>
        </div>

        {/* Subtext + CTAs */}
        <motion.div
          className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="max-w-sm text-sm leading-relaxed text-ivory/75">
            Premium agricultural solutions for healthier soil, stronger roots and thriving plants.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <Link
              to="/shop"
              className="flex items-center gap-2 bg-gold px-6 py-3.5 font-mono text-[10px] uppercase tracking-[0.22em] text-forest-deep transition-all hover:bg-ivory hover:-translate-y-0.5 hover:shadow-lg"
            >
              Shop Products
              <ArrowRight className="size-3" />
            </Link>
            <Link
              to="/categories"
              className="flex items-center gap-2 border border-ivory/35 px-6 py-3.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ivory transition-all hover:border-ivory hover:bg-ivory/8"
            >
              Explore Solutions
              <ArrowUpRight className="size-3" />
            </Link>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          className="mt-12 grid grid-cols-3 gap-6 border-t border-ivory/15 pt-8 sm:w-fit sm:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 1.0 }}
        >
          {[
            ["6+", "Product Range"],
            ["100%", "Natural Inputs"],
            ["All", "Crop Types"],
          ].map(([num, label]) => (
            <div key={label} className="flex flex-col gap-1">
              <span className="font-display text-2xl font-medium text-gold">{num}</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-ivory/50">
                {label}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>
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
              <h3 className="mt-1 font-display text-xl font-medium text-ivory">{("short" in cat ? cat.short : cat.name) as string}</h3>
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
   5. SHOP BY NEED
══════════════════════════════════════════════════════════════════ */
const NEEDS = [
  {
    label: "Stronger Roots",
    description:
      "Build resilient root systems with VAM mycorrhizal inoculant and Pseudomonas microbial culture.",
    image:
      "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=700&q=80&auto=format&fit=crop",
    icon: Sprout,
    productIds: ["pseudomonas", "vam"],
  },
  {
    label: "Better Soil Health",
    description:
      "Enrich your growing medium with Vermi Compost, Trichoderma and Azospirillum for a living, productive soil.",
    image:
      "https://images.unsplash.com/photo-1599686300821-42a9a38bb975?w=700&q=80&auto=format&fit=crop",
    icon: Leaf,
    productIds: ["vermicompost", "trichoderma", "azospirillum"],
  },
  {
    label: "Natural Nutrition",
    description:
      "Feed your plants with Fish Amino Acid, Panchakaviyam and Bone Meal — slow-release organic inputs for every stage.",
    image:
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=700&q=80&auto=format&fit=crop",
    icon: Sun,
    productIds: ["fish-amino-acid", "panchakaviyam", "bone-meal"],
  },
  {
    label: "Healthier Growth",
    description:
      "A full-season approach: combine microbial cultures with organic nutrition for consistent, balanced development.",
    image:
      "https://images.unsplash.com/photo-1504198322253-cfa87a0ff60f?w=700&q=80&auto=format&fit=crop",
    icon: Zap,
    productIds: ["azospirillum", "paspo-bacteria", "neem-cake"],
  },
  {
    label: "Flowering & Fruiting",
    description:
      "Phosphorous-rich Bone Meal and natural liquid manures timed for your best flowering and fruiting results.",
    image:
      "https://images.unsplash.com/photo-1490750967868-88df5691cc97?w=700&q=80&auto=format&fit=crop",
    icon: Star,
    productIds: ["bone-meal", "panchakaviyam", "fish-amino-acid"],
  },
];

function ShopByNeedSection() {
  const [active, setActive] = useState(0);

  return (
    <section className="bg-forest-deep py-24 text-ivory lg:py-32" aria-label="Shop by need">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        <div className="grid grid-cols-12 gap-x-8 gap-y-12">
          {/* Left — heading + nav */}
          <div className="col-span-12 lg:col-span-4">
            <Reveal>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold/70">
                (05) — Shop by need
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2
                className="mt-5 font-display font-medium leading-[0.9] text-ivory"
                style={{ fontSize: "clamp(2.8rem, 5vw, 4.5rem)" }}
              >
                What do your{" "}
                <span className="italic text-gold">plants need?</span>
              </h2>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-ivory/55">
                Every growing challenge has a natural solution. Choose what matters most to your
                plants right now.
              </p>
            </Reveal>

            {/* Tab list */}
            <div className="mt-10 flex flex-col">
              {NEEDS.map((need, i) => {
                const Icon = need.icon;
                return (
                  <button
                    key={need.label}
                    onClick={() => setActive(i)}
                    className={`group flex items-center gap-4 border-b py-4 text-left transition-all ${
                      active === i
                        ? "border-gold text-ivory"
                        : "border-ivory/10 text-ivory/45 hover:text-ivory/75"
                    }`}
                  >
                    <div
                      className={`flex size-7 shrink-0 items-center justify-center border transition-colors ${
                        active === i
                          ? "border-gold bg-gold text-forest-deep"
                          : "border-ivory/20 text-ivory/40"
                      }`}
                    >
                      <Icon className="size-3.5" />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
                      {need.label}
                    </span>
                    {active === i && (
                      <motion.div
                        className="ml-auto"
                        initial={{ x: -6, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ArrowRight className="size-3.5 text-gold" />
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right — large image panel */}
          <div className="col-span-12 lg:col-span-7 lg:col-start-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <img
                  src={NEEDS[active]!.image}
                  alt={NEEDS[active]!.label}
                  loading="lazy"
                  width={900}
                  height={600}
                  className="aspect-[3/2] w-full object-cover"
                  style={{ borderRadius: "min(0.8vw, 8px)" }}
                />
                {/* Caption overlay */}
                <div
                  className="absolute inset-x-0 bottom-0 p-8"
                  style={{
                    background:
                      "linear-gradient(to top, oklch(0.23 0.07 157.2 / 85%) 0%, transparent 70%)",
                    borderRadius: "0 0 min(0.8vw, 8px) min(0.8vw, 8px)",
                  }}
                >
                  <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-gold">
                    Solution
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-medium text-ivory">
                    {NEEDS[active]!.label}
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-ivory/65">
                    {NEEDS[active]!.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(NEEDS[active]!.productIds ?? []).map((id) => {
                      const p = products.find((pr) => pr.id === id);
                      if (!p) return null;
                      return (
                        <Link
                          key={id}
                          to="/product/$id"
                          params={{ id }}
                          className="flex items-center gap-1 border border-gold/40 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-gold/80 transition-all hover:border-gold hover:text-gold"
                        >
                          {p.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════
   6. AGRICULTURAL JOURNEY
══════════════════════════════════════════════════════════════════ */
const JOURNEY_STEPS = [
  { label: "Healthy Soil", number: "01" },
  { label: "Strong Roots", number: "02" },
  { label: "Healthy Plants", number: "03" },
  { label: "Better Growth", number: "04" },
];

function AgriculturalJourneySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.08, 1.0]);
  const imgY = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-0"
      aria-label="Agricultural journey"
    >
      {/* Full-width cinematic image */}
      <div className="relative h-[80vh] min-h-[520px] overflow-hidden">
        <motion.img
          src={IMG.journey}
          alt="Lush agricultural field stretching to the horizon in golden light"
          loading="lazy"
          width={1600}
          height={900}
          className="size-full object-cover"
          style={{ scale: imgScale, y: imgY }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, oklch(0.23 0.07 157.2 / 55%) 0%, oklch(0.18 0.05 157.2 / 75%) 100%)",
          }}
        />

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <Reveal>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-gold/80">
              (06) — The journey
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2
              className="mt-5 font-display font-medium leading-[0.88] text-ivory"
              style={{ fontSize: "clamp(3rem, 7vw, 7rem)" }}
            >
              From Soil
              <br />
              <span className="italic text-gold">to Stronger Growth.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-ivory/65">
              A living sequence — healthy soil feeds strong roots, strong roots feed healthy plants,
              and healthy plants simply grow better.
            </p>
          </Reveal>

          {/* Steps */}
          <Reveal delay={0.3} className="mt-10">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {JOURNEY_STEPS.map((step, i) => (
                <div key={step.label} className="flex items-center gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-mono text-[9px] text-gold/60">{step.number}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ivory/80">
                      {step.label}
                    </span>
                  </div>
                  {i < JOURNEY_STEPS.length - 1 && (
                    <ArrowRight className="size-4 shrink-0 text-gold/50" />
                  )}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════
   7. WHY EVERGREEN MEDIA
══════════════════════════════════════════════════════════════════ */
const TRUST_PILLARS = [
  {
    icon: ShieldCheck,
    title: "Premium Quality",
    body: "Every input in our range is selected for consistency, purity and real-world performance across soil types.",
  },
  {
    icon: Sprout,
    title: "Plant Focused",
    body: "We start with the plant's needs, then work backward — choosing inputs that support the whole growing system.",
  },
  {
    icon: Leaf,
    title: "Natural Approach",
    body: "Our range works with living soil biology, not against it. No synthetics. No shortcuts. Just considered natural inputs.",
  },
  {
    icon: Microscope,
    title: "Quality Driven",
    body: "From sourcing to formulation, quality is the standard that governs every product decision we make.",
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
              <SectionLabel index="07">Why Evergreen Media</SectionLabel>
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

        {/* Pillars */}
        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_PILLARS.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <Reveal key={pillar.title} delay={i * 0.1}>
                <div className="flex flex-col gap-5 border-t-2 border-gold/30 pt-6">
                  <div className="flex size-10 items-center justify-center border border-forest/20 text-forest">
                    <Icon className="size-4" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-medium text-forest-deep">
                      {pillar.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink/60">{pillar.body}</p>
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
  { label: "Organic Farming", image: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4e1?w=600&q=75&auto=format&fit=crop" },
  { label: "Vegetable Crops", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=75&auto=format&fit=crop" },
  { label: "Fruit Crops", image: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=600&q=75&auto=format&fit=crop" },
  { label: "Flowering Plants", image: "https://images.unsplash.com/photo-1490750967868-88df5691cc97?w=600&q=75&auto=format&fit=crop" },
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
    image: "https://images.unsplash.com/photo-1599686300821-42a9a38bb975?w=700&q=80&auto=format&fit=crop",
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
    image: "https://images.unsplash.com/photo-1504198322253-cfa87a0ff60f?w=700&q=80&auto=format&fit=crop",
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

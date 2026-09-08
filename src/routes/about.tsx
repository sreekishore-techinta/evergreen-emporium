import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useRef } from "react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Evergreen Media" },
      { name: "description", content: "Evergreen Media — natural agricultural inputs for healthier soil, stronger roots and thriving plants. Our story, philosophy and approach." },
      { property: "og:title", content: "About Evergreen Media" },
    ],
  }),
  component: AboutPage,
});

// ─── Shared images ───────────────────────────────────────────────
const IMG = {
  hero:      "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=1800&q=90&auto=format&fit=crop",
  soil:      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&q=85&auto=format&fit=crop",
  roots:     "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=900&q=85&auto=format&fit=crop",
  plant:     "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=85&auto=format&fit=crop",
  growth:    "https://images.unsplash.com/photo-1543257580-7269da773bf5?w=900&q=85&auto=format&fit=crop",
  field:     "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1400&q=85&auto=format&fit=crop",
  organic:   "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=900&q=85&auto=format&fit=crop",
  nursery:   "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80&auto=format&fit=crop",
  terrace:   "https://images.unsplash.com/photo-1444930694458-01babf71870c?w=700&q=80&auto=format&fit=crop",
  homeGarden:"https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=700&q=80&auto=format&fit=crop",
  farmer:    "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=700&q=80&auto=format&fit=crop",
  commercial:"https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=700&q=80&auto=format&fit=crop",
  vegCrops:  "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=700&q=80&auto=format&fit=crop",
  cta:       "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=1600&q=85&auto=format&fit=crop",
};

// ─── Scroll reveal ────────────────────────────────────────────────
function Reveal({
  children, className = "", delay = 0, y = 32,
}: {
  children: React.ReactNode; className?: string; delay?: number; y?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ─── Eyebrow label ────────────────────────────────────────────────
function Eyebrow({ children }: { children: string }) {
  return (
    <p className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-gold">
      <span className="h-px w-6 bg-gold" />
      {children}
    </p>
  );
}

// ─── Products data ────────────────────────────────────────────────
const PRODUCT_FAMILIES = [
  {
    number: "01",
    family: "Bio & Microbial Solutions",
    color: "#2d5a3e",
    bg: "#eaf4ee",
    products: ["Pseudomonas", "VAM", "Azospirillum", "PASPO Bacteria", "Trichoderma"],
    description: "Live microbial cultures that work with soil biology to protect roots, fix nitrogen and build resilient plants from the ground up.",
    image: IMG.soil,
  },
  {
    number: "02",
    family: "Organic Fertilizers & Plant Nutrition",
    color: "#5c4a1e",
    bg: "#f9f3e8",
    products: ["Vermi Compost", "Bone Meal Powder", "Neem Cake Powder", "Fish Amino Acid", "Panchakaviyam"],
    description: "Natural, slow-release organic inputs that feed plants through every stage — from seedling establishment to flowering and harvest.",
    image: IMG.organic,
  },
  {
    number: "03",
    family: "Growing Media",
    color: "#3a5c45",
    bg: "#edf5f1",
    products: ["Cocopeat", "Potting Mix"],
    description: "Premium root substrates engineered for optimal aeration, moisture retention and healthy root development across all growing systems.",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=900&q=85&auto=format&fit=crop",
  },
];

const STORY_STEPS = [
  { label: "Soil", desc: "Every outcome begins below the surface. We build from the ground up — enriching the living matrix that feeds everything above it.", image: IMG.soil, num: "01" },
  { label: "Roots", desc: "Strong, deep roots are not an accident. They are the result of biology working correctly — and we provide the inputs that make that possible.", image: IMG.roots, num: "02" },
  { label: "Plant", desc: "A plant in the right conditions doesn't struggle. It simply grows — using the energy it would otherwise spend fighting the environment.", image: IMG.plant, num: "03" },
  { label: "Growth", desc: "Consistent, abundant growth — season after season. That is the goal, and it is only possible when everything beneath it is working as it should.", image: IMG.growth, num: "04" },
];

const PRINCIPLES = [
  {
    number: "01",
    title: "Natural by Choice",
    body: "We don't use synthetic shortcuts because we don't need to. Every input in our range is selected from natural, organic and microbial sources that work with biology, not against it.",
  },
  {
    number: "02",
    title: "Quality with Purpose",
    body: "Quality is not a label — it is a discipline. From how we source to how we formulate, every decision is measured against one standard: does this genuinely help the plant?",
  },
  {
    number: "03",
    title: "Soil First",
    body: "We start with the soil. A living, balanced soil profile is the foundation for every healthy plant outcome. Fix the soil and everything above it follows.",
  },
  {
    number: "04",
    title: "Grower Focused",
    body: "Whether you grow on a terrace or across hundreds of acres, our range is designed around what you actually need — clear inputs, honest information and real results.",
  },
];

const WHO_WE_SERVE = [
  { label: "Home Growers",          image: IMG.homeGarden },
  { label: "Terrace Gardeners",     image: IMG.terrace    },
  { label: "Nurseries",             image: IMG.nursery    },
  { label: "Organic Growers",       image: IMG.farmer     },
  { label: "Vegetable Farmers",     image: IMG.vegCrops   },
  { label: "Commercial Agriculture",image: IMG.commercial },
];

// ═══════════════════════════════════════════════════════════════════
function AboutPage() {
  return (
    <main className="bg-ivory text-ink overflow-x-hidden">
      <HeroSection />
      <BrandIntroSection />
      <OurStorySection />
      <PhilosophySection />
      <PrinciplesSection />
      <ProductWorldSection />
      <QualitySection />
      <FinalCtaSection />
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 1. HERO
// ═══════════════════════════════════════════════════════════════════
function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"], layoutEffect: false });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  return (
    <section ref={ref} className="relative min-h-[92vh] overflow-hidden" aria-label="About hero">
      {/* Parallax image */}
      <motion.div className="absolute inset-0 scale-110" style={{ y: imgY }}>
        <img
          src={IMG.hero}
          alt="Lush green field under natural golden light"
          width={1800}
          height={1000}
          className="size-full object-cover object-center"
        />
      </motion.div>

      {/* Minimal dark scrim — just enough for text legibility, no white wash */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(10,22,12,0.70) 0%, rgba(10,22,12,0.25) 50%, rgba(10,22,12,0.10) 100%)" }}
      />

      {/* Content — vertically centred with bottom anchor */}
      <div className="relative z-10 flex min-h-[92vh] flex-col justify-center pb-10 pt-24 lg:justify-end lg:pb-20">
        <div className="mx-auto w-full max-w-[1440px] px-6 lg:px-10">

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mb-6 flex items-center gap-3"
          >
            <div className="h-px w-10 bg-ivory/50" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-ivory/60">
              Evergreen Media · Our Story
            </span>
          </motion.div>

          {/* Two-column grid: headline left, descriptor right */}
          <div className="grid grid-cols-12 items-end gap-8">

            {/* Headline */}
            <div className="col-span-12 lg:col-span-7">
              <div className="overflow-hidden">
                <motion.h1
                  className="font-display font-bold leading-[0.88] text-ivory"
                  style={{ fontSize: "clamp(3.2rem, 7.5vw, 8.5rem)", letterSpacing: "-0.03em" }}
                  initial={{ y: "105%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  Growing
                  <br />
                  <span className="italic text-ivory">
                    with Purpose.
                  </span>
                </motion.h1>
              </div>

              {/* Stat row */}
              <motion.div
                className="mt-8 flex flex-wrap items-center gap-6 lg:gap-10"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.8 }}
              >
                {[
                  { value: "12+", label: "Products" },
                  { value: "3", label: "Categories" },
                  { value: "100%", label: "Natural" },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col gap-0.5">
                    <span
                      className="font-display font-bold leading-none text-ivory"
                      style={{ fontSize: "clamp(1.6rem, 3vw, 2.8rem)" }}
                    >
                      {s.value}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-ivory/50">
                      {s.label}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Descriptor */}
            <div className="col-span-12 lg:col-span-4 lg:col-start-9 lg:pb-3">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="text-sm leading-[1.8] text-ivory/75">
                  Evergreen Media sources and formulates premium natural agricultural inputs
                  — biofertilizers, organic nutrition and growing media — for growers who
                  understand that great outcomes begin below the surface.
                </p>
                <Link
                  to="/shop"
                  className="mt-6 inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-ivory transition-all hover:gap-4 hover:text-ivory/70"
                >
                  Explore our range <ArrowRight className="size-3" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 2. BRAND INTRODUCTION
// ═══════════════════════════════════════════════════════════════════
function BrandIntroSection() {
  return (
    <section className="bg-ivory py-20 lg:py-28" aria-label="Brand introduction">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        <div className="grid grid-cols-12 gap-x-12 gap-y-10 items-center">

          {/* Left — large editorial text */}
          <div className="col-span-12 lg:col-span-6">
            <Reveal>
              <Eyebrow>Our approach</Eyebrow>
            </Reveal>
            <Reveal delay={0.1}>
              <h2
                className="mt-5 font-display font-bold leading-[0.88] text-forest-deep"
                style={{ fontSize: "clamp(2.4rem, 5vw, 5rem)", letterSpacing: "-0.03em" }}
              >
                More than inputs.
                <br />
                <span className="italic text-gold">A foundation for better growing.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-7 max-w-md text-base leading-loose text-ink/65">
                Evergreen Media was built on one conviction: the best growing outcomes come from
                working with nature, not against it. Our range — spanning microbial cultures,
                organic fertilisers, soil conditioners and growing media — is designed to support
                the way soil and plants actually function.
              </p>
            </Reveal>
            <Reveal delay={0.25}>
              <p className="mt-4 max-w-md text-base leading-loose text-ink/65">
                We don't cut corners, replace biology with chemicals, or chase shortcuts. We source
                with care, formulate with intent and present everything clearly — so every grower
                can make the right choice for their plants.
              </p>
            </Reveal>
          </div>

          {/* Right — split image pair */}
          <div className="col-span-12 lg:col-span-5 lg:col-start-8">
            <Reveal delay={0.15} y={48}>
              <div className="relative">
                <img
                  src={IMG.soil}
                  alt="Young plant growing from rich soil with natural fertilizer — the foundation for better growing"
                  loading="lazy"
                  className="aspect-[4/5] w-full rounded-2xl object-cover"
                />
                {/* Floating stat card */}
                <motion.div
                  className="absolute -bottom-6 -left-6 rounded-2xl bg-forest-deep p-5 shadow-2xl"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-gold/70">
                    Our range
                  </p>
                  <p className="mt-1 font-display text-3xl font-bold text-ivory">12+</p>
                  <p className="mt-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-ivory/50">
                    Natural products
                  </p>
                </motion.div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 3. OUR STORY
// ═══════════════════════════════════════════════════════════════════
function OurStorySection() {
  return (
    <section
      className="relative overflow-hidden bg-[#FCFAF7] py-24 lg:py-36 border-y border-ink/8"
      aria-label="Our story"
    >
      {/* Subtle dot-grid texture — dark on light */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.6) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto max-w-[1440px] px-6 lg:px-10">

        {/* ── Header row ── */}
        <div className="mb-20 grid grid-cols-12 items-end gap-8 lg:mb-24">
          <div className="col-span-12 lg:col-span-6">
            <Reveal>
              <span className="inline-flex items-center gap-3 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-gold">
                <span className="h-px w-8 bg-gold/60" />
                Our story
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2
                className="mt-5 font-display font-bold leading-[0.88] text-forest-deep"
                style={{ fontSize: "clamp(2.8rem, 6vw, 6.5rem)", letterSpacing: "-0.03em" }}
              >
                Better growing
                <br />
                <span className="italic" style={{ color: "oklch(0.64 0.09 77.6)" }}>
                  beneath the surface.
                </span>
              </h2>
            </Reveal>
          </div>
          <div className="col-span-12 lg:col-span-5 lg:col-start-8 lg:pb-2">
            <Reveal delay={0.2}>
              <p className="text-sm leading-loose text-ink/60">
                Every healthy plant outcome follows a sequence. We built our entire range around
                understanding that sequence — and supplying the right natural input at each stage.
              </p>
            </Reveal>
          </div>
        </div>

        {/* ── Story steps — alternating layout ── */}
        <div className="flex flex-col gap-0">
          {STORY_STEPS.map((step, i) => {
            const isEven = i % 2 === 0;
            const accents = [
              { line: "#7ab893", num: "#4a7c59" },
              { line: "#c9b88a", num: "#8a7355" },
              { line: "#8ab8a8", num: "#3d7068" },
              { line: "#d4b896", num: "#6b5e45" },
            ][i];
            return (
              <Reveal key={step.label} delay={i * 0.08}>
                <div
                  className={`group grid grid-cols-12 items-center gap-8 border-t border-ink/10 py-12 lg:py-16 ${
                    i === STORY_STEPS.length - 1 ? "border-b border-ink/10" : ""
                  }`}
                >
                  {/* Step number — always col 1 */}
                  <div className="col-span-2 lg:col-span-1">
                    <span
                      className="font-display font-bold leading-none select-none"
                      style={{
                        fontSize: "clamp(3rem, 6vw, 6rem)",
                        color: accents.num,
                        opacity: 0.35,
                        letterSpacing: "-0.04em",
                      }}
                    >
                      {step.num}
                    </span>
                  </div>

                  {/* Image — alternates left / right on desktop */}
                  <div
                    className={`col-span-10 sm:col-span-5 lg:col-span-4 ${
                      !isEven ? "lg:order-last lg:col-start-9" : "lg:col-start-2"
                    }`}
                  >
                    <div className="relative overflow-hidden rounded-2xl">
                      <div className="aspect-[4/3] overflow-hidden">
                        <motion.img
                          src={step.image}
                          alt={step.label}
                          loading="lazy"
                          className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                      </div>
                      {/* Coloured bottom accent bar */}
                      <div
                        className="absolute inset-x-0 bottom-0 h-1 rounded-b-2xl"
                        style={{ background: accents.line }}
                      />
                    </div>
                  </div>

                  {/* Text — fills remaining columns */}
                  <div
                    className={`col-span-12 lg:col-span-5 ${
                      !isEven ? "lg:col-start-3" : "lg:col-start-7"
                    }`}
                  >
                    {/* Accent line */}
                    <div
                      className="mb-4 h-0.5 w-10 rounded-full"
                      style={{ background: accents.line }}
                    />
                    <h3
                      className="font-display font-bold leading-tight text-forest-deep"
                      style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)", letterSpacing: "-0.02em" }}
                    >
                      {step.label}
                    </h3>
                    <p className="mt-4 max-w-md text-sm leading-loose text-ink/65">
                      {step.desc}
                    </p>

                    {/* Connector arrow to next step */}
                    {i < STORY_STEPS.length - 1 && (
                      <div className="mt-6 flex items-center gap-2">
                        <span
                          className="font-mono text-[9px] uppercase tracking-[0.14em]"
                          style={{ color: accents.line, opacity: 0.6 }}
                        >
                          Next → {STORY_STEPS[i + 1].label}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* ── Closing statement ── */}
        <Reveal delay={0.2}>
          <div
            className="mt-16 rounded-2xl border border-gold/30 bg-gradient-to-r from-white via-[#FCFAF7] to-white px-8 py-10 text-center shadow-xl lg:mt-20 lg:px-16 lg:py-14"
          >
            <p
              className="mx-auto font-display font-bold italic text-forest-deep"
              style={{ fontSize: "clamp(1.4rem, 3vw, 2.4rem)", maxWidth: "28ch", letterSpacing: "-0.02em" }}
            >
              "Understand what's happening below the surface — and everything above it responds."
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 4. PHILOSOPHY
// ═══════════════════════════════════════════════════════════════════
// 4. PHILOSOPHY
// ═══════════════════════════════════════════════════════════════════
function PhilosophySection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"], layoutEffect: false });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  return (
    <section
      ref={ref}
      className="overflow-hidden py-20 lg:py-28"
      style={{ background: "#f7f4ee" }}
      aria-label="Our philosophy"
    >
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        <div className="grid grid-cols-12 items-center gap-10 lg:gap-16">

          {/* ── LEFT — text column ── */}
          <div className="col-span-12 lg:col-span-6">

            {/* Eyebrow */}
            <Reveal>
              <span className="inline-flex items-center gap-3 font-mono text-[9px] font-bold uppercase tracking-[0.14em]" style={{ color: "#8a9e7a" }}>
                <span className="h-px w-8 flex-shrink-0" style={{ background: "#8a9e7a" }} />
                Our philosophy
              </span>
            </Reveal>

            {/* Headline */}
            <Reveal delay={0.1}>
              <h2
                className="mt-5 font-display font-bold leading-[0.9]"
                style={{ fontSize: "clamp(2.6rem, 5.5vw, 5.5rem)", letterSpacing: "-0.03em", color: "#1e2d1a" }}
              >
                We believe better growing
                <br />
                <span className="italic" style={{ color: "oklch(0.64 0.09 77.6)" }}>
                  starts from the ground up.
                </span>
              </h2>
            </Reveal>

            {/* Divider */}
            <Reveal delay={0.15}>
              <div className="my-7 h-px w-16" style={{ background: "oklch(0.64 0.09 77.6 / 40%)" }} />
            </Reveal>

            {/* Body paragraphs */}
            <Reveal delay={0.2}>
              <p className="max-w-lg text-[0.95rem] leading-loose" style={{ color: "#5c6b54" }}>
                The most common reason plants underperform isn't what you see above the soil — it's
                what's happening beneath it. Poor biology, depleted structure, absent microbes. We
                built our range to address exactly that.
              </p>
            </Reveal>
            <Reveal delay={0.25}>
              <p className="mt-4 max-w-lg text-[0.95rem] leading-loose" style={{ color: "#5c6b54" }}>
                At Evergreen Media, we work backward from the outcome. What does this soil need?
                What does this root system need at this stage? Then we source the most purposeful
                natural input we can find — and present it clearly.
              </p>
            </Reveal>

            {/* Bullet points */}
            <Reveal delay={0.3}>
              <ul className="mt-8 flex flex-col gap-4">
                {[
                  { label: "Soil first", body: "A living, balanced soil is the foundation for every healthy plant outcome." },
                  { label: "Biology over chemistry", body: "Microbial cultures and organic matter work with the plant's own systems — not around them." },
                  { label: "Grower focused", body: "Every product decision is governed by one question: does this genuinely help the plant?" },
                ].map((item) => (
                  <li key={item.label} className="flex items-start gap-3">
                    <span
                      className="mt-1.5 size-1.5 shrink-0 rounded-full"
                      style={{ background: "oklch(0.64 0.09 77.6)" }}
                    />
                    <p className="text-sm leading-relaxed" style={{ color: "#5c6b54" }}>
                      <span className="font-semibold" style={{ color: "#1e2d1a" }}>{item.label}:</span>{" "}
                      {item.body}
                    </p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/* ── RIGHT — tall image + floating quote card ── */}
          <div className="col-span-12 lg:col-span-6">
            <Reveal delay={0.15} y={48}>
              <div className="relative">
                {/* Main tall image */}
                <div className="relative overflow-hidden rounded-3xl" style={{ height: "clamp(480px, 65vh, 780px)" }}>
                  <motion.img
                    src={IMG.field}
                    alt="Lush green agricultural field at golden hour"
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover object-center"
                    style={{ y: imgY }}
                  />
                </div>

                {/* Floating quote card — bottom-left overlap */}
                <motion.div
                  className="absolute -bottom-6 -left-5 max-w-[280px] rounded-2xl p-5 shadow-2xl lg:-left-8"
                  style={{ background: "oklch(0.22 0.07 157.2)" }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div
                    className="mb-3 h-px w-10"
                    style={{ background: "oklch(0.64 0.09 77.6 / 60%)" }}
                  />
                  <p className="font-display text-base font-bold italic leading-snug text-ivory">
                    "Not more chemistry.
                    <br />More biology."
                  </p>
                  <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: "rgba(255,255,255,0.40)" }}>
                    Evergreen Media
                  </p>
                </motion.div>
              </div>
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 5. PRINCIPLES
// ═══════════════════════════════════════════════════════════════════
function PrinciplesSection() {
  return (
    <section
      className="py-20 lg:py-28"
      style={{ background: "#f4f0ea" }}
      aria-label="What we stand for"
    >
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        <div className="grid grid-cols-12 gap-x-12 gap-y-10">
          {/* Heading col */}
          <div className="col-span-12 lg:col-span-4">
            <Reveal>
              <Eyebrow>What we stand for</Eyebrow>
            </Reveal>
            <Reveal delay={0.1}>
              <h2
                className="mt-5 font-display font-bold leading-[0.9] text-forest-deep"
                style={{ fontSize: "clamp(2.2rem, 4vw, 4.2rem)", letterSpacing: "-0.03em" }}
              >
                Four things
                <br />
                that never
                <br />
                <span className="italic text-gold">change.</span>
              </h2>
            </Reveal>
          </div>

          {/* Principles col */}
          <div className="col-span-12 lg:col-span-7 lg:col-start-6">
            <div className="flex flex-col divide-y divide-ink/10">
              {PRINCIPLES.map((p, i) => (
                <Reveal key={p.number} delay={i * 0.08}>
                  <div className="grid grid-cols-12 gap-6 py-8">
                    <div className="col-span-1">
                      <span className="font-mono text-[9px] font-bold text-gold/60">{p.number}</span>
                    </div>
                    <div className="col-span-11">
                      <h3
                        className="font-display font-bold text-forest-deep"
                        style={{ fontSize: "clamp(1.3rem, 2vw, 1.8rem)", letterSpacing: "-0.02em" }}
                      >
                        {p.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink/60">{p.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 6. PRODUCT WORLD
// ═══════════════════════════════════════════════════════════════════
function ProductWorldSection() {
  return (
    <section className="bg-ivory py-20 lg:py-28" aria-label="Our product world">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        <div className="mb-12 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Reveal>
              <Eyebrow>Our product world</Eyebrow>
            </Reveal>
            <Reveal delay={0.1}>
              <h2
                className="mt-4 font-display font-bold leading-[0.9] text-forest-deep"
                style={{ fontSize: "clamp(2.2rem, 4.5vw, 4.5rem)", letterSpacing: "-0.03em" }}
              >
                Three families.
                <br />
                <span className="italic text-gold">One purpose.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.15}>
            <p className="max-w-xs text-sm leading-relaxed text-ink/55 lg:text-right">
              Every product in our range is chosen to work as part of a living system — not in isolation.
            </p>
          </Reveal>
        </div>

        {/* Product family cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PRODUCT_FAMILIES.map((fam, i) => (
            <Reveal key={fam.family} delay={i * 0.1}>
              <div className="group flex flex-col overflow-hidden rounded-2xl ring-1 ring-ink/8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                {/* Image */}
                <div className="relative aspect-[3/2] overflow-hidden">
                  <img
                    src={fam.image}
                    alt={fam.family}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${fam.color}ee 0%, transparent 60%)` }} />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <span className="font-mono text-[9px] font-bold text-white/60">{fam.number}</span>
                    <h3
                      className="mt-1 font-display font-bold leading-tight text-white"
                      style={{ fontSize: "clamp(1.1rem, 2vw, 1.4rem)", letterSpacing: "-0.02em" }}
                    >
                      {fam.family}
                    </h3>
                  </div>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col p-5" style={{ background: fam.bg }}>
                  <p className="text-xs leading-relaxed text-ink/65">{fam.description}</p>

                  {/* Product pills */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {fam.products.map((prod) => (
                      <span
                        key={prod}
                        className="rounded-full px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.04em]"
                        style={{ background: "rgba(0,0,0,0.07)", color: fam.color }}
                      >
                        {prod}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* CTA */}
        <Reveal delay={0.3} className="mt-12 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2.5 rounded-full bg-forest px-8 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-deep hover:shadow-xl active:translate-y-0"
          >
            Explore all products <ArrowRight className="size-3.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 7. QUALITY APPROACH
// ═══════════════════════════════════════════════════════════════════
const QUALITY_STEPS = [
  { step: "01", label: "Select",  desc: "Only ingredients that meet our quality standard make it into the range. We evaluate for biological activity, purity and real-world performance." },
  { step: "02", label: "Prepare", desc: "Carefully processed to preserve biological viability, nutrient integrity and effectiveness through application." },
  { step: "03", label: "Nourish", desc: "Applied at the right moment in the growing cycle — each product calibrated for the stage of growth where it delivers the most benefit." },
  { step: "04", label: "Grow",    desc: "The outcome: healthier soil, stronger roots, thriving plants and confident growers with consistent results season after season." },
];

function QualitySection() {
  return (
    <section
      className="py-20 lg:py-28"
      style={{ background: "oklch(0.22 0.07 157.2)" }}
      aria-label="Quality approach"
    >
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        <div className="grid grid-cols-12 gap-x-12 gap-y-10 items-end mb-14">
          <div className="col-span-12 lg:col-span-6">
            <Reveal>
              <Eyebrow>Quality approach</Eyebrow>
            </Reveal>
            <Reveal delay={0.1}>
              <h2
                className="mt-5 font-display font-bold leading-[0.9] text-ivory"
                style={{ fontSize: "clamp(2.2rem, 4.5vw, 4.5rem)", letterSpacing: "-0.03em" }}
              >
                Quality in
                <br />
                <span className="italic text-gold">every choice.</span>
              </h2>
            </Reveal>
          </div>
          <div className="col-span-12 lg:col-span-5 lg:col-start-8">
            <Reveal delay={0.15}>
              <p className="text-base leading-relaxed text-ivory/55">
                Quality isn't a final checkpoint — it's the standard applied to every decision
                from the very first step of sourcing to the moment the product reaches your growing system.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
          {QUALITY_STEPS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1} className="h-full">
              <div
                className="group relative flex h-full flex-col justify-between rounded-2xl p-6 sm:p-7 ring-1 ring-ivory/10 transition-all duration-300 hover:ring-gold/40 hover:bg-white/[0.08]"
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold tracking-widest text-gold/70">
                      STEP {s.step}
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-gold/40 group-hover:bg-gold transition-colors" />
                  </div>
                  <h3
                    className="mt-4 font-display font-bold text-ivory"
                    style={{ fontSize: "clamp(1.5rem, 2vw, 1.9rem)", letterSpacing: "-0.02em" }}
                  >
                    {s.label}
                  </h3>
                  <p className="mt-3 text-xs sm:text-[13px] leading-relaxed text-ivory/60">
                    {s.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-ivory/10 flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-ivory/40">
                    {i === QUALITY_STEPS.length - 1 ? "Cycle Complete" : `Next: Step 0${i + 2}`}
                  </span>
                  <ArrowRight className="size-3.5 text-gold/60 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 8. WHO WE SERVE
// ═══════════════════════════════════════════════════════════════════
function WhoWeServeSection() {
  return (
    <section className="bg-ivory py-20 lg:py-28" aria-label="Who we serve">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        <div className="mb-12">
          <Reveal>
            <Eyebrow>Who we serve</Eyebrow>
          </Reveal>
          <Reveal delay={0.1}>
            <h2
              className="mt-4 font-display font-bold leading-[0.9] text-forest-deep"
              style={{ fontSize: "clamp(2.2rem, 4.5vw, 4.5rem)", letterSpacing: "-0.03em" }}
            >
              Built for every
              <br />
              <span className="italic text-gold">growing journey.</span>
            </h2>
          </Reveal>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
          {WHO_WE_SERVE.map((w, i) => (
            <Reveal key={w.label} delay={i * 0.07}>
              <div className="group relative overflow-hidden rounded-2xl">
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={w.image}
                    alt={w.label}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-108"
                  />
                </div>
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: "linear-gradient(to top, rgba(18,36,20,0.85) 0%, transparent 55%)" }}
                />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-ivory/80">
                    {w.label}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 9. BRAND STATEMENT
// ═══════════════════════════════════════════════════════════════════
function BrandStatementSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"], layoutEffect: false });
  const imgY = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);

  return (
    <section ref={ref} className="relative overflow-hidden" aria-label="Brand statement">
      <div className="relative min-h-[60vh] overflow-hidden">
        <motion.img
          src={IMG.roots}
          alt="Deep root system — the foundation of growth"
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
          style={{ y: imgY, scale: 1.12 }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(160deg, rgba(12,26,14,0.82) 0%, rgba(12,26,14,0.65) 100%)" }}
        />
        <div className="relative z-10 flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
          <Reveal>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-gold/70">
              Evergreen Media
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2
              className="mx-auto mt-5 max-w-4xl font-display font-bold leading-[0.88] text-ivory"
              style={{ fontSize: "clamp(2.8rem, 6.5vw, 7rem)", letterSpacing: "-0.03em" }}
            >
              From healthier soil
              <br />
              <span className="italic text-gold">to stronger growth.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-7 max-w-md text-base leading-relaxed text-ivory/60">
              Every product we make, source and recommend is anchored to one purpose —
              giving every grower the natural foundation their plants deserve.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 10. FINAL CTA
// ═══════════════════════════════════════════════════════════════════
function FinalCtaSection() {
  return (
    <section className="bg-parchment py-12 lg:py-16" aria-label="Call to action">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">

        {/* ── Contained rounded card ── */}
        <motion.div
          className="overflow-hidden rounded-3xl"
          style={{ boxShadow: "0 24px 64px 0 rgba(20,35,20,0.18)" }}
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="grid min-h-[340px] grid-cols-1 lg:grid-cols-2">

            {/* Left — image with floating badge */}
            <div className="relative min-h-[280px] overflow-hidden lg:min-h-0">
              <img
                src={IMG.cta}
                alt="Lush green field at golden hour"
                loading="lazy"
                className="absolute inset-0 size-full object-cover object-center"
              />
              {/* Right-edge fade into dark panel */}
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to right, transparent 55%, rgba(14,24,16,0.88) 100%)" }}
              />
              {/* Floating review badge */}
              <motion.div
                className="absolute bottom-5 left-5 flex items-center gap-3 rounded-full bg-white/95 px-4 py-2.5 shadow-lg backdrop-blur-sm"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.45 }}
              >
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-amber-400 text-xs">★</span>
                  ))}
                </div>
                <div>
                  <p className="font-mono text-[10px] font-bold leading-none" style={{ color: "#1e2d1a" }}>4.9</p>
                  <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-black/40">Trusted by growers</p>
                </div>
              </motion.div>
            </div>

            {/* Right — dark text panel */}
            <div
              className="flex flex-col justify-center px-8 py-10 lg:px-12 lg:py-12"
              style={{ background: "oklch(0.16 0.06 157.2)" }}
            >
              {/* Eyebrow */}
              <Reveal>
                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-gold/60">
                  Natural Agricultural Inputs · MEX
                </span>
              </Reveal>

              {/* Headline */}
              <Reveal delay={0.08}>
                <h2
                  className="mt-3 font-display font-bold leading-[0.92] text-ivory"
                  style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)", letterSpacing: "-0.02em" }}
                >
                  Let's grow
                  <br />
                  <span className="italic text-gold">something better.</span>
                </h2>
              </Reveal>

              {/* Body */}
              <Reveal delay={0.14}>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-ivory/50">
                  Explore the full Evergreen Media range — natural inputs for every stage
                  of your growing journey.
                </p>
              </Reveal>

              {/* Buttons */}
              <Reveal delay={0.2}>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-forest-deep transition-all duration-300 hover:-translate-y-0.5 hover:bg-ivory hover:shadow-xl active:translate-y-0"
                  >
                    Shop Products <ArrowRight className="size-3" />
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 rounded-full border border-ivory/20 px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-ivory/75 transition-all duration-300 hover:-translate-y-0.5 hover:border-ivory/50 hover:text-ivory active:translate-y-0"
                  >
                    Get in Touch <ArrowUpRight className="size-3" />
                  </Link>
                </div>
              </Reveal>

              {/* Trust line */}
              <Reveal delay={0.25}>
                <p className="mt-5 font-mono text-[8px] uppercase tracking-[0.22em] text-ivory/25">
                  100% Natural · All Crop Types · Premium Quality
                </p>
              </Reveal>
            </div>

          </div>
        </motion.div>

        {/* Copyright */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 px-1">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink/30">
            © 2026 Evergreen Media (MEX)
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink/30">
            Natural Agricultural Solutions · Tamil Nadu, India
          </span>
        </div>

      </div>
    </section>
  );
}

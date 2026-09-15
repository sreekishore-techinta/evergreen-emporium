import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PageIntro, SectionLabel } from "@/components/storefront";
import { products } from "@/lib/storefront";

const CTA_IMAGE = "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1600&q=85&auto=format&fit=crop";

export const Route = createFileRoute("/solutions")({
  head: () => ({
    meta: [
      { title: "Solutions — Evergreen Media" },
      {
        name: "description",
        content:
          "Find the right Evergreen Media natural solution for your growing challenge — from soil health to root strength, nutrition and plant protection.",
      },
    ],
  }),
  component: SolutionsPage,
});

// ─── Solution challenges mapped to real PDF products ─────────────
const CHALLENGES = [
  {
    index: "01",
    challenge: "Weak roots & poor soil biology",
    summary:
      "Build a resilient root zone with living microbial cultures that colonise the root system and defend against soil-borne pathogens.",
    productIds: ["pseudomonas", "vam", "trichoderma"],
    image:
      "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=900&q=80&auto=format&fit=crop",
  },
  {
    index: "02",
    challenge: "Low soil nitrogen & fertility",
    summary:
      "Restore natural nitrogen levels and soil fertility through biological nitrogen fixation and phosphate solubilisation — without synthetic inputs.",
    productIds: ["azospirillum", "paspo-bacteria"],
    image:
      "https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?w=900&q=80&auto=format&fit=crop",
  },
  {
    index: "03",
    challenge: "Poor flowering & fruiting",
    summary:
      "Support the reproductive stage with slow-release phosphorus-rich organic inputs timed to enhance flowering, fruiting and crop productivity.",
    productIds: ["bone-meal", "panchakaviyam", "fish-amino-acid"],
    image:
      "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=900&q=80&auto=format&fit=crop",
  },
  {
    index: "04",
    challenge: "Depleted soil & poor organic matter",
    summary:
      "Rebuild soil structure, improve aeration and add essential nutrients with premium organic soil conditioners suited for all growing systems.",
    productIds: ["vermicompost", "neem-cake"],
    image:
      "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=900&q=80&auto=format&fit=crop",
  },
  {
    index: "05",
    challenge: "Poor growing medium & root aeration",
    summary:
      "Create the ideal root environment with premium growing media that deliver superior aeration, water retention and natural fungal protection.",
    productIds: ["cocopeat", "potting-mix"],
    image:
      "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=900&q=80&auto=format&fit=crop",
  },
  {
    index: "06",
    challenge: "Slow growth & low plant energy",
    summary:
      "Stimulate plant metabolism, boost photosynthesis and accelerate growth with amino acid-rich organic liquid inputs.",
    productIds: ["fish-amino-acid", "panchakaviyam", "vermicompost"],
    image:
      "https://images.unsplash.com/photo-1543257580-7269da773bf5?w=900&q=80&auto=format&fit=crop",
  },
];

function SolutionsPage() {
  return (
    <main className="bg-ivory text-ink">
      <div className="mx-auto max-w-[1440px] px-6 pb-24 lg:px-10">
        <PageIntro
          eyebrow="Natural solutions"
          title={
            <>
              The right input for{" "}
              <span className="italic text-gold">every challenge.</span>
            </>
          }
          description="Every growing challenge has a natural answer. Start with the problem and we'll point you to the right product from the Evergreen Media range."
        />

        {/* Challenge cards */}
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {CHALLENGES.map((item, i) => {
            const relatedProducts = item.productIds
              .map((id) => products.find((p) => p.id === id))
              .filter(Boolean) as typeof products;

            return (
              <motion.div
                key={item.index}
                className="group overflow-hidden border border-ink/10 transition-shadow hover:shadow-lg"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.65, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Image */}
                <div className="overflow-hidden">
                  <motion.img
                    src={item.image}
                    alt={item.challenge}
                    loading="lazy"
                    width={900}
                    height={400}
                    className="aspect-[16/7] w-full object-cover"
                    whileHover={{ scale: 1.04 }}
                    transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                    onError={(e) => {
                      // Graceful fallback to verified organic farming image
                      (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=900&q=80&auto=format&fit=crop";
                    }}
                  />
                </div>

                {/* Content */}
                <div className="p-7">
                  <SectionLabel index={item.index}>{item.challenge}</SectionLabel>
                  <h2 className="mt-3 font-display text-2xl font-bold text-forest-deep">
                    {item.challenge}
                  </h2>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-ink">{item.summary}</p>

                  {/* Product chips */}
                  <div className="mt-5 flex flex-wrap gap-2">
                    {relatedProducts.map((p) => (
                      <Link
                        key={p.id}
                        to="/product/$id"
                        params={{ id: p.id }}
                        className="flex items-center gap-1.5 border-2 border-forest px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-forest transition-all duration-200 hover:bg-forest hover:text-ivory hover:shadow-md"
                      >
                        {p.name}
                        <ArrowRight className="size-2.5" />
                      </Link>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA — Premium card */}
        <motion.div
          className="mt-20 overflow-hidden rounded-3xl"
          style={{ boxShadow: "0 24px 64px 0 rgba(20,35,20,0.18)" }}
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="grid min-h-[340px] grid-cols-1 lg:grid-cols-2">

            {/* Left — image + badge */}
            <div className="relative min-h-[260px] overflow-hidden lg:min-h-0">
              <img
                src={CTA_IMAGE}
                alt="Lush green field"
                loading="lazy"
                className="absolute inset-0 size-full object-cover object-center"
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to right, transparent 55%, rgba(14,24,16,0.88) 100%)" }}
              />
              <motion.div
                className="absolute bottom-5 left-5 flex items-center gap-3 rounded-full bg-white/95 px-4 py-2.5 shadow-lg backdrop-blur-sm"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.45 }}
              >
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-xs text-amber-400">★</span>
                  ))}
                </div>
                <div>
                  <p className="font-mono text-[10px] font-bold leading-none" style={{ color: "#1e2d1a" }}>4.9</p>
                  <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-black/40">Trusted by growers</p>
                </div>
              </motion.div>
            </div>

            {/* Right — dark panel */}
            <div
              className="flex flex-col justify-center px-8 py-10 lg:px-12 lg:py-12"
              style={{ background: "oklch(0.16 0.06 157.2)" }}
            >
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-gold/60">
                Natural Agricultural Inputs · MEX
              </span>
              <h2
                className="mt-3 font-display font-bold leading-[0.92] text-ivory"
                style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)", letterSpacing: "-0.02em" }}
              >
                Not sure where
                <br />
                <span className="italic text-gold">to start?</span>
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-ivory/50">
                Browse the full range and filter by category — every product is built around
                what your soil and plants actually need.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-forest-deep transition-all duration-300 hover:-translate-y-0.5 hover:bg-ivory hover:shadow-xl active:translate-y-0"
                >
                  Shop All Products <ArrowRight className="size-3" />
                </Link>
                <Link
                  to="/categories"
                  className="inline-flex items-center gap-2 rounded-full border border-ivory/20 px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-ivory/75 transition-all duration-300 hover:-translate-y-0.5 hover:border-ivory/50 hover:text-ivory active:translate-y-0"
                >
                  Browse Categories <ArrowUpRight className="size-3" />
                </Link>
              </div>
              <p className="mt-5 font-mono text-[8px] uppercase tracking-[0.22em] text-ivory/25">
                100% Natural · All Crop Types · Premium Quality
              </p>
            </div>
          </div>
        </motion.div>

        {/* Copyright */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 px-1">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink/30">© 2026 Evergreen Media (MEX)</span>
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink/30">Natural Agricultural Solutions · Tamil Nadu, India</span>
        </div>
      </div>
    </main>
  );
}

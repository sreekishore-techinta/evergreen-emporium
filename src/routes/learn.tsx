import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PageIntro } from "@/components/storefront";

const CTA_IMAGE = "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1600&q=85&auto=format&fit=crop";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn — Evergreen Media" },
      { name: "description", content: "Growing knowledge, soil science and organic gardening guides from Evergreen Media." },
    ],
  }),
  component: LearnPage,
});

const ARTICLES = [
  {
    title: "Understanding Soil Health",
    excerpt:
      "The living ecosystem beneath your feet is the single most important factor in plant performance. Here's how to read and improve it.",
    tag: "Soil Science",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?w=800&q=80&auto=format&fit=crop",
    related: ["vermicompost", "pseudomonas"],
  },
  {
    title: "Choosing the Right Plant Nutrition",
    excerpt:
      "Not all fertilisers are equal. This guide helps you match the right nutrient input to the right stage of your plant's life cycle.",
    tag: "Plant Nutrition",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80&auto=format&fit=crop",
    related: ["bone-meal", "neem-cake"],
  },
  {
    title: "Organic Gardening Essentials",
    excerpt:
      "Building a thriving organic garden is about rhythm and observation. Start with these core principles and trusted natural inputs.",
    tag: "Organic Gardening",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&q=80&auto=format&fit=crop",
    related: ["vermicompost", "cocopeat"],
  },
  {
    title: "Biofertilizers Explained",
    excerpt:
      "Microbial inoculants like Pseudomonas and VAM work with the soil food web to improve nutrient availability and root health.",
    tag: "Biofertilizers",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&q=80&auto=format&fit=crop",
    related: ["pseudomonas", "vam"],
  },
  {
    title: "Getting the Most from Cocopeat",
    excerpt:
      "Cocopeat is one of the most versatile growing media available. Learn how to use it in containers, seed trays and soil blends.",
    tag: "Growing Media",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80&auto=format&fit=crop",
    related: ["cocopeat"],
  },
  {
    title: "Terrace Gardening: A Starter Guide",
    excerpt:
      "Limited space doesn't mean limited results. The right growing media, nutrition and containers make all the difference.",
    tag: "Terrace Gardening",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1531971589569-0d9370cbe1e5?w=800&q=80&auto=format&fit=crop",
    related: ["cocopeat", "vermicompost", "bone-meal"],
  },
];

function LearnPage() {
  return (
    <main className="bg-ivory text-ink">
      <div className="mx-auto max-w-[1440px] px-6 pb-24 lg:px-10">
        <PageIntro
          eyebrow="Knowledge"
          title={<>Learn. Grow. <span className="italic text-gold">Thrive.</span></>}
          description="Growing knowledge, soil science and practical guidance for every stage of your growing journey."
        />

        <div className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.map((article) => (
            <article key={article.title} className="group flex flex-col">
              <div className="overflow-hidden rounded-[min(1vw,10px)]">
                <img
                  src={article.image}
                  alt={article.title}
                  loading="lazy"
                  width={800}
                  height={533}
                  className="aspect-[3/2] w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
              <div className="mt-5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="bg-gold/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-gold">
                    {article.tag}
                  </span>
                  <span className="font-mono text-[9px] text-ink/35">{article.readTime}</span>
                </div>
                <h2 className="font-display text-2xl font-medium leading-snug text-forest-deep transition-colors group-hover:text-gold">
                  {article.title}
                </h2>
                <p className="text-sm leading-relaxed text-ink/55">{article.excerpt}</p>
                <div className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-forest transition-all group-hover:gap-4 group-hover:text-gold">
                  Read article <ArrowRight className="size-3" />
                </div>
              </div>
            </article>
          ))}
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
                Ready to put it
                <br />
                <span className="italic text-gold">into practice?</span>
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-ivory/50">
                Find the right natural input for your growing goals — every product is
                backed by the principles you've just read about.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-forest-deep transition-all duration-300 hover:-translate-y-0.5 hover:bg-ivory hover:shadow-xl active:translate-y-0"
                >
                  Shop the Range <ArrowRight className="size-3" />
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

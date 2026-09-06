import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PageIntro, SectionLabel } from "@/components/storefront";
import { products } from "@/lib/storefront";

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
      "https://images.unsplash.com/photo-1490750967868-88df5691cc97?w=900&q=80&auto=format&fit=crop",
  },
  {
    index: "04",
    challenge: "Depleted soil & poor organic matter",
    summary:
      "Rebuild soil structure, improve aeration and add essential nutrients with premium organic soil conditioners suited for all growing systems.",
    productIds: ["vermicompost", "neem-cake"],
    image:
      "https://images.unsplash.com/photo-1599686300821-42a9a38bb975?w=900&q=80&auto=format&fit=crop",
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
      "https://images.unsplash.com/photo-1504198322253-cfa87a0ff60f?w=900&q=80&auto=format&fit=crop",
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
                  />
                </div>

                {/* Content */}
                <div className="p-7">
                  <SectionLabel index={item.index}>{item.challenge}</SectionLabel>
                  <h2 className="mt-3 font-display text-2xl font-medium text-forest-deep">
                    {item.challenge}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-ink/60">{item.summary}</p>

                  {/* Product chips */}
                  <div className="mt-5 flex flex-wrap gap-2">
                    {relatedProducts.map((p) => (
                      <Link
                        key={p.id}
                        to="/product/$id"
                        params={{ id: p.id }}
                        className="flex items-center gap-1.5 border border-forest/20 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-forest transition-all hover:bg-forest hover:text-ivory"
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

        {/* Bottom CTA */}
        <motion.div
          className="mt-20 border-t border-ink/10 pt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-display text-3xl text-forest-deep">
            Not sure where to start?
          </p>
          <p className="mt-3 text-sm text-ink/55">
            Browse the full range and filter by category.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-4">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-forest px-8 py-4 font-mono text-[10px] uppercase tracking-[0.22em] text-ivory transition-colors hover:bg-forest-deep"
            >
              Shop all products <ArrowRight className="size-3" />
            </Link>
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 border border-forest/25 px-8 py-4 font-mono text-[10px] uppercase tracking-[0.22em] text-forest transition-colors hover:bg-forest hover:text-ivory"
            >
              Browse categories <ArrowRight className="size-3" />
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

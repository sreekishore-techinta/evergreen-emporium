import { Link, createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { useState } from "react";
import { PageIntro, SectionLabel } from "@/components/storefront";
import {
  ALL_CATEGORIES,
  CATEGORY_BIO,
  CATEGORY_MEDIA,
  CATEGORY_ORGANIC,
  getProductsByCategory,
  type ProductCategory,
} from "@/lib/storefront";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — Evergreen Media" },
      {
        name: "description",
        content:
          "Explore Evergreen Media's three product categories: Bio & Microbial Solutions, Organic Fertilizers & Plant Nutrition, and Growing Media.",
      },
      { property: "og:title", content: "Categories — Evergreen Media" },
    ],
  }),
  component: CategoriesPage,
});

// ─── Category metadata ────────────────────────────────────────────
const CATEGORY_META: Record<
  ProductCategory,
  { headline: string; body: string; image: string; tag: string }
> = {
  [CATEGORY_BIO]: {
    tag: "01",
    headline: "Bio & Microbial Solutions",
    body: "Live microbial cultures, mycorrhizal inoculants and biofungicides that work with the soil food web to build resilient root zones and protect plants naturally.",
    image:
      "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=1000&q=85&auto=format&fit=crop",
  },
  [CATEGORY_ORGANIC]: {
    tag: "02",
    headline: "Organic Fertilizers & Plant Nutrition",
    body: "Slow-release organic fertilisers, liquid manures and botanical inputs that nourish plants through every stage — from seedling to harvest.",
    image:
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1000&q=85&auto=format&fit=crop",
  },
  [CATEGORY_MEDIA]: {
    tag: "03",
    headline: "Growing Media",
    body: "Premium root substrates — export-quality cocopeat and an 18-in-1 potting mix — engineered for superior aeration, water retention and healthy root development.",
    image:
      "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1000&q=85&auto=format&fit=crop",
  },
};

// ─── Product list within an expanded category ─────────────────────
function ProductPills({ category }: { category: ProductCategory }) {
  const items = getProductsByCategory(category);
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {items.map((p) => (
        <Link
          key={p.id}
          to="/product/$id"
          params={{ id: p.id }}
          className="flex items-center gap-1.5 border border-ivory/25 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-ivory/70 transition-colors hover:border-gold hover:text-gold"
        >
          {p.name}
          <ArrowUpRight className="size-2.5" />
        </Link>
      ))}
    </div>
  );
}

// ─── Single category card ─────────────────────────────────────────
function CategoryCard({
  category,
  index,
  tall,
}: {
  category: ProductCategory;
  index: number;
  tall?: boolean;
}) {
  const meta = CATEGORY_META[category];
  const count = getProductsByCategory(category).length;
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to="/shop"
        className="group relative block overflow-hidden"
        style={{ borderRadius: "min(0.8vw, 8px)" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={`Browse ${meta.headline}`}
      >
        {/* Image */}
        <div className={`overflow-hidden ${tall ? "aspect-[3/4]" : "aspect-[4/3]"}`}>
          <motion.img
            src={meta.image}
            alt={meta.headline}
            loading="lazy"
            width={1000}
            height={tall ? 1333 : 750}
            className="size-full object-cover"
            animate={{ scale: hovered ? 1.07 : 1 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        {/* Gradient */}
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, oklch(0.23 0.07 157.2 / 92%) 0%, oklch(0.23 0.07 157.2 / 10%) 55%, transparent 100%)",
          }}
          animate={{ opacity: hovered ? 1 : 0.85 }}
          transition={{ duration: 0.3 }}
        />

        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-gold/80">
                {meta.tag} — {count} products
              </span>
              <h2 className="mt-1.5 font-display text-2xl font-medium leading-tight text-ivory">
                {meta.headline}
              </h2>
              <motion.p
                className="mt-2 max-w-xs text-xs leading-relaxed text-ivory/60"
                animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }}
                transition={{ duration: 0.3 }}
              >
                {meta.body}
              </motion.p>
            </div>
            <motion.div
              className="flex size-9 shrink-0 items-center justify-center border border-ivory/30"
              animate={{
                rotate: hovered ? 45 : 0,
                borderColor: hovered
                  ? "oklch(0.64 0.09 77.6)"
                  : "oklch(0.956 0.023 89.9 / 30%)",
              }}
              transition={{ duration: 0.3 }}
            >
              <ArrowUpRight className="size-4 text-ivory" />
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Expanded detail row ──────────────────────────────────────────
function CategoryDetailRow({ category }: { category: ProductCategory }) {
  const meta = CATEGORY_META[category];
  const items = getProductsByCategory(category);

  return (
    <motion.div
      className="grid grid-cols-12 gap-8 border-t border-ink/10 py-14"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Left */}
      <div className="col-span-12 md:col-span-4">
        <SectionLabel index={meta.tag}>{meta.headline}</SectionLabel>
        <h2 className="mt-4 font-display text-4xl font-medium leading-tight text-forest-deep">
          {meta.headline}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-ink/60">{meta.body}</p>
        <Link
          to="/shop"
          className="mt-6 inline-flex items-center gap-2 border-b border-forest/25 pb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-forest transition-all hover:gap-4 hover:text-gold"
        >
          Shop {meta.headline} <ChevronRight className="size-3" />
        </Link>
      </div>

      {/* Right — product grid */}
      <div className="col-span-12 md:col-span-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                to="/product/$id"
                params={{ id: product.id }}
                className="group flex flex-col"
                aria-label={product.name}
              >
                <div className="overflow-hidden bg-ivory-soft" style={{ borderRadius: "min(0.6vw, 6px)" }}>
                  <motion.img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    width={300}
                    height={300}
                    className="aspect-square w-full object-cover"
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <div className="mt-2.5">
                  <p className="font-display text-base font-medium leading-snug text-forest-deep transition-colors group-hover:text-gold">
                    {product.name}
                  </p>
                  <p className="mt-0.5 font-mono text-[9px] text-ink/40">{product.weight}</p>
                  <p className="mt-0.5 font-mono text-[10px] font-medium text-ink">
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────
function CategoriesPage() {
  return (
    <main className="bg-ivory text-ink">
      <div className="mx-auto max-w-[1440px] px-6 pb-24 lg:px-10">
        <PageIntro
          eyebrow="Product categories"
          title={
            <>
              Three ranges.{" "}
              <span className="italic text-gold">One purpose.</span>
            </>
          }
          description="Every Evergreen Media product belongs to one of three carefully curated categories — choose by what your growing system needs most."
        />

        {/* Hero category cards */}
        <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-3">
          {ALL_CATEGORIES.map((cat, i) => (
            <CategoryCard key={cat} category={cat} index={i} tall />
          ))}
        </div>

        {/* Summary stat bar */}
        <motion.div
          className="mt-10 grid grid-cols-3 divide-x divide-ink/10 border border-ink/10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {ALL_CATEGORIES.map((cat) => {
            const count = getProductsByCategory(cat).length;
            const meta = CATEGORY_META[cat];
            return (
              <div key={cat} className="px-6 py-5 text-center">
                <p className="font-display text-3xl font-medium text-forest-deep">{count}</p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-ink/50">
                  {meta.headline}
                </p>
              </div>
            );
          })}
        </motion.div>

        {/* Detailed rows with product listings */}
        <div className="mt-16">
          {ALL_CATEGORIES.map((cat) => (
            <CategoryDetailRow key={cat} category={cat} />
          ))}
        </div>
      </div>
    </main>
  );
}

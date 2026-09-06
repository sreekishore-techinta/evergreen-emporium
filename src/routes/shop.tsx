import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageIntro, PremiumProductCard } from "@/components/storefront";
import { ALL_CATEGORIES, products, type ProductCategory } from "@/lib/storefront";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Evergreen Media" },
      {
        name: "description",
        content:
          "Shop Evergreen Media's full range: Bio & Microbial Solutions, Organic Fertilizers & Plant Nutrition, and Growing Media.",
      },
      { property: "og:title", content: "Shop — Evergreen Media" },
    ],
  }),
  component: ShopPage,
});

type SortOption = "Featured" | "Price: Low" | "Price: High" | "Top Rated";

const SORT_OPTIONS: SortOption[] = ["Featured", "Price: Low", "Price: High", "Top Rated"];

function ShopPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ProductCategory | "All">("All");
  const [sort, setSort] = useState<SortOption>("Featured");

  const visible = useMemo(() => {
    return [...products]
      .filter(
        (p) =>
          (category === "All" || p.category === category) &&
          `${p.name} ${p.description} ${p.type}`
            .toLowerCase()
            .includes(query.toLowerCase())
      )
      .sort((a, b) => {
        if (sort === "Price: Low") return a.price - b.price;
        if (sort === "Price: High") return b.price - a.price;
        if (sort === "Top Rated") return b.rating - a.rating;
        return 0; // Featured — preserve catalogue order
      });
  }, [category, query, sort]);

  const hasFilters = query !== "" || category !== "All";

  return (
    <main className="bg-ivory text-ink">
      <div className="mx-auto max-w-[1440px] px-6 pb-24 lg:px-10">
        <PageIntro
          eyebrow="The collection"
          title={
            <>
              Shop the{" "}
              <span className="italic text-gold">range.</span>
            </>
          }
          description="Premium natural inputs for home growers, nurseries and commercial producers — presented with clarity, selected with care."
        />

        {/* Filter bar */}
        <div className="mt-8 flex flex-col gap-5 border-b border-ink/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <div className="flex flex-1 items-center gap-3 border-b border-ink/20 pb-3 lg:max-w-sm lg:pb-0 lg:border-none">
            <Search className="size-4 shrink-0 text-forest" />
            <input
              aria-label="Search products"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink/40"
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Clear search">
                <X className="size-3.5 text-ink/40 hover:text-ink" />
              </button>
            )}
          </div>

          {/* Category filters + sort */}
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="size-4 shrink-0 text-forest" />

            {/* All */}
            <button
              onClick={() => setCategory("All")}
              className={`px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
                category === "All"
                  ? "bg-forest text-ivory"
                  : "text-ink/55 hover:text-forest"
              }`}
            >
              All
            </button>

            {/* Category buttons */}
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
                  category === cat
                    ? "bg-forest text-ivory"
                    : "text-ink/55 hover:text-forest"
                }`}
              >
                {/* Short labels for mobile */}
                <span className="hidden sm:inline">{cat}</span>
                <span className="sm:hidden">
                  {cat === "Bio & Microbial Solutions"
                    ? "Bio"
                    : cat === "Organic Fertilizers & Plant Nutrition"
                    ? "Organic"
                    : "Media"}
                </span>
              </button>
            ))}

            {/* Sort */}
            <select
              aria-label="Sort products"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="ml-2 border-b border-ink/20 bg-transparent py-2 pl-1 pr-6 font-mono text-[10px] uppercase tracking-[0.18em] text-ink outline-none"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active filter + count */}
        <div className="flex items-center justify-between py-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/45">
            {visible.length} product{visible.length !== 1 ? "s" : ""}
            {category !== "All" && (
              <span className="ml-2 text-gold">
                — {category}
              </span>
            )}
          </p>
          {hasFilters && (
            <button
              onClick={() => { setQuery(""); setCategory("All"); }}
              className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/40 transition-colors hover:text-forest"
            >
              <X className="size-3" /> Clear filters
            </button>
          )}
        </div>

        {/* Product grid */}
        <AnimatePresence mode="wait">
          {visible.length > 0 ? (
            <motion.div
              key={`${category}-${query}-${sort}`}
              className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {visible.map((product) => (
                <PremiumProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              className="flex flex-col items-center justify-center py-24 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="font-display text-3xl text-forest-deep">
                No products found.
              </p>
              <p className="mt-3 text-sm text-ink/50">
                Try adjusting your search or filter.
              </p>
              <Button
                onClick={() => { setQuery(""); setCategory("All"); }}
                className="mt-6 rounded-none bg-forest font-mono text-[10px] uppercase tracking-[0.2em] text-ivory hover:bg-forest-deep"
              >
                Clear filters
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category browse strip */}
        {category === "All" && visible.length > 0 && (
          <div className="mt-20 border-t border-ink/10 pt-12">
            <p className="text-center font-mono text-[10px] uppercase tracking-[0.3em] text-ink/40">
              Browse by category
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className="border border-forest/20 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-forest transition-all hover:bg-forest hover:text-ivory"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageIntro, PremiumProductCard } from "@/components/storefront";
import { categoriesApi, useProducts, type ApiCategory, type ProductListParams } from "@/lib/api";

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

const SORT_MAP: Record<SortOption, ProductListParams["sort"]> = {
  "Featured":    "default",
  "Price: Low":  "price_asc",
  "Price: High": "price_desc",
  "Top Rated":   "rating",
};

function ShopPage() {
  const [query, setQuery]             = useState("");
  const [debouncedQuery, setDQ]       = useState("");
  const [categorySlug, setCategorySlug] = useState<string>("all");
  const [sort, setSort]               = useState<SortOption>("Featured");
  const [categories, setCategories]   = useState<ApiCategory[]>([]);
  const [page, setPage]               = useState(1);

  /* ── Debounce search input 300 ms ── */
  useEffect(() => {
    const t = setTimeout(() => { setDQ(query); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [query]);

  /* ── Load categories once ── */
  useEffect(() => {
    categoriesApi.list(true).then((res) => {
      if (res.success && res.data) setCategories(res.data);
    });
  }, []);

  /* ── Build API params ── */
  const params: ProductListParams = {
    page,
    page_size: 16,
    sort: SORT_MAP[sort],
    ...(debouncedQuery ? { search: debouncedQuery } : {}),
    ...(categorySlug !== "all" ? { category_slug: categorySlug } : {}),
  };

  const { data, loading } = useProducts(params);
  const products   = data?.items ?? [];
  const total      = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const hasFilters = query !== "" || categorySlug !== "all";

  function clearFilters() {
    setQuery("");
    setDQ("");
    setCategorySlug("all");
    setPage(1);
  }

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

        {/* ── Filter bar ── */}
        <div className="mt-8 flex flex-col gap-5 border-b border-ink/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <div className="flex flex-1 items-center gap-3 border-b border-ink/20 pb-3 lg:max-w-sm lg:pb-0 lg:border-none">
            <Search className="size-4 shrink-0 text-forest" />
            <input
              aria-label="Search products"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search products…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink/40"
            />
            {query && (
              <button onClick={() => { setQuery(""); setDQ(""); setPage(1); }} aria-label="Clear search">
                <X className="size-3.5 text-ink/40 hover:text-ink" />
              </button>
            )}
          </div>

          {/* Category + sort */}
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="size-4 shrink-0 text-forest" />

            {/* All */}
            <button
              onClick={() => { setCategorySlug("all"); setPage(1); }}
              className={`px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
                categorySlug === "all" ? "bg-forest text-ivory" : "text-ink/55 hover:text-forest"
              }`}
            >
              All
            </button>

            {/* Dynamic category buttons from API */}
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setCategorySlug(cat.slug); setPage(1); }}
                className={`px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
                  categorySlug === cat.slug ? "bg-forest text-ivory" : "text-ink/55 hover:text-forest"
                }`}
              >
                <span className="hidden sm:inline">{cat.name}</span>
                <span className="sm:hidden">
                  {cat.name.split(" ")[0]}
                </span>
              </button>
            ))}

            {/* Sort */}
            <select
              aria-label="Sort products"
              value={sort}
              onChange={(e) => { setSort(e.target.value as SortOption); setPage(1); }}
              className="ml-2 border-b border-ink/20 bg-transparent py-2 pl-1 pr-6 font-mono text-[10px] uppercase tracking-[0.18em] text-ink outline-none"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Count + clear ── */}
        <div className="flex items-center justify-between py-5">
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/45">
            {loading
              ? <Loader2 className="size-3 animate-spin" />
              : <>{total} product{total !== 1 ? "s" : ""}</>
            }
            {categorySlug !== "all" && (
              <span className="text-gold">
                — {categories.find((c) => c.slug === categorySlug)?.name ?? categorySlug}
              </span>
            )}
          </p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/40 transition-colors hover:text-forest"
            >
              <X className="size-3" /> Clear filters
            </button>
          )}
        </div>

        {/* ── Product grid ── */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-4">
                  <div className="aspect-[3/4] w-full animate-pulse rounded bg-ink/8" />
                  <div className="h-3 w-3/4 animate-pulse rounded bg-ink/8" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-ink/8" />
                </div>
              ))}
            </motion.div>
          ) : products.length > 0 ? (
            <motion.div
              key={`${categorySlug}-${debouncedQuery}-${sort}-${page}`}
              className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {products.map((product) => (
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
              <p className="font-display text-3xl text-forest-deep">No products found.</p>
              <p className="mt-3 text-sm text-ink/50">Try adjusting your search or filter.</p>
              <Button
                onClick={clearFilters}
                className="mt-6 rounded-full bg-forest font-mono text-[10px] uppercase tracking-[0.2em] text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-deep hover:shadow-lg active:translate-y-0"
              >
                Clear filters
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="border border-ink/20 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55 transition-colors hover:border-forest hover:text-forest disabled:pointer-events-none disabled:opacity-30"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
                  p === page
                    ? "border-forest bg-forest text-ivory"
                    : "border-ink/20 text-ink/55 hover:border-forest hover:text-forest"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="border border-ink/20 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55 transition-colors hover:border-forest hover:text-forest disabled:pointer-events-none disabled:opacity-30"
            >
              Next
            </button>
          </div>
        )}

        {/* ── Category browse strip ── */}
        {categorySlug === "all" && products.length > 0 && categories.length > 0 && (
          <div className="mt-20 border-t border-ink/10 pt-12">
            <p className="text-center font-mono text-[10px] uppercase tracking-[0.3em] text-ink/40">
              Browse by category
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setCategorySlug(cat.slug); setPage(1); }}
                  className="rounded-full border border-forest/20 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-forest transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest hover:text-ivory hover:shadow-md active:translate-y-0"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

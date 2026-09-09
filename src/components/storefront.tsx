import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Eye,
  Heart,
  Loader2,
  Menu,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Star,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useProductSearch, type ApiProduct } from "@/lib/api";
import { getProduct, products, useStore, type Product } from "@/lib/storefront";

// Unified card product shape — works for both static Product and live ApiProduct
type CardProduct = {
  id: string | number;
  name: string;
  description: string | null;
  type: string | null;
  tagline?: string | null;
  price: number;
  discount_price?: number | null;
  rating: number;
  weight?: string | null;
  image?: string;                // static Product
  primary_image_url?: string;   // ApiProduct
  category?: string;            // static Product
  category_name?: string;       // ApiProduct
  badge?: string | null;
  slug?: string;
};

function cardImage(p: CardProduct): string {
  return p.primary_image_url || p.image || "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=85&auto=format&fit=crop";
}
function cardId(p: CardProduct): string {
  // Prefer slug for API products (cleaner URLs), fall back to numeric id as string
  if (typeof p.id === "string") return p.id;
  return (p as ApiProduct).slug || String(p.id);
}
function cardCategory(p: CardProduct): string {
  return p.category_name ?? p.category ?? "";
}

type StorefrontPath =
  | "/"
  | "/shop"
  | "/categories"
  | "/solutions"
  | "/learn"
  | "/about"
  | "/contact"
  | "/cart"
  | "/checkout"
  | "/wishlist"
  | "/account";

const nav = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Shop", to: "/shop" },
  { label: "Categories", to: "/categories" },
  { label: "Solutions", to: "/solutions" },
  { label: "Learn", to: "/learn" },
] as const;

/* ─── Search Modal ──────────────────────────────────────────────── */
function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, []);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const { results, loading: searchLoading } = useProductSearch(query, 6);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ background: "rgba(18,32,18,0.82)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      {/* Panel */}
      <motion.div
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -16, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full"
        style={{ background: "#1a2e1a" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input row */}
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-6 py-5 lg:px-8">
          <Search className="size-5 shrink-0 text-gold/70" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="flex-1 bg-transparent text-lg text-ivory outline-none placeholder:text-ivory/30"
            aria-label="Search products"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear"
              className="text-ivory/40 transition-colors hover:text-ivory"
            >
              <X className="size-4" />
            </button>
          )}
          <button
            onClick={onClose}
            aria-label="Close search"
            className="ml-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ivory/40 transition-colors hover:text-ivory"
          >
            Esc
          </button>
        </div>

        {/* Divider */}
        <div className="mx-auto max-w-3xl border-t border-ivory/10 px-6 lg:px-8" />

        {/* Results */}
        <AnimatePresence mode="wait">
          {query.trim().length > 0 && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="mx-auto max-w-3xl px-6 py-4 lg:px-8"
            >
              {searchLoading ? (
                <div className="flex items-center justify-center gap-2 py-6 text-ivory/40">
                  <Loader2 className="size-4 animate-spin" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em]">Searching…</span>
                </div>
              ) : results.length > 0 ? (
                <ul className="divide-y divide-ivory/8">
                  {results.map((p) => (
                    <li key={p.id}>
                      <Link
                        to="/product/$id"
                        params={{ id: p.slug || String(p.id) }}
                        onClick={onClose}
                        className="group flex items-center gap-4 py-3 transition-colors hover:text-gold"
                      >
                        <img
                          src={p.primary_image_url || ""}
                          alt={p.name}
                          className="size-10 rounded-lg object-cover opacity-80 group-hover:opacity-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-ivory group-hover:text-gold">
                            {p.name}
                          </p>
                          <p className="truncate font-mono text-[10px] uppercase tracking-[0.15em] text-ivory/40">
                            {p.type}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm text-gold">
                          ₹{p.price.toLocaleString("en-IN")}
                        </span>
                        <ArrowUpRight className="size-3.5 shrink-0 text-ivory/25 group-hover:text-gold" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-6 text-center text-sm text-ivory/40">
                  No products found for "{query}"
                </p>
              )}

              {/* View all in shop */}
              {results.length > 0 && (
                <div className="border-t border-ivory/10 pt-3 pb-1">
                  <Link
                    to="/shop"
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ivory/40 transition-colors hover:text-gold"
                  >
                    View all in shop <ArrowUpRight className="size-3" />
                  </Link>
                </div>
              )}
            </motion.div>
          )}

          {query.trim().length === 0 && (
            <motion.div
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto max-w-3xl px-6 py-6 lg:px-8"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ivory/25">
                Try "compost", "VAM", "cocopeat"…
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

/* ─── Site Header ───────────────────────────────────────────────── */
export function SiteHeader() {
  const { cartCount, wishlist } = useStore();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  return (
    <>
      <header className="sticky top-0 z-50 bg-forest text-ivory">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 lg:px-10">
          <Link to="/" className="font-display text-2xl font-semibold tracking-[0.22em]">
            EVERGREEN <span className="text-gold">MEDIA</span>
          </Link>
          <nav className="hidden items-center gap-8 text-[11px] uppercase tracking-[0.2em] text-ivory/70 md:flex">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeProps={{ className: "text-gold" }}
                className="transition-colors hover:text-ivory"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.2em]">
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden items-center transition-colors hover:text-ivory sm:flex"
              aria-label="Open search"
            >
              <Search className="mr-1 inline size-3.5" /> Search
            </button>
            <Link to="/wishlist" className="hidden transition-colors hover:text-gold sm:block">
              Wishlist <span className="text-gold" suppressHydrationWarning>{wishlist.length}</span>
            </Link>
            <Link to="/cart" className="transition-colors hover:text-ivory">
              <ShoppingBag className="mr-1 inline size-3.5" /> Cart{" "}
              <span className="text-gold" suppressHydrationWarning>{cartCount}</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="text-ivory hover:bg-ivory/10 hover:text-ivory md:hidden"
              onClick={() => setOpen(!open)}
              aria-label="Open navigation"
            >
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        {open && (
          <nav className="border-t border-ivory/15 bg-forest px-6 py-5 md:hidden">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="block border-b border-ivory/10 py-3 text-xs uppercase tracking-[0.18em] text-ivory/75"
              >
                {item.label}
              </Link>
            ))}
            {/* Mobile search row */}
            <button
              onClick={() => { setOpen(false); setSearchOpen(true); }}
              className="flex w-full items-center gap-2 border-b border-ivory/10 py-3 text-xs uppercase tracking-[0.18em] text-ivory/75"
            >
              <Search className="size-3.5" /> Search
            </button>
          </nav>
        )}
      </header>

      {/* Search modal — rendered outside header so it overlays everything */}
      <AnimatePresence>
        {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

/* ─── Site Footer ───────────────────────────────────────────────── */
export function SiteFooter() {
  return (
    <footer className="bg-forest-deep text-ivory">
      <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-8 px-6 py-16 lg:px-10">
        <div className="col-span-12 md:col-span-4">
          <Link to="/" className="font-display text-2xl font-semibold tracking-[0.22em]">
            EVERGREEN <span className="text-gold">MEDIA</span>
          </Link>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.25em] text-gold/70">
            MEX — Natural Agricultural Solutions
          </p>
          <p className="mt-4 max-w-[34ch] text-sm leading-relaxed text-ivory/60">
            Premium agricultural inputs for healthier soil, stronger roots and thriving plants.
          </p>
          <div className="mt-6 flex gap-3">
            {["Instagram", "Facebook", "YouTube"].map((s) => (
              <a
                key={s}
                href="#"
                aria-label={s}
                className="border border-ivory/15 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-ivory/50 transition-colors hover:border-gold hover:text-gold"
              >
                {s.slice(0, 2)}
              </a>
            ))}
          </div>
        </div>
        <FooterColumn
          title="Shop"
          links={[
            ["All Products", "/shop"],
            ["Categories", "/categories"],
            ["Solutions", "/solutions"],
          ]}
        />
        <FooterColumn
          title="Company"
          links={[
            ["About", "/about"],
            ["Learn", "/learn"],
            ["Contact", "/contact"],
          ]}
        />
        <div className="col-span-12 md:col-span-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold">
            Stay grounded
          </p>
          <p className="mt-2 text-xs text-ivory/50">
            Growing knowledge, seasonal tips and new arrivals — direct to your inbox.
          </p>
          <form className="mt-4 flex border-b border-ivory/30 focus-within:border-gold">
            <input
              aria-label="Email address"
              type="email"
              placeholder="Email address"
              className="w-full bg-transparent py-2 text-sm placeholder:text-ivory/40 focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 text-[11px] uppercase tracking-[0.2em] text-gold transition-colors hover:text-ivory"
            >
              Join
            </button>
          </form>
        </div>
      </div>
      {/* Gold divider */}
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        <div
          className="h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, oklch(0.64 0.09 77.6 / 35%), transparent)",
          }}
        />
      </div>
      <div className="mx-auto flex max-w-[1440px] flex-wrap justify-between gap-3 px-6 py-6 font-mono text-[10px] uppercase tracking-[0.2em] text-ivory/40 lg:px-10">
        <span>© 2026 Evergreen Media (MEX)</span>
        <span>Privacy · Terms · Shipping</span>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<readonly [string, StorefrontPath]>;
}) {
  return (
    <div className="col-span-6 md:col-span-2">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold">{title}</p>
      <ul className="mt-4 space-y-2 text-sm text-ivory/70">
        {links.map(([label, to]) => (
          <li key={to}>
            <Link to={to} className="transition-colors hover:text-ivory">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SectionLabel({
  index,
  children,
  className = "",
}: {
  index?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={`font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-forest/70 ${className}`}>
      {children}
    </p>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
}) {
  return (
    <div className="border-b border-ink/10 pb-10 pt-16 md:pt-24">
      <SectionLabel index="00">{eyebrow}</SectionLabel>
      <h1 className="mt-4 max-w-4xl font-display text-5xl font-medium leading-[0.95] text-forest-deep md:text-7xl">
        {title}
      </h1>
      {description && (
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-ink/70">{description}</p>
      )}
    </div>
  );
}

/* ─── Original ProductCard (used on shop / product pages) ───────── */
export function ProductCard({
  product,
  compact = false,
}: {
  product: CardProduct;
  compact?: boolean;
}) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const id = cardId(product);
  const img = cardImage(product);
  return (
    <article className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink/5 transition-shadow duration-300 hover:shadow-lg">
      <div
        className={`relative overflow-hidden bg-ivory-soft ${
          compact ? "aspect-square" : "aspect-[4/5]"
        }`}
      >
        <Link to="/product/$id" params={{ id }}>
          <img
            src={img}
            alt={`${product.name} natural material study`}
            loading="lazy"
            width={1024}
            height={1024}
            className="size-full object-cover transition duration-700 group-hover:scale-105"
          />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleWishlist(String(product.id))}
          aria-label={
            isWishlisted(String(product.id))
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          className="absolute right-3 top-3 rounded-full bg-ivory/90 text-forest hover:bg-gold hover:text-forest-deep"
        >
          <Heart className={isWishlisted(String(product.id)) ? "fill-current" : ""} />
        </Button>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              to="/product/$id"
              params={{ id }}
              className="font-display text-lg font-medium leading-tight text-forest-deep hover:text-gold"
            >
              {product.name}
            </Link>
            <p className="mt-0.5 text-xs text-ink/55">
              {cardCategory(product)} · {product.weight ?? ""}
            </p>
          </div>
          <span className="shrink-0 font-mono text-sm font-medium text-ink">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
        </div>
        <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-ink/60">{product.description ?? ""}</p>
        <Button
          variant="outline"
          onClick={() => addToCart(String(product.id), product)}
          className="mt-3 w-full rounded-full border-forest/25 text-forest transition-all duration-300 hover:-translate-y-0.5 hover:border-forest hover:bg-forest hover:text-ivory hover:shadow-md active:translate-y-0"
        >
          Add to Cart
        </Button>
      </div>
    </article>
  );
}

/* ─── Premium Product Card (homepage featured / shop grid) ──────── */
export function PremiumProductCard({ product }: { product: CardProduct }) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const id  = cardId(product);
  const img = cardImage(product);

  function handleAddToCart() {
    addToCart(String(product.id), product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <motion.article
      className="group relative flex flex-col h-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink/5 transition-shadow duration-300 hover:shadow-xl"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Image container */}
      <div className="relative overflow-hidden bg-ivory-soft" style={{ aspectRatio: "3/4" }}>
        <Link to="/product/$id" params={{ id }} tabIndex={-1} aria-hidden="true">
          <motion.img
            src={img}
            alt={product.name}
            loading="lazy"
            width={800}
            height={1067}
            className="size-full object-cover"
            animate={{ scale: hovered ? 1.06 : 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />
        </Link>

        {/* Dark gradient */}
        <motion.div
          className="absolute inset-x-0 bottom-0 h-2/3"
          style={{
            background:
              "linear-gradient(to top, oklch(0.23 0.07 157.2 / 80%) 0%, transparent 100%)",
          }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.35 }}
        />

        {/* Hover action tray */}
        <motion.div
          className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-4"
          animate={{ y: hovered ? 0 : 12, opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <button
            onClick={handleAddToCart}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-forest-deep transition-all duration-300 hover:-translate-y-0.5 hover:bg-ivory hover:shadow-md active:translate-y-0"
          >
            <ShoppingBag className="size-3" />
            {added ? "Added ✓" : "Add to Cart"}
          </button>
          <Link
            to="/product/$id"
            params={{ id }}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-ivory/40 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ivory transition-all duration-300 hover:border-ivory hover:bg-ivory/10 active:scale-[0.99]"
          >
            <Eye className="size-3" />
            Quick View
          </Link>
        </motion.div>

        {/* Wishlist */}
        <button
          onClick={() => toggleWishlist(String(product.id))}
          aria-label={isWishlisted(String(product.id)) ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-ivory/90 text-forest shadow-sm transition-all hover:bg-gold hover:text-forest-deep"
        >
          <Heart
            className={`size-3.5 transition-transform ${
              isWishlisted(String(product.id)) ? "fill-current scale-110" : ""
            }`}
          />
        </button>

        {/* Category badge */}
        <div className="absolute left-3 top-3">
          <span className="bg-forest-deep/80 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-ivory/80 backdrop-blur-sm">
            {cardCategory(product)}
          </span>
        </div>

        {/* Discount badge */}
        {product.discount_price && (
          <div className="absolute bottom-3 left-3">
            <span className="bg-gold px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-forest-deep">
              Sale
            </span>
          </div>
        )}
      </div>

      {/* Info row — inside the card, padded */}
      <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-3">
        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`size-2.5 ${
                  i < Math.floor(product.rating)
                    ? "fill-gold text-gold"
                    : "fill-transparent text-ink/25"
                }`}
              />
            ))}
          </div>
          <span className="font-mono text-[9px] text-ink/50">{product.rating}</span>
        </div>

        {/* Name + price */}
        <div className="flex items-start justify-between gap-2">
          <Link
            to="/product/$id"
            params={{ id }}
            className="font-display text-lg font-medium leading-tight text-forest-deep transition-colors hover:text-gold"
          >
            {product.name}
          </Link>
          <div className="shrink-0 text-right">
            {product.discount_price ? (
              <>
                <span className="font-mono text-sm font-medium text-gold">
                  ₹{product.discount_price.toLocaleString("en-IN")}
                </span>
                <span className="ml-1 block font-mono text-[9px] text-ink/40 line-through">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
              </>
            ) : (
              <span className="font-mono text-sm font-medium text-ink">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>

        {/* Description — clamped to 3 lines */}
        <p className="line-clamp-3 text-xs leading-relaxed text-ink/55">
          {product.description ?? ""}
        </p>

        {/* Weight + arrow */}
        <div className="mt-auto flex items-center justify-between border-t border-ink/8 pt-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink/40">
            {product.weight ?? ""}
          </span>
          <motion.div animate={{ x: hovered ? 3 : 0 }} transition={{ duration: 0.2 }}>
            <ArrowUpRight className="size-3.5 text-gold" />
          </motion.div>
        </div>
      </div>
    </motion.article>
  );
}

/* ─── Quick View Modal ──────────────────────────────────────────── */
export function QuickViewModal({
  product,
  onClose,
}: {
  product: CardProduct;
  onClose: () => void;
}) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const [qty, setQty] = useState(1);
  const id  = cardId(product);
  const img = cardImage(product);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-forest-deep/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Panel */}
        <motion.div
          className="relative z-10 grid w-full max-w-2xl grid-cols-1 overflow-hidden bg-ivory sm:grid-cols-2"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="aspect-square overflow-hidden">
            <img
              src={img}
              alt={product.name}
              className="size-full object-cover"
              width={600}
              height={600}
            />
          </div>
          <div className="flex flex-col justify-between p-6">
            <div>
              <button
                onClick={onClose}
                className="mb-4 ml-auto flex size-7 items-center justify-center rounded-full border border-ink/15 text-ink/40 hover:text-ink"
                aria-label="Close"
              >
                <X className="size-3.5" />
              </button>
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-forest/60">
                {cardCategory(product)}
              </p>
              <h2 className="mt-2 font-display text-3xl font-medium text-forest-deep">
                {product.name}
              </h2>
              <div className="mt-2 flex items-center gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-3 ${
                      i < Math.floor(product.rating)
                        ? "fill-gold text-gold"
                        : "fill-transparent text-ink/25"
                    }`}
                  />
                ))}
                <span className="ml-1 font-mono text-[9px] text-ink/50">{product.rating}</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink/65">{product.description ?? ""}</p>
              <div className="mt-5 flex items-baseline justify-between">
                <span className="font-display text-3xl text-forest-deep">
                  ₹{(product.discount_price ?? product.price).toLocaleString("en-IN")}
                </span>
                <span className="font-mono text-xs text-ink/45">{product.weight ?? ""}</span>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-ink/15">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="flex size-8 items-center justify-center text-ink/60 hover:text-ink"
                    aria-label="Decrease"
                  >
                    <Minus className="size-3" />
                  </button>
                  <span className="min-w-8 text-center font-mono text-sm">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="flex size-8 items-center justify-center text-ink/60 hover:text-ink"
                    aria-label="Increase"
                  >
                    <Plus className="size-3" />
                  </button>
                </div>
                <button
                  onClick={() => toggleWishlist(String(product.id))}
                className="flex size-8 items-center justify-center rounded-lg border border-ink/15 text-forest transition-all duration-300 hover:border-gold hover:bg-gold hover:text-forest-deep"
                  aria-label="Wishlist"
                >
                  <Heart
                    className={`size-3.5 ${isWishlisted(String(product.id)) ? "fill-current" : ""}`}
                  />
                </button>
              </div>
              <button
                onClick={() => {
                  for (let i = 0; i < qty; i++) addToCart(String(product.id), product);
                  onClose();
                }}
                className="w-full rounded-xl bg-forest py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-deep hover:shadow-lg active:translate-y-0"
              >
                Add to Cart
              </button>
              <Link
                to="/product/$id"
                params={{ id }}
                className="text-center font-mono text-[9px] uppercase tracking-[0.2em] text-forest/60 underline underline-offset-4 hover:text-forest"
              >
                View Full Details
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Quantity control (cart page) ─────────────────────────────── */
export function QuantityControl({ id, quantity }: { id: string; quantity: number }) {
  const { updateQuantity } = useStore();
  return (
    <div className="flex items-center border border-ink/15">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => updateQuantity(id, quantity - 1)}
        aria-label="Decrease quantity"
      >
        <Minus />
      </Button>
      <span className="min-w-8 text-center text-sm">{quantity}</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => updateQuantity(id, quantity + 1)}
        aria-label="Increase quantity"
      >
        <Plus />
      </Button>
    </div>
  );
}

export { getProduct, products };

/* ─── Premium CTA Card — shared across all pages ───────────────── */
export function PremiumCta({
  eyebrow = "Natural Agricultural Inputs · MEX",
  headline,
  headlineItalic,
  body,
  primaryLabel = "Shop Products",
  primaryTo = "/shop",
  secondaryLabel = "Explore Range",
  secondaryTo = "/categories",
  trustLine = "100% Natural · All Crop Types · Premium Quality",
  image = "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1600&q=85&auto=format&fit=crop",
  imageAlt = "Lush green field at golden hour",
  badgeValue = "4.9",
  badgeLabel = "Trusted by growers",
}: {
  eyebrow?: string;
  headline: string;
  headlineItalic: string;
  body: string;
  primaryLabel?: string;
  primaryTo?: string;
  secondaryLabel?: string;
  secondaryTo?: string;
  trustLine?: string;
  image?: string;
  imageAlt?: string;
  badgeValue?: string;
  badgeLabel?: string;
}) {
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
                src={image}
                alt={imageAlt}
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
                    <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div>
                  <p className="font-mono text-[10px] font-bold leading-none" style={{ color: "#1e2d1a" }}>
                    {badgeValue}
                  </p>
                  <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-black/40">
                    {badgeLabel}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Right — dark text panel */}
            <div
              className="flex flex-col justify-center px-8 py-10 lg:px-12 lg:py-12"
              style={{ background: "oklch(0.16 0.06 157.2)" }}
            >
              {/* Eyebrow */}
              <motion.span
                className="font-mono text-[9px] uppercase tracking-[0.18em]"
                style={{ color: "oklch(0.64 0.09 77.6 / 60%)" }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {eyebrow}
              </motion.span>

              {/* Headline */}
              <motion.h2
                className="mt-3 font-display font-bold leading-[0.92]"
                style={{
                  fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
                  letterSpacing: "-0.02em",
                  color: "#f5f0e8",
                }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                {headline}
                <br />
                <span className="italic" style={{ color: "oklch(0.64 0.09 77.6)" }}>
                  {headlineItalic}
                </span>
              </motion.h2>

              {/* Body */}
              <motion.p
                className="mt-4 max-w-sm text-sm leading-relaxed"
                style={{ color: "rgba(245,240,232,0.50)" }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.25 }}
              >
                {body}
              </motion.p>

              {/* Buttons */}
              <motion.div
                className="mt-7 flex flex-wrap items-center gap-3"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.32 }}
              >
                <Link
                  to={primaryTo}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
                  style={{ background: "oklch(0.64 0.09 77.6)", color: "#1e2d1a" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f5f0e8"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "oklch(0.64 0.09 77.6)"; }}
                >
                  {primaryLabel} <ArrowUpRight className="size-3" />
                </Link>
                <Link
                  to={secondaryTo}
                  className="inline-flex items-center gap-2 rounded-full border px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                  style={{ borderColor: "rgba(245,240,232,0.20)", color: "rgba(245,240,232,0.70)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(245,240,232,0.55)";
                    (e.currentTarget as HTMLElement).style.color = "#f5f0e8";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(245,240,232,0.20)";
                    (e.currentTarget as HTMLElement).style.color = "rgba(245,240,232,0.70)";
                  }}
                >
                  {secondaryLabel} <ArrowUpRight className="size-3" />
                </Link>
              </motion.div>

              {/* Trust line */}
              <motion.p
                className="mt-5 font-mono text-[8px] uppercase tracking-[0.22em]"
                style={{ color: "rgba(245,240,232,0.22)" }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                {trustLine}
              </motion.p>
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

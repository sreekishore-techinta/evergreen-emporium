import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Eye,
  Heart,
  Menu,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Star,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { getProduct, products, useStore, type Product } from "@/lib/storefront";

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
  { label: "Shop", to: "/shop" },
  { label: "Categories", to: "/categories" },
  { label: "Solutions", to: "/solutions" },
  { label: "Learn", to: "/learn" },
  { label: "About", to: "/about" },
] as const;

/* ─── Site Header ───────────────────────────────────────────────── */
export function SiteHeader() {
  const { cartCount, wishlist } = useStore();
  const [open, setOpen] = useState(false);
  return (
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
          <Link to="/shop" className="hidden transition-colors hover:text-ivory sm:block">
            <Search className="mr-1 inline size-3.5" /> Search
          </Link>
          <Link to="/wishlist" className="hidden transition-colors hover:text-gold sm:block">
            Wishlist <span className="text-gold">{wishlist.length}</span>
          </Link>
          <Link to="/cart" className="transition-colors hover:text-ivory">
            <ShoppingBag className="mr-1 inline size-3.5" /> Cart{" "}
            <span className="text-gold">{cartCount}</span>
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
        </nav>
      )}
    </header>
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

/* ─── Shared primitives ─────────────────────────────────────────── */
export function SectionLabel({ index, children }: { index: string; children: string }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-forest/60">
      ({index}) — {children}
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
  product: Product;
  compact?: boolean;
}) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  return (
    <article className="group">
      <div
        className={`relative overflow-hidden rounded-[min(1vw,12px)] bg-ivory-soft ${
          compact ? "aspect-square" : "aspect-[4/5]"
        }`}
      >
        <Link to="/product/$id" params={{ id: product.id }}>
          <img
            src={product.image}
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
          onClick={() => toggleWishlist(product.id)}
          aria-label={
            isWishlisted(product.id)
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          className="absolute right-3 top-3 rounded-full bg-ivory/90 text-forest hover:bg-gold hover:text-forest-deep"
        >
          <Heart className={isWishlisted(product.id) ? "fill-current" : ""} />
        </Button>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <Link
            to="/product/$id"
            params={{ id: product.id }}
            className="font-display text-2xl font-medium text-forest-deep hover:text-gold"
          >
            {product.name}
          </Link>
          <p className="text-xs text-ink/55">
            {product.category} · {product.weight}
          </p>
        </div>
        <span className="text-sm font-medium text-ink">
          ₹{product.price.toLocaleString("en-IN")}
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-ink/60">{product.description}</p>
      <Button
        variant="outline"
        onClick={() => addToCart(product.id)}
        className="mt-4 w-full rounded-none border-forest/25 text-forest hover:bg-forest hover:text-ivory"
      >
        Add to Cart
      </Button>
    </article>
  );
}

/* ─── Premium Product Card (homepage featured products) ─────────── */
export function PremiumProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    addToCart(product.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <motion.article
      className="group relative flex flex-col"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Image container */}
      <div className="relative overflow-hidden bg-ivory-soft" style={{ aspectRatio: "3/4" }}>
        {/* Product image */}
        <Link to="/product/$id" params={{ id: product.id }} tabIndex={-1} aria-hidden="true">
          <motion.img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={800}
            height={1067}
            className="size-full object-cover"
            animate={{ scale: hovered ? 1.06 : 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />
        </Link>

        {/* Dark gradient at bottom for text legibility */}
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
            className="flex w-full items-center justify-center gap-2 bg-gold py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-forest-deep transition-colors hover:bg-ivory"
          >
            <ShoppingBag className="size-3" />
            {added ? "Added ✓" : "Add to Cart"}
          </button>
          <Link
            to="/product/$id"
            params={{ id: product.id }}
            className="flex w-full items-center justify-center gap-2 border border-ivory/40 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ivory transition-colors hover:border-ivory"
          >
            <Eye className="size-3" />
            Quick View
          </Link>
        </motion.div>

        {/* Wishlist button */}
        <button
          onClick={() => toggleWishlist(product.id)}
          aria-label={isWishlisted(product.id) ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-ivory/90 text-forest shadow-sm transition-all hover:bg-gold hover:text-forest-deep"
        >
          <Heart
            className={`size-3.5 transition-transform ${
              isWishlisted(product.id) ? "fill-current scale-110" : ""
            }`}
          />
        </button>

        {/* Category badge */}
        <div className="absolute left-3 top-3">
          <span className="bg-forest-deep/80 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-ivory/80 backdrop-blur-sm">
            {product.category}
          </span>
        </div>
      </div>

      {/* Info row */}
      <div className="mt-4 flex flex-col gap-1.5">
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
        <div className="flex items-baseline justify-between gap-2">
          <Link
            to="/product/$id"
            params={{ id: product.id }}
            className="font-display text-xl font-medium leading-tight text-forest-deep transition-colors hover:text-gold"
          >
            {product.name}
          </Link>
          <span className="shrink-0 font-mono text-sm font-medium text-ink">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
        </div>

        <p className="text-xs leading-relaxed text-ink/55">{product.description}</p>

        {/* Weight + arrow */}
        <div className="mt-1 flex items-center justify-between border-t border-ink/8 pt-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink/40">
            {product.weight}
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
  product: Product;
  onClose: () => void;
}) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const [qty, setQty] = useState(1);

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
              src={product.image}
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
                {product.category}
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
              <p className="mt-4 text-sm leading-relaxed text-ink/65">{product.description}</p>
              <div className="mt-5 flex items-baseline justify-between">
                <span className="font-display text-3xl text-forest-deep">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                <span className="font-mono text-xs text-ink/45">{product.weight}</span>
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
                  onClick={() => toggleWishlist(product.id)}
                  className="flex size-8 items-center justify-center border border-ink/15 text-forest hover:bg-gold hover:border-gold hover:text-forest-deep transition-colors"
                  aria-label="Wishlist"
                >
                  <Heart
                    className={`size-3.5 ${isWishlisted(product.id) ? "fill-current" : ""}`}
                  />
                </button>
              </div>
              <button
                onClick={() => {
                  for (let i = 0; i < qty; i++) addToCart(product.id);
                  onClose();
                }}
                className="w-full bg-forest py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-forest-deep"
              >
                Add to Cart
              </button>
              <Link
                to="/product/$id"
                params={{ id: product.id }}
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

import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Loader2, Star } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront";
import { useProduct } from "@/lib/api";
import { useStore } from "@/lib/storefront";

export const Route = createFileRoute("/product/$id")({
  head: () => ({
    meta: [
      { title: "Product — Evergreen Media" },
      { name: "description", content: "Explore the details, use and applications of Evergreen Media plant nutrition products." },
      { property: "og:title", content: "Product — Evergreen Media" },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { data: product, loading, error } = useProduct(id);
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const [quantity, setQuantity] = useState(1);

  /* ── Loading ── */
  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-ivory">
        <Loader2 className="size-8 animate-spin text-forest/40" />
      </main>
    );
  }

  /* ── Error / Not found ── */
  if (error || !product) {
    return (
      <main className="mx-auto max-w-[1440px] px-6 py-24 lg:px-10">
        <h1 className="font-display text-6xl text-forest-deep">Product not found.</h1>
        <Link to="/shop" className="mt-8 inline-block text-sm uppercase tracking-[0.2em] text-forest">
          Return to shop →
        </Link>
      </main>
    );
  }

  const displayPrice    = product.discount_price ?? product.price;
  const primaryImage    = product.primary_image_url ||
    (product.images?.[0]?.url ?? "");

  return (
    <main className="mx-auto max-w-[1440px] px-6 pb-24 lg:px-10">
      {/* ── Product detail ── */}
      <div className="grid grid-cols-1 gap-12 py-12 md:grid-cols-2 md:py-20">
        {/* Image */}
        <div className="overflow-hidden rounded-[min(1vw,12px)] bg-ivory-soft">
          <img
            src={primaryImage}
            alt={product.name}
            width={1024}
            height={1024}
            className="aspect-square w-full object-cover"
          />
          {/* Thumbnail strip if multiple images */}
          {product.images && product.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt=""
                  className="size-16 shrink-0 cursor-pointer rounded-md object-cover opacity-70 ring-1 ring-ink/10 transition hover:opacity-100"
                />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-forest/60">
            {product.category_name} · {product.type ?? ""}
          </p>

          {product.badge && (
            <span className="mt-2 inline-block w-fit bg-gold/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-gold">
              {product.badge}
            </span>
          )}

          <h1 className="mt-4 font-display text-6xl font-medium leading-none text-forest-deep md:text-7xl">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="mt-5 flex items-center gap-3 text-sm text-gold">
            <span className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`size-4 ${i < Math.floor(product.rating) ? "fill-current" : "fill-transparent text-ink/25"}`}
                />
              ))}
            </span>
            <span className="text-ink/60">
              {product.rating} · {product.rating_count} review{product.rating_count !== 1 ? "s" : ""}
            </span>
          </div>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-ink/70">
            {product.long_description ?? product.description ?? ""}
          </p>

          {/* Price row */}
          <div className="mt-8 flex items-baseline justify-between border-b border-ink/15 pb-6">
            <div className="flex items-baseline gap-3">
              <span className="font-display text-4xl text-forest-deep">
                ₹{displayPrice.toLocaleString("en-IN")}
              </span>
              {product.discount_price && (
                <span className="font-mono text-base text-ink/40 line-through">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
              )}
            </div>
            <span className="text-sm text-ink/55">{product.weight ?? ""}</span>
          </div>

          {/* Stock */}
          <p className={`mt-3 font-mono text-[10px] uppercase tracking-[0.18em] ${
            product.stock === 0 ? "text-red-500" : product.stock <= product.low_stock_alert ? "text-orange-500" : "text-forest/60"
          }`}>
            {product.stock === 0 ? "Out of stock" : product.stock <= product.low_stock_alert ? `Only ${product.stock} left` : "In stock"}
          </p>

          {/* Add to cart */}
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="flex items-center border border-ink/15">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity((v) => Math.max(1, v - 1))}
                aria-label="Decrease quantity"
                disabled={product.stock === 0}
              >−</Button>
              <span className="min-w-10 text-center text-sm">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity((v) => v + 1)}
                aria-label="Increase quantity"
                disabled={product.stock === 0}
              >+</Button>
            </div>
            <Button
              onClick={() => { for (let i = 0; i < quantity; i++) addToCart(String(product.id), product); }}
              disabled={product.stock === 0}
              className="rounded-full bg-forest px-8 text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-deep hover:shadow-lg disabled:opacity-50 active:translate-y-0"
            >
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
            <Button
              variant="outline"
              onClick={() => toggleWishlist(String(product.id))}
              className="rounded-full border-forest/25 text-forest transition-all duration-300 hover:bg-forest hover:text-ivory hover:shadow-md"
            >
              <Heart className={isWishlisted(String(product.id)) ? "fill-current" : ""} />
            </Button>
          </div>

          <Button
            asChild
            variant="outline"
            className="mt-3 w-full rounded-full border-gold text-forest transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold hover:shadow-md active:translate-y-0"
          >
            <Link to="/checkout">Buy Now</Link>
          </Button>

          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/45">
            Suitable for {product.applications.join(" · ")}
          </p>
        </div>
      </div>

      {/* ── Details tabs ── */}
      <div className="border-t border-ink/10 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Benefits */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold">Benefits</p>
            {product.benefits && product.benefits.length > 0 ? (
              <ul className="mt-4 space-y-2 text-sm text-ink/70">
                {product.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold" />
                    {b}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm leading-relaxed text-ink/70">{product.description ?? ""}</p>
            )}
          </div>

          {/* How to use */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold">How to use</p>
            <p className="mt-4 text-sm leading-relaxed text-ink/70">
              {product.usage_info ?? "Follow the dosage and application notes on the selected pack. Start with a light application and observe your plant's response."}
            </p>
          </div>

          {/* Specs */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold">Specifications</p>
            <dl className="mt-4 space-y-2 text-sm text-ink/70">
              <div className="flex justify-between border-b border-ink/10 pb-2">
                <dt>Format</dt>
                <dd>{product.type ?? "—"}</dd>
              </div>
              {product.weight && (
                <div className="flex justify-between border-b border-ink/10 pb-2">
                  <dt>Pack size</dt>
                  <dd>{product.weight}</dd>
                </div>
              )}
              <div className="flex justify-between border-b border-ink/10 pb-2">
                <dt>SKU</dt>
                <dd className="font-mono text-[11px]">{product.sku}</dd>
              </div>
              <div className="flex justify-between border-b border-ink/10 pb-2">
                <dt>Category</dt>
                <dd>{product.category_name}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* ── Reviews ── */}
      {product.reviews && product.reviews.length > 0 && (
        <div className="border-t border-ink/10 pt-14">
          <h2 className="font-display text-4xl text-forest-deep">Customer reviews.</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {product.reviews.map((rev) => (
              <div key={rev.id} className="rounded-lg border border-ink/8 p-5">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`size-3 ${i < rev.rating ? "fill-gold text-gold" : "fill-transparent text-ink/25"}`} />
                  ))}
                </div>
                {rev.title && <p className="mt-2 font-medium text-forest-deep">{rev.title}</p>}
                {rev.body && <p className="mt-1 text-sm text-ink/65">{rev.body}</p>}
                <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.15em] text-ink/35">
                  {rev.user_name ?? "Verified buyer"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Related products ── */}
      {product.related && product.related.length > 0 && (
        <div className="border-t border-ink/10 pt-14">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-4xl text-forest-deep">Related products.</h2>
            <Link to="/shop" className="text-[11px] uppercase tracking-[0.2em] text-forest">
              View all
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {product.related.slice(0, 3).map((item) => (
              <ProductCard key={item.id} product={item} compact />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

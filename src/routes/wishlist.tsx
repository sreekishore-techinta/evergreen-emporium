import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { ProductCard, SectionLabel } from "@/components/storefront";
import { getProduct, products, useStore } from "@/lib/storefront";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — Evergreen Media" },
      { name: "description", content: "Your saved Evergreen Media products." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlist, hydrated } = useStore();
  const saved = wishlist.map((id) => getProduct(id)).filter(Boolean) as typeof products;

  // Wait for localStorage hydration before branching on wishlist length.
  // The server always sees an empty wishlist — without this guard the
  // "Nothing saved yet" empty-state gets SSR'd but the client may have items,
  // causing React hydration error #418 (tree-level mismatch).
  if (!hydrated) {
    return (
      <main className="mx-auto max-w-[1440px] px-6 pb-24 lg:px-10">
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-forest/20 border-t-forest" />
        </div>
      </main>
    );
  }

  if (saved.length === 0) {
    return (
      <main className="mx-auto max-w-[1440px] px-6 pb-24 lg:px-10">
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-5 text-center">
          <SectionLabel index="—">Wishlist</SectionLabel>
          <h1 className="font-display text-5xl font-medium text-forest-deep">
            Nothing saved <span className="italic text-gold">yet.</span>
          </h1>
          <p className="text-sm text-ink/55">
            Tap the <Heart className="inline size-4 text-forest" /> icon on any product to save it here.
          </p>
          <Link
            to="/shop"
            className="mt-2 inline-flex items-center gap-2 bg-forest px-7 py-3.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ivory transition-colors hover:bg-forest-deep"
          >
            Browse products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1440px] px-6 pb-24 lg:px-10">
      <div className="border-b border-ink/10 pb-10 pt-16 md:pt-24">
        <SectionLabel index="00">Saved</SectionLabel>
        <h1 className="mt-4 font-display text-5xl font-medium leading-[0.95] text-forest-deep md:text-7xl">
          Wishlist
        </h1>
        <p className="mt-4 text-sm text-ink/55">{saved.length} saved product{saved.length !== 1 ? "s" : ""}</p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {saved.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}

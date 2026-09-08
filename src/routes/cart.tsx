import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuantityControl, SectionLabel } from "@/components/storefront";
import { getProduct, useStore } from "@/lib/storefront";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Cart — Evergreen Media" },
      { name: "description", content: "Review your Evergreen Media cart and proceed to checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { cart, removeFromCart, cartTotal } = useStore();

  if (cart.length === 0) {
    return (
      <main className="mx-auto max-w-[1440px] px-6 pb-24 lg:px-10">
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-5 text-center">
          <SectionLabel index="—">Cart</SectionLabel>
          <h1 className="font-display text-5xl font-medium text-forest-deep">
            Your cart is <span className="italic text-gold">empty.</span>
          </h1>
          <p className="text-sm text-ink/55">
            Add some products from our range to get started.
          </p>
          <Link
            to="/shop"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-forest px-7 py-3.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-deep hover:shadow-lg active:translate-y-0"
          >
            Shop the range
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1440px] px-6 pb-24 lg:px-10">
      <div className="border-b border-ink/10 pb-10 pt-16 md:pt-24">
        <SectionLabel index="00">Your cart</SectionLabel>
        <h1 className="mt-4 font-display text-5xl font-medium leading-[0.95] text-forest-deep md:text-7xl">
          Cart
        </h1>
      </div>

      <div className="mt-12 grid grid-cols-12 gap-10">
        {/* Line items */}
        <div className="col-span-12 lg:col-span-8">
          {cart.map(({ id, quantity }) => {
            const product = getProduct(id);
            if (!product) return null;
            return (
              <div key={id} className="flex items-center gap-6 border-b border-ink/10 py-6">
                <Link to="/product/$id" params={{ id }}>
                  <img
                    src={product.image}
                    alt={product.name}
                    width={80}
                    height={80}
                    className="size-20 rounded-[min(1vw,8px)] object-cover bg-ivory-soft"
                  />
                </Link>
                <div className="flex flex-1 flex-col gap-2">
                  <Link
                    to="/product/$id"
                    params={{ id }}
                    className="font-display text-xl font-medium text-forest-deep hover:text-gold"
                  >
                    {product.name}
                  </Link>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/45">
                    {product.category} · {product.weight}
                  </p>
                  <QuantityControl id={id} quantity={quantity} />
                </div>
                <div className="flex flex-col items-end gap-3">
                  <span className="font-display text-xl text-forest-deep">
                    ₹{(product.price * quantity).toLocaleString("en-IN")}
                  </span>
                  <button
                    onClick={() => removeFromCart(id)}
                    aria-label={`Remove ${product.name} from cart`}
                    className="text-ink/35 transition-colors hover:text-red-500"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="col-span-12 lg:col-span-4">
          <div className="border border-ink/10 p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold">
              Order summary
            </p>
            <div className="mt-5 flex justify-between border-b border-ink/10 pb-5">
              <span className="text-sm text-ink/65">Subtotal</span>
              <span className="font-display text-xl text-forest-deep">
                ₹{cartTotal.toLocaleString("en-IN")}
              </span>
            </div>
            <p className="mt-4 font-mono text-[9px] text-ink/40">
              Shipping calculated at checkout.
            </p>
            <Button
              asChild
              className="mt-6 w-full rounded-full bg-forest py-4 font-mono text-[10px] uppercase tracking-[0.22em] text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-deep hover:shadow-lg active:translate-y-0"
            >
              <Link to="/checkout">Proceed to checkout</Link>
            </Button>
            <Link
              to="/shop"
              className="mt-3 block text-center font-mono text-[9px] uppercase tracking-[0.18em] text-ink/40 transition-colors hover:text-forest"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

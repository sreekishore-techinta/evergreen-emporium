import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/storefront";
import { getProduct, useStore } from "@/lib/storefront";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Evergreen Media" },
      { name: "description", content: "Complete your Evergreen Media order." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { cart, cartTotal } = useStore();
  const [placed, setPlaced] = useState(false);

  if (cart.length === 0 && !placed) {
    return (
      <main className="mx-auto max-w-[1440px] px-6 pb-24 lg:px-10">
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-5 text-center">
          <h1 className="font-display text-5xl font-medium text-forest-deep">
            Your cart is <span className="italic text-gold">empty.</span>
          </h1>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-forest px-7 py-3.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ivory transition-colors hover:bg-forest-deep"
          >
            Shop the range
          </Link>
        </div>
      </main>
    );
  }

  if (placed) {
    return (
      <main className="mx-auto max-w-[1440px] px-6 pb-24 lg:px-10">
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-5 text-center">
          <SectionLabel index="✓">Order placed</SectionLabel>
          <h1 className="font-display text-5xl font-medium text-forest-deep">
            Thank you for your <span className="italic text-gold">order.</span>
          </h1>
          <p className="max-w-sm text-sm text-ink/55">
            We'll be in touch shortly with your order confirmation and shipping details.
          </p>
          <Link
            to="/"
            className="mt-2 inline-flex items-center gap-2 border border-forest/25 px-7 py-3.5 font-mono text-[10px] uppercase tracking-[0.22em] text-forest transition-colors hover:bg-forest hover:text-ivory"
          >
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1440px] px-6 pb-24 lg:px-10">
      <div className="border-b border-ink/10 pb-10 pt-16 md:pt-24">
        <SectionLabel index="00">Order</SectionLabel>
        <h1 className="mt-4 font-display text-5xl font-medium leading-[0.95] text-forest-deep md:text-7xl">
          Checkout
        </h1>
      </div>

      <div className="mt-12 grid grid-cols-12 gap-10">
        {/* Shipping form */}
        <div className="col-span-12 lg:col-span-7">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold">
            Shipping details
          </p>
          <form
            className="mt-6 flex flex-col gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              setPlaced(true);
            }}
          >
            <div className="grid grid-cols-2 gap-6">
              {[
                { id: "first", label: "First name", type: "text" },
                { id: "last", label: "Last name", type: "text" },
              ].map(({ id, label, type }) => (
                <div key={id} className="flex flex-col gap-2">
                  <label htmlFor={id} className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/55">
                    {label}
                  </label>
                  <input
                    id={id}
                    required
                    type={type}
                    className="border-b border-ink/20 bg-transparent py-3 text-sm outline-none focus:border-forest"
                  />
                </div>
              ))}
            </div>
            {[
              { id: "email", label: "Email", type: "email" },
              { id: "phone", label: "Phone", type: "tel" },
              { id: "address", label: "Address", type: "text" },
              { id: "city", label: "City", type: "text" },
              { id: "pincode", label: "Pincode", type: "text" },
            ].map(({ id, label, type }) => (
              <div key={id} className="flex flex-col gap-2">
                <label htmlFor={id} className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/55">
                  {label}
                </label>
                <input
                  id={id}
                  required
                  type={type}
                  className="border-b border-ink/20 bg-transparent py-3 text-sm outline-none focus:border-forest"
                />
              </div>
            ))}
            <Button
              type="submit"
              className="w-fit rounded-none bg-forest px-8 py-4 font-mono text-[10px] uppercase tracking-[0.22em] text-ivory hover:bg-forest-deep"
            >
              Place order
            </Button>
          </form>
        </div>

        {/* Order summary */}
        <div className="col-span-12 lg:col-span-4 lg:col-start-9">
          <div className="border border-ink/10 p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold">
              Order summary
            </p>
            <div className="mt-5 flex flex-col gap-4">
              {cart.map(({ id, quantity }) => {
                const p = getProduct(id);
                if (!p) return null;
                return (
                  <div key={id} className="flex items-center justify-between gap-3 border-b border-ink/8 pb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        width={40}
                        height={40}
                        className="size-10 rounded object-cover bg-ivory-soft"
                      />
                      <div>
                        <p className="text-sm font-medium text-forest-deep">{p.name}</p>
                        <p className="font-mono text-[9px] text-ink/40">Qty {quantity}</p>
                      </div>
                    </div>
                    <span className="text-sm text-ink">
                      ₹{(p.price * quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 flex justify-between border-t border-ink/10 pt-5">
              <span className="text-sm text-ink/65">Total</span>
              <span className="font-display text-xl text-forest-deep">
                ₹{cartTotal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

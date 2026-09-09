import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Edit2,
  Loader2,
  Lock,
  ShieldCheck,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ordersApi, type ApiOrder } from "@/lib/api";
import { getProduct, useStore, SLUG_TO_NUMERIC_ID } from "@/lib/storefront";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Evergreen Media" },
      { name: "description", content: "Complete your Evergreen Media order." },
    ],
  }),
  component: CheckoutPage,
});

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4 | 5;

interface AddressForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

interface DeliveryOption {
  id: string;
  label: string;
  desc: string;
  price: number;
  days: string;
}

const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: "standard",
    label: "Standard Delivery",
    desc: "Delivered to your doorstep",
    price: 0,
    days: "5–7 business days",
  },
  {
    id: "express",
    label: "Express Delivery",
    desc: "Priority handling & dispatch",
    price: 120,
    days: "2–3 business days",
  },
];

const PAYMENT_METHODS = [
  {
    id: "online",
    label: "Online Payment",
    sub: "UPI · Card · Net Banking",
    icon: "💳",
  },
  {
    id: "cod",
    label: "Cash on Delivery",
    sub: "Pay when your order arrives",
    icon: "🏠",
  },
];

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli",
  "Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

const EMPTY_ADDRESS: AddressForm = {
  firstName: "", lastName: "", email: "", phone: "",
  line1: "", line2: "", city: "", state: "", pincode: "", country: "India",
};

// ─────────────────────────────────────────────────────────────────
// Progress bar
// ─────────────────────────────────────────────────────────────────
const STEPS = [
  { n: 1, label: "Information" },
  { n: 2, label: "Address" },
  { n: 3, label: "Delivery" },
  { n: 4, label: "Payment" },
  { n: 5, label: "Review" },
];

function ProgressBar({ current }: { current: Step }) {
  return (
    <nav aria-label="Checkout steps" className="mb-10 lg:mb-14">
      <ol className="flex items-center justify-center gap-0">
        {STEPS.map((s, i) => {
          const done = current > s.n;
          const active = current === s.n;
          return (
            <li key={s.n} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                {/* Circle */}
                <div
                  className={`flex size-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300 ${
                    done
                      ? "border-forest bg-forest text-ivory shadow-sm"
                      : active
                      ? "border-forest bg-forest/15 text-forest ring-2 ring-forest/30 font-bold"
                      : "border-ink/30 bg-white text-ink/60 font-semibold"
                  }`}
                >
                  {done ? <Check className="size-3.5 stroke-[3]" /> : <span>{s.n}</span>}
                </div>
                {/* Label */}
                <span
                  className={`hidden font-mono text-[10px] uppercase tracking-[0.18em] sm:block ${
                    active
                      ? "font-bold text-forest-deep"
                      : done
                      ? "font-semibold text-forest"
                      : "font-medium text-ink/60"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {/* Connector */}
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-2 h-0.5 w-10 transition-all duration-500 sm:w-16 lg:w-20 ${
                    current > s.n ? "bg-forest" : "bg-ink/20"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────
// Premium input
// ─────────────────────────────────────────────────────────────────
function Field({
  id, label, type = "text", value, onChange, error, required = true,
  placeholder = "", autoComplete,
}: {
  id: string; label: string; type?: string; value: string;
  onChange: (v: string) => void; error?: string | undefined; required?: boolean;
  placeholder?: string; autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="font-mono text-xs font-bold uppercase tracking-[0.15em] text-forest-deep"
      >
        {label}{required && <span className="ml-1 text-red-600 font-bold">*</span>}
      </label>
      <div
        className={`relative border-b-2 transition-colors duration-200 ${
          error
            ? "border-red-500"
            : focused
            ? "border-forest"
            : "border-ink/35"
        }`}
      >
        <input
          id={id}
          type={type}
          required={required}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent py-2.5 text-sm font-semibold text-forest-deep outline-none placeholder:font-normal placeholder:text-ink/40"
        />
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs font-semibold text-red-600"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function SelectField({
  id, label, value, onChange, options, error,
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; options: string[]; error?: string | undefined;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-mono text-xs font-bold uppercase tracking-[0.15em] text-forest-deep">
        {label}<span className="ml-1 text-red-600 font-bold">*</span>
      </label>
      <div className={`relative border-b-2 transition-colors duration-200 ${error ? "border-red-500" : focused ? "border-forest" : "border-ink/35"}`}>
        <select
          id={id}
          value={value}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-transparent py-2.5 pr-6 text-sm font-semibold text-forest-deep outline-none"
        >
          <option value="" className="text-ink/50">Select state</option>
          {options.map((o) => <option key={o} value={o} className="text-forest-deep font-semibold">{o}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-1 top-3 size-4 text-forest font-bold" />
      </div>
      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Step transition wrapper
// ─────────────────────────────────────────────────────────────────
function StepPanel({ children, stepKey }: { children: React.ReactNode; stepKey: number }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepKey}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────
// Section heading
// ─────────────────────────────────────────────────────────────────
function StepHeading({ index, title }: { index: string; title: string }) {
  return (
    <div className="mb-7 flex items-center gap-3">
      <span className="font-mono text-xs font-bold text-gold">{index}</span>
      <div className="h-px flex-1 bg-ink/20" />
      <h2 className="font-mono text-xs sm:text-sm font-bold uppercase tracking-[0.22em] text-forest-deep">{title}</h2>
      <div className="h-px flex-1 bg-ink/20" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Nav buttons
// ─────────────────────────────────────────────────────────────────
function NavButtons({
  onBack, onNext, nextLabel = "Continue", loading = false, backLabel = "Back",
}: {
  onBack?: () => void; onNext: () => void; nextLabel?: string;
  loading?: boolean; backLabel?: string;
}) {
  return (
    <div className="mt-8 flex items-center justify-between">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.18em] text-forest hover:text-gold transition-colors"
        >
          <ArrowLeft className="size-3.5" /> {backLabel}
        </button>
      ) : (
        <div />
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={loading}
        className="flex items-center gap-2.5 rounded-full bg-forest px-8 py-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-deep hover:shadow-lg disabled:opacity-50 active:translate-y-0"
      >
        {loading ? (
          <><Loader2 className="size-3.5 animate-spin" /> Processing…</>
        ) : (
          <>{nextLabel} <ArrowRight className="size-3.5" /></>
        )}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Order Summary (right column)
// ─────────────────────────────────────────────────────────────────
function OrderSummary({
  delivery,
}: {
  delivery: DeliveryOption | null;
}) {
  const { cart, cartTotal } = useStore();
  const [summaryOpen, setSummaryOpen] = useState(true);

  const shipping = delivery?.price ?? 0;
  const grand = Math.max(0, cartTotal + shipping);

  return (
    <div className="lg:sticky lg:top-24">
      {/* Mobile toggle */}
      <button
        className="flex w-full items-center justify-between border-2 border-forest/20 bg-ivory px-5 py-4 lg:hidden rounded-lg shadow-sm"
        onClick={() => setSummaryOpen((o) => !o)}
      >
        <span className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-forest-deep">
          Order summary
        </span>
        <div className="flex items-center gap-3">
          <span className="font-display text-xl font-bold text-forest-deep">
            ₹{grand.toLocaleString("en-IN")}
          </span>
          {summaryOpen
            ? <ChevronUp className="size-5 text-forest font-bold" />
            : <ChevronDown className="size-5 text-forest font-bold" />
          }
        </div>
      </button>

      <AnimatePresence initial={false}>
        {(summaryOpen) && (
          <motion.div
            key="summary"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden lg:overflow-visible"
          >
            <div className="border border-ink/20 bg-white p-5 lg:p-6 rounded-lg shadow-sm">
              {/* Line items */}
              <p className="mb-4 hidden font-mono text-xs font-bold uppercase tracking-[0.25em] text-forest-deep lg:block">
                Order Summary
              </p>
              <div className="flex flex-col gap-4">
                {cart.map((line) => {
                  const p = getProduct(line.id);
                  const name = line.name || p?.name || "Product";
                  const price = line.price ?? p?.price ?? 0;
                  const image = line.image || p?.image || "";
                  const weight = line.weight || p?.weight || "";

                  return (
                    <div key={line.id} className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        {image ? (
                          <img
                            src={image}
                            alt={name}
                            className="size-14 rounded-lg object-cover ring-2 ring-forest/20 shadow-sm"
                          />
                        ) : (
                          <div className="size-14 rounded-lg bg-gray-100 ring-2 ring-forest/20 flex items-center justify-center text-xs text-gray-400">
                            IMG
                          </div>
                        )}
                        <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-forest font-mono text-[10px] font-bold text-ivory shadow ring-1 ring-white">
                          {line.quantity}
                        </span>
                      </div>
                      <div className="flex flex-1 items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold leading-snug text-forest-deep">{name}</p>
                          {weight && <p className="mt-0.5 font-mono text-xs font-semibold text-ink/75">{weight}</p>}
                        </div>
                        <span className="shrink-0 font-mono text-base font-bold text-forest-deep">
                          ₹{(price * line.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="mt-6 flex flex-col gap-3 border-t-2 border-ink/15 pt-5 text-sm">
                <div className="flex justify-between items-center text-forest-deep">
                  <span className="font-bold text-sm text-forest-deep">Subtotal</span>
                  <span className="font-mono text-base font-bold text-forest-deep">₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center text-forest-deep">
                  <span className="font-bold text-sm text-forest-deep">Shipping</span>
                  <span className="font-mono text-base font-bold text-forest">
                    {shipping === 0 ? "Free" : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex items-baseline justify-between border-t-2 border-ink/20 pt-4 mt-1">
                  <span className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-forest-deep">Total</span>
                  <span className="font-display text-2xl font-bold text-forest-deep">
                    ₹{grand.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-6 flex items-center justify-center gap-4 border-t border-ink/15 pt-4">
                <div className="flex items-center gap-1.5">
                  <Lock className="size-3.5 text-forest stroke-[2.5]" />
                  <span className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-forest-deep">Secure</span>
                </div>
                <div className="h-3.5 w-px bg-ink/25" />
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-forest stroke-[2.5]" />
                  <span className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-forest-deep">Protected</span>
                </div>
                <div className="h-3.5 w-px bg-ink/25" />
                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-forest-deep">
                  Evergreen Media
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────
// Review row
// ─────────────────────────────────────────────────────────────────
function ReviewRow({
  label, value, onEdit,
}: { label: string; value: string | React.ReactNode; onEdit: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-ink/15 py-3.5 last:border-0">
      <div>
        <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-forest">{label}</p>
        <div className="mt-1 text-sm font-semibold text-forest-deep">{value}</div>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="flex shrink-0 items-center gap-1 font-mono text-xs font-bold uppercase tracking-[0.15em] text-forest hover:text-gold transition-colors"
      >
        <Edit2 className="size-3.5" /> Edit
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Confirmation screen
// ─────────────────────────────────────────────────────────────────
function ConfirmationScreen({ order }: { order: ApiOrder }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-2xl px-6 py-16 text-center lg:px-0"
    >
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto mb-8 flex size-20 items-center justify-center rounded-full border-2 border-forest bg-forest/10"
      >
        <Check className="size-9 text-forest stroke-[3]" />
      </motion.div>

      <p className="font-mono text-xs font-bold uppercase tracking-[0.35em] text-gold">
        Order Confirmed
      </p>
      <h1 className="mt-3 font-display text-5xl font-bold leading-[0.95] text-forest-deep">
        Thank you for your <span className="italic text-gold">order.</span>
      </h1>
      <p className="mt-4 text-sm font-medium leading-relaxed text-forest-deep/80">
        We've received your order and will begin processing it shortly.
        A confirmation will be sent to your email.
      </p>

      {/* Order details card */}
      <div className="mt-10 border-2 border-ink/15 rounded-lg bg-white text-left shadow-sm">
        <div className="border-b border-ink/15 px-6 py-4">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-forest-deep">
            Order Details
          </p>
        </div>
        <div className="divide-y divide-ink/10 px-6">
          <div className="flex justify-between py-3.5 text-sm">
            <span className="font-bold text-forest-deep">Order Number</span>
            <span className="font-mono font-bold text-forest-deep">{order.order_number}</span>
          </div>
          <div className="flex justify-between py-3.5 text-sm">
            <span className="font-bold text-forest-deep">Date</span>
            <span
              className="font-semibold text-forest-deep"
              suppressHydrationWarning
            >
              {new Date(order.created_at).toLocaleDateString("en-IN", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </span>
          </div>
          <div className="flex justify-between py-3.5 text-sm">
            <span className="font-bold text-forest-deep">Payment</span>
            <span className={`font-mono text-xs font-bold uppercase tracking-[0.15em] ${
              order.payment_status === "paid" ? "text-forest" : "text-gold"
            }`}>
              {order.payment_status === "paid" ? "Paid" : "Pending"}
            </span>
          </div>
          <div className="flex justify-between py-3.5 text-sm">
            <span className="font-bold text-forest-deep">Deliver to</span>
            <span className="text-right font-semibold text-forest-deep max-w-[220px]">
              {order.ship_name}, {order.ship_city}, {order.ship_state} — {order.ship_pincode}
            </span>
          </div>
          <div className="flex justify-between py-3.5 text-sm">
            <span className="font-bold text-forest-deep">Grand Total</span>
            <span className="font-display text-2xl font-bold text-forest-deep">
              ₹{order.grand_total.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* CTA buttons */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          to="/"
          className="flex items-center justify-center gap-2 rounded-full border-2 border-forest px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.22em] text-forest transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest hover:text-ivory hover:shadow-md active:translate-y-0"
        >
          Continue Shopping
        </Link>
        <Link
          to="/shop"
          className="flex items-center justify-center gap-2 rounded-full bg-forest px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.22em] text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-deep hover:shadow-lg active:translate-y-0"
        >
          Shop More
        </Link>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Empty cart screen
// ─────────────────────────────────────────────────────────────────
function EmptyCart() {
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center gap-5 text-center">
      <div className="flex size-16 items-center justify-center rounded-full border-2 border-forest/30 bg-forest/5">
        <span className="font-display text-2xl font-bold text-forest">0</span>
      </div>
      <h1 className="font-display text-4xl font-bold text-forest-deep">
        Your cart is <span className="italic text-gold">empty.</span>
      </h1>
      <p className="max-w-xs text-sm font-semibold text-ink/80">
        Add products to your cart before proceeding to checkout.
      </p>
      <Link
        to="/shop"
        className="mt-2 flex items-center gap-2 rounded-full bg-forest px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.22em] text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-deep hover:shadow-lg active:translate-y-0"
      >
        Shop the range <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main checkout page
// ─────────────────────────────────────────────────────────────────
function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useStore() as ReturnType<typeof useStore> & { clearCart?: () => void };
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(1);
  const [address, setAddress] = useState<AddressForm>({ ...EMPTY_ADDRESS });
  const [errors, setErrors] = useState<Partial<Record<keyof AddressForm, string>>>({});
  const [delivery, setDelivery] = useState<DeliveryOption>(DELIVERY_OPTIONS[0]!);
  const [payment, setPayment] = useState("online");
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState<ApiOrder | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // Scroll to top on step change
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  // ── Validation ──────────────────────────────────────────────────
  function validateStep1(): boolean {
    const e: typeof errors = {};
    if (!address.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(address.email)) e.email = "Enter a valid email";
    if (!address.phone.trim()) e.phone = "Phone is required";
    else if (!/^[6-9]\d{9}$/.test(address.phone)) e.phone = "Enter a valid 10-digit mobile number";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep2(): boolean {
    const e: typeof errors = {};
    if (!address.firstName.trim()) e.firstName = "Required";
    if (!address.lastName.trim()) e.lastName = "Required";
    if (!address.line1.trim()) e.line1 = "Address is required";
    if (!address.city.trim()) e.city = "City is required";
    if (!address.state.trim()) e.state = "State is required";
    if (!address.pincode.trim()) e.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(address.pincode)) e.pincode = "Enter a valid 6-digit pincode";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function upd(field: keyof AddressForm) {
    return (v: string) => {
      setAddress((a) => ({ ...a, [field]: v }));
      setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
    };
  }

  // ── Place order ─────────────────────────────────────────────────
  async function placeOrder() {
    setPlacing(true);
    setPlaceError("");
    const addressPayload: {
      name: string;
      phone: string;
      line1: string;
      line2?: string;
      city: string;
      state: string;
      pincode: string;
      country?: string;
    } = {
      name: `${address.firstName} ${address.lastName}`.trim(),
      phone: address.phone,
      line1: address.line1,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country || "India",
    };
    if (address.line2.trim()) {
      addressPayload.line2 = address.line2.trim();
    }
    const res = await ordersApi.checkout({
      address: addressPayload,
      payment_method: payment,
      items: cart.map((line) => {
        const p = getProduct(line.id);
        const num = Number(line.id);
        const pid = !isNaN(num) && num > 0 ? num : (p?.numericId ?? SLUG_TO_NUMERIC_ID[line.id] ?? line.id);
        return { product_id: pid, quantity: line.quantity };
      }),
    });
    setPlacing(false);
    if (res.success && res.data) {
      setConfirmedOrder(res.data);
      if (typeof clearCart === "function") clearCart();
      localStorage.removeItem("evergreen-cart");
    } else {
      setPlaceError(res.message ?? "Order could not be placed. Please try again.");
    }
  }

  // ── Confirmed ───────────────────────────────────────────────────
  if (confirmedOrder) {
    return (
      <main className="bg-ivory">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
          <ConfirmationScreen order={confirmedOrder} />
        </div>
      </main>
    );
  }

  // ── Empty cart ──────────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <main className="bg-ivory">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
          <EmptyCart />
        </div>
      </main>
    );
  }

  const shipping = delivery.price;
  const grand = Math.max(0, cartTotal + shipping);

  // ── Render ──────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-ivory text-ink">
      <div ref={topRef} className="mx-auto max-w-[1440px] px-6 pb-24 pt-10 lg:px-10 lg:pt-14">

        {/* Logo + progress */}
        <div className="mb-8 text-center lg:mb-10">
          <Link to="/" className="inline-block font-display text-2xl font-bold tracking-[0.22em] text-forest-deep">
            EVERGREEN <span className="text-gold">MEDIA</span>
          </Link>
        </div>

        <ProgressBar current={step} />

        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]">

          {/* ── LEFT — step content ── */}
          <div>
            {/* ════════════════════════════════════
                STEP 1 — CONTACT INFORMATION
            ════════════════════════════════════ */}
            {step === 1 && (
              <StepPanel stepKey={1}>
                <StepHeading index="01" title="Contact Information" />
                <div className="flex flex-col gap-6">
                  <Field
                    id="email" label="Email Address" type="email"
                    value={address.email} onChange={upd("email")}
                    error={errors.email} autoComplete="email"
                  />
                  <Field
                    id="phone" label="Phone Number" type="tel"
                    value={address.phone} onChange={upd("phone")}
                    error={errors.phone} autoComplete="tel"
                    placeholder="10-digit mobile number"
                  />
                  <p className="font-mono text-xs font-semibold text-forest-deep/80">
                    Have an account?{" "}
                    <Link to="/shop" className="text-forest font-bold underline underline-offset-2 hover:text-gold">
                      Sign in
                    </Link>{" "}
                    to auto-fill your details.
                  </p>
                </div>
                <NavButtons
                  onBack={() => navigate({ to: "/cart" })}
                  backLabel="Back to cart"
                  onNext={() => { if (validateStep1()) setStep(2); }}
                  nextLabel="Continue to address"
                />
              </StepPanel>
            )}

            {/* ════════════════════════════════════
                STEP 2 — SHIPPING ADDRESS
            ════════════════════════════════════ */}
            {step === 2 && (
              <StepPanel stepKey={2}>
                <StepHeading index="02" title="Shipping Address" />
                <div className="flex flex-col gap-5">
                  <div className="grid grid-cols-2 gap-5">
                    <Field
                      id="firstName" label="First Name"
                      value={address.firstName} onChange={upd("firstName")}
                      error={errors.firstName} autoComplete="given-name"
                    />
                    <Field
                      id="lastName" label="Last Name"
                      value={address.lastName} onChange={upd("lastName")}
                      error={errors.lastName} autoComplete="family-name"
                    />
                  </div>
                  <Field
                    id="line1" label="Address"
                    value={address.line1} onChange={upd("line1")}
                    error={errors.line1} autoComplete="address-line1"
                    placeholder="House no., building, street"
                  />
                  <Field
                    id="line2" label="Apartment / Area (optional)" required={false}
                    value={address.line2} onChange={upd("line2")}
                    autoComplete="address-line2"
                    placeholder="Flat, colony, locality"
                  />
                  <div className="grid grid-cols-2 gap-5">
                    <Field
                      id="city" label="City"
                      value={address.city} onChange={upd("city")}
                      error={errors.city} autoComplete="address-level2"
                    />
                    <Field
                      id="pincode" label="Pincode"
                      value={address.pincode} onChange={upd("pincode")}
                      error={errors.pincode} autoComplete="postal-code"
                      placeholder="6-digit pincode"
                    />
                  </div>
                  <SelectField
                    id="state" label="State"
                    value={address.state} onChange={upd("state")}
                    options={INDIAN_STATES} error={errors.state}
                  />
                  <Field
                    id="country" label="Country" required={false}
                    value={address.country} onChange={upd("country")}
                    autoComplete="country-name"
                  />
                </div>
                <NavButtons
                  onBack={() => setStep(1)}
                  onNext={() => { if (validateStep2()) setStep(3); }}
                  nextLabel="Continue to delivery"
                />
              </StepPanel>
            )}

            {/* ════════════════════════════════════
                STEP 3 — DELIVERY METHOD
            ════════════════════════════════════ */}
            {step === 3 && (
              <StepPanel stepKey={3}>
                <StepHeading index="03" title="Delivery Method" />
                <div className="flex flex-col gap-3">
                  {DELIVERY_OPTIONS.map((opt) => (
                    <motion.button
                      key={opt.id}
                      type="button"
                      onClick={() => setDelivery(opt)}
                      whileTap={{ scale: 0.99 }}
                      className={`relative flex w-full items-center justify-between border-2 px-5 py-4 text-left transition-all duration-200 rounded-lg ${
                        delivery.id === opt.id
                          ? "border-forest bg-forest/10 shadow-sm"
                          : "border-ink/20 bg-white hover:border-forest/50"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Radio indicator */}
                        <div className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                          delivery.id === opt.id ? "border-forest bg-white" : "border-ink/35 bg-white"
                        }`}>
                          {delivery.id === opt.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="size-2.5 rounded-full bg-forest"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-mono text-xs sm:text-sm font-bold uppercase tracking-[0.18em] text-forest-deep">
                            {opt.label}
                          </p>
                          <p className="mt-0.5 text-xs font-semibold text-forest-deep/80">{opt.desc}</p>
                          <p className="mt-1 font-mono text-xs font-bold text-forest">{opt.days}</p>
                        </div>
                      </div>
                      <span className={`font-mono text-base font-bold ${
                        delivery.id === opt.id ? "text-forest" : "text-forest-deep"
                      }`}>
                        {opt.price === 0 ? "Free" : `₹${opt.price}`}
                      </span>
                    </motion.button>
                  ))}
                </div>
                <NavButtons
                  onBack={() => setStep(2)}
                  onNext={() => setStep(4)}
                  nextLabel="Continue to payment"
                />
              </StepPanel>
            )}

            {/* ════════════════════════════════════
                STEP 4 — PAYMENT
            ════════════════════════════════════ */}
            {step === 4 && (
              <StepPanel stepKey={4}>
                <StepHeading index="04" title="Payment" />

                {/* Payment cards */}
                <div className="flex flex-col gap-3">
                  {PAYMENT_METHODS.map((m) => (
                    <motion.button
                      key={m.id}
                      type="button"
                      onClick={() => setPayment(m.id)}
                      whileTap={{ scale: 0.99 }}
                      className={`flex w-full items-center gap-4 border-2 px-5 py-4 text-left transition-all duration-200 rounded-lg ${
                        payment === m.id
                          ? "border-forest bg-forest/10 shadow-sm"
                          : "border-ink/20 bg-white hover:border-forest/50"
                      }`}
                    >
                      <div className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        payment === m.id ? "border-forest bg-white" : "border-ink/35 bg-white"
                      }`}>
                        {payment === m.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="size-2.5 rounded-full bg-forest"
                          />
                        )}
                      </div>
                      <span className="text-2xl">{m.icon}</span>
                      <div>
                        <p className="font-mono text-xs sm:text-sm font-bold uppercase tracking-[0.18em] text-forest-deep">
                          {m.label}
                        </p>
                        <p className="mt-0.5 text-xs font-semibold text-forest-deep/80">{m.sub}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Online payment note */}
                {payment === "online" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 border-2 border-gold/30 bg-gold/10 px-5 py-4 rounded-lg"
                  >
                    <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-gold">
                      Razorpay / UPI
                    </p>
                    <p className="mt-1 text-xs font-semibold text-forest-deep">
                      You will be redirected to our secure payment gateway after order review.
                      We never store your card details.
                    </p>
                  </motion.div>
                )}

                {/* Secure badge */}
                <div className="mt-6 flex items-center gap-2 text-forest-deep">
                  <Lock className="size-4 shrink-0 text-forest stroke-[2.5]" />
                  <p className="text-xs font-bold">
                    Secure Checkout — your payment information is encrypted and protected.
                  </p>
                </div>

                <NavButtons
                  onBack={() => setStep(3)}
                  onNext={() => setStep(5)}
                  nextLabel="Review order"
                />
              </StepPanel>
            )}

            {/* ════════════════════════════════════
                STEP 5 — REVIEW & PLACE ORDER
            ════════════════════════════════════ */}
            {step === 5 && (
              <StepPanel stepKey={5}>
                <StepHeading index="05" title="Review Your Order" />

                {/* Review rows */}
                <div className="border-2 border-ink/15 rounded-lg bg-white p-5 shadow-sm">
                  <ReviewRow
                    label="Contact"
                    value={<span>{address.email}<br />{address.phone}</span>}
                    onEdit={() => setStep(1)}
                  />
                  <ReviewRow
                    label="Ship to"
                    value={
                      <span>
                        {address.firstName} {address.lastName}<br />
                        {address.line1}{address.line2 ? `, ${address.line2}` : ""}<br />
                        {address.city}, {address.state} — {address.pincode}
                        {address.country ? `, ${address.country}` : ""}
                      </span>
                    }
                    onEdit={() => setStep(2)}
                  />
                  <ReviewRow
                    label="Delivery"
                    value={`${delivery.label} · ${delivery.price === 0 ? "Free" : `₹${delivery.price}`} · ${delivery.days}`}
                    onEdit={() => setStep(3)}
                  />
                  <ReviewRow
                    label="Payment"
                    value={PAYMENT_METHODS.find((m) => m.id === payment)?.label ?? payment}
                    onEdit={() => setStep(4)}
                  />
                </div>

                {/* Products recap */}
                <div className="mt-6 border-2 border-ink/15 rounded-lg bg-white p-5 shadow-sm">
                  <p className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.25em] text-forest-deep">
                    Items Ordered
                  </p>
                  <div className="flex flex-col gap-3">
                    {cart.map((line) => {
                      const p = getProduct(line.id);
                      const name = line.name || p?.name || "Product";
                      const price = line.price ?? p?.price ?? 0;
                      const image = line.image || p?.image || "";
                      const weight = line.weight || p?.weight || "";

                      return (
                        <div key={line.id} className="flex items-center gap-3 border-b border-ink/10 pb-3.5 last:border-0">
                          {image ? (
                            <img src={image} alt={name} className="size-12 rounded-lg object-cover ring-1 ring-forest/20" />
                          ) : (
                            <div className="size-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                              IMG
                            </div>
                          )}
                          <div className="flex flex-1 items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-bold text-forest-deep">{name}</p>
                              <p className="font-mono text-xs font-semibold text-forest-deep/80">
                                {weight ? `${weight} · ` : ""}Qty {line.quantity}
                              </p>
                            </div>
                            <span className="font-mono text-base font-bold text-forest-deep">
                              ₹{(price * line.quantity).toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Grand total recap */}
                <div className="mt-5 flex items-baseline justify-between border-t-2 border-ink/20 pt-5">
                  <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-forest-deep">
                    Grand Total
                  </span>
                  <span className="font-display text-3xl font-bold text-forest-deep">
                    ₹{grand.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {placeError && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-4 flex items-start gap-2 border-2 border-red-300 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 rounded-lg"
                    >
                      <X className="mt-0.5 size-4 shrink-0" />
                      {placeError}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Place order CTA */}
                <div className="mt-7">
                  <motion.button
                    type="button"
                    onClick={placeOrder}
                    disabled={placing}
                    whileTap={{ scale: 0.98 }}
                    className="flex w-full items-center justify-center gap-3 rounded-full bg-forest py-4 font-mono text-xs font-bold uppercase tracking-[0.25em] text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-deep hover:shadow-xl disabled:opacity-60 active:translate-y-0 shadow-md"
                  >
                    {placing ? (
                      <><Loader2 className="size-4 animate-spin" /> Processing Order…</>
                    ) : (
                      <><Lock className="size-4 stroke-[2.5]" /> Place Order · ₹{grand.toLocaleString("en-IN")}</>
                    )}
                  </motion.button>
                  <p className="mt-3 text-center font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-forest-deep/80">
                    Secure checkout · Safe payment · Order confirmation by email
                  </p>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.18em] text-forest hover:text-gold transition-colors"
                  >
                    <ArrowLeft className="size-3.5" /> Back
                  </button>
                </div>
              </StepPanel>
            )}
          </div>

          {/* ── RIGHT — sticky order summary ── */}
          <div>
            <OrderSummary delivery={delivery} />
          </div>
        </div>
      </div>
    </main>
  );
}

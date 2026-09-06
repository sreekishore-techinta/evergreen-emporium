import { Link } from "@tanstack/react-router";
import { ArrowRight, Heart, Menu, Minus, Plus, Search, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getProduct, products, useStore, type Product } from "@/lib/storefront";

const nav = [{ label: "Shop", to: "/shop" }, { label: "Categories", to: "/categories" }, { label: "Solutions", to: "/solutions" }, { label: "Learn", to: "/learn" }, { label: "About", to: "/about" }];

export function SiteHeader() {
  const { cartCount, wishlist } = useStore();
  const [open, setOpen] = useState(false);
  return <header className="sticky top-0 z-50 bg-forest text-ivory">
    <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 lg:px-10">
      <Link to="/" className="font-display text-2xl font-semibold tracking-[0.22em]">EVERGREEN <span className="text-gold">MEDIA</span></Link>
      <nav className="hidden items-center gap-8 text-[11px] uppercase tracking-[0.2em] text-ivory/70 md:flex">{nav.map((item) => <Link key={item.to} to={item.to} activeProps={{ className: "text-gold" }} className="transition-colors hover:text-ivory">{item.label}</Link>)}</nav>
      <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.2em]">
        <Link to="/shop" search={{ q: "" }} className="hidden transition-colors hover:text-ivory sm:block"><Search className="mr-1 inline size-3.5" /> Search</Link>
        <Link to="/wishlist" className="hidden transition-colors hover:text-gold sm:block">Wishlist <span className="text-gold">{wishlist.length}</span></Link>
        <Link to="/cart" className="transition-colors hover:text-ivory"><ShoppingBag className="mr-1 inline size-3.5" /> Cart <span className="text-gold">{cartCount}</span></Link>
        <Button variant="ghost" size="icon" className="text-ivory hover:bg-ivory/10 hover:text-ivory md:hidden" onClick={() => setOpen(!open)} aria-label="Open navigation">{open ? <X /> : <Menu />}</Button>
      </div>
    </div>
    {open && <nav className="border-t border-ivory/15 bg-forest px-6 py-5 md:hidden">{nav.map((item) => <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className="block border-b border-ivory/10 py-3 text-xs uppercase tracking-[0.18em] text-ivory/75">{item.label}</Link>)}</nav>}
  </header>;
}

export function SiteFooter() {
  return <footer className="bg-forest-deep text-ivory"><div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-8 px-6 py-16 lg:px-10"><div className="col-span-12 md:col-span-5"><Link to="/" className="font-display text-2xl font-semibold tracking-[0.22em]">EVERGREEN <span className="text-gold">MEDIA</span></Link><p className="mt-4 max-w-[34ch] text-sm leading-relaxed text-ivory/60">Premium agricultural inputs for healthier soil, stronger roots and thriving plants.</p></div><FooterColumn title="Shop" links={[["All Products", "/shop"], ["Categories", "/categories"], ["Solutions", "/solutions"]]} /><FooterColumn title="Company" links={[["About", "/about"], ["Learn", "/learn"], ["Contact", "/contact"]]} /><div className="col-span-12 md:col-span-3"><p className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold">Stay grounded</p><form className="mt-4 flex border-b border-ivory/30 focus-within:border-gold"><input aria-label="Email address" type="email" placeholder="Email address" className="w-full bg-transparent py-2 text-sm placeholder:text-ivory/40 focus:outline-none" /><button type="submit" className="text-[11px] uppercase tracking-[0.2em] text-gold">Join</button></form></div></div><div className="border-t border-ivory/10"><div className="mx-auto flex max-w-[1440px] flex-wrap justify-between gap-3 px-6 py-6 font-mono text-[10px] uppercase tracking-[0.2em] text-ivory/50 lg:px-10"><span>© 2026 Evergreen Media (MEX)</span><span>Privacy · Terms · Shipping</span></div></div></footer>;
}

function FooterColumn({ title, links }: { title: string; links: string[][] }) { return <div className="col-span-6 md:col-span-2"><p className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold">{title}</p><ul className="mt-4 space-y-2 text-sm text-ivory/70">{links.map(([label, to]) => <li key={to}><Link to={to} className="transition-colors hover:text-ivory">{label}</Link></li>)}</ul></div>; }

export function SectionLabel({ index, children }: { index: string; children: string }) { return <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-forest/60">({index}) — {children}</p>; }
export function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: React.ReactNode; description?: string }) { return <div className="border-b border-ink/10 pb-10 pt-16 md:pt-24"><SectionLabel index="00" >{eyebrow}</SectionLabel><h1 className="mt-4 max-w-4xl font-display text-5xl font-medium leading-[0.95] text-forest-deep md:text-7xl">{title}</h1>{description && <p className="mt-6 max-w-xl text-sm leading-relaxed text-ink/70">{description}</p>}</div>; }

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  return <article className="group"><div className={`relative overflow-hidden rounded-[min(1vw,12px)] bg-ivory-soft ${compact ? "aspect-square" : "aspect-[4/5]"}`}><Link to="/product/$id" params={{ id: product.id }}><img src={product.image} alt={`${product.name} natural material study`} loading="lazy" width={1024} height={1024} className="size-full object-cover transition duration-700 group-hover:scale-105" /></Link><Button variant="ghost" size="icon" onClick={() => toggleWishlist(product.id)} aria-label={isWishlisted(product.id) ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`} className="absolute right-3 top-3 rounded-full bg-ivory/90 text-forest hover:bg-gold hover:text-forest-deep"> <Heart className={isWishlisted(product.id) ? "fill-current" : ""} /></Button></div><div className="mt-4 flex items-start justify-between gap-3"><div><Link to="/product/$id" params={{ id: product.id }} className="font-display text-2xl font-medium text-forest-deep hover:text-gold">{product.name}</Link><p className="text-xs text-ink/55">{product.category} · {product.weight}</p></div><span className="text-sm font-medium text-ink">₹{product.price.toLocaleString("en-IN")}</span></div><p className="mt-2 text-xs leading-relaxed text-ink/60">{product.description}</p><Button variant="outline" onClick={() => addToCart(product.id)} className="mt-4 w-full rounded-none border-forest/25 text-forest hover:bg-forest hover:text-ivory">Add to Cart</Button></article>;
}

export function QuantityControl({ id, quantity }: { id: string; quantity: number }) { const { updateQuantity } = useStore(); return <div className="flex items-center border border-ink/15"><Button variant="ghost" size="icon" onClick={() => updateQuantity(id, quantity - 1)} aria-label="Decrease quantity"><Minus /></Button><span className="min-w-8 text-center text-sm">{quantity}</span><Button variant="ghost" size="icon" onClick={() => updateQuantity(id, quantity + 1)} aria-label="Increase quantity"><Plus /></Button></div>; }
export { getProduct, products };
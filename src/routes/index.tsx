import { Link } from "@tanstack/react-router";
import heroImage from "@/assets/evergreen-hero.jpg";
import storyImage from "@/assets/evergreen-story.jpg";
import microbesImage from "@/assets/evergreen-microbes.jpg";
import fertilizerImage from "@/assets/evergreen-fertilizer.jpg";
import compostImage from "@/assets/evergreen-compost.jpg";
import cocopeatImage from "@/assets/evergreen-cocopeat.jpg";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ProductCard, SectionLabel } from "@/components/storefront";
import { products } from "@/lib/storefront";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Evergreen Media — Grow Better, Nourish Naturally" },
    { name: "description", content: "Premium agricultural solutions for healthier soil, stronger roots and thriving plants." },
    { property: "og:title", content: "Evergreen Media — Grow Better, Nourish Naturally" },
    { property: "og:description", content: "Premium agricultural solutions for healthier soil, stronger roots and thriving plants." },
  ] }),
  component: HomePage,
});

const categories = [
  ["Biofertilizers", "Live cultures for living soil", microbesImage, "/shop"],
  ["Organic Fertilizers", "Slow-release natural nutrition", fertilizerImage, "/shop"],
  ["Soil Enhancers", "Build a richer soil profile", compostImage, "/shop"],
  ["Growing Media", "Cocopeat and root substrates", cocopeatImage, "/shop"],
  ["Plant Nutrition", "Thoughtful inputs for growth", fertilizerImage, "/shop"],
  ["Plant Protection", "Botanical everyday care", compostImage, "/shop"],
] as const;

function HomePage() {
  return <main className="bg-ivory text-ink">
    <section className="relative flex min-h-[calc(100vh-4rem)] items-end overflow-hidden">
      <img src={heroImage} alt="Healthy plants growing in a sunlit greenhouse" width={1920} height={1088} className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-forest-deep/45" />
      <div className="relative mx-auto w-full max-w-[1440px] px-6 pb-14 lg:px-10"><SectionLabel index="00">Soil science, made tangible</SectionLabel><p className="mt-5 font-mono text-[11px] uppercase tracking-[0.3em] text-gold animate-rise">Evergreen Media · MEX</p><h1 className="mt-4 max-w-5xl font-display text-[clamp(3.5rem,8vw,8rem)] font-medium leading-[0.85] text-ivory animate-reveal">Grow Better.<br /><span className="italic text-gold">Nourish Naturally.</span></h1><p className="mt-6 max-w-md text-sm leading-relaxed text-ivory/80 animate-rise">Premium agricultural solutions for healthier soil, stronger roots and thriving plants.</p><div className="mt-8 flex flex-wrap items-center gap-5 animate-rise"><Button asChild className="rounded-none bg-gold px-6 py-3 text-[11px] uppercase tracking-[0.2em] text-forest-deep hover:bg-ivory"><Link to="/shop">Shop Products</Link></Button><Link to="/solutions" className="text-[11px] uppercase tracking-[0.2em] text-ivory underline decoration-ivory/40 underline-offset-8 transition hover:text-gold">Explore Solutions <span aria-hidden="true">→</span></Link></div></div>
    </section>

    <section className="mx-auto grid max-w-[1440px] grid-cols-12 gap-x-8 gap-y-8 px-6 py-20 lg:px-10"><div className="col-span-12 md:col-span-5"><SectionLabel index="01">The approach</SectionLabel><h2 className="mt-4 font-display text-5xl font-medium leading-tight text-forest-deep">Better Soil.<br />Stronger Roots.<br /><span className="italic text-gold">Healthier Growth.</span></h2><p className="mt-6 max-w-md text-sm leading-relaxed text-ink/70">We craft living inputs — microbial cultures, organic amenders and refined growing media — formulated so every plant starts from a healthier foundation.</p></div><div className="col-span-12 md:col-span-6 md:col-start-7"><img src={storyImage} alt="Young plant growing from rich soil beside stone" loading="lazy" width={1088} height={1200} className="aspect-[4/5] w-full rounded-[min(1vw,12px)] object-cover" /></div></section>

    <section className="border-t editorial-rule"><div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-10"><div className="flex items-baseline justify-between"><SectionLabel index="02">Categories</SectionLabel><Link to="/categories" className="text-[11px] uppercase tracking-[0.2em] text-forest hover:text-gold">View all</Link></div><div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 md:gap-x-8">{categories.map(([name, description, image, to], index) => <Link to={to} key={name} className="group"><div className="overflow-hidden rounded-[min(1vw,12px)]"><img src={image} alt={`${name} natural material`} loading="lazy" width={1024} height={1024} className="aspect-square w-full object-cover transition duration-700 group-hover:scale-105" /></div><div className="mt-4 flex items-baseline justify-between border-b border-ink/10 pb-3"><div><span className="font-display text-2xl font-medium text-forest-deep">{name}</span><p className="mt-1 text-xs text-ink/55">{description}</p></div><span className="font-mono text-[10px] text-ink/40">0{index + 3}</span></div></Link>)}</div></div></section>

    <section className="border-t editorial-rule"><div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-10"><div className="flex items-baseline justify-between"><SectionLabel index="03">Featured products</SectionLabel><Link to="/shop" className="text-[11px] uppercase tracking-[0.2em] text-forest hover:text-gold">Shop all</Link></div><div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">{products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} compact />)}</div></div></section>

    <section className="bg-forest text-ivory"><div className="mx-auto grid max-w-[1440px] grid-cols-12 items-center gap-8 px-6 py-24 lg:px-10"><div className="col-span-12 md:col-span-7"><SectionLabel index="04">Brand story</SectionLabel><h2 className="mt-4 max-w-2xl font-display text-5xl font-medium leading-tight">From Soil to Stronger Growth.</h2><p className="mt-5 max-w-xl text-sm leading-relaxed text-ivory/70">A living sequence — healthy soil feeds strong roots, strong roots feed healthy plants, and healthy plants simply grow better.</p><div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ivory/60"><span>Healthy Soil</span><span className="text-gold">→</span><span>Strong Roots</span><span className="text-gold">→</span><span>Healthy Plants</span><span className="text-gold">→</span><span>Stronger Growth</span></div></div><div className="col-span-12 md:col-span-5"><img src={storyImage} alt="Plant roots in rich soil" loading="lazy" width={1088} height={1200} className="aspect-square w-full rounded-[min(1vw,12px)] object-cover" /></div></div></section>

    <section className="mx-auto max-w-[1440px] px-6 py-24 text-center lg:px-10"><h2 className="mx-auto max-w-3xl font-display text-5xl font-medium leading-tight text-forest-deep md:text-7xl">Give your plants a <span className="italic text-gold">better foundation.</span></h2><Button asChild className="mt-8 rounded-none bg-forest px-7 py-3.5 text-[11px] uppercase tracking-[0.2em] text-ivory hover:bg-forest-deep"><Link to="/shop">Shop Products</Link></Button></section>
  </main>;
}
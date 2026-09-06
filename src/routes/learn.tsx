import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageIntro } from "@/components/storefront";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn — Evergreen Media" },
      { name: "description", content: "Growing knowledge, soil science and organic gardening guides from Evergreen Media." },
    ],
  }),
  component: LearnPage,
});

const ARTICLES = [
  {
    title: "Understanding Soil Health",
    excerpt:
      "The living ecosystem beneath your feet is the single most important factor in plant performance. Here's how to read and improve it.",
    tag: "Soil Science",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?w=800&q=80&auto=format&fit=crop",
    related: ["vermicompost", "pseudomonas"],
  },
  {
    title: "Choosing the Right Plant Nutrition",
    excerpt:
      "Not all fertilisers are equal. This guide helps you match the right nutrient input to the right stage of your plant's life cycle.",
    tag: "Plant Nutrition",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80&auto=format&fit=crop",
    related: ["bone-meal", "neem-cake"],
  },
  {
    title: "Organic Gardening Essentials",
    excerpt:
      "Building a thriving organic garden is about rhythm and observation. Start with these core principles and trusted natural inputs.",
    tag: "Organic Gardening",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&q=80&auto=format&fit=crop",
    related: ["vermicompost", "cocopeat"],
  },
  {
    title: "Biofertilizers Explained",
    excerpt:
      "Microbial inoculants like Pseudomonas and VAM work with the soil food web to improve nutrient availability and root health.",
    tag: "Biofertilizers",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&q=80&auto=format&fit=crop",
    related: ["pseudomonas", "vam"],
  },
  {
    title: "Getting the Most from Cocopeat",
    excerpt:
      "Cocopeat is one of the most versatile growing media available. Learn how to use it in containers, seed trays and soil blends.",
    tag: "Growing Media",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800&q=80&auto=format&fit=crop",
    related: ["cocopeat"],
  },
  {
    title: "Terrace Gardening: A Starter Guide",
    excerpt:
      "Limited space doesn't mean limited results. The right growing media, nutrition and containers make all the difference.",
    tag: "Terrace Gardening",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1531971589569-0d9370cbe1e5?w=800&q=80&auto=format&fit=crop",
    related: ["cocopeat", "vermicompost", "bone-meal"],
  },
];

function LearnPage() {
  return (
    <main className="bg-ivory text-ink">
      <div className="mx-auto max-w-[1440px] px-6 pb-24 lg:px-10">
        <PageIntro
          eyebrow="Knowledge"
          title={<>Learn. Grow. <span className="italic text-gold">Thrive.</span></>}
          description="Growing knowledge, soil science and practical guidance for every stage of your growing journey."
        />

        <div className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.map((article) => (
            <article key={article.title} className="group flex flex-col">
              <div className="overflow-hidden rounded-[min(1vw,10px)]">
                <img
                  src={article.image}
                  alt={article.title}
                  loading="lazy"
                  width={800}
                  height={533}
                  className="aspect-[3/2] w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
              <div className="mt-5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="bg-gold/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-gold">
                    {article.tag}
                  </span>
                  <span className="font-mono text-[9px] text-ink/35">{article.readTime}</span>
                </div>
                <h2 className="font-display text-2xl font-medium leading-snug text-forest-deep transition-colors group-hover:text-gold">
                  {article.title}
                </h2>
                <p className="text-sm leading-relaxed text-ink/55">{article.excerpt}</p>
                <div className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-forest transition-all group-hover:gap-4 group-hover:text-gold">
                  Read article <ArrowRight className="size-3" />
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-20 border-t border-ink/10 pt-12 text-center">
          <p className="font-display text-3xl text-forest-deep">
            Ready to put it into practice?
          </p>
          <p className="mt-3 text-sm text-ink/60">
            Find the right product for your growing goals.
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-flex items-center gap-2 bg-forest px-7 py-3.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ivory transition-colors hover:bg-forest-deep"
          >
            Shop the range <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </main>
  );
}

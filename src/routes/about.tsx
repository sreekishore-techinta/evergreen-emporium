import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageIntro, SectionLabel } from "@/components/storefront";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Evergreen Media" },
      { name: "description", content: "Evergreen Media (MEX) — natural agricultural inputs for healthier soil, stronger roots and thriving plants." },
    ],
  }),
  component: AboutPage,
});

const VALUES = [
  {
    index: "01",
    title: "Natural, always.",
    body: "Every product in the Evergreen Media range is built around natural inputs. No synthetic shortcuts — only carefully sourced organic and microbial materials.",
  },
  {
    index: "02",
    title: "The soil first.",
    body: "We work backward from the soil. A healthy, living soil profile is the foundation for every growth outcome we care about.",
  },
  {
    index: "03",
    title: "Clarity over complexity.",
    body: "Good growing shouldn't require a degree. We present our products honestly — what they do, how to use them and why they work.",
  },
  {
    index: "04",
    title: "Quality as the standard.",
    body: "From sourcing to formulation, quality governs every decision. Each product earns its place in the range by performing consistently.",
  },
];

function AboutPage() {
  return (
    <main className="bg-ivory text-ink">
      <div className="mx-auto max-w-[1440px] px-6 pb-24 lg:px-10">
        <PageIntro
          eyebrow="Our story"
          title={<>Evergreen <span className="italic text-gold">Media.</span></>}
          description="A natural agricultural brand focused on soil health, root biology and plant nutrition — crafted for home growers, nurseries and commercial producers alike."
        />

        {/* Mission */}
        <div className="mt-20 grid grid-cols-12 gap-x-8 gap-y-12">
          <div className="col-span-12 lg:col-span-5">
            <SectionLabel index="01">Mission</SectionLabel>
            <h2 className="mt-4 font-display text-4xl font-medium leading-tight text-forest-deep">
              Better inputs.<br />
              <span className="italic text-gold">Better growing.</span>
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <p className="text-sm leading-loose text-ink/65">
              Evergreen Media (MEX) was built on a simple idea: that the best growing outcomes
              come from working with nature rather than against it. We source and formulate
              microbial cultures, organic fertilisers, soil conditioners and growing media that
              genuinely support the way soil and plants function.
            </p>
            <p className="mt-5 text-sm leading-loose text-ink/65">
              Our range is designed for growers who want to do things properly — whether that's
              a terrace garden in Chennai, a nursery in Coimbatore or a commercial farm in Tamil
              Nadu. Every product we offer is chosen for what it actually contributes to a
              healthier growing system.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mt-20 border-t border-ink/10 pt-16">
          <SectionLabel index="02">Values</SectionLabel>
          <h2 className="mt-4 font-display text-4xl font-medium text-forest-deep">
            What guides us.
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.index} className="border-t-2 border-gold/30 pt-6">
                <SectionLabel index={v.index}>{v.title}</SectionLabel>
                <h3 className="mt-3 font-display text-xl font-medium text-forest-deep">{v.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/60">{v.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 border-t border-ink/10 pt-12 text-center">
          <p className="font-display text-3xl text-forest-deep">
            Explore the range.
          </p>
          <p className="mt-3 text-sm text-ink/60">
            Natural inputs for every stage of the growing journey.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-forest px-7 py-3.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ivory transition-colors hover:bg-forest-deep"
            >
              Shop products <ArrowRight className="size-3" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 border border-forest/25 px-7 py-3.5 font-mono text-[10px] uppercase tracking-[0.22em] text-forest transition-colors hover:bg-forest hover:text-ivory"
            >
              Get in touch <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

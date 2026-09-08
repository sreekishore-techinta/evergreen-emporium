import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageIntro, SectionLabel } from "@/components/storefront";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Evergreen Media" },
      { name: "description", content: "Get in touch with Evergreen Media for product enquiries, wholesale and growing advice." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <main className="bg-ivory text-ink">
      <div className="mx-auto max-w-[1440px] px-6 pb-24 lg:px-10">
        <PageIntro
          eyebrow="Get in touch"
          title={<>We'd love to <span className="italic text-gold">hear from you.</span></>}
          description="Product enquiries, wholesale orders or just a growing question — reach us below and we'll respond promptly."
        />

        <div className="mt-16 grid grid-cols-12 gap-x-12 gap-y-16">
          {/* Contact form */}
          <div className="col-span-12 lg:col-span-7">
            {sent ? (
              <div className="border border-gold/30 bg-gold/5 p-10 text-center">
                <p className="font-display text-3xl text-forest-deep">Thank you.</p>
                <p className="mt-3 text-sm text-ink/60">
                  We've received your message and will get back to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">
                      Name
                    </label>
                    <input
                      id="name"
                      required
                      type="text"
                      placeholder="Your name"
                      className="border-b border-ink/20 bg-transparent py-3 text-sm outline-none placeholder:text-ink/35 focus:border-forest"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">
                      Email
                    </label>
                    <input
                      id="email"
                      required
                      type="email"
                      placeholder="your@email.com"
                      className="border-b border-ink/20 bg-transparent py-3 text-sm outline-none placeholder:text-ink/35 focus:border-forest"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="subject" className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">
                    Subject
                  </label>
                  <input
                    id="subject"
                    type="text"
                    placeholder="Product enquiry, wholesale, growing question…"
                    className="border-b border-ink/20 bg-transparent py-3 text-sm outline-none placeholder:text-ink/35 focus:border-forest"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="message" className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    placeholder="Tell us what you need…"
                    className="border-b border-ink/20 bg-transparent py-3 text-sm outline-none placeholder:text-ink/35 focus:border-forest resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-fit rounded-full bg-forest px-8 py-3.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-deep hover:shadow-lg active:translate-y-0"
                >
                  Send message
                </button>
              </form>
            )}
          </div>

          {/* Contact details */}
          <div className="col-span-12 lg:col-span-4 lg:col-start-9">
            <div className="flex flex-col gap-8">
              {[
                { label: "Email", value: "hello@evergreenmedia.in" },
                { label: "Phone", value: "+91 98000 00000" },
                { label: "Location", value: "Tamil Nadu, India" },
                { label: "Hours", value: "Mon–Sat, 9am–6pm IST" },
              ].map(({ label, value }) => (
                <div key={label} className="border-b border-ink/10 pb-6">
                  <SectionLabel index="—">{label}</SectionLabel>
                  <p className="mt-2 font-display text-xl text-forest-deep">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

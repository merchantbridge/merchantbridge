import type { Metadata } from "next";
import PageSections from "@/components/public/PageSections";
import ContactForm from "./ContactForm";
import { siteConfig } from "@/config/branding";

export const metadata: Metadata = {
  title: "Contact Merchant Bridge",
  description: "Get in touch. Questions about your profile, a listing, or how the platform works? Send us a message and a real person will reply.",
};

export default function ContactPage() {
  return (
    <>
<main>
        <PageSections path="/contact" />

        <section className="py-20">
          <div className="mx-auto grid max-w-[1000px] gap-14 px-7 md:grid-cols-[1fr_1.3fr]">
            <div>
              <h2 className="mb-4 text-[16px] font-semibold">Direct email</h2>
              <a href={`mailto:${siteConfig.supportEmail}`} className="text-[15px] text-accent">
                {siteConfig.supportEmail}
              </a>
              <p className="mt-6 text-[13.5px] leading-relaxed text-textSecondary">
                A real person will reply, usually within one working day.
              </p>
            </div>

            <ContactForm />
          </div>
        </section>
      </main>
</>
  );
}

"use client";

import SectionHeading from "@/app/components/common/SectionHeading";
import { cn } from "@/app/lib/utils";
import ContactIntro from "./contact_comp/ContactIntro";
import ContactForm from "./contact_comp/ContactForm";
import ContactAtmosphere from "./contact_comp/ContactAtmosphere";

export default function ContactSection({
    className = "",
}) {
    return (
        <section
            id="contact"
            aria-labelledby="contact-heading"
            className={cn(
                "relative overflow-hidden",
                "bg-background",
                "px-[clamp(24px,5vw,80px)]",
                "py-[clamp(90px,11vw,170px)]",
                className
            )}
        >
            <ContactAtmosphere />

            <div className="relative z-10 mx-auto max-w-7xl">
                <div className="grid gap-10 md:gap-14 lg:grid-cols-[180px_1fr] lg:gap-16">
                    <div>
                        <SectionHeading
                            label="CONTACT"
                            align="left"
                            number={"07"}
                        />
                    </div>

                    <div>
                        <SectionHeading
                            supporting="Let's build something worth exploring."
                            align="left"
                            supportingId="contact-heading"
                        />

                        <div className="mt-10 sm:mt-12">
                            <ContactIntro />
                        </div>

                        <ContactForm className="mt-12 sm:mt-14" />

                    </div>
                </div>
            </div>
        </section>
    );
}
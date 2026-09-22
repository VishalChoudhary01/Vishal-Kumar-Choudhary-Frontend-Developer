"use client";

import FooterSocialButton from "./FooterSocialButton";

export default function FooterSocials({ links = [] }) {
    return (
        <div
            className="flex shrink-0 items-center gap-2"
            aria-label="Social links"
        >
            {links.map((social) => {
                if (!social.href || !social.icon) {
                    return null;
                }

                const isExternal = !social.href.startsWith("mailto:");

                return (
                    <FooterSocialButton
                        key={social.href}
                        href={social.href}
                        label={social.label}
                        icon={social.icon}
                        isExternal={isExternal}
                    />
                );
            })}
        </div>
    );
}
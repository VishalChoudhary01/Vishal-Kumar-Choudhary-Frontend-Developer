"use client";

import { useState } from "react";
import FooterClosingLine from "./FooterClosingLine";
import FooterOutlinedWord from "./FooterOutlinedWord";

export default function FooterClosing({
    primary = "STILL",
    secondary = "BUILDING.",
    show = false,
    reduced = false,
}) {
    const [hovered, setHovered] = useState(false);

    const handleEnter = () => {
        if (!reduced) {
            setHovered(true);
        }
    };

    const handleLeave = () => {
        setHovered(false);
    };

    return (
        <div
            className="w-full max-w-[75%] max-md:max-w-full"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            onFocus={handleEnter}
            onBlur={handleLeave}
        >
            <h2 className="cursor-pointer select-none font-display text-[clamp(3.25rem,8vw,8.5rem)] font-normal leading-[0.88] tracking-[-0.06em]">
                <FooterClosingLine
                    text={primary}
                    show={show}
                    reduced={reduced}
                    delay={0.08}
                />

                <FooterClosingLine
                    show={show}
                    reduced={reduced}
                    delay={0.16}
                >
                    <FooterOutlinedWord
                        text={secondary}
                        hovered={hovered}
                        reduced={reduced}
                    />
                </FooterClosingLine>
            </h2>
        </div>
    );
}
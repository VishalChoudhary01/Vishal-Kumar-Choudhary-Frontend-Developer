"use client";

import { ArrowDown, ArrowUpRight, Sparkles } from "lucide-react";
import { ArrowDownToLineIcon } from "@/app/components/ui/Icons";
import DownloadButton from "../common/buttons/DownloadButton";
import ActionButton from "../common/buttons/ActionButton";


export function SomeComponent() {

    return (
        <div className="bg-red-500 w-full">
            <ActionButton
                type="button"
                label="View Project"
                icon={ArrowUpRight}
                iconMotion={{
                    direction: "up-right",
                    distance: 4,
                    rotate: 8,
                    scale: 1,
                    duration: 0.25,
                    ease: [0.22, 1, 0.36, 1],
                }}
            />
            <DownloadButton
                label="Download Resume"
                icon={ArrowDownToLineIcon}
                iconPosition="right"
                iconAnimation={{
                    from: {
                        x: 0,
                        y: -8,
                        scale: 0.65,
                        opacity: 0,
                        rotate: 0,
                    },

                    to: {
                        x: 0,
                        y: 0,
                        scale: 1,
                        opacity: 1,
                        rotate: 0,
                    },

                    duration: 0.3,
                    ease: [0.22, 1, 0.36, 1],
                }}
            />
            
        </div>
    );
}
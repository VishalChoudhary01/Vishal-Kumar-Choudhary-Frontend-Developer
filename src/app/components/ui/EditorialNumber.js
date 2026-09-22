import { motion } from "motion/react";
import { easeStandard } from "@/app/lib/motion/easings";

function EditorialNumber({ number, isActive, }) {
    return (
        <motion.span aria-hidden="true" className=" pointer-events-none absolute -left-1 top-1/3 z-0 -translate-y-1/3 select-none font-body text-[clamp(4rem,10vw,7rem)] font-medium leading-none tracking-[-0.08em] tabular-nums "
            animate={{
                opacity: isActive
                    ? 0.16
                    : 0.05,
            }}
            transition={{
                duration: 0.25,
                ease: easeStandard,
            }}
        >
            {number}
        </motion.span>
    );
} 

export default EditorialNumber
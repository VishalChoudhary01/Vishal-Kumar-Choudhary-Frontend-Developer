import { motion } from "motion/react";

function ActiveDot() {
    return (
        <motion.span
            layoutId="navbar-active-marker"
            aria-hidden="true"
            className=" pointer-events-none absolute bottom-[5px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand "
            initial={false}
            transition={{
                type: "spring",
                stiffness: 520,
                damping: 32,
                mass: 0.6,
            }}
        />
    );
}

export default ActiveDot
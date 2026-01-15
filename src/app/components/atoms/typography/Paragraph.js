import { motion } from "motion/react";

const Paragraph = ({
  children,
  className = "",
  delay = 0.4,
  duration = 1.5,
  ...props
}) => {
  return (
    <motion.p
      initial={{ opacity: 0, y: 35, filter: "blur(85px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={`  ${className}`}
      {...props}
    >
      {children}
    </motion.p>
  );
};

export default Paragraph;

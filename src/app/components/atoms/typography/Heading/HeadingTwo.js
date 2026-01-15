import { motion } from 'framer-motion';

const HeadingTwo = ({ 
  children, 
  className = "", 
  duration = 0.7,
  ...props 
}) => {
  return (
    <motion.h2
      initial={{ opacity: 0, y: 20, filter: "blur(55px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration, ease: "easeOut" }}
      className={` ${className}`}
      {...props}
    >
      {children}
    </motion.h2>
  );
};

export default HeadingTwo;
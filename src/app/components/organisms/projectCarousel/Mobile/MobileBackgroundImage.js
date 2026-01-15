"use client";

import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

const MobileBackgroundImage = ({ image, name, id }) => (
  <div className="absolute bottom-48   inset-0 z-10" style={{ perspective: '1000px' }}>
    <AnimatePresence mode="wait">
      <motion.div
        key={id}
        initial={{ opacity: 0, rotateY: 90, scale: 0.8 }}
        animate={{ opacity: 1, rotateY: 0, scale: 1 }}
        exit={{ opacity: 0, rotateY: -90, scale: 0.8 }}
        transition={{
          duration: 0.6,
          ease: [0.4, 0, 0.2, 1]
        }}
        style={{ transformStyle: 'preserve-3d' }}
        className="w-full h-full"
      >
        <Image
          src={image}
          alt={name}
          fill
          loading='lazy'
          className="object-contain"
          style={{ 
            backfaceVisibility: 'hidden',
          }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </motion.div>
    </AnimatePresence>
  </div>
);

export default MobileBackgroundImage;
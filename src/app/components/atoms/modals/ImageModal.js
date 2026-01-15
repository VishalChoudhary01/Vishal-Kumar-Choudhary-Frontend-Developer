"use client";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { FaTimes } from "react-icons/fa";

export default function ImageModal({ selectedImage, setSelectedImage }) {
  return (
    <AnimatePresence>
      {selectedImage && (
        <motion.div
          className="
            fixed inset-0 z-50
            bg-black/95
            flex items-center justify-center
            px-4 py-6
          "
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            className="
              relative
              w-full
              max-w-6xl
              h-full
              max-h-[100dvh]
              flex items-center justify-center
            "
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* IMAGE WRAPPER */}
            <div
              className="
                relative
                w-full
                h-full
                max-h-[90dvh]
                max-w-[90vw]
              "
            >
              <Image
                src={selectedImage}
                alt="Enlarged view"
                fill
                sizes="(max-width: 768px) 100vw, 90vw"
                className="
                  object-contain
                  rounded-xl
                  shadow-2xl
                "
                priority
              />
            </div>

            {/* CLOSE BUTTON */}
            <motion.button
              onClick={() => setSelectedImage(null)}
              className="
                absolute top-4 right-4
                text-white text-xl
                bg-black/70
                rounded-full p-2
                backdrop-blur-md
                border border-white/20
              "
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaTimes />
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

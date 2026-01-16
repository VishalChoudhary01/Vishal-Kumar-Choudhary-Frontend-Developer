"use client";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { FaTimes } from "react-icons/fa";
import { useEffect } from "react";

export default function ImageModal({ selectedImage, setSelectedImage }) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = "hidden";
      document.body.style.height = "100vh";
    } else {
      document.body.style.overflow = "unset";
      document.body.style.height = "auto";
    }
    
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.height = "auto";
    };
  }, [selectedImage]);

  return (
    <AnimatePresence>
      {selectedImage && (
        <motion.div
          className="
            fixed top-0 left-0 right-0 bottom-0
            w-screen h-screen
            z-[9999]
            bg-black/96
            backdrop-blur-2xl
            flex items-center justify-center
            overflow-hidden
          "
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => setSelectedImage(null)}
          style={{
            position: "fixed",
            margin: 0,
            padding: 0,
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        >
          {/* Additional blur layer for stronger effect */}
          <div 
            className="absolute top-0 left-0 right-0 bottom-0 w-full h-full bg-black/85 backdrop-blur-3xl"
            style={{
              backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
            }}
          />
          
          <motion.div
            className="
              relative
              z-10
              w-full
              h-full
              flex items-center justify-center
              p-4 md:p-6
            "
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* IMAGE WRAPPER */}
            <div
              className="
                relative
                w-full
                h-full
                max-h-[90vh]
                max-w-[90vw]
              "
            >
              <Image
                src={selectedImage}
                alt="Enlarged view"
                fill
                sizes="90vw"
                className="
                  object-contain
                  rounded-lg
                  shadow-2xl
                  drop-shadow-2xl
                "
                priority
                quality={95}
              />
            </div>

            {/* CLOSE BUTTON */}
            <motion.button
              onClick={() => setSelectedImage(null)}
              className="
                absolute top-4 right-4 md:top-6 md:right-6
                text-white text-xl
                bg-black/80
                rounded-full p-3
                backdrop-blur-lg
                border border-white/30
                hover:bg-black/90
                transition-colors
                shadow-lg
                z-20
              "
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Close modal"
            >
              <FaTimes />
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
import React from "react";
import DesktopContent from "./DesktopContent";
import { motion } from 'motion/react';
import Image from 'next/image';

const DesktopSlideItem = ({ item, index, isMain, isMobile, previewCount,seeMorePage }) => {
  if (isMobile && isMain) {
    return null;
  }

  let positionStyle = {};

  if (isMain) {
    // Desktop main image
    positionStyle = {
      top: 0,
      left: 0,
      width: "100%",
      height: "90%",
      zIndex: 20,
      borderRadius: "0px",
      boxShadow: "none",
    };
  } else {
    // Desktop preview cards
    if (previewCount === 0) return null;

    const offset = 190;
    const previewLeft = `calc(100% - ${(previewCount - index + 1) * offset}px)`;

    positionStyle = {
      top: "68%",
      left: previewLeft,
      width: "180px",
      height: "250px",
      transform: "translateY(-50%)",
      zIndex: 80,
      boxShadow: "0 15px 30px rgba(0,0,0,0.8)",
      borderRadius: "16px",
      opacity: 1,
    };
  }

  return (
    <motion.div
      key={item.id}
      className="absolute transition-all duration-500  ease-in-out overflow-hidden "
      style={positionStyle}
    >
      {isMain ? (
        // Main image - use fill layout
        <Image
          src={item.image}
        alt={item.name}
          fill
          className="object-cover"
          priority={isMain}
          loading={isMain ? "eager" : "lazy"}
          // sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
        />
      ) : (
        // Preview cards - use fixed dimensions
        <div  style={{ width: '100%', height: '100%', position: 'relative' }}>

          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover "
            sizes="180px"
      />
        </div>
      )}

      {isMain && !isMobile && <DesktopContent item={item} seeMore={seeMorePage} />}
    </motion.div>
  );
};

export default DesktopSlideItem;
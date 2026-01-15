"use client";
import Image from "next/image";
import { motion, } from "motion/react";
import { FaExpand } from "react-icons/fa";
import { Heading } from "../../atoms/typography";
import ImageModal from "@/app/components/atoms/modals/ImageModal"; 

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: "easeOut" },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

export default function VisualShowcaseSection({
  project,
  selectedImage,
  setSelectedImage,
}) {
  // If no bentoGrid, create one from gallery
  const visualItems =
    project.bentoGrid ||
    (project.gallery
      ? project.gallery.map((img, index) => ({
          id: index + 1,
          title: `Screenshot ${index + 1}`,
          description: "Project screenshot",
          image: img,
          gridPosition: getGridPosition(index),
          category: "screenshot",
          size: getSize(index),
        }))
      : []);

  function getGridPosition(index) {
    const positions = [
      "col-span-2 row-span-2",
      "col-span-1 row-span-1",
      "col-span-1 row-span-1",
      "col-span-1 row-span-2",
      "col-span-1 row-span-1",
      "col-span-2 row-span-1",
      "col-span-1 row-span-1",
    ];
    return positions[index % positions.length];
  }

  function getSize(index) {
    const sizes = [
      "large",
      "medium",
      "medium",
      "tall",
      "medium",
      "wide",
      "medium",
    ];
    return sizes[index % sizes.length];
  }

  if (!visualItems || visualItems.length === 0) {
    return null;
  }

  return (
    <>
      <motion.section
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        className="md:px-8 px-3 mx-auto"
      >
        <motion.div className="text-center mb-12" variants={fadeInUp}>
          <Heading heading="Project Screenshots" subheading="" />
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 md:gap-6 gap-y-2   auto-rows-[200px] sm:auto-rows-[250px] grid-flow-dense"
          variants={staggerContainer}
        >
          {visualItems.map((item, index) => (
            <motion.div
              key={item.id}
              className={`relative group cursor-pointer rounded-xl overflow-hidden border backdrop-blur-lg border-neutral-600/50 dark:border-neutral-200/20   shadow hover:shadow-lg  dark:shadow-neutral-700/85   ${item.gridPosition || ""}`}
              variants={scaleIn}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedImage(item.image)}
            >
              {/* Always use Image component */}
              <Image
                src={item.image}
                alt={item.title}
                fill
                priority={index === 0}
                quality={85}
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loading={index > 2 ? "lazy" : "eager"}
              />

              {/* Gradient overlay - hidden by default */}
              <div className="absolute inset-0 bg-linear-to-t dark:from-black/90 dark:via-black/40 from-neutral-200/90  via-neutral-200/40   to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

              {/* Title and description - completely hidden until hover */}
              <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="dark:text-white text-neutral-800/80  font-open-sans font-semibold text-lg mb-1">
                  {item.title}
                </h3>
                <p className="dark:text-gray-300 text-neutral-700/80 md:text-[0.9rem]   text-sm line-clamp-2">
                  {item.description}
                </p>
              </div>

              {/* Category tag - hidden until hover */}
              <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div
                  className={`px-3 py-1.5 rounded-md text-xs font-medium font-roboto backdrop-blur-md border uppercase  text-neutral-600/90     `}
                >
                  {item.category}
                </div>
              </div>

              {/* Expand icon - hidden until hover */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="p-2 rounded-full backdrop-blur-md bg-black/30 border border-white/20 hover:bg-black/50 transition-colors">
                  <FaExpand className="text-white text-sm" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Image Modal Component */}
      <ImageModal 
        selectedImage={selectedImage} 
        setSelectedImage={setSelectedImage} 
      />
    </>
  );
}
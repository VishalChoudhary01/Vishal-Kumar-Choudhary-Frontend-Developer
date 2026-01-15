import React from "react";
import { motion } from "motion/react";
import Heading from "@/app/components/atoms/typography/Heading/Heading";
import { MdLocationPin } from "react-icons/md";
import { IoTime } from "react-icons/io5";
import InfoBadge from "../../atoms/badges/InfoBadge";
import AvailabilityBadge from "../../atoms/badges/AvailabilityBadge";

export default function ContactHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="mb-16 md:mb-20 text-center"
    >
      <Heading
        heading="Contact"
        subheading="Let's Build Something Amazing Together"
        align="center"
        className="mb-6"
      />
      
      <p className="md:text-lg text-[0.95rem]  font-open-sans text-para2 dark:text-darkPara2 max-w-3xl mx-auto mb-10">
        I'm currently open to frontend roles, exciting freelance projects, and innovative collaborations. 
        Let's turn your ideas into reality with stunning user interfaces.
      </p>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap justify-center md:gap-4 gap-2 "
      >
        <InfoBadge icon={<MdLocationPin  className="animate-bounce"/>} text="Patna, India" />
        <AvailabilityBadge />
        <InfoBadge icon={<IoTime />} text="24h Response Time" />
      </motion.div>
    </motion.div>
  );
}




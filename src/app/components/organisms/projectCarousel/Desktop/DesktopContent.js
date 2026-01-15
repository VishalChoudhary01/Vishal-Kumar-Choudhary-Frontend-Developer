import { motion } from "motion/react";
import GhostButton from "../../../atoms/button/GhostButton";
import {  Paragraph } from "@/app/components/atoms/typography/index";
import { FaArrowRight } from "react-icons/fa6";
import { RxGithubLogo } from "react-icons/rx";
import { LuExternalLink } from "react-icons/lu";




const DesktopContent = ({ item,seeMore }) => (
  <div className="hidden md:block absolute top-[52%] left-[100px] -translate-y-1/2 z-10 transition-all duration-500">
    {/* Subtle blurred background */}
    <div className="absolute inset-0 -inset-x-8 -inset-y-6 dark:bg-black/20  bg-white/35  transition-all duration-700 backdrop-blur-[15px]  rounded-2xl -z-10" />

    <motion.div
      initial={{ opacity: 0, y: 150,filter:"blur(50px)" }}
      animate={{ opacity: 1, y: 0,filter:"blur(0px)" }}
      transition={{ duration: 0.8,delay:0.1 }}
      className="w-fit relative"
    >
  
      <motion.h2 className="text-[2.5rem] dark:text-white text-h1 font-lora  uppercase font-bold tracking-wider text-shadow-lg text-shadow-gray-400" initial={{opacity:0, y:20, filter: "blur(45px)"}} animate={{opacity:1,y:0,filter:"blur(0px)"}}  transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}>{item.name}</motion.h2>

      <Paragraph className="leading-6 my-3 text-[15px] max-w-[380px] font-poppins text-left text-shadow-md dark:text-slate-50 text-h3  text-shadow-gray-500">
        {item.description}
      </Paragraph>

      <div className="w-full  flex justify-between font-medium text-[0.92rem] mt-8 font-roboto ">
        <GhostButton 
          onClick={() => seeMore(item.id)}
         buttonText={"Project Details"} buttonStyle={"group cursor-pointer bg-gray-900 dark:bg-black  text-white rounded-md md:px-3 md:py-2.5 "} rightIcon={<FaArrowRight/>} rightStyle={"flex transition-all items-center group-hover:translate-x-1 duration-300"}/>
        <GhostButton
          onClick={() => window.open(item.githubUrl, "_blank")}
         buttonText={"View Repo"} buttonStyle={" transition-color active:scale-105 cursor-pointer bg-gray-900 dark:bg-black  text-white rounded-md md:px-3 md:py-2.5 "} leftIcon={<RxGithubLogo/>} rightStyle={"flex items-center"}/>
        <GhostButton
          onClick={() => window.open(item.liveUrl, "_blank")}
         buttonText={"Live Demo"} buttonStyle={" active:scale-105 cursor-pointer group bg-gray-900 dark:bg-black  text-white rounded-md md:px-3 md:py-2.5 "} rightIcon={<LuExternalLink/>} rightStyle={"flex items-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"}/>
      </div>
    </motion.div>
  </div>
);

export default DesktopContent;


import {motion} from 'motion/react';
import MobileNavigationButtons from './MobileNavigationButtons'
import { Paragraph } from '@/app/components/atoms/typography';
import GhostButton from '@/app/components/atoms/button/GhostButton';
import { HiExternalLink } from "react-icons/hi";

const MobileContent = ({ item, onPrev, onNext ,handleSeeMore}) => (
  <div className="absolute bottom-0   left-0 w-full  py-6 z-30  ">

    <div className=" px-4 sm:px-6">
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 150, filter: "blur(100px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className=" text-center"
      >
       
        <motion.h2 className='text-xl text-[1.1rem]      dark:text-Head2dark tracking-wider font-lora uppercase font-bold [word-spacing:0.4rem]  '
        initial={{ opacity: 0, y: 20,filter:"blur(30px)" }}
          animate={{ opacity: 1, y: 0,filter:"blur(0px)" }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          {item.name}
        </motion.h2>
        <Paragraph className='text-sm text-para2 leading-relaxed my-2 font-open-sans'>
          {item.description}
        </Paragraph>
        
        <div className='space-x-2.5  font-roboto font-medium '>
        <GhostButton onClick={()=>handleSeeMore(item.id)} buttonText={"Project Details"} buttonStyle={"bg-btnBG dark:bg-darkbtnBG text-btnTXT dark:text-darkbtnTXT  px-4 py-2 rounded-lg select-none text-slate-50 md:text-[0.95rem] text-[0.85rem] "} />
        <GhostButton onClick={()=>window.open(item.liveUrl, "_blank")} rightIcon={<HiExternalLink/>} buttonText={"Live Demo"} buttonStyle={"bg-btnBG dark:bg-darkbtnBG text-btnTXT dark:text-darkbtnTXT  select-none px-5 py-2 rounded-lg text-slate-50 md:text-[0.95rem] text-[0.85rem]"} />
        </div>
      </motion.div>
    </div>
    
    <MobileNavigationButtons onPrev={onPrev} onNext={onNext} />

  </div>
);

export default MobileContent
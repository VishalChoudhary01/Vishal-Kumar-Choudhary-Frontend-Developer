
"use client";
import './logo.css';
import useDarkMode from '@/app/hooks/useDarkMode';

const VKR = () => {
    const {isDarkMode}=useDarkMode()
  return (
    <div className={` xl:text-[1.2rem] lg:text-[1.15rem] md:text-[1.10rem] text-[1.05rem] lg:w-[55px] lg:h-[55px] md:w-[52px] md:h-[52px] w-[50px] h-[50px] gap-x-1.5 relative  font-merriweather flex items-center justify-center  rounded-full font-semibold  overflow-hidden ${isDarkMode?"logo-glow-dark":"logo-glow-light"}`}>
      <span className="text-black dark:text-neutral-100">V</span>
      <span className='text-sky-500 dark:text-sky-300'>Kr.</span>
    </div>
  )
}

export default VKR
import React from 'react'

const InfoBadge = ({ icon, text }) => {
  return (
    <div className="flex items-center gap-2 md:px-5 md:py-3 px-3 py-1.5 font-roboto rounded-full bg-white dark:bg-white/5 border border-lightBorder dark:border-darkBorder/30">
      <span className="text-accent dark:text-darkAccent/60 ">{icon}</span>
      <span className="md:text-sm text-[0.85rem]  font-medium text-para3 dark:text-darkPara3 ">{text}</span>
    </div>
  );
}

export default InfoBadge
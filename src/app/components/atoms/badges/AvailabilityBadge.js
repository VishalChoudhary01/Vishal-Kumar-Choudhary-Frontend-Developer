import React from 'react'

const AvailabilityBadge=()=> {
  return (
    <div className="flex items-center gap-2 md:px-5 md:py-3 px-3 py-1.5 rounded-full bg-white dark:bg-white/5 border border-lightBorder dark:border-darkBorder/30">
      <div className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-600/50 dark:bg-emerald-400/50  opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-800 dark:bg-emerald-400" />
      </div>
      <span className="md:text-sm text-[0.85rem] font-roboto font-medium text-para1 dark:text-darkPara1">Available Now</span>
    </div>
  );
}
export default AvailabilityBadge
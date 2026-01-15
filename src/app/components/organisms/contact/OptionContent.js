import React from 'react'

const OptionContent=({ option, getIcon })=> {
  return (
    <div className="flex items-center gap-3 ">
      <div className="p-2.5 rounded-lg bg-neutral-100/70     dark:bg-white/10">
        {getIcon()}
      </div>
      <div>
        <div className="font-medium text-sm text-para1 dark:text-darkPara1 text-left">{option.label}</div>
        <div className="text-xs mt-0.5 text-para2 dark:text-darkPara2">
          {option.description}
        </div>
      </div>
    </div>
  );
}

export default OptionContent
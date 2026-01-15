import React from 'react'

const Input = ({ label, ...props }) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-para1 dark:text-darkPara1">
        {label}
      </label>
      <input
        className="w-full rounded-lg md:rounded-xl  px-4 py-3 text-sm bg-white/40 dark:bg-white/5 border border-lightBorder dark:border-darkBorder/30 text-para1 dark:text-darkPara1 focus:outline-none focus:ring-2 focus:border-accent focus:ring-accent/30 dark:focus:border-darkAccent dark:focus:ring-darkAccent/30 transition-all duration-300 placeholder:text-gray-400 dark:placeholder:text-gray-100/55  "
        {...props}
      />
    </div>
  );
}

export default Input
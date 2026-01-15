// BackgroundDecoration.jsx - Updated
import React from "react";

const BackgroundDecoration = () => {
  return (
    <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
      <div className="absolute top-4 sm:top-10 right-4 sm:right-10 w-20 h-20 sm:w-40 sm:h-40 bg-linear-to-br from-btn-modern-from to-btn-modern-to rounded-full blur-2xl sm:blur-3xl"></div>
      <div className="absolute bottom-4 sm:bottom-10 left-4 sm:left-10 w-20 h-20 sm:w-40 sm:h-40 bg-linear-to-tr from-dark-btn-modern-from to-btn-modern-to rounded-full blur-2xl sm:blur-3xl"></div>
    </div>
  );
};

export default BackgroundDecoration;
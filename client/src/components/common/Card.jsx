import React from 'react';

export const Card = ({ children, className = '', hover = false, onClick, ...props }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-[#111E2B] border border-[#D8E3EA] dark:border-[#263849] rounded-xl transition-all duration-150 ${
        hover ? 'hover:border-[#089E9A] dark:hover:border-[#12D6C5]/50 hover:shadow-md cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};


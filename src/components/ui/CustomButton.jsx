import React from 'react';

const CustomButton = ({ content, icon, variant, link, size, onClick }) => {
  const baseClasses = 'rounded-md flex items-center space-x-2 transition duration-300 ease-in-out shadow-lg';
  const variantClasses = variant === 'blue'
    ? 'bg-blue-500 text-white hover:bg-blue-900'
    : 'bg-white text-blue-500 hover:bg-gray-300';

  const sizeClasses = {
    xl: 'px-8 py-4 text-lg sm:px-6 sm:py-3 sm:text-base font-bold',
    l: 'px-6 py-3 text-base sm:px-4 sm:py-2 sm:text-sm font-bold',
    m: 'px-4 py-2 text-sm sm:px-3 sm:py-1 sm:text-xs font-bold',
  };

  const iconSizeClasses = {
    xl: 'w-6 h-6 sm:w-5 sm:h-5',
    l: 'w-5 h-5 sm:w-4 sm:h-4',
    m: 'w-4 h-4 sm:w-3 sm:h-3',
  };

  return (
    <a href={link} onClick={onClick} className={`${baseClasses} ${variantClasses} ${sizeClasses[size]}`}>
      {icon && <img src={icon} alt="" className={iconSizeClasses[size]} />}
      <span>{content}</span>
    </a>
  );
};

export default CustomButton;

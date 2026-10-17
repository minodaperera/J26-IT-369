import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  type = 'button', 
  disabled = false, 
  className = '' 
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn btn-${variant} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;

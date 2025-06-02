
import React from 'react';

const BotIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-6 h-6 ${className}`}
  >
    <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
    <path d="M12 10c-1.103 0-2 .897-2 2s.897 2 2 2 2-.897 2-2-.897-2-2-2zm-4 4c0-1.103.897-2 2-2 .232 0 .453.042.658.115A3.99 3.99 0 0 0 9 15.073V16H8c-1.103 0-2-.897-2-2zm8-4c1.103 0 2 .897 2 2s-.897 2-2 2c-.232 0-.453-.042-.658-.115A3.99 3.99 0 0 0 15 12.927V12h1c1.103 0 2 .897 2 2z" />
    <circle cx="12" cy="7" r="1.5" />
    <path d="M12 17c1.5 0 2.5-1.5 2.5-2.5S13.5 12 12 12s-2.5 1.5-2.5 2.5S10.5 17 12 17z" />
  </svg>
);

export default BotIcon;

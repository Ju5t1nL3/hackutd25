// src/components/Header.tsx

import React from "react";

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <div className="pb-4 border-b border-gray-200">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
        {title}
      </h1>
    </div>
  );
};

export default Header;

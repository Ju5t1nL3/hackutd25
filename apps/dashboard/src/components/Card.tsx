// src/components/Card.tsx

import React from "react";

interface CardProps {
  title: string;
  value: string;
  description: string;
}

const Card: React.FC<CardProps> = ({ title, value, description }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-xl border-l-4 border-blue-500 hover:shadow-2xl transition duration-300">
      <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
      <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-2 text-xs text-gray-400">{description}</p>
    </div>
  );
};

export default Card;

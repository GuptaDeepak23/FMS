import React from 'react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Feedback Management System
            </h1>
            <p className="text-gray-600 mt-1">
              Real-time gesture recognition for feedback collection
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500">Live Camera</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;


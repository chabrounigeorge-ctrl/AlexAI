
import React from 'react';

const AssistanceScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center animate-fadeIn p-8">
      <h1 className="font-serif text-6xl text-yellow-500 mb-4">
        Hold for assistance
      </h1>
      <p className="text-2xl text-gray-300">
        A staff member will be with you shortly.
      </p>
    </div>
  );
};

export default AssistanceScreen;

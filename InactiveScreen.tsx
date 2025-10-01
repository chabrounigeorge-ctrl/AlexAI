import React from 'react';
import AlexandrionLogo from './AlexandrionLogo';

interface InactiveScreenProps {
  onActivate: () => void;
}

const InactiveScreen: React.FC<InactiveScreenProps> = ({ onActivate }) => {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center cursor-pointer animate-fadeIn bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 to-black"
      onClick={onActivate}
    >
      <div className="mb-8">
        <AlexandrionLogo className="w-96 h-auto" />
      </div>
      <p className="text-2xl text-gray-400 font-serif tracking-wider">
        Touch to activate
      </p>
    </div>
  );
};

export default InactiveScreen;


import React from 'react';
import { Language } from '../types';

interface LanguageSelectionScreenProps {
  onSelect: (language: Language) => void;
}

const LanguageButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
    <button
      onClick={onClick}
      className="font-serif text-3xl text-gray-200 border border-gray-600 rounded-lg px-12 py-6 hover:bg-gray-800 hover:border-yellow-500 hover:text-yellow-500 transition-all duration-300"
    >
        {children}
    </button>
);

const LanguageSelectionScreen: React.FC<LanguageSelectionScreenProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-col items-center justify-center animate-fadeIn">
      <h2 className="font-serif text-4xl text-gray-200 mb-12">Choose your language</h2>
      <div className="flex space-x-8">
        <LanguageButton onClick={() => onSelect('en')}>English</LanguageButton>
        <LanguageButton onClick={() => onSelect('ro')}>Română</LanguageButton>
      </div>
    </div>
  );
};

export default LanguageSelectionScreen;

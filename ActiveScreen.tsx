import React, { useRef, useEffect } from 'react';
import { useGeminiLive } from '../hooks/useGeminiLive';
import { Language } from '../types';
import AlexandrionLogo from './AlexandrionLogo';
import ProductCarousel from './ProductCarousel';
import MicrophoneIcon from './icons/MicrophoneIcon';

interface ActiveScreenProps {
  language: Language;
  onError: () => void;
  onDeactivate: () => void;
}

const ActiveScreen: React.FC<ActiveScreenProps> = ({ language, onError, onDeactivate }) => {
  const { isConnecting, liveUserInput, liveAlexResponse, recommendations, conversationHistory } = useGeminiLive(language, onError);
  const transcriptEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory, liveAlexResponse, liveUserInput]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-8 animate-fadeIn relative">
        <div 
          className="absolute top-4 right-4 text-xs text-gray-600 hover:text-gray-400 cursor-pointer"
          onClick={onDeactivate}
        >
          [ END SESSION ]
        </div>
      <header className="w-full flex justify-center mt-4">
        <AlexandrionLogo className="w-64 h-auto" />
      </header>

      {isConnecting ? (
        <div className="flex flex-col items-center justify-center flex-grow">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-yellow-500"></div>
            <p className="mt-4 text-gray-400 font-serif">Connecting to Alex...</p>
        </div>
      ) : (
        <main className="flex-grow w-full max-w-5xl flex flex-col justify-center items-center my-4">
          {recommendations.length > 0 ? (
            <ProductCarousel recommendations={recommendations} />
          ) : (
             <div className="h-[450px] flex items-center justify-center">
                 <MicrophoneIcon className="w-24 h-24 text-gray-800 animate-pulse" />
             </div>
          )}
        </main>
      )}

      <footer className="w-full max-w-5xl text-left pb-4 h-[200px] overflow-y-auto scroll-smooth border-t border-gray-800 pt-4">
        {conversationHistory.map((turn, index) => (
          <div key={index} className="mb-4">
            {turn.speaker === 'user' ? (
                <p className="text-lg text-gray-400"><span className="font-semibold text-gray-300">You: </span>{turn.text}</p>
            ) : (
                <p className="font-serif text-2xl text-yellow-500"><span className="font-semibold">Alex: </span>{turn.text}</p>
            )}
          </div>
        ))}
         { liveUserInput && <p className="text-lg text-gray-400 mt-4"><span className="font-semibold text-gray-300">You: </span>{liveUserInput}</p> }
        { liveAlexResponse && <p className="font-serif text-2xl text-yellow-500 mt-4"><span className="font-semibold">Alex: </span>{liveAlexResponse}</p> }
        <div ref={transcriptEndRef} />
      </footer>
    </div>
  );
};

export default ActiveScreen;

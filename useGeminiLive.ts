import { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Language, Recommendation, ConversationTurn } from '../types';
import { SYSTEM_INSTRUCTIONS, RECOMMENDATIONS_FUNCTION_DECLARATION, PRODUCTS } from '../constants';
import { createBlob, decode, decodeAudioData } from '../services/audioUtils';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export function useGeminiLive(language: Language, onError: () => void) {
  const [isConnecting, setIsConnecting] = useState(true);
  const [liveUserInput, setLiveUserInput] = useState('');
  const [liveAlexResponse, setLiveAlexResponse] = useState('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);

  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef(0);
  const outputSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');

  useEffect(() => {
    let sessionPromise: ReturnType<typeof ai.live.connect> | null = null;
    let stream: MediaStream | null = null;

    const cleanup = () => {
      console.log('Cleaning up Gemini Live session...');
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current.onaudioprocess = null;
      }
      if (mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
      }
      if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        inputAudioContextRef.current.close();
      }
      if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        outputSourcesRef.current.forEach(source => source.stop());
        outputAudioContextRef.current.close();
      }
      sessionPromise?.then(session => session.close());
      
      setIsConnecting(false);
    };

    const setup = async () => {
      try {
        if (!process.env.API_KEY) {
          throw new Error("API_KEY environment variable not set.");
        }
        
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          callbacks: {
            onopen: () => {
              console.log('Session opened.');
              if (!stream || !inputAudioContextRef.current) return;

              mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(stream);
              scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
              
              scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                const pcmBlob = createBlob(inputData);
                sessionPromise?.then((session) => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              };

              mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
              scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
              setIsConnecting(false);
            },
            onmessage: async (message: LiveServerMessage) => {
              if (message.serverContent) {
                const { inputTranscription, outputTranscription, turnComplete } = message.serverContent;
                if(inputTranscription) {
                    currentInputTranscriptionRef.current += inputTranscription.text;
                    setLiveUserInput(currentInputTranscriptionRef.current);
                }
                if(outputTranscription) {
                    currentOutputTranscriptionRef.current += outputTranscription.text;
                    setLiveAlexResponse(currentOutputTranscriptionRef.current);
                }
                if (turnComplete) {
                    if (currentInputTranscriptionRef.current || currentOutputTranscriptionRef.current) {
                        setConversationHistory(prev => [
                            ...prev,
                            ...(currentInputTranscriptionRef.current ? [{ speaker: 'user' as const, text: currentInputTranscriptionRef.current }] : []),
                            ...(currentOutputTranscriptionRef.current ? [{ speaker: 'alex' as const, text: currentOutputTranscriptionRef.current }] : []),
                        ]);
                    }
                    currentInputTranscriptionRef.current = '';
                    currentOutputTranscriptionRef.current = '';
                    setLiveUserInput('');
                    setLiveAlexResponse('');
                    setRecommendations([]); 
                }
                const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                if (base64Audio && outputAudioContextRef.current) {
                    const audioContext = outputAudioContextRef.current;
                    nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContext.currentTime);
                    const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
                    const source = audioContext.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(audioContext.destination);
                    source.addEventListener('ended', () => outputSourcesRef.current.delete(source));
                    source.start(nextStartTimeRef.current);
                    nextStartTimeRef.current += audioBuffer.duration;
                    outputSourcesRef.current.add(source);
                }
              }

              if (message.toolCall) {
                for (const fc of message.toolCall.functionCalls) {
                  if (fc.name === 'showRecommendations' && fc.args.recommendations) {
                     const recs = (fc.args.recommendations as any[]).map(rec => {
                       const product = PRODUCTS.find(p => p.name === rec.name);
                       return {
                         name: rec.name,
                         description: rec.description,
                         image: product ? product.image : "https://picsum.photos/800",
                         brief: product ? product.brief : "",
                       };
                     });
                     setRecommendations(recs);
                  }
                }
              }
            },
            onerror: (e: ErrorEvent) => {
              console.error('Session error:', e);
              onError();
              cleanup();
            },
            onclose: (e: CloseEvent) => {
              console.log('Session closed.');
              cleanup();
            },
          },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
            systemInstruction: SYSTEM_INSTRUCTIONS[language],
            tools: [{ functionDeclarations: [RECOMMENDATIONS_FUNCTION_DECLARATION] }],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
          },
        });

      } catch (err) {
        console.error('Failed to start Gemini Live session:', err);
        onError();
      }
    };

    setup();

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, onError]);

  return { isConnecting, liveUserInput, liveAlexResponse, recommendations, conversationHistory };
}

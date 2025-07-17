import React from 'react';
import { Users, Trophy, Bot, ArrowLeft } from 'lucide-react';
import { GameMode } from '../types/game';
import AnimatedBackground from './AnimatedBackground';
import SoundButton from './SoundButton';

interface GameModeSelectionProps {
  onModeSelect: (mode: GameMode) => void;
  onBack: () => void;
  mainVolume?: number;
  uiSound?: number;
}

export default function GameModeSelection({ onModeSelect, onBack, mainVolume = 1, uiSound = 1 }: GameModeSelectionProps) {
  const gameModes = [
    {
      id: 'pvp' as GameMode,
      img: '/assets/Menu-Background/Assets/1v1_card.png',
      alt: '1v1 Mode',
    },
    {
      id: 'ai' as GameMode,
      img: '/assets/Menu-Background/Assets/Ai_card.png',
      alt: 'AI Survival',
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-8">
      <AnimatedBackground />
      <div className="absolute inset-0 bg-black/20 z-10 transition-opacity duration-1000" />
      <div className="max-w-4xl w-full relative z-20 flex flex-col items-center justify-center">
        {/* Header */}
        <div className="text-center mb-12">
          <img src="/assets/Menu-Background/Assets/Choose_battle.png" alt="Choose Battle" className="mx-auto mb-4 max-w-[500px] w-[500vw] drop-shadow-2xl text-7xl" />
        </div>
        {/* Game Mode Cards - Centered */}
        <div className="flex flex-row justify-center items-center gap-16 mb-8">
          {gameModes.map((mode) => (
            <SoundButton
              key={mode.id}
              onClick={() => onModeSelect(mode.id)}
              className="group relative rounded-2xl p-0 transition-transform duration-300 hover:scale-105 hover:z-30 focus:outline-none bg-transparent shadow-none "
              style={{ background: 'none', border: 'none' }}
              mainVolume={mainVolume}
              uiSound={uiSound}
            >
              <img
                src={mode.img}
                alt={mode.alt}
                className="w-[300px] h-[190px] md:w-[300px] md:h-[190px] lg:w-[300px] lg:h-[190px] rounded-2xl select-none pointer-events-none"
                draggable="false"
              />
            </SoundButton>
          ))}
        </div>
        {/* Back Button - Centered below */}
        <div className="flex justify-center mt-4">
          <SoundButton
            onClick={onBack}
            className="transition-transform duration-300 hover:scale-110 focus:outline-none bg-transparent shadow-none"
            style={{ background: 'none', border: 'none', padding: 0 }}
            mainVolume={mainVolume}
            uiSound={uiSound}
          >
            <img
              src="/assets/Menu-Background/Assets/back_button.png"
              alt="Back"
              className="w-[240px] h-auto select-none"
              draggable="false"
            />
          </SoundButton>
        </div>
      </div>
    </div>
  );
}
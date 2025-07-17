import React from 'react';
import { Bot, Brain, Zap } from 'lucide-react';
import SoundButton from './SoundButton';
import { AILevel } from '../types/game';

interface AISetupProps {
  onLevelSelect: (level: AILevel) => void;
  onBack: () => void;
  mainVolume?: number;
  uiSound?: number;
}

const bmoFrames = [
  '/assets/Menu-Background/Assets/bmo1.png',
  '/assets/Menu-Background/Assets/bmo2.png',
  '/assets/Menu-Background/Assets/bmo3.png',
];

const BMOAnimation: React.FC<{ fps?: number; size?: number }> = ({ fps = 6, size = 220 }) => {
  const [showStatic, setShowStatic] = React.useState(true);
  const [frame, setFrame] = React.useState(0);
  React.useEffect(() => {
    const timeout = setTimeout(() => setShowStatic(false), 1000);
    return () => clearTimeout(timeout);
  }, []);
  React.useEffect(() => {
    if (showStatic) return;
    const id = setInterval(() => setFrame(f => (f + 1) % bmoFrames.length), 1000 / fps);
    return () => clearInterval(id);
  }, [fps, showStatic]);
  return (
    <img
      src={showStatic ? '/assets/Menu-Background/Assets/bmo0.png' : bmoFrames[frame]}
      alt="BMO"
      style={{ width: size, height: size, imageRendering: 'pixelated', display: 'block' }}
      className="opacity-100"
      draggable={false}
    />
  );
};

export default function AISetup({ onLevelSelect, onBack, mainVolume = 1, uiSound = 1 }: AISetupProps) {
  const [hovered, setHovered] = React.useState<null | 'easy' | 'medium' | 'hard'>(null);
  const aiLevels = [
    {
      id: 'easy' as AILevel,
      name: 'Easy',
      description: 'Perfect for beginners',
      icon: Bot,
      color: 'from-green-600 to-green-500',
      hoverColor: 'from-green-500 to-green-400',
      details: ['Slower reactions', 'Basic strategy', 'Forgiving gameplay']
    },
    {
      id: 'medium' as AILevel,
      name: 'Medium',
      description: 'Balanced challenge',
      icon: Brain,
      color: 'from-yellow-600 to-yellow-500',
      hoverColor: 'from-yellow-500 to-yellow-400',
      details: ['Moderate difficulty', 'Tactical thinking', 'Good for practice']
    },
    {
      id: 'hard' as AILevel,
      name: 'Hard',
      description: 'Maximum challenge',
      icon: Zap,
      color: 'from-red-600 to-red-500',
      hoverColor: 'from-red-500 to-red-400',
      details: ['Advanced strategy', 'Quick reactions', 'Expert level']
    }
  ];

  // Helper to get the correct BMO image
  const getBMOImage = () => {
    if (hovered === 'easy') return '/assets/Menu-Background/Assets/bemo_easy.png';
    if (hovered === 'medium') return '/assets/Menu-Background/Assets/bmo_medium.png';
    if (hovered === 'hard') return '/assets/Menu-Background/Assets/bemo_hard.png';
    return null;
  };
  console.log('hovered:', hovered);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 z-10" style={{ opacity: 1, filter: 'none' }}>
      <div className="max-w-4xl w-full flex flex-row items-center justify-center relative z-10" style={{ height: 320 }}>
        {/* BMO Animation (left) */}
        <div className="flex-shrink-0 flex items-center justify-center" style={{ width: 240 }}>
          {getBMOImage() ? (
            <img
              src={getBMOImage() || ''}
              alt="BMO"
              style={{ width: 220, height: 220, imageRendering: 'pixelated', display: 'block' }}
              className="opacity-100"
              draggable={false}
            />
          ) : (
          <BMOAnimation fps={6} size={220} />
          )}
        </div>
        {/* Difficulty.png with overlaid buttons (right) */}
        <div className="relative flex items-center justify-center" style={{ width: 520, height: 320, marginLeft: 32 }}>
          <img
            src="/assets/Menu-Background/Assets/Difficulty.png"
            alt="Difficulty Container"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[520px] h-auto select-none pointer-events-none"
            style={{ zIndex: 1 }}
            draggable="false"
          />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full flex flex-row items-center justify-center gap-4" style={{ zIndex: 2, height: '100%', marginTop: '65px' }}>
            <button
              onClick={() => onLevelSelect('easy')}
              onMouseEnter={() => setHovered('easy')}
              onMouseLeave={() => setHovered(null)}
              className="transition-transform duration-300 hover:scale-110 focus:outline-none bg-transparent shadow-none"
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              <img
                src="/assets/Menu-Background/Assets/easy.png"
                alt="Easy"
                className="w-[150px] h-auto select-none opacity-100"
                draggable="false"
              />
            </button>
            <button
              onClick={() => onLevelSelect('medium')}
              onMouseEnter={() => setHovered('medium')}
              onMouseLeave={() => setHovered(null)}
              className="transition-transform duration-300 hover:scale-110 focus:outline-none bg-transparent shadow-none"
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              <img
                src="/assets/Menu-Background/Assets/medium.png"
                alt="Medium"
                className="w-[150px] h-auto select-none opacity-100"
                draggable="false"
              />
            </button>
            <button
              onClick={() => onLevelSelect('hard')}
              onMouseEnter={() => setHovered('hard')}
              onMouseLeave={() => setHovered(null)}
              className="transition-transform duration-300 hover:scale-110 focus:outline-none bg-transparent shadow-none"
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              <img
                src="/assets/Menu-Background/Assets/hard.png"
                alt="Hard"
                className="w-[150px] h-auto select-none opacity-100"
                draggable="false"
              />
            </button>
          </div>
        </div>
      </div>
      {/* Back Button */}
      <div className="text-center mt-4 absolute left-1/2 bottom-8 -translate-x-1/2">
        <SoundButton
          onClick={onBack}
          className="transition-transform duration-300 focus:outline-none drop-shadow-lg hover:scale-110"
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
  );
}
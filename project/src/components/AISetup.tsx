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

export default function AISetup({ onLevelSelect, onBack, mainVolume = 1, uiSound = 1 }: AISetupProps) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="public/assets/Menu-Background/Assets/Ai_Setup.png"
            alt="AI Setup"
            className="mx-auto mb-4 max-w-[320px] w-[320px] drop-shadow-2xl block"
            style={{ display: 'block' }}
          />
        </div>

        {/* AI Level Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {aiLevels.map((level) => (
            <button
              key={level.id}
              onClick={() => onLevelSelect(level.id)}
              className={`group relative bg-gradient-to-br ${level.color} hover:${level.hoverColor} rounded-2xl p-8 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl`}
            >
              <div className="text-center">
                <level.icon className="w-16 h-16 text-white mx-auto mb-4 group-hover:animate-bounce" />
                <h3 className="text-2xl font-bold text-white mb-3">{level.name}</h3>
                <p className="text-white/80 mb-4">{level.description}</p>
                
                <div className="space-y-2">
                  {level.details.map((detail, index) => (
                    <div key={index} className="text-sm text-white/70">
                      • {detail}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          ))}
        </div>

        {/* Power-ups Preview */}
        <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-sm rounded-2xl p-4 border border-purple-400/20 mb-4">
          <h3 className="text-xl font-bold text-white mb-4">Available Power-ups</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl mb-2">❤️</div>
              <div className="text-white font-semibold">Heal</div>
              <div className="text-white/70 text-sm">Restore 1000 HP</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-white font-semibold">2x Damage</div>
              <div className="text-white/70 text-sm">Double attack power</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🔨</div>
              <div className="text-white font-semibold">Hammer</div>
              <div className="text-white/70 text-sm">Reset AI piece</div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-4">
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
    </div>
  );
}
import React from 'react';
import { Volume2, VolumeX, Music, Mouse } from 'lucide-react';
import SoundButton from './SoundButton';
import { GameSettings } from '../types/game';

interface SettingsProps {
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
  onBack: () => void;
  mainVolume?: number;
  uiSound?: number;
}

export default function Settings({ settings, onSettingsChange, onBack, mainVolume = 1, uiSound = 1 }: SettingsProps) {
  const handleVolumeChange = (type: keyof GameSettings, value: number) => {
    if (type === 'soundEnabled') return;
    
    onSettingsChange({
      ...settings,
      [type]: value
    });
  };

  const toggleSound = () => {
    onSettingsChange({
      ...settings,
      soundEnabled: !settings.soundEnabled
    });
  };

  const VolumeSlider = ({ 
    label, 
    value, 
    onChange, 
    icon: Icon, 
    color 
  }: { 
    label: string; 
    value: number; 
    onChange: (value: number) => void; 
    icon: React.ElementType; 
    color: string; 
  }) => (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
      <div className="flex items-center space-x-3 mb-4">
        <Icon className={`w-6 h-6 ${color}`} />
        <h3 className="text-xl font-bold text-white">{label}</h3>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            disabled={!settings.soundEnabled}
          />
        </div>
        <div className="text-white font-bold min-w-[3rem]">
          {Math.round(value * 100)}%
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-8">
      {/* Back Button - always visible, fixed top left */}
      <div className="fixed top-8 left-8 z-50">
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
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <img
            src="/assets/Menu-Background/Assets/Settings.png"
            alt="Settings"
            className="mx-auto mb-4 max-w-[400px] w-[90vw] drop-shadow-2xl"
          />
        </div>

        {/* Volume Controls */}
        <div className="space-y-6 mb-8">
          <VolumeSlider
            label="Main Volume"
            value={settings.mainVolume}
            onChange={(value) => handleVolumeChange('mainVolume', value)}
            icon={Volume2}
            color="text-blue-400"
          />
          
          <VolumeSlider
            label="Menu Music"
            value={settings.menuMusic}
            onChange={(value) => handleVolumeChange('menuMusic', value)}
            icon={Music}
            color="text-purple-400"
          />
          
          <VolumeSlider
            label="UI Sounds"
            value={settings.uiSound}
            onChange={(value) => handleVolumeChange('uiSound', value)}
            icon={Mouse}
            color="text-yellow-400"
          />
        </div>

        {/* Back Button */}
      </div>

      {/* Custom CSS for slider */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: #3b82f6;
          cursor: pointer;
          border-radius: 50%;
          border: 2px solid #1e40af;
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #3b82f6;
          cursor: pointer;
          border-radius: 50%;
          border: 2px solid #1e40af;
        }
        
        .slider:disabled::-webkit-slider-thumb {
          background: #6b7280;
          border-color: #4b5563;
        }
        
        .slider:disabled::-moz-range-thumb {
          background: #6b7280;
          border-color: #4b5563;
        }
      `}</style>
    </div>
  );
}
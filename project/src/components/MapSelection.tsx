import React, { useState } from 'react';
import { Shuffle } from 'lucide-react';
import SoundButton from './SoundButton';
import { MapTheme, Player } from '../types/game';

interface MapSelectionProps {
  players: Player[];
  onMapSelect: (map: MapTheme) => void;
  onBack: () => void;
  mainVolume?: number;
  uiSound?: number;
}

const maps = [
  {
    theme: 'lava' as MapTheme,
    name: 'Lava Realm',
    gradient: 'from-red-900 via-orange-800 to-red-700',
    description: 'Molten landscapes and fiery challenges',
    emoji: '🌋'
  },
  {
    theme: 'river' as MapTheme,
    name: 'River Valley',
    gradient: 'from-blue-900 via-teal-800 to-blue-700',
    description: 'Flowing waters and mystical islands',
    emoji: '🌊'
  },
  {
    theme: 'polar' as MapTheme,
    name: 'Polar Wastes',
    gradient: 'from-cyan-900 via-blue-800 to-indigo-700',
    description: 'Frozen tundra and icy winds',
    emoji: '❄️'
  }
];

export default function MapSelection({ players, onMapSelect, onBack, mainVolume = 1, uiSound = 1 }: MapSelectionProps) {
  const [player1Choice, setPlayer1Choice] = useState<MapTheme | null>(null);
  const [player2Choice, setPlayer2Choice] = useState<MapTheme | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const handleMapChoice = (map: MapTheme) => {
    if (!player1Choice) {
      setPlayer1Choice(map);
    } else if (!player2Choice) {
      setPlayer2Choice(map);
    }
  };

  const handleRandomSelect = () => {
    const randomMap = maps[Math.floor(Math.random() * maps.length)];
    onMapSelect(randomMap.theme);
  };

  const handleConfirm = () => {
    if (player1Choice && player2Choice) {
      setIsSelecting(true);
      setTimeout(() => {
        // If both players chose the same map, use it. Otherwise, pick randomly between the two.
        const finalMap = player1Choice === player2Choice 
          ? player1Choice 
          : Math.random() < 0.5 ? player1Choice : player2Choice;
        onMapSelect(finalMap);
      }, 1000);
    }
  };

  const reset = () => {
    setPlayer1Choice(null);
    setPlayer2Choice(null);
    setIsSelecting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-2xl">
            Choose Your Battlefield
          </h1>
          <p className="text-xl text-white/80 drop-shadow-lg">
            Select the map for your epic battle
          </p>
        </div>

        {/* Player Choices Display */}
        {(player1Choice || player2Choice) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gradient-to-br from-blue-600/30 to-blue-500/30 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/20">
              <h3 className="text-xl font-bold text-white mb-4 text-center">{players[0]?.name}</h3>
              {player1Choice ? (
                <div className="text-center">
                  <div className="text-4xl mb-2">{maps.find(m => m.theme === player1Choice)?.emoji}</div>
                  <div className="text-white font-semibold">{maps.find(m => m.theme === player1Choice)?.name}</div>
                </div>
              ) : (
                <div className="text-center text-white/60">Waiting for choice...</div>
              )}
            </div>

            <div className="bg-gradient-to-br from-red-600/30 to-red-500/30 backdrop-blur-sm rounded-2xl p-6 border border-red-400/20">
              <h3 className="text-xl font-bold text-white mb-4 text-center">{players[1]?.name}</h3>
              {player2Choice ? (
                <div className="text-center">
                  <div className="text-4xl mb-2">{maps.find(m => m.theme === player2Choice)?.emoji}</div>
                  <div className="text-white font-semibold">{maps.find(m => m.theme === player2Choice)?.name}</div>
                </div>
              ) : (
                <div className="text-center text-white/60">Waiting for choice...</div>
              )}
            </div>
          </div>
        )}

        {/* Map Selection */}
        {!isSelecting ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {maps.map((map) => (
                <button
                  key={map.theme}
                  onClick={() => handleMapChoice(map.theme)}
                  disabled={player1Choice && player2Choice}
                  className={`group relative bg-gradient-to-br ${map.gradient} rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                    player1Choice && player2Choice ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">{map.emoji}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{map.name}</h3>
                    <p className="text-white/80 text-sm leading-relaxed">{map.description}</p>
                  </div>
                  <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              ))}

              {/* Random Selection */}
              <button
                onClick={handleRandomSelect}
                className="group relative bg-gradient-to-br from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                <div className="text-center">
                  <Shuffle className="w-12 h-12 text-white mx-auto mb-3 group-hover:animate-spin" />
                  <h3 className="text-xl font-bold text-white mb-2">Random</h3>
                  <p className="text-white/80 text-sm leading-relaxed">Let fate decide your battlefield</p>
                </div>
                <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
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

              {player1Choice && player2Choice && (
                <>
                  <button
                    onClick={reset}
                    className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                  >
                    Reset Choices
                  </button>

                  <button
                    onClick={handleConfirm}
                    className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                  >
                    Confirm Selection
                  </button>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-4 animate-pulse">🎲</div>
            <div className="text-2xl font-bold text-white mb-2">Selecting Map...</div>
            <div className="text-white/80">Determining your battlefield</div>
          </div>
        )}
      </div>
    </div>
  );
}
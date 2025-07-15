import React, { useState } from 'react';
import { Trophy, Users, Play } from 'lucide-react';
import SoundButton from './SoundButton';
import { Player } from '../types/game';

interface TournamentSetupProps {
  onStart: (players: Player[]) => void;
  onBack: () => void;
  mainVolume?: number;
  uiSound?: number;
}

export default function TournamentSetup({ onStart, onBack, mainVolume = 1, uiSound = 1 }: TournamentSetupProps) {
  const [playerCount, setPlayerCount] = useState(4);
  const [playerNames, setPlayerNames] = useState<string[]>(Array(4).fill(''));

  const maxPlayers = 8;
  const minPlayers = 2;

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    setPlayerNames(Array(count).fill('').map((_, i) => `Player ${i + 1}`));
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const handleStart = () => {
    let finalPlayers: Player[] = playerNames.slice(0, playerCount).map((name, index) => ({
      id: index + 1,
      name: name || `Player ${index + 1}`,
      creature: 'rock',
      isAI: false,
      wins: 0
    }));

    // Add AI players if needed to make even number
    if (finalPlayers.length % 2 === 1) {
      finalPlayers.push({
        id: finalPlayers.length + 1,
        name: 'AI Bot',
        creature: 'rock',
        isAI: true,
        wins: 0
      });
    }

    // Ensure we have at least 2 players
    while (finalPlayers.length < 2) {
      finalPlayers.push({
        id: finalPlayers.length + 1,
        name: `AI Bot ${finalPlayers.length}`,
        creature: 'rock',
        isAI: true,
        wins: 0
      });
    }

    onStart(finalPlayers);
  };

  const isValidSetup = playerNames.slice(0, playerCount).every(name => name.trim() !== '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="public/assets/Menu-Background/Assets/Tournament_Setup.png"
            alt="Tournament Setup"
            className="mx-auto mb-4 max-w-[320px] w-[320px] drop-shadow-2xl block"
            style={{ display: 'block' }}
          />
        </div>

        {/* Player Count Selection */}
        <div className="bg-gradient-to-r from-yellow-600/30 to-orange-600/30 backdrop-blur-sm rounded-2xl p-8 border border-yellow-400/20 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Users className="w-8 h-8 text-yellow-400" />
            <h3 className="text-2xl font-bold text-white">Number of Players</h3>
          </div>
          
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => handlePlayerCountChange(Math.max(minPlayers, playerCount - 1))}
              disabled={playerCount <= minPlayers}
              className="w-10 h-10 rounded-full bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold text-xl transition-all duration-300"
            >
              -
            </button>
            
            <div className="text-4xl font-bold text-white mx-8">{playerCount}</div>
            
            <button
              onClick={() => handlePlayerCountChange(Math.min(maxPlayers, playerCount + 1))}
              disabled={playerCount >= maxPlayers}
              className="w-10 h-10 rounded-full bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold text-xl transition-all duration-300"
            >
              +
            </button>
          </div>
          
          <div className="text-white/60 text-sm">
            Maximum players: {maxPlayers} | Minimum players: {minPlayers}
          </div>
          
          {playerCount % 2 === 1 && (
            <div className="mt-4 p-4 bg-blue-600/30 rounded-xl border border-blue-400/20">
              <div className="text-blue-200 text-sm">
                ℹ️ An AI player will be added to make an even number of players
              </div>
            </div>
          )}
        </div>

        {/* Player Names Input */}
        <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 backdrop-blur-sm rounded-2xl p-8 border border-blue-400/20 mb-8">
          <h3 className="text-2xl font-bold text-white mb-6">Player Names</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: playerCount }).map((_, index) => (
              <div key={index} className="space-y-2">
                <label className="block text-white/80 font-semibold">
                  Player {index + 1}
                </label>
                <input
                  type="text"
                  value={playerNames[index] || ''}
                  onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                  placeholder={`Player ${index + 1}`}
                  className="w-full bg-white/10 backdrop-blur-sm text-white placeholder-white/50 px-4 py-3 rounded-xl border border-white/20 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all duration-300"
                  maxLength={20}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
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
          <SoundButton
            onClick={handleStart}
            disabled={!isValidSetup}
            className={`transition-transform duration-300 focus:outline-none drop-shadow-lg hover:scale-110 -mt-[3px] ${isValidSetup ? '' : 'opacity-50 cursor-not-allowed'}`}
            style={{ background: 'none', border: 'none', padding: 0 }}
            mainVolume={mainVolume}
            uiSound={uiSound}
          >
            <img
              src="/assets/Menu-Background/Assets/play_button.png"
              alt="Play"
              className="w-[270px] h-auto select-none"
              draggable="false"
            />
          </SoundButton>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import SoundButton from './SoundButton';
import { Player, CreatureType } from '../types/game';

interface PlayerCustomizationProps {
  players: Player[];
  onPlayersChange: (players: Player[]) => void;
  onComplete: () => void;
  onBack: () => void;
  mainVolume?: number;
  uiSound?: number;
}

const creatures = [
  { type: 'rock' as CreatureType, name: 'Rock Warrior', emoji: '🪨', description: 'Sturdy and resilient' },
  { type: 'islander' as CreatureType, name: 'Island Spirit', emoji: '🏝️', description: 'Swift and adaptable' },
  { type: 'snow' as CreatureType, name: 'Snow Explorer', emoji: '❄️', description: 'Cool and calculated' }
];

export default function PlayerCustomization({ players, onPlayersChange, onComplete, onBack, mainVolume = 1, uiSound = 1 }: PlayerCustomizationProps) {
  const [player1Ready, setPlayer1Ready] = useState(false);
  const [player2Ready, setPlayer2Ready] = useState(false);
  const [player1Creature, setPlayer1Creature] = useState<CreatureType>(players[0]?.creature || 'rock');
  const [player2Creature, setPlayer2Creature] = useState<CreatureType>(players[1]?.creature || 'rock');

  const handlePlayer1Ready = () => {
    setPlayer1Ready(true);
    updatePlayerCreature(0, player1Creature);
  };

  const handlePlayer2Ready = () => {
    setPlayer2Ready(true);
    updatePlayerCreature(1, player2Creature);
  };

  const updatePlayerCreature = (playerIndex: number, creature: CreatureType) => {
    const updatedPlayers = [...players];
    updatedPlayers[playerIndex] = { ...updatedPlayers[playerIndex], creature };
    onPlayersChange(updatedPlayers);
  };

  const handleComplete = () => {
    if (player1Ready && player2Ready) {
      onComplete();
    }
  };

  const resetPlayer1 = () => {
    setPlayer1Ready(false);
  };

  const resetPlayer2 = () => {
    setPlayer2Ready(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-2xl">
            Choose Your Creature
          </h1>
          <p className="text-xl text-white/80 drop-shadow-lg">
            Select your preferred creature type
          </p>
        </div>

        {/* Player Customization Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Player 1 */}
          <div className="bg-gradient-to-br from-blue-600/30 to-blue-500/30 backdrop-blur-sm rounded-2xl p-8 border border-blue-400/20">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">{players[0]?.name}</h3>
              <div className="text-blue-400 font-semibold">Player 1</div>
            </div>

            {!player1Ready ? (
              <>
                <div className="grid grid-cols-1 gap-4 mb-6">
                  {creatures.map((creature) => (
                    <button
                      key={creature.type}
                      onClick={() => setPlayer1Creature(creature.type)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                        player1Creature === creature.type
                          ? 'border-blue-400 bg-blue-400/20'
                          : 'border-white/20 bg-white/10 hover:border-blue-400/50'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">{creature.emoji}</div>
                        <div className="text-left">
                          <div className="text-white font-bold">{creature.name}</div>
                          <div className="text-white/70 text-sm">{creature.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={handlePlayer1Ready}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                >
                  <Check className="w-5 h-5 inline mr-2" />
                  Ready
                </button>
              </>
            ) : (
              <div className="text-center">
                <div className="text-6xl mb-4">{creatures.find(c => c.type === player1Creature)?.emoji}</div>
                <div className="text-2xl font-bold text-white mb-2">
                  {creatures.find(c => c.type === player1Creature)?.name}
                </div>
                <div className="text-green-400 font-semibold mb-4">✓ Ready!</div>
                <button
                  onClick={resetPlayer1}
                  className="text-white/70 hover:text-white transition-colors duration-300"
                >
                  Change selection
                </button>
              </div>
            )}
          </div>

          {/* Player 2 */}
          <div className="bg-gradient-to-br from-red-600/30 to-red-500/30 backdrop-blur-sm rounded-2xl p-8 border border-red-400/20">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">{players[1]?.name}</h3>
              <div className="text-red-400 font-semibold">Player 2</div>
            </div>

            {!player2Ready ? (
              <>
                <div className="grid grid-cols-1 gap-4 mb-6">
                  {creatures.map((creature) => (
                    <button
                      key={creature.type}
                      onClick={() => setPlayer2Creature(creature.type)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                        player2Creature === creature.type
                          ? 'border-red-400 bg-red-400/20'
                          : 'border-white/20 bg-white/10 hover:border-red-400/50'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">{creature.emoji}</div>
                        <div className="text-left">
                          <div className="text-white font-bold">{creature.name}</div>
                          <div className="text-white/70 text-sm">{creature.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={handlePlayer2Ready}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                >
                  <Check className="w-5 h-5 inline mr-2" />
                  Ready
                </button>
              </>
            ) : (
              <div className="text-center">
                <div className="text-6xl mb-4">{creatures.find(c => c.type === player2Creature)?.emoji}</div>
                <div className="text-2xl font-bold text-white mb-2">
                  {creatures.find(c => c.type === player2Creature)?.name}
                </div>
                <div className="text-green-400 font-semibold mb-4">✓ Ready!</div>
                <button
                  onClick={resetPlayer2}
                  className="text-white/70 hover:text-white transition-colors duration-300"
                >
                  Change selection
                </button>
              </div>
            )}
          </div>
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

          <button
            onClick={handleComplete}
            disabled={!player1Ready || !player2Ready}
            className={`group flex items-center space-x-2 px-8 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
              player1Ready && player2Ready
                ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white'
                : 'bg-gray-600 text-gray-300 cursor-not-allowed'
            }`}
          >
            <span>Continue</span>
            <ArrowRight className="w-5 h-5 group-hover:animate-pulse" />
          </button>
        </div>
      </div>
    </div>
  );
}
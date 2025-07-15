import React, { useState, useEffect } from 'react';
import { Heart, Zap, Hammer, Trophy, Crown } from 'lucide-react';
import SoundButton from './SoundButton';
import { AILevel, PowerUp, MapTheme } from '../types/game';

interface AISurvivalProps {
  level: AILevel;
  onBack: () => void;
  mainVolume?: number;
  uiSound?: number;
}

const powerUps: PowerUp[] = [
  {
    id: 'heal',
    name: 'Heal',
    description: 'Restore 1000 HP',
    effect: 'heal',
    value: 1000
  },
  {
    id: 'damage',
    name: '2x Damage',
    description: 'Double your damage for next round',
    effect: 'damage',
    value: 2
  },
  {
    id: 'hammer',
    name: 'Hammer',
    description: 'Reset an AI piece position',
    effect: 'hammer',
    value: 1
  }
];

const maps: MapTheme[] = ['lava', 'river', 'polar'];

export default function AISurvival({ level, onBack, mainVolume = 1, uiSound = 1 }: AISurvivalProps) {
  const [playerHP, setPlayerHP] = useState(2000);
  const [aiHP, setAiHP] = useState(200);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentMap, setCurrentMap] = useState<MapTheme>('lava');
  const [showPowerUps, setShowPowerUps] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [damagePowerUp, setDamagePowerUp] = useState(false);
  const [maxStreak, setMaxStreak] = useState(0);

  // Load max streak from localStorage
  useEffect(() => {
    const savedStreak = localStorage.getItem('tacticross-max-streak');
    if (savedStreak) {
      setMaxStreak(parseInt(savedStreak));
    }
  }, []);

  // Save max streak when round increases
  useEffect(() => {
    if (currentRound > maxStreak) {
      setMaxStreak(currentRound);
      localStorage.setItem('tacticross-max-streak', currentRound.toString());
    }
  }, [currentRound, maxStreak]);

  const getDifficultyMultiplier = () => {
    switch (level) {
      case 'easy': return 1;
      case 'medium': return 1.5;
      case 'hard': return 2;
      default: return 1;
    }
  };

  const simulateRound = () => {
    // Simple AI simulation - player has slight advantage
    const playerChance = 0.6 / getDifficultyMultiplier();
    const playerWins = Math.random() < playerChance;
    
    if (playerWins) {
      // Player wins round
      const damage = Math.floor(Math.random() * 300 + 200) * (damagePowerUp ? 2 : 1);
      setAiHP(prev => Math.max(0, prev - damage));
      setDamagePowerUp(false); // Reset damage power-up
      
      setTimeout(() => {
        if (aiHP - damage <= 0) {
          // AI defeated, show power-ups
          setShowPowerUps(true);
        }
      }, 1000);
    } else {
      // AI wins round
      const damage = Math.floor(Math.random() * 400 + 300) * getDifficultyMultiplier();
      setPlayerHP(prev => Math.max(0, prev - damage));
      
      setTimeout(() => {
        if (playerHP - damage <= 0) {
          setGameOver(true);
        }
      }, 1000);
    }
  };

  const handlePowerUpSelect = (powerUp: PowerUp) => {
    switch (powerUp.effect) {
      case 'heal':
        setPlayerHP(prev => Math.min(2000, prev + powerUp.value));
        break;
      case 'damage':
        setDamagePowerUp(true);
        break;
      case 'hammer':
        // In a real game, this would reset an AI piece
        // For simulation, we'll give a small HP boost
        setPlayerHP(prev => Math.min(2000, prev + 100));
        break;
    }
    
    setShowPowerUps(false);
    nextRound();
  };

  const nextRound = () => {
    const newRound = currentRound + 1;
    setCurrentRound(newRound);
    setAiHP(200 + (newRound - 1) * 100); // AI HP increases each round
    
    // Change map every 5 rounds
    if (newRound % 5 === 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentMap(maps[Math.floor(Math.random() * maps.length)]);
        setIsTransitioning(false);
      }, 1000);
    }
  };

  const resetGame = () => {
    setPlayerHP(2000);
    setAiHP(200);
    setCurrentRound(1);
    setCurrentMap('lava');
    setShowPowerUps(false);
    setGameOver(false);
    setIsTransitioning(false);
    setDamagePowerUp(false);
  };

  const getMapConfig = () => {
    const configs = {
      lava: { name: 'Lava Realm', gradient: 'from-red-900 via-orange-800 to-red-700' },
      river: { name: 'River Valley', gradient: 'from-blue-900 via-teal-800 to-blue-700' },
      polar: { name: 'Polar Wastes', gradient: 'from-cyan-900 via-blue-800 to-indigo-700' }
    };
    return configs[currentMap];
  };

  const mapConfig = getMapConfig();

  // Game Over Screen
  if (gameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-8xl mb-8">💀</div>
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-2xl">
            GAME OVER
          </h1>
          <div className="text-2xl text-white/80 mb-4">
            You survived {currentRound - 1} rounds
          </div>
          <div className="text-xl text-yellow-400 mb-8">
            Best Streak: {maxStreak} rounds
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              Try Again
            </button>
            <button
              onClick={onBack}
              className="bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Power-up Selection Screen
  if (showPowerUps) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
            <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-2xl">
              Round {currentRound - 1} Complete!
            </h1>
            <p className="text-xl text-white/80 drop-shadow-lg">
              Choose your power-up
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {powerUps.map((powerUp) => (
              <button
                key={powerUp.id}
                onClick={() => handlePowerUpSelect(powerUp)}
                className="group bg-gradient-to-br from-purple-600/30 to-pink-600/30 backdrop-blur-sm rounded-2xl p-8 border border-purple-400/20 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">
                    {powerUp.effect === 'heal' && <Heart className="w-12 h-12 text-red-400 mx-auto" />}
                    {powerUp.effect === 'damage' && <Zap className="w-12 h-12 text-yellow-400 mx-auto" />}
                    {powerUp.effect === 'hammer' && <Hammer className="w-12 h-12 text-blue-400 mx-auto" />}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{powerUp.name}</h3>
                  <p className="text-white/80">{powerUp.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Main Game Screen
  return (
    <div className={`min-h-screen bg-gradient-to-br ${mapConfig.gradient} flex items-center justify-center p-8 transition-all duration-1000`}>
      {/* Cloud Transition */}
      {isTransitioning && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="text-4xl font-bold text-white animate-pulse">
            Transitioning to {mapConfig.name}...
          </div>
        </div>
      )}

      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-2xl">
            {mapConfig.name} - Round {currentRound}
          </h1>
          <div className="text-white/80">
            AI Level: {level.charAt(0).toUpperCase() + level.slice(1)}
          </div>
        </div>

        {/* HP Bars */}
        <div className="space-y-4 mb-8">
          {/* AI HP */}
          <div className="bg-black/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-bold">AI Enemy</span>
              <span className="text-white">{aiHP} HP</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-red-600 to-red-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${(aiHP / (200 + (currentRound - 1) * 100)) * 100}%` }}
              />
            </div>
          </div>

          {/* Player HP */}
          <div className="bg-black/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-bold">Your HP</span>
              <span className="text-white">{playerHP} HP</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-green-600 to-green-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${(playerHP / 2000) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-black/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{currentRound}</div>
            <div className="text-white/70">Current Round</div>
          </div>
          <div className="bg-black/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{maxStreak}</div>
            <div className="text-white/70">Best Streak</div>
          </div>
          <div className="bg-black/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{level.toUpperCase()}</div>
            <div className="text-white/70">Difficulty</div>
          </div>
        </div>

        {/* Power-up Status */}
        {damagePowerUp && (
          <div className="bg-yellow-600/30 rounded-xl p-4 mb-8 text-center">
            <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-yellow-200 font-bold">2x Damage Active!</div>
          </div>
        )}

        {/* Action Button */}
        <div className="text-center mb-8">
          <button
            onClick={simulateRound}
            disabled={isTransitioning}
            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white px-12 py-4 rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTransitioning ? 'Transitioning...' : 'Battle!'}
          </button>
        </div>

        {/* Back Button */}
        <div className="text-center">
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
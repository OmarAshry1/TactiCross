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
  const [playerNames, setPlayerNames] = useState<string[]>(Array(4).fill(""));

  const maxPlayers = 8;
  const minPlayers = 2;

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    setPlayerNames(Array(count).fill(""));
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
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-[440px] h-[140px] flex items-center justify-center select-none">
            <img
              src="/assets/Menu-Background/Assets/Tournament_Player_num.png"
              alt="Number of Players"
              className="w-[450px] h-[140px] drop-shadow-2xl select-none pointer-events-none"
              draggable="false"
              style={{ userSelect: 'none' }}
            />
            {/* Arrow Buttons Vertical Stack */}
            <div className="absolute flex flex-col items-center gap-2 right-7 top-[54%] -translate-y-1/2 z-10">
              <SoundButton
                onClick={() => handlePlayerCountChange(Math.min(maxPlayers, playerCount + 1))}
                disabled={playerCount >= maxPlayers}
                className="w-10 h-10 transition-transform duration-200 hover:scale-125 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'none', border: 'none', padding: 0 }}
                mainVolume={mainVolume}
                uiSound={uiSound}
              >
                <img
                  src="/assets/Menu-Background/Assets/green-arrow.png"
                  alt="Increase Players"
                  className="w-10 h-10 select-none pointer-events-none"
                  draggable="false"
                  style={{ userSelect: 'none' }}
                />
              </SoundButton>
              <SoundButton
                onClick={() => handlePlayerCountChange(Math.max(minPlayers, playerCount - 1))}
                disabled={playerCount <= minPlayers}
                className="w-10 h-10 transition-transform duration-200 hover:scale-125 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'none', border: 'none', padding: 0 }}
                mainVolume={mainVolume}
                uiSound={uiSound}
              >
                <img
                  src="/assets/Menu-Background/Assets/red-arrow.png"
                  alt="Decrease Players"
                  className="w-10 h-10 select-none pointer-events-none"
                  draggable="false"
                  style={{ userSelect: 'none' }}
                />
              </SoundButton>
            </div>
            {/* Player Count Number only */}
            <div
              className="absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 text-4xl font-bold"
              style={{ color: 'black', fontFamily: 'RetroPix, monospace', letterSpacing: '2px', width: '60px', textAlign: 'left', userSelect: 'none' }}
            >
              <span>{playerCount}</span>
            </div>
          </div>
        </div>

        {/* Player Names Input */}
        <div className="w-full flex justify-center items-center" style={{ minHeight: '320px' }}>
          <div
            className="grid items-center justify-center"
            style={{
              gridTemplateColumns: 'repeat(4, 1fr)',
              gridTemplateRows: 'repeat(2, 1fr)',
              width: '1120px',
              height: '300px',
              columnGap: '24px',
              rowGap: '0px',
              justifyContent: 'center',
              alignContent: 'center',
              margin: '0 auto',
            }}
          >
            {(() => {
              const columns = 4;
              const rows = 2;
              const totalSlots = columns * rows;
              // Fill grid left-to-right, top-to-bottom, then pad with empty cells
              const playerCells = Array.from({ length: playerCount }).map((_, index) => (
                <div key={index} className="relative flex justify-center items-center">
                  <img
                    src={`/assets/Menu-Background/Assets/Player_cards/player${index + 1}.png`}
                    alt={`Player ${index + 1} Card`}
                    className="w-full max-w-[460px] md:max-w-[460px] lg:max-w-[460px] xl:max-w-[460px] 2xl:max-w-[460px] rounded-2xl shadow-lg select-none pointer-events-none"
                    draggable="false"
                    style={{ userSelect: 'none', height: '110px', width: '270px' }}
                  />
                  <input
                    type="text"
                    value={playerNames[index] || ''}
                    onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                    placeholder={`Player ${index + 1}`}
                    className="absolute left-1/2 top-[62%] -translate-x-1/2 -translate-y-1/2 bg-transparent text-black px-2 py-2 rounded-xl border border-black/20 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all duration-300 text-center text-2xl font-bold shadow-md"
                    maxLength={20}
                    style={{
                      zIndex: 2,
                      fontFamily: 'RetroPix, monospace',
                      letterSpacing: '1px',
                      width: '86%',
                      background: 'transparent',
                      color: playerNames[index] ? 'black' : '#888',
                    }}
                  />
                </div>
              ));
              const emptyCells = Array.from({ length: totalSlots - playerCount }).map((_, i) => <div key={`empty-${i}`}></div>);
              return [...playerCells, ...emptyCells];
            })()}
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
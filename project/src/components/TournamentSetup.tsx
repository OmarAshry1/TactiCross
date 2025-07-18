import React, { useState } from 'react';
import { Trophy, Users, Play } from 'lucide-react';
import SoundButton from './SoundButton';
import { Player } from '../types/game';
import AnimatedBackground from './AnimatedBackground';

interface TournamentSetupProps {
  onStart: (players: Player[], playerCount: number) => void;
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

    onStart(finalPlayers, playerCount);
  };

  const isValidSetup = playerNames.slice(0, playerCount).every(name => name.trim() !== '');

  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden">
      <AnimatedBackground className="z-0" />
      {/* Back Button - fixed top left */}
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
      <div className="max-w-4xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="/assets/Menu-Background/Assets/Tournament_Setup.png"
            alt="Tournament Setup"
            className="mx-auto mb-4 max-w-[320px] w-[320px] drop-shadow-2xl block"
            style={{ display: 'block' }}
          />
        </div>
        {/* Player Count Selection and Let's Play button in a row */}
        <div className="flex flex-row items-center justify-center mb-8 gap-6">
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
          {/* Let's Play button right next to player count card */}
          <SoundButton
            onClick={handleStart}
            disabled={!isValidSetup}
            className={`transition-transform duration-300 hover:scale-110 focus:outline-none bg-transparent shadow-none ${!isValidSetup ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ background: 'none', border: 'none', padding: 0 }}
            mainVolume={mainVolume}
            uiSound={uiSound}
          >
            <img
              src="/assets/Menu-Background/Assets/play_button.png"
              alt="Let's Play"
              className="w-[240px] h-auto select-none"
              draggable="false"
            />
          </SoundButton>
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
                    className="absolute left-1/2 top-[62%] -translate-x-1/2 -translate-y-1/2 bg-transparent text-black px-2 py-2 rounded-xl border border-black/20 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all duration-300 text-center text-2xl font-bold shadow-md retropix"
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
      </div>
    </div>
  );
}
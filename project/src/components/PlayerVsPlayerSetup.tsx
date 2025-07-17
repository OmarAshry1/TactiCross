import React, { useState } from 'react';
import { User, Play } from 'lucide-react';
import SoundButton from './SoundButton';
import { Player } from '../types/game';

interface PlayerVsPlayerSetupProps {
  players: Player[];
  onPlayersChange: (players: Player[]) => void;
  onReady: () => void;
  onBack: () => void;
}

interface PlayerVsPlayerSetupPropsWithVolume extends PlayerVsPlayerSetupProps {
  mainVolume?: number;
  uiSound?: number;
}

export default function PlayerVsPlayerSetup({ players, onPlayersChange, onReady, onBack, mainVolume = 1, uiSound = 1 }: PlayerVsPlayerSetupPropsWithVolume) {
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");

  const handleStart = () => {
    const updatedPlayers = [
      { ...players[0], name: player1Name },
      { ...players[1], name: player2Name }
    ];
    onPlayersChange(updatedPlayers);
    onReady();
  };

  const isValidSetup = player1Name.trim() !== '' && player2Name.trim() !== '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <img
            src="/assets/Menu-Background/Assets/Player_setup.png"
            alt="Player Setup"
            className="mx-auto mb-4 max-w-[600px] w-[90vw] drop-shadow-2xl"
          />
        </div>

        {/* Player Input Cards as Images */}
        <div className="space-y-6 mb-8">
          <div className="relative flex justify-center">
            <img
              src="/assets/Menu-Background/Assets/Player_cards/player1.png"
              alt="Player 1 Card"
              className="w-full max-w-[460px] rounded-2xl shadow-lg select-none pointer-events-none"
              draggable="false"
              style={{ userSelect: 'none', height: '130px', width: '370px' }}
            />
            <input
              type="text"
              value={player1Name}
              onChange={(e) => setPlayer1Name(e.target.value)}
              placeholder="Player 1"
              className="absolute left-1/2 top-[63%] -translate-x-1/2 -translate-y-1/2 bg-transparent text-black px-2 py-2 rounded-xl border border-black/20 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all duration-300 text-center text-2xl font-bold shadow-md retropix"
              maxLength={20}
              style={{
                zIndex: 2,
                fontFamily: 'Retropix, monospace',
                letterSpacing: '1px',
                width: '47%',
                background: 'transparent',
                color: player1Name ? 'black' : '#888',
              }}
            />
          </div>
          <div className="relative flex justify-center">
            <img
              src="/assets/Menu-Background/Assets/Player_cards/player2.png"
              alt="Player 2 Card"
              className="w-full max-w-[460px] rounded-2xl shadow-lg select-none pointer-events-none"
              draggable="false"
              style={{ userSelect: 'none', height: '130px', width: '370px' }}
            />
            <input
              type="text"
              value={player2Name}
              onChange={(e) => setPlayer2Name(e.target.value)}
              placeholder="Player 2"
              className="absolute left-1/2 top-[62%] -translate-x-1/2 -translate-y-1/2 bg-transparent text-black px-2 py-2 rounded-xl border border-black/20 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/30 transition-all duration-300 text-center text-2xl font-bold shadow-md retropix"
              maxLength={20}
              style={{
                zIndex: 2,
                fontFamily: 'Retropix, monospace',
                letterSpacing: '1px',
                width: '47%',
                background: 'transparent',
                color: player2Name ? 'black' : '#888',
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
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
            className={`transition-transform duration-300 focus:outline-none drop-shadow-lg hover:scale-110 -mt-1.5 ${isValidSetup ? '' : 'opacity-50 cursor-not-allowed'}`}
            style={{ background: 'none', border: 'none', padding: 0 }}
            mainVolume={mainVolume}
            uiSound={uiSound}
          >
            <img
              src="/assets/Menu-Background/Assets/play_button.png"
              alt="Play"
              className="w-[265px] h-auto select-none"
              draggable="false"
            />
          </SoundButton>
        </div>
      </div>
    </div>
  );
}
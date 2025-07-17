import React from 'react';
import SoundButton from './SoundButton';
import { Player } from '../types/game';
import AnimatedBackground from './AnimatedBackground';

interface TournamentBracketProps {
  players: Player[];
  playerCount: number;
  onComplete?: () => void;
  onBack: () => void;
  mainVolume?: number;
  uiSound?: number;
}

/**
 * Overlay positions for each bracket size (2-8 players).
 * Each entry is an array of { left, top, width, height } for each player slot.
 * Coordinates are in px for a 1000x1000 image. Adjust as needed for your actual PNG layout.
 */
const overlayPositions: { [key: number]: { left: number; top: number; width: number; height: number }[] } = {
  2: [
    { left: 500, top: 415, width: 180, height: 40 }, // Player 1
    { left: 1050, top: 415, width: 180, height: 40 }, // Player 2
  ],
  3: [
    { left: 365, top: 410, width: 180, height: 40 }, // Player 1
    { left: 365, top: 520, width: 180, height: 40 }, // Player 2
    { left: 1150, top: 415, width: 180, height: 40 }, // Player 3
  ],
  4: [
    { left: 370, top: 398, width: 180, height: 40 }, // Player 1
    { left: 375, top: 505, width: 180, height: 40 }, // Player 2
    { left: 1150, top: 400, width: 180, height: 40 }, // Player 3
    { left: 1155, top: 517, width: 180, height: 40 }, // Player 4
  ],
  5: [
    { left: 330, top: 324, width: 180, height: 40 }, // Player 1
    { left: 330, top: 400, width: 180, height: 40 }, // Player 2
    { left: 1172, top: 326, width: 180, height: 40 }, // Player 3
    { left: 1172, top: 407, width: 180, height: 40 }, // Player 4
    { left: 333, top: 547, width: 180, height: 40 }, // Player 5
  ],
  6: [
    { left: 330, top: 333, width: 180, height: 40 }, // Player 1
    { left: 330, top: 408, width: 180, height: 40 }, // Player 2
    { left: 1164, top: 334, width: 180, height: 40 }, // Player 3
    { left: 1164, top: 415, width: 180, height: 40 }, // Player 4
    { left: 336, top: 552, width: 180, height: 40 }, // Player 5
    { left: 336, top: 627, width: 180, height: 40 }, // Player 6
  ],
  7: [
    { left: 335, top: 330, width: 180, height: 40 }, // Player 1
    { left: 335, top: 405, width: 180, height: 40 }, // Player 2
    { left: 1160, top: 332, width: 180, height: 40 }, // Player 3
    { left: 1160, top: 412, width: 180, height: 40 }, // Player 4
    { left: 341, top: 548, width: 180, height: 40 }, // Player 5
    { left: 339, top: 623, width: 180, height: 40 }, // Player 6
    { left: 1164, top: 543, width: 180, height: 40 }, // Player 7
  ],
  8: [
    { left: 335, top: 325, width: 180, height: 40 }, // Player 1
    { left: 335, top: 402, width: 180, height: 40 }, // Player 2
    { left: 1168, top: 328, width: 180, height: 40 }, // Player 3
    { left: 1168, top: 409, width: 180, height: 40 }, // Player 4
    { left: 341, top: 548, width: 180, height: 40 }, // Player 5
    { left: 339, top: 623, width: 180, height: 40 }, // Player 6
    { left: 1172, top: 541, width: 180, height: 40 }, // Player 7
    { left: 1172, top: 623, width: 180, height: 40 }, // Player 8
  ],
};

const overlayWinnerPositions: { [key: number]: { left: number; top: number; width: number; height: number }[] } = {
  2: [
    { left: 750, top:605, width: 180, height: 40 }, // Final winner
  ],
  3: [
    { left: 595, top: 480, width: 180, height: 40 }, // Semifinal 1 winner
    { left: 905, top: 480, width: 180, height: 40 }, // Semifinal 2 winner
    { left: 742, top: 595, width: 180, height: 40 }, // Final winner
  ],
  4: [
    { left: 600, top: 465, width: 180, height: 40 }, // Semifinal 1 winner
    { left: 915, top: 465, width: 180, height: 40 }, // Semifinal 2 winner
    { left: 750, top: 580, width: 180, height: 40 }, // Final winner
  ],
  5: [
    { left: 495, top: 372, width: 180, height: 40 }, // QF1 winner
    { left: 1000, top: 370, width: 180, height: 40 }, // QF2 winner
    { left: 495, top: 595, width: 180, height: 40 }, // QF3 winner
    { left: 1003, top: 585, width: 180, height: 40 }, // QF4 winner
    { left: 655, top: 502, width: 180, height: 40 }, // SF1 winner
    { left: 827, top: 500, width: 180, height: 40 }, // SF2 winner
    { left: 745, top: 630, width: 180, height: 40 }, // Final winner
  ],
  6: [
    { left: 495, top: 380, width: 180, height: 40 }, // QF1 winner
    { left: 993, top: 379, width: 180, height: 40 }, // QF2 winner
    { left: 495, top: 600, width: 180, height: 40 }, // QF3 winner
    { left: 1003, top: 591, width: 180, height: 40 }, // QF4 winner
    { left: 655, top: 508, width: 180, height: 40 }, // SF1 winner
    { left: 827, top: 506, width: 180, height: 40 }, // SF2 winner
    { left: 743, top: 634, width: 180, height: 40 }, // Final winner
  ],
  7: [
    { left: 495, top: 377, width: 180, height: 40 }, // QF1 winner
    { left: 993, top: 377, width: 180, height: 40 }, // QF2 winner
    { left: 495, top: 597, width: 180, height: 40 }, // QF3 winner
    { left: 1000, top: 588, width: 180, height: 40 }, // QF4 winner
    { left: 655, top: 506, width: 180, height: 40 }, // SF1 winner
    { left: 827, top: 503, width: 180, height: 40 }, // SF2 winner
    { left: 743, top: 631, width: 180, height: 40 }, // Final winner
  ],
  8: [
    { left: 495, top: 374, width: 180, height: 40 }, // QF1 winner
    { left: 998, top: 373, width: 180, height: 40 }, // QF2 winner
    { left: 495, top: 595, width: 180, height: 40 }, // QF3 winner
    { left: 1002, top: 586, width: 180, height: 40 }, // QF4 winner
    { left: 655, top: 503, width: 180, height: 40 }, // SF1 winner
    { left: 827, top: 501, width: 180, height: 40 }, // SF2 winner
    { left: 743, top: 631, width: 180, height: 40 }, // Final winner
  ],
};

export default function TournamentBracket({ players, playerCount, onBack, mainVolume = 1, uiSound = 1 }: TournamentBracketProps) {
  // Clamp player count between 2 and 8
  const clampedPlayerCount = Math.max(2, Math.min(playerCount, 8));
  const bracketImg = `/assets/Menu-Background/Assets/tournament_${clampedPlayerCount}.png`;
    
    return (
    <div className="min-h-screen w-full flex items-center justify-center p-0 relative overflow-hidden">
      {/* Animated background behind everything */}
      <div className="absolute inset-0 z-0">
        <AnimatedBackground />
      </div>
      {/* Back button always top left */}
      <div style={{ position: 'absolute', top: 32, left: 32, zIndex: 50 }}>
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
            style={{ width: 240, height: 'auto' }}
              draggable="false"
            />
          </SoundButton>
        </div>
      {/* Bracket image absolutely positioned, fills viewport */}
      <img
        src={bracketImg}
        alt={`Tournament Bracket for ${clampedPlayerCount} players`}
        style={{
          position: 'absolute',
          top: 0,
          left: 350,
          width: '1000px', // match your PNG size for overlay accuracy
          height: '1000px',
          objectFit: 'contain',
          zIndex: 10,
          pointerEvents: 'none',
        }}
        draggable="false"
      />
      {/* Overlay player names */}
      {overlayPositions[clampedPlayerCount]?.map((pos: { left: number; top: number; width: number; height: number }, idx: number) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            left: pos.left,
            top: pos.top,
            width: pos.width,
            height: pos.height,
            zIndex: 20,
            color: 'black',
            fontWeight: 'bold',
            fontSize: 22,
            background: 'rgba(255, 255, 255, 0)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0)',
            textShadow: '0 2px 8px #fff',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {players[idx]?.name || ''}
        </div>
      ))}
      {/* Overlay winner slots */}
      {overlayWinnerPositions[clampedPlayerCount]?.map((pos: { left: number; top: number; width: number; height: number }, idx: number) => (
        <div
          key={`winner-${idx}`}
          style={{
            position: 'absolute',
            left: pos.left,
            top: pos.top,
            width: pos.width,
            height: pos.height,
            zIndex: 21,
            color: '#1a237e',
            fontWeight: 'bold',
            fontSize: 20,
            background: 'rgba(173, 216, 230, 0)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            fontStyle: 'italic',
            textShadow: '0 2px 8px #fff',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {`Winner ${idx + 1}`}
      </div>
      ))}
    </div>
  );
}
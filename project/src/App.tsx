import React, { useState, useRef, useEffect } from 'react';
import StartingPage from './components/StartingPage';
import GameModeSelection from './components/GameModeSelection';
import PlayerVsPlayerSetup from './components/PlayerVsPlayerSetup';
import PlayerCustomization from './components/PlayerCustomization';
import MapSelection from './components/MapSelection';
import GameBoard from './components/GameBoard';
import TournamentSetup from './components/TournamentSetup';
import TournamentBracket from './components/TournamentBracket';
import AISetup from './components/AISetup';
import AISurvival from './components/AISurvival';
import Settings from './components/Settings';
import SoundButton from './components/SoundButton';
import AnimatedBackground from './components/AnimatedBackground';
import { Volume2, VolumeX } from 'lucide-react';
import { GameState, Player, GameMode, MapTheme, AILevel } from './types/game';

// --- Map Game State and Logic ---

// Helper: get idle animation frames for a creature and direction
function getIdleFrames(creature: string, direction: 'left' | 'right') {
  // Example: /assets/Menu-Background/Assets/creatures/PNG/Slime1/Idle/left/Slime1_Idle_1.PNG
  return Array.from({ length: 6 }, (_, i) =>
    `/assets/Menu-Background/Assets/creatures/PNG/${creature}/Idle/${direction}/${creature}_Idle_${i + 1}.PNG`
  );
}

// River map game board cell: { owner: 1 | 2 | null, moved: boolean }
type RiverCell = { owner: 1 | 2 | null, moved: boolean };

// Define MapGameProps for the main props, and MapGameExtraProps for the extra control props
type MapGameProps = {
  player1Name: string;
  player2Name: string;
  player1Creature: string;
  player2Creature: string;
  mapType: 'river' | 'lava' | 'polar';
  mainVolume: number;
  isMuted: boolean;
};
type MapGameExtraProps = {
  onRematch: () => void;
  onBackToModeSelect: () => void;
  gameWinner: 1 | 2 | null;
  setGameWinner: (winner: 1 | 2 | null) => void;
};

function MapGame({ player1Name, player2Name, player1Creature, player2Creature, mapType, mainVolume, isMuted, onRematch, onBackToModeSelect, gameWinner, setGameWinner }: MapGameProps & MapGameExtraProps) {
  const mapRevealPNGs: Record<string, string> = {
    polar: '/assets/Menu-Background/Assets/polar/polar_map.png',
    river: '/assets/Menu-Background/Assets/river/river_map.png',
    lava: '/assets/Menu-Background/Assets/lava/lava_map.png',
  };
  const initialBoard: RiverCell[][] = [
    [ { owner: 2, moved: false }, { owner: null, moved: false }, { owner: 1, moved: false } ],
    [ { owner: 2, moved: false }, { owner: null, moved: false }, { owner: 1, moved: false } ],
    [ { owner: 2, moved: false }, { owner: null, moved: false }, { owner: 1, moved: false } ],
  ];
  const [board, setBoard] = useState(initialBoard);
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [frame, setFrame] = useState(0);
  const [roundWinner, setRoundWinner] = useState<1 | 2 | null>(null);

  // Track how many creatures each player has moved across
  const [player1Crossed, setPlayer1Crossed] = useState(0);
  const [player2Crossed, setPlayer2Crossed] = useState(0);
  const [isAnimatingCreature, setIsAnimatingCreature] = useState(false);
  const [animatingCreature, setAnimatingCreature] = useState<1 | 2 | null>(null);

  // Round counters for both players
  const [player1Rounds, setPlayer1Rounds] = useState(0);
  const [player2Rounds, setPlayer2Rounds] = useState(0);

  // Creature animation state
  const [creatureStates, setCreatureStates] = useState([
    { top: '40%', left: '71%', anim: 'idle', frame: 0, finished: false }, // Player 1, Creature 1
    { top: '50%', left: '71%', anim: 'idle', frame: 0, finished: false }, // Player 1, Creature 2
    { top: '40%', left: '29%', anim: 'idle', frame: 0, finished: false }, // Player 2, Creature 1
    { top: '50%', left: '29%', anim: 'idle', frame: 0, finished: false }, // Player 2, Creature 2
  ]);
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);
  const [animDirection, setAnimDirection] = useState<'up'|'left'|'down'|'right'|'idle'|null>(null);
  const [animTimer, setAnimTimer] = useState<any>(null);

  // Helper to get animation frames
  function getRunFrames(creature: string, dir: 'left'|'right'|'front'|'back') {
    return Array.from({ length: 8 }, (_, i) =>
      `/assets/Menu-Background/Assets/creatures/PNG/${creature}/Run/${dir}/${creature}_Run_${i + 1}.PNG`
    );
  }
  function getIdleFramesCount(creature: string, dir: 'left'|'right') {
    return Array.from({ length: 6 }, (_, i) =>
      `/assets/Menu-Background/Assets/creatures/PNG/${creature}/Idle/${dir}/${creature}_Idle_${i + 1}.PNG`
    );
  }

  // Win detection helper
  function checkWin(board: RiverCell[][]): 1 | 2 | null {
    // Helper to check if all cells in a line belong to the same player and have been moved
    const checkLine = (cells: [number, number][]): 1 | 2 | null => {
      const owners = cells.map(([r, c]) => board[r][c].owner);
      const moved = cells.map(([r, c]) => board[r][c].moved);
      if (owners.every(o => o === 1) && moved.every(m => m)) return 1;
      if (owners.every(o => o === 2) && moved.every(m => m)) return 2;
      return null;
    };
    // Rows
    for (let r = 0; r < 3; r++) {
      const winner = checkLine([[r,0],[r,1],[r,2]]);
      if (winner) return winner;
    }
    // Columns
    for (let c = 0; c < 3; c++) {
      const winner = checkLine([[0,c],[1,c],[2,c]]);
      if (winner) return winner;
    }
    // Diagonals
    let winner = checkLine([[0,0],[1,1],[2,2]]);
    if (winner) return winner;
    winner = checkLine([[0,2],[1,1],[2,0]]);
    if (winner) return winner;
    return null;
  }

  // Check for win after every move
  useEffect(() => {
    const winner = checkWin(board);
    if (winner) {
      setRoundWinner(winner);
      // Animation and round reset logic will go here
    }
  }, [board]);

  React.useEffect(() => {
    const id = setInterval(() => setFrame(f => (f + 1) % 6), 180);
    return () => clearInterval(id);
  }, []);

  const mapAudioRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    let audio: HTMLAudioElement | null = null;
    let musicPath = '';
    if (mapType === 'river') {
      musicPath = '/assets/Menu-Background/Assets/river/music/river_music.wav';
    } else if (mapType === 'lava') {
      musicPath = '/assets/Menu-Background/Assets/lava/music/lava_music.wav';
    } else if (mapType === 'polar') {
      musicPath = '/assets/Menu-Background/Assets/polar/music/polar_music.wav';
    }
    if (musicPath) {
      audio = new Audio(musicPath);
      audio.loop = true;
      audio.volume = mainVolume * 0.4;
      mapAudioRef.current = audio;
      if (!isMuted) {
        audio.play();
      }
    }
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio = null;
        mapAudioRef.current = null;
      }
    };
  }, [mapType, mainVolume, isMuted]);

  React.useEffect(() => {
    if (mapAudioRef.current) {
      if (isMuted) {
        mapAudioRef.current.pause();
      } else {
        mapAudioRef.current.play();
      }
    }
  }, [isMuted]);

  const selectSound = '/assets/Menu-Background/Assets/sounds/select_icon.wav';
  const placeSound = '/assets/Menu-Background/Assets/sounds/placing_icon.wav';

  function playSound(src: string) {
    const audio = new Audio(src);
    audio.volume = Math.min(mainVolume * 1.5, 1);
    audio.play();
  }

  // Animation logic for round win
  useEffect(() => {
    if (roundWinner && !gameWinner) {
      // Find which creature to animate for the winner
      let idx = -1;
      if (roundWinner === 1) {
        idx = creatureStates.findIndex((c, i) => i < 2 && !c.finished);
      } else {
        idx = creatureStates.findIndex((c, i) => i >= 2 && !c.finished);
      }
      if (idx === -1) return;
      setAnimatingIndex(idx);
      setIsAnimatingCreature(true);
      setAnimDirection(roundWinner === 1 ? 'up' : 'down');
      setCreatureStates(cs => cs.map((c, i) => i === idx ? { ...c, anim: roundWinner === 1 ? 'run-back' : 'run-front', frame: 0 } : c));
      let frame = 0;
      let pos = parseFloat(creatureStates[idx].top);
      let interval = setInterval(() => {
        frame = (frame + 1) % 8;
        setCreatureStates(cs => cs.map((c, i) => i === idx ? { ...c, frame } : c));
        if ((roundWinner === 1 && pos > 10) || (roundWinner === 2 && pos < 80)) {
          pos += roundWinner === 1 ? -2 : 2;
          setCreatureStates(cs => cs.map((c, i) => i === idx ? { ...c, top: `${pos}%` } : c));
        } else {
          clearInterval(interval);
          // Now animate left/right
          setAnimDirection(roundWinner === 1 ? 'left' : 'right');
          setCreatureStates(cs => cs.map((c, i) => i === idx ? { ...c, anim: roundWinner === 1 ? 'run-left' : 'run-right', frame: 0 } : c));
          let lpos = parseFloat(creatureStates[idx].left);
          let linterval = setInterval(() => {
            frame = (frame + 1) % 8;
            setCreatureStates(cs => cs.map((c, i) => i === idx ? { ...c, frame } : c));
            if ((roundWinner === 1 && lpos > 29) || (roundWinner === 2 && lpos < 71)) {
              lpos += roundWinner === 1 ? -2 : 2;
              setCreatureStates(cs => cs.map((c, i) => i === idx ? { ...c, left: `${lpos}%` } : c));
            } else {
              clearInterval(linterval);
              // Idle at destination
              setAnimDirection('idle');
              setCreatureStates(cs => cs.map((c, i) => i === idx ? { ...c, anim: roundWinner === 1 ? 'idle-right' : 'idle-left', frame: 0, finished: true } : c));
              setTimeout(() => {
                setIsAnimatingCreature(false);
                setAnimatingIndex(null);
                setAnimDirection(null);
                if (roundWinner === 1) {
                  setPlayer1Rounds(r => r + 1);
                } else {
                  setPlayer2Rounds(r => r + 1);
                }
                setBoard(initialBoard);
                setRoundWinner(null);
                setSelected(null);
                setCurrentPlayer(1);
                // Resume music if not muted and game not over
                if (!isMuted && !gameWinner && mapAudioRef.current) {
                  try {
                    mapAudioRef.current.pause();
                    mapAudioRef.current.currentTime = 0;
                    mapAudioRef.current.load();
                    mapAudioRef.current.volume = mainVolume * 0.4;
                    mapAudioRef.current.play().catch(() => {});
                  } catch (e) {}
                }
              }, 800);
            }
          }, 60);
        }
      }, 60);
      setAnimTimer(interval);
      return () => clearInterval(interval);
    }
  }, [roundWinner, gameWinner]);

  // Game win logic
  useEffect(() => {
    if (player1Rounds >= 2 && !gameWinner) {
      setGameWinner(1);
    } else if (player2Rounds >= 2 && !gameWinner) {
      setGameWinner(2);
    }
  }, [player1Rounds, player2Rounds, gameWinner, setGameWinner]);

  // Reset all state for rematch
  function handleRematch() {
    setPlayer1Rounds(0);
    setPlayer2Rounds(0);
    setCreatureStates([
      { top: '40%', left: '71%', anim: 'idle', frame: 0, finished: false },
      { top: '50%', left: '71%', anim: 'idle', frame: 0, finished: false },
      { top: '40%', left: '29%', anim: 'idle', frame: 0, finished: false },
      { top: '50%', left: '29%', anim: 'idle', frame: 0, finished: false },
    ]);
    setAnimatingIndex(null);
    setAnimDirection(null);
    setIsAnimatingCreature(false);
    setRoundWinner(null);
    setSelected(null);
    setCurrentPlayer(1);
    setBoard(initialBoard);
    setGameWinner(null);
  }

  // When a player has moved both creatures across, set gameWinner
  useEffect(() => {
    if (player1Crossed >= 2 && !gameWinner) {
      setGameWinner(1);
    } else if (player2Crossed >= 2 && !gameWinner) {
      setGameWinner(2);
    }
  }, [player1Crossed, player2Crossed, gameWinner, setGameWinner]);

  // Prevent moves during animation
  function handleCellClick(row: number, col: number) {
    if (roundWinner || gameWinner || isAnimatingCreature) return; // Prevent moves after win or during animation
    if (selected) {
      if (board[row][col].owner === null) {
        const { row: fromRow, col: fromCol } = selected;
        if (board[fromRow][fromCol].owner === currentPlayer) {
          const newBoard = board.map(r => r.map(c => ({ ...c })));
          newBoard[row][col] = { owner: currentPlayer, moved: true };
          newBoard[fromRow][fromCol] = { owner: null, moved: board[fromRow][fromCol].moved };
          setBoard(newBoard);
          setSelected(null);
          setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
          playSound(placeSound); // Play placing sound
        }
      } else {
        setSelected(null);
      }
    } else {
      if (board[row][col].owner === currentPlayer) {
        setSelected({ row, col });
        playSound(selectSound); // Play select sound
      }
    }
  }
  // Choose translucent background color based on mapType
  const bgColors: Record<string, string> = {
    river: 'rgba(66, 127, 59, 0.7)',
    lava: 'rgba(61, 45, 44, 0.7)',
    polar: 'rgba(216, 233, 242, 0.7)'
  };
  const bgColor = bgColors[mapType] || 'rgba(0,0,0,0.7)';
  const winRoundSound = '/assets/Menu-Background/Assets/sounds/win_round.wav';
  const winGameSound = '/assets/Menu-Background/Assets/sounds/win_game.mp3';
  const winnerCardImg = '/assets/Menu-Background/Assets/Winner_Card.png';
  const backButtonImg = '/assets/Menu-Background/Assets/back_button.png';
  const rematchButtonImg = '/assets/Menu-Background/Assets/remtach_button.png';

  // Track if game is won
  // const [gameWinner, setGameWinner] = useState<1 | 2 | null>(null); // Moved up to App

  // Play win sounds and pause music
  useEffect(() => {
    if (roundWinner && !gameWinner) {
      if (mapAudioRef.current) mapAudioRef.current.pause();
      const audio = new Audio(winRoundSound);
      audio.volume = Math.min(mainVolume * 1.5, 1);
      audio.play();
    }
  }, [roundWinner, gameWinner]);

  useEffect(() => {
    if (gameWinner) {
      if (mapAudioRef.current) mapAudioRef.current.pause();
      const audio = new Audio(winGameSound);
      audio.volume = Math.min(mainVolume * 1.5, 1);
      audio.play();
    }
  }, [gameWinner]);

  // Basic round reset after win (no animation yet)
  useEffect(() => {
    if (roundWinner && !gameWinner) {
      const timeout = setTimeout(() => {
        setBoard(initialBoard);
        setRoundWinner(null);
        setSelected(null);
        setCurrentPlayer(1);
      }, 1800); // 1.8s delay for win sound
      return () => clearTimeout(timeout);
    }
  }, [roundWinner, gameWinner]);

  // In MapGame, add state for map image variant and a timer ref
  const [mapImageVariant, setMapImageVariant] = useState<'normal' | 'p1' | 'p2'>('normal');
  const mapImageTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update map image on round win and revert after 4 seconds
  useEffect(() => {
    if (roundWinner && !gameWinner) {
      // Clear any previous timer
      if (mapImageTimerRef.current) {
        clearTimeout(mapImageTimerRef.current);
      }
      if (roundWinner === 1) setMapImageVariant('p1');
      else if (roundWinner === 2) setMapImageVariant('p2');
      // Set timer to revert after 4 seconds
      mapImageTimerRef.current = setTimeout(() => {
        setMapImageVariant('normal');
      }, 4000);
    }
    // Clean up timer on unmount
    return () => {
      if (mapImageTimerRef.current) {
        clearTimeout(mapImageTimerRef.current);
      }
    };
  }, [roundWinner, gameWinner]);

  // Helper to get the correct map image
  function getMapImage() {
    const base = `/assets/Menu-Background/Assets/${mapType}/${mapType}_map`;
    if (mapImageVariant === 'p1') return `${base}_1.png`;
    if (mapImageVariant === 'p2') return `${base}_2.png`;
    return `${base}.png`;
  }

  // Game win popup UI
  function GameWinPopup() {
    const winnerName = gameWinner === 1 ? player1Name : player2Name;
    
  return (
      <div style={{
        position: 'fixed',
        left: '30%',
        top: '30%',
        transform: 'translate(-50%, -50%)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        animation: 'float-title 3.5s ease-in-out infinite',
        width: '100vw',
        height: '100vh',
        pointerEvents: 'auto'
      }}>
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img 
            src={winnerCardImg} 
            alt="Winner Card" 
            style={{ 
              width: 800, 
              height: 'auto', 
              filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))',
              animation: 'float-title 3.5s ease-in-out infinite'
            }} 
          />
          {/* Winner name overlay - positioned below "Winner:" text */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#222',
            fontWeight: 700,
            fontSize: 48,
            textShadow: '0 2px 8px #fff, 0 4px 12px rgba(255,255,255,0.8)',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            zIndex: 2,
            maxWidth: '80%',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {winnerName}
          </div>
          
          {/* Buttons positioned below the card, centered */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            marginTop: 32,
            zIndex: 3
          }}>
            <button
              onClick={onBackToModeSelect}
              style={{ 
                background: 'none', 
                border: 'none', 
                padding: 0, 
                cursor: 'pointer',
                transition: 'transform 0.2s ease-in-out'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <img src={backButtonImg} alt="Back" style={{ width: 400, height: 'auto' }} />
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center" style={{ background: bgColor }}>
      {/* Player 1 card top right */}
      <div style={{ position: 'absolute', top: 32, right: 32, zIndex: 10, width: 800, height: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <div style={{ position: 'relative', width: 800, height: 'auto' }}>
          <img
            src="/assets/Menu-Background/Assets/Player_cards/player1.png"
            alt="Player 1 Card"
            style={{ width: 800, height: 'auto', filter: 'drop-shadow(0 2px 8px #222)' }}
            draggable="false"
          />
          <span style={{
            position: 'absolute',
            top: '60%',
            left: 0,
            width: '100%',
            transform: 'translateY(-50%)',
            color: '#222',
            fontWeight: 700,
            fontSize: 90,
            textShadow: '0 2px 8px #fff',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            pointerEvents: 'none',
          }}>{player1Name}</span>
        </div>
      </div>
      {/* Player 2 card bottom left */}
      <div style={{ position: 'absolute', bottom: 32, left: 32, zIndex: 10, width: 800, height: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <div style={{ position: 'relative', width: 800, height: 'auto' }}>
          <img
            src="/assets/Menu-Background/Assets/Player_cards/player2.png"
            alt="Player 2 Card"
            style={{ width: 800, height: 'auto', filter: 'drop-shadow(0 2px 8px #222)' }}
            draggable="false"
          />
          <span style={{
            position: 'absolute',
            top: '60%',
            left: 0,
            width: '100%',
            transform: 'translateY(-50%)',
            color: '#222',
            fontWeight: 700,
            fontSize: 90,
            textShadow: '0 2px 8px #fff',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            pointerEvents: 'none',
          }}>{player2Name}</span>
        </div>
      </div>
      <img
        src={getMapImage()}
        alt={`${mapType} Map`}
        className="absolute inset-0 w-full h-full object-contain select-none"
        style={{ zIndex: 0 }}
        draggable="false"
      />
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          transform: 'translate(-50%, -50%)',
          width: '28%',
          height: '59%',
          display: 'grid',
          gridTemplateRows: 'repeat(3, 1fr)',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '18px',
          pointerEvents: 'auto',
          zIndex: 2,
        }}
      >
        {board.map((row, rIdx) =>
          row.map((cell, cIdx) => (
            <div
              key={rIdx + '-' + cIdx}
              onClick={() => handleCellClick(rIdx, cIdx)}
              style={{
                border: '1.5px solid rgba(255,255,255,0.5)',
                background: selected && selected.row === rIdx && selected.col === cIdx
                  ? 'rgba(255,255,255,0.18)'
                  : 'rgba(255,255,255,0.08)',
                boxSizing: 'border-box',
                cursor: cell.owner === currentPlayer || (selected && cell.owner === null) ? 'pointer' : 'default',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
              }}
            >
              {cell.owner === 1 && (
                <img
                  src={
                    mapType === 'river'
                      ? '/assets/Menu-Background/Assets/river/player1_icon_river.png'
                      : mapType === 'lava'
                      ? '/assets/Menu-Background/Assets/lava/player1_icon_lava.png'
                      : '/assets/Menu-Background/Assets/polar/player1_icon_polar.png'
                  }
                  alt="P1 Icon"
                  style={{ width: 350, height: 350, opacity: 1 }}
                  draggable="false"
                />
              )}
              {cell.owner === 2 && (
                <img
                  src={
                    mapType === 'river'
                      ? '/assets/Menu-Background/Assets/river/player2_icon_river.png'
                      : mapType === 'lava'
                      ? '/assets/Menu-Background/Assets/lava/player2_icon_lava.png'
                      : '/assets/Menu-Background/Assets/polar/player2_icon_polar.png'
                  }
                  alt="P2 Icon"
                  style={{ width: 360, height: 360, opacity: 1 }}
                  draggable="false"
                />
              )}
            </div>
          ))
        )}
      </div>
      {/* Animated creatures moving across the map - only show when animating */}
      {isAnimatingCreature && animatingIndex !== null && (
        (() => {
          const creature = creatureStates[animatingIndex];
          if (creature.finished) return null;
          
          let spriteSrc = '';
          const creatureType = animatingIndex < 2 ? player1Creature : player2Creature;
          
          // Get the correct sprite based on animation state
          if (creature.anim === 'run-back') {
            spriteSrc = getRunFrames(creatureType, 'back')[creature.frame];
          } else if (creature.anim === 'run-front') {
            spriteSrc = getRunFrames(creatureType, 'front')[creature.frame];
          } else if (creature.anim === 'run-left') {
            spriteSrc = getRunFrames(creatureType, 'left')[creature.frame];
          } else if (creature.anim === 'run-right') {
            spriteSrc = getRunFrames(creatureType, 'right')[creature.frame];
          } else if (creature.anim === 'idle-left') {
            spriteSrc = getIdleFramesCount(creatureType, 'left')[creature.frame % 6];
          } else if (creature.anim === 'idle-right') {
            spriteSrc = getIdleFramesCount(creatureType, 'right')[creature.frame % 6];
          } else {
            // Default idle animation
            spriteSrc = getIdleFramesCount(creatureType, animatingIndex < 2 ? 'left' : 'right')[creature.frame % 6];
          }
          
          return (
            <img
              key={`animated-${animatingIndex}`}
              src={spriteSrc}
              alt={`${animatingIndex < 2 ? 'P1' : 'P2'} Animated Creature`}
              style={{
                position: 'absolute',
                top: creature.top,
                left: creature.left,
                width: 220,
                height: 220,
                imageRendering: 'pixelated',
                zIndex: 5,
                transform: 'translate(-50%, -50%)',
                transition: 'top 0.06s linear, left 0.06s linear'
              }}
              draggable="false"
            />
          );
        })()
      )}
      
      {/* Idle creatures on land (only show if not animating) */}
      {!isAnimatingCreature && (
        <>
      {/* Player 1 creatures (right) */}
          <div style={{ position: 'absolute', right: '25%', top: '40%', transform: 'translateY(-50%)', zIndex: 3, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[0, 1].map(i => (
              !creatureStates[i].finished && animatingIndex !== i && (
          <img
                  key={`p1-idle-${i}`}
            src={getIdleFrames(player1Creature, 'left')[frame]}
            alt="P1 Creature"
                  style={{ width: 350, height: 350, imageRendering: 'pixelated', marginBottom: 6 }}
            draggable="false"
          />
              )
        ))}
      </div>
      {/* Player 2 creatures (left) */}
          <div style={{ position: 'absolute', left: '25%', top: '50%', transform: 'translateY(-50%)', zIndex: 3, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[2, 3].map(i => (
              !creatureStates[i].finished && animatingIndex !== i && (
          <img
                  key={`p2-idle-${i}`}
            src={getIdleFrames(player2Creature, 'right')[frame]}
            alt="P2 Creature"
                  style={{ width: 350, height: 350, imageRendering: 'pixelated', marginBottom: 6 }}
            draggable="false"
          />
              )
        ))}
      </div>
        </>
      )}
      {/* Player names (top) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 400,
        height: 100,
        paddingTop: 0
      }}>
        <img
          src="/assets/Menu-Background/Assets/turn_card.png"
          alt="Turn Card"
          style={{
            width: 400,
            height: 100,
            objectFit: 'contain',
            position: 'absolute',
            left: 0,
            top: 0,
            zIndex: 1
          }}
          draggable="false"
        />
        <span style={{
          position: 'relative',
          zIndex: 2,
          color: '#222',
          fontWeight: 700,
          fontSize: 32,
          width: '100%',
          textAlign: 'center',
          fontFamily: 'inherit',
          textShadow: '0 2px 8px #fff'
        }}>
          {currentPlayer === 1 ? player1Name : player2Name}
        </span>
      </div>
      {gameWinner && (
        <div style={{
          position: 'absolute',
          left: '42%',
          top: '40%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'float-title 3.5s ease-in-out infinite',
          width: 600,
          pointerEvents: 'auto',
        }}>
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img 
              src={winnerCardImg} 
              alt="Winner Card" 
              style={{ 
                width: 600, 
                height: 'auto', 
                filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))',
                animation: 'float-title 3.5s ease-in-out infinite'
              }} 
            />
            {/* Winner name overlay - positioned below "Winner:" text */}
            <div style={{
              position: 'absolute',
              top: '65%',
              left: '55%',
              transform: 'translate(-50%, -50%)',
              color: '#222',
              fontWeight: 700,
              fontSize: 48,
              textShadow: '0 2px 8px #fff, 0 4px 12px rgba(255,255,255,0.8)',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
              textAlign: 'center',
              zIndex: 2,
              maxWidth: '80%',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {gameWinner === 1 ? player1Name : player2Name}
            </div>
          </div>
          {/* Buttons positioned below the card */}
          <div style={{ 
            display: 'flex', 
            gap: 26, 
            marginTop: 25,
            zIndex: 3
          }}>
            <button
              onClick={onBackToModeSelect}
              style={{ 
                background: 'none', 
                border: 'none', 
                padding: 0, 
                cursor: 'pointer',
                transition: 'transform 0.2s ease-in-out'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <img src={backButtonImg} alt="Back" style={{ width: 500, height: 'auto' }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function RiverGame(props: Omit<MapGameProps, 'mapType'>) {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [gameMode, setGameMode] = useState<GameMode>('pvp');
  const [selectedMap, setSelectedMap] = useState<MapTheme>('lava');
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: 'Player 1', creature: 'rock', isAI: false },
    { id: 2, name: 'Player 2', creature: 'rock', isAI: false }
  ]);
  const [tournamentPlayers, setTournamentPlayers] = useState<Player[]>([]);
  const [aiLevel, setAiLevel] = useState<AILevel>('easy');
  const [settings, setSettings] = useState({
    mainVolume: 0.7,
    menuMusic: 0.5,
    uiSound: 0.6,
    soundEnabled: true
  });
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Store previous mainVolume for toggling sound
  const [prevMainVolume, setPrevMainVolume] = useState(settings.mainVolume);
  const [showMapReveal, setShowMapReveal] = useState(false);
  const [pendingMap, setPendingMap] = useState<MapTheme | null>(null);
  // Add gameWinner state
  const [gameWinner, setGameWinner] = useState<1 | 2 | null>(null);

  // Music logic: play on all menus, stop in game
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/assets/Menu-Background/music/summer_nights.ogg');
      audioRef.current.loop = true;
      audioRef.current.volume = settings.mainVolume * settings.menuMusic;
    }
    if (gameState !== 'game' && gameState !== 'map-revealed' && !isMuted) {
      audioRef.current.volume = settings.mainVolume * settings.menuMusic;
      audioRef.current.play().catch(() => {});
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [gameState, isMuted, settings.mainVolume, settings.menuMusic]);

  // Toggle sound: set mainVolume to 0 when off, restore when on
  const toggleSound = () => {
    setSettings((prev) => {
      if (prev.mainVolume === 0) {
        return { ...prev, mainVolume: prevMainVolume, soundEnabled: true };
      } else {
        setPrevMainVolume(prev.mainVolume);
        return { ...prev, mainVolume: 0, soundEnabled: false };
      }
    });
  };

  const toggleMute = () => setIsMuted((m) => !m);

  const handleGameStateChange = (newState: GameState) => {
    setGameState(newState);
  };

  const handleGameModeSelect = (mode: GameMode) => {
    setGameMode(mode);
    if (mode === 'pvp') {
      setGameState('player-setup');
    } else if (mode === 'tournament') {
      setGameState('tournament-setup');
    } else if (mode === 'ai') {
      setGameState('ai-setup');
    }
  };

  // Map index to key mapping
  const mapIndexToKey = ['polar', 'river', 'lava'];

  const handleMapSelect = (map: MapTheme | number) => {
    let mapKey: MapTheme;
    if (typeof map === 'number') {
      mapKey = mapIndexToKey[map] as MapTheme;
    } else {
      mapKey = map;
    }
    setPendingMap(mapKey);
    setShowMapReveal(true);
    setTimeout(() => {
      setSelectedMap(mapKey);
      setShowMapReveal(false);
      setGameState('map-revealed');
    }, 1500);
  };

  const handlePlayersReady = () => {
    setGameState('player-customization');
  };

  const handleCustomizationComplete = () => {
    setGameState('map-selection');
  };

  const handleTournamentStart = (playerList: Player[], playerCount: number) => {
    setTournamentPlayers(playerList);
    setTournamentPlayerCount(playerCount);
    setGameState('tournament-bracket');
  };

  const handleAILevelSelect = (level: AILevel) => {
    setAiLevel(level);
    setGameState('ai-survival');
  };

  const renderCurrentScreen = () => {
    switch (gameState) {
      case 'menu':
        return (
          <StartingPage
            onPlay={() => setGameState('mode-selection')}
            onSettings={() => setGameState('settings')}
            mainVolume={settings.mainVolume}
            uiSound={settings.uiSound}
          />
        );
      case 'mode-selection':
        return (
          <GameModeSelection
            onModeSelect={handleGameModeSelect}
            onBack={() => setGameState('menu')}
            mainVolume={settings.mainVolume}
            uiSound={settings.uiSound}
          />
        );
      case 'player-setup':
        return (
          <PlayerVsPlayerSetup
            players={players}
            onPlayersChange={setPlayers}
            onReady={handlePlayersReady}
            onBack={() => setGameState('mode-selection')}
            mainVolume={settings.mainVolume}
            uiSound={settings.uiSound}
          />
        );
      case 'player-customization':
        return (
          <PlayerCustomization
            players={players}
            onPlayersChange={setPlayers}
            onComplete={handleCustomizationComplete}
            onBack={() => setGameState('player-setup')}
            mainVolume={settings.mainVolume}
            uiSound={settings.uiSound}
          />
        );
      case 'map-selection':
        return (
          <MapSelection
            players={players}
            onMapSelect={handleMapSelect}
            onBack={() => setGameState('player-customization')}
            mainVolume={settings.mainVolume}
            uiSound={settings.uiSound}
          />
        );
      case 'tournament-setup':
        return (
          <TournamentSetup
            onStart={handleTournamentStart}
            onBack={() => setGameState('mode-selection')}
            mainVolume={settings.mainVolume}
            uiSound={settings.uiSound}
          />
        );
      case 'tournament-bracket':
        return (
          <TournamentBracket
            players={tournamentPlayers}
            playerCount={tournamentPlayerCount}
            onComplete={() => setGameState('menu')}
            onBack={() => setGameState('tournament-setup')}
            mainVolume={settings.mainVolume}
            uiSound={settings.uiSound}
          />
        );
      case 'ai-setup':
        return (
          <AISetup
            onLevelSelect={handleAILevelSelect}
            onBack={() => setGameState('mode-selection')}
            mainVolume={settings.mainVolume}
            uiSound={settings.uiSound}
          />
        );
      case 'ai-survival':
        return (
          <AISurvival
            level={aiLevel}
            onBack={() => setGameState('ai-setup')}
            mainVolume={settings.mainVolume}
            uiSound={settings.uiSound}
            muteGlobalMusic={muteGlobalMusic}
            unmuteGlobalMusic={unmuteGlobalMusic}
          />
        );
      case 'settings':
        return (
          <Settings
            settings={settings}
            onSettingsChange={setSettings}
            onBack={() => setGameState('menu')}
            mainVolume={settings.mainVolume}
            uiSound={settings.uiSound}
          />
        );
      case 'map-revealed':
        // Render the correct map game based on selectedMap
        if (selectedMap === 'river') {
          return (
            <MapGame
              player1Name={players[0]?.name || 'Player 1'}
              player2Name={players[1]?.name || 'Player 2'}
              player1Creature={players[0]?.creature || 'Slime1'}
              player2Creature={players[1]?.creature || 'Slime2'}
              mapType="river"
              mainVolume={settings.mainVolume}
              isMuted={isMuted}
              onRematch={() => {
                setGameState('map-revealed');
                setGameWinner(null); // Reset game winner
              }}
              onBackToModeSelect={() => {
                setGameState('mode-selection');
                setGameWinner(null); // Reset game winner
              }}
              gameWinner={gameWinner}
              setGameWinner={setGameWinner}
            />
          );
        } else if (selectedMap === 'lava') {
          return (
            <MapGame
              player1Name={players[0]?.name || 'Player 1'}
              player2Name={players[1]?.name || 'Player 2'}
              player1Creature={players[0]?.creature || 'Slime1'}
              player2Creature={players[1]?.creature || 'Slime2'}
              mapType="lava"
              mainVolume={settings.mainVolume}
              isMuted={isMuted}
              onRematch={() => {
                setGameState('map-revealed');
                setGameWinner(null); // Reset game winner
              }}
              onBackToModeSelect={() => {
                setGameState('mode-selection');
                setGameWinner(null); // Reset game winner
              }}
              gameWinner={gameWinner}
              setGameWinner={setGameWinner}
            />
          );
        } else if (selectedMap === 'polar') {
          return (
            <MapGame
              player1Name={players[0]?.name || 'Player 1'}
              player2Name={players[1]?.name || 'Player 2'}
              player1Creature={players[0]?.creature || 'Slime1'}
              player2Creature={players[1]?.creature || 'Slime2'}
              mapType="polar"
              mainVolume={settings.mainVolume}
              isMuted={isMuted}
              onRematch={() => {
                setGameState('map-revealed');
                setGameWinner(null); // Reset game winner
              }}
              onBackToModeSelect={() => {
                setGameState('mode-selection');
                setGameWinner(null); // Reset game winner
              }}
              gameWinner={gameWinner}
              setGameWinner={setGameWinner}
            />
          );
        } else {
          return null;
        }
      default:
        return null;
    }
  };

  const mapRevealPNGs: Record<string, string> = {
    polar: '/assets/Menu-Background/Assets/polar/polar_map.png',
    river: '/assets/Menu-Background/Assets/river/river_map.png',
    lava: '/assets/Menu-Background/Assets/lava/lava_map.png',
  };

  // Helper to normalize map key
  function normalizeMapKey(map: string) {
    if (typeof map === 'string') {
      return map.toLowerCase().replace('_map', '');
    }
    return '';
  }

  useEffect(() => {
    if (gameState === 'map-revealed') {
      document.body.style.zoom = '0.4';
    } else {
      document.body.style.zoom = '1';
    }
    return () => {
      document.body.style.zoom = '1';
    };
  }, [gameState]);

  const muteGlobalMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };
  const unmuteGlobalMusic = () => {
    if (audioRef.current && gameState !== 'game' && gameState !== 'map-revealed' && !isMuted) {
      audioRef.current.play().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Animated background on all menus except game and map-revealed */}
      {gameState !== 'game' && gameState !== 'map-revealed' && <AnimatedBackground />}
      {gameState !== 'game' && (
        <div className="absolute top-8 right-8 z-50">
          <SoundButton
            onClick={toggleMute}
            className="p-2 rounded-full bg-black/20 backdrop-blur-custom hover:bg-black/40 transition-all duration-300 button-glow"
            mainVolume={settings.mainVolume}
            uiSound={settings.uiSound}
          >
            {isMuted ? (
              <VolumeX className="w-8 h-8 text-white/70" />
            ) : (
              <Volume2 className="w-8 h-8 text-white/70 audio-pulse" />
            )}
          </SoundButton>
        </div>
      )}
      {showMapReveal && pendingMap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          {(() => {
            const key = normalizeMapKey(pendingMap);
            console.log('Map reveal key:', key);
            const imgSrc = mapRevealPNGs[key];
            if (imgSrc) {
              return (
                <img
                  src={imgSrc}
                  alt="Selected Map"
                  className="w-full h-full object-contain select-none animate-pulse"
                  draggable="false"
                />
              );
            } else {
              return (
                <div className="text-white text-3xl">Map image not found for key: {key}</div>
              );
            }
          })()}
        </div>
      )}
      {!showMapReveal && renderCurrentScreen()}
    </div>
  );
}

function LavaGame(props: Omit<MapGameProps, 'mapType'>) {
  return <MapGame {...props} mapType="lava" />;
}
function PolarGame(props: Omit<MapGameProps, 'mapType'> & MapGameExtraProps) {
  return <MapGame {...props} mapType="polar" />;
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [gameMode, setGameMode] = useState<GameMode>('pvp');
  const [selectedMap, setSelectedMap] = useState<MapTheme>('lava');
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: 'Player 1', creature: 'rock', isAI: false },
    { id: 2, name: 'Player 2', creature: 'rock', isAI: false }
  ]);
  const [tournamentPlayers, setTournamentPlayers] = useState<Player[]>([]);
  const [aiLevel, setAiLevel] = useState<AILevel>('easy');
  const [settings, setSettings] = useState({
    mainVolume: 0.7,
    menuMusic: 0.5,
    uiSound: 0.6,
    soundEnabled: true
  });
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Store previous mainVolume for toggling sound
  const [prevMainVolume, setPrevMainVolume] = useState(settings.mainVolume);
  const [showMapReveal, setShowMapReveal] = useState(false);
  const [pendingMap, setPendingMap] = useState<MapTheme | null>(null);
  // In App, add gameWinner state
  const [gameWinner, setGameWinner] = useState<1 | 2 | null>(null);
  const [tournamentPlayerCount, setTournamentPlayerCount] = useState<number>(4);

  // Music logic: play on all menus, stop in game
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/assets/Menu-Background/music/summer_nights.ogg');
      audioRef.current.loop = true;
      audioRef.current.volume = settings.mainVolume * settings.menuMusic;
    }
    if (gameState !== 'game' && gameState !== 'map-revealed' && !isMuted) {
      audioRef.current.volume = settings.mainVolume * settings.menuMusic;
      audioRef.current.play().catch(() => {});
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [gameState, isMuted, settings.mainVolume, settings.menuMusic]);

  // Toggle sound: set mainVolume to 0 when off, restore when on
  const toggleSound = () => {
    setSettings((prev) => {
      if (prev.mainVolume === 0) {
        return { ...prev, mainVolume: prevMainVolume, soundEnabled: true };
      } else {
        setPrevMainVolume(prev.mainVolume);
        return { ...prev, mainVolume: 0, soundEnabled: false };
      }
    });
  };

  const toggleMute = () => setIsMuted((m) => !m);

  const handleGameStateChange = (newState: GameState) => {
    setGameState(newState);
  };

  const handleGameModeSelect = (mode: GameMode) => {
    setGameMode(mode);
    if (mode === 'pvp') {
      setGameState('player-setup');
    } else if (mode === 'tournament') {
      setGameState('tournament-setup');
    } else if (mode === 'ai') {
      setGameState('ai-setup');
    }
  };

  // Map index to key mapping
  const mapIndexToKey = ['polar', 'river', 'lava'];

  const handleMapSelect = (map: MapTheme | number) => {
    let mapKey: MapTheme;
    if (typeof map === 'number') {
      mapKey = mapIndexToKey[map] as MapTheme;
    } else {
      mapKey = map;
    }
    setPendingMap(mapKey);
    setShowMapReveal(true);
    setTimeout(() => {
      setSelectedMap(mapKey);
      setShowMapReveal(false);
      setGameState('map-revealed');
    }, 1500);
  };

  const handlePlayersReady = () => {
    setGameState('player-customization');
  };

  const handleCustomizationComplete = () => {
    setGameState('map-selection');
  };

  const handleTournamentStart = (playerList: Player[], playerCount: number) => {
    setTournamentPlayers(playerList);
    setTournamentPlayerCount(playerCount);
    setGameState('tournament-bracket');
  };

  const handleAILevelSelect = (level: AILevel) => {
    setAiLevel(level);
    setGameState('ai-survival');
  };

  const renderCurrentScreen = () => {
    switch (gameState) {
      case 'menu':
        return (
          <StartingPage
            onPlay={() => setGameState('mode-selection')}
            onSettings={() => setGameState('settings')}
            mainVolume={settings.mainVolume}
            uiSound={settings.uiSound}
          />
        );
      case 'mode-selection':
        return (
          <GameModeSelection
            onModeSelect={handleGameModeSelect}
            onBack={() => setGameState('menu')}
            mainVolume={settings.mainVolume}
            uiSound={settings.uiSound}
          />
        );
      case 'player-setup':
        return (
          <PlayerVsPlayerSetup
            players={players}
            onPlayersChange={setPlayers}
            onReady={handlePlayersReady}
            onBack={() => setGameState('mode-selection')}
            mainVolume={settings.mainVolume}
            uiSound={settings.uiSound}
          />
        );
      case 'player-customization':
        return (
          <PlayerCustomization
            players={players}
            onPlayersChange={setPlayers}
            onComplete={handleCustomizationComplete}
            onBack={() => setGameState('player-setup')}
            mainVolume={settings.mainVolume}
            uiSound={settings.uiSound}
          />
        );
      case 'map-selection':
        return (
          <MapSelection
            players={players}
            onMapSelect={handleMapSelect}
            onBack={() => setGameState('player-customization')}
            mainVolume={settings.mainVolume}
            uiSound={settings.uiSound}
          />
        );
      case 'tournament-setup':
        return (
          <TournamentSetup
            onStart={handleTournamentStart}
            onBack={() => setGameState('mode-selection')}
            mainVolume={settings.mainVolume}
            uiSound={settings.uiSound}
          />
        );
      case 'tournament-bracket':
        return (
          <TournamentBracket
            players={tournamentPlayers}
            playerCount={tournamentPlayerCount}
            onComplete={() => setGameState('menu')}
            onBack={() => setGameState('tournament-setup')}
            mainVolume={settings.mainVolume}
            uiSound={settings.uiSound}
          />
        );
      case 'ai-setup':
        return (
          <AISetup
            onLevelSelect={handleAILevelSelect}
            onBack={() => setGameState('mode-selection')}
            mainVolume={settings.mainVolume}
            uiSound={settings.uiSound}
          />
        );
      case 'ai-survival':
        return (
          <AISurvival
            level={aiLevel}
            onBack={() => setGameState('ai-setup')}
            mainVolume={settings.mainVolume}
            uiSound={settings.uiSound}
            muteGlobalMusic={muteGlobalMusic}
            unmuteGlobalMusic={unmuteGlobalMusic}
          />
        );
      case 'settings':
        return (
          <Settings
            settings={settings}
            onSettingsChange={setSettings}
            onBack={() => setGameState('menu')}
            mainVolume={settings.mainVolume}
            uiSound={settings.uiSound}
          />
        );
      case 'map-revealed':
        // Render the correct map game based on selectedMap
        if (selectedMap === 'river') {
        return (
            <MapGame
              player1Name={players[0]?.name || 'Player 1'}
              player2Name={players[1]?.name || 'Player 2'}
              player1Creature={players[0]?.creature || 'Slime1'}
              player2Creature={players[1]?.creature || 'Slime2'}
              mapType="river"
              mainVolume={settings.mainVolume}
              isMuted={isMuted}
              onRematch={() => {
                setGameWinner(null);
                setGameState('map-revealed');
              }}
              onBackToModeSelect={() => {
                setGameWinner(null);
                setGameState('mode-selection');
              }}
              gameWinner={gameWinner}
              setGameWinner={setGameWinner}
            />
          );
        } else if (selectedMap === 'lava') {
          return (
            <MapGame
              player1Name={players[0]?.name || 'Player 1'}
              player2Name={players[1]?.name || 'Player 2'}
              player1Creature={players[0]?.creature || 'Slime1'}
              player2Creature={players[1]?.creature || 'Slime2'}
              mapType="lava"
              mainVolume={settings.mainVolume}
              isMuted={isMuted}
              onRematch={() => {
                setGameWinner(null);
                setGameState('map-revealed');
              }}
              onBackToModeSelect={() => {
                setGameWinner(null);
                setGameState('mode-selection');
              }}
              gameWinner={gameWinner}
              setGameWinner={setGameWinner}
            />
          );
        } else if (selectedMap === 'polar') {
          return (
            <MapGame
              player1Name={players[0]?.name || 'Player 1'}
              player2Name={players[1]?.name || 'Player 2'}
              player1Creature={players[0]?.creature || 'Slime1'}
              player2Creature={players[1]?.creature || 'Slime2'}
              mapType="polar"
              mainVolume={settings.mainVolume}
              isMuted={isMuted}
              onRematch={() => {
                setGameWinner(null);
                setGameState('map-revealed');
              }}
              onBackToModeSelect={() => {
                setGameWinner(null);
                setGameState('mode-selection');
              }}
              gameWinner={gameWinner}
              setGameWinner={setGameWinner}
            />
          );
        } else {
          return null;
        }
      default:
        return null;
    }
  };

  const mapRevealPNGs: Record<string, string> = {
    polar: '/assets/Menu-Background/Assets/polar/polar_map.png',
    river: '/assets/Menu-Background/Assets/river/river_map.png',
    lava: '/assets/Menu-Background/Assets/lava/lava_map.png',
  };

  // Helper to normalize map key
  function normalizeMapKey(map: string) {
    if (typeof map === 'string') {
      return map.toLowerCase().replace('_map', '');
    }
    return '';
  }

  useEffect(() => {
    if (gameState === 'map-revealed') {
      document.body.style.zoom = '0.4';
    } else {
      document.body.style.zoom = '1';
    }
    return () => {
      document.body.style.zoom = '1';
    };
  }, [gameState]);

  const muteGlobalMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };
  const unmuteGlobalMusic = () => {
    if (audioRef.current && gameState !== 'game' && gameState !== 'map-revealed' && !isMuted) {
      audioRef.current.play().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Animated background on all menus except game and map-revealed */}
      {gameState !== 'game' && gameState !== 'map-revealed' && <AnimatedBackground />}
      {gameState !== 'game' && (
        <div className="absolute top-8 right-8 z-50">
          <SoundButton
            onClick={toggleMute}
            className="p-2 rounded-full bg-black/20 backdrop-blur-custom hover:bg-black/40 transition-all duration-300 button-glow"
            mainVolume={settings.mainVolume}
            uiSound={settings.uiSound}
          >
            {isMuted ? (
              <VolumeX className="w-8 h-8 text-white/70" />
            ) : (
              <Volume2 className="w-8 h-8 text-white/70 audio-pulse" />
            )}
          </SoundButton>
        </div>
      )}
      {showMapReveal && pendingMap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          {(() => {
            const key = normalizeMapKey(pendingMap);
            console.log('Map reveal key:', key);
            const imgSrc = mapRevealPNGs[key];
            if (imgSrc) {
              return (
                <img
                  src={imgSrc}
                  alt="Selected Map"
                  className="w-full h-full object-contain select-none animate-pulse"
                  draggable="false"
                />
              );
            } else {
              return (
                <div className="text-white text-3xl">Map image not found for key: {key}</div>
              );
            }
          })()}
        </div>
      )}
      {!showMapReveal && renderCurrentScreen()}
    </div>
  );
}
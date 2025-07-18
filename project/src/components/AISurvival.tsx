import React, { useState, useEffect, useRef } from 'react';
import SoundButton from './SoundButton';
import { AILevel, MapTheme } from '../types/game';

interface AISurvivalProps {
  level: string;
  onBack: () => void;
  mainVolume: number;
  uiSound: number;
  muteGlobalMusic?: () => void;
  unmuteGlobalMusic?: () => void;
}

const maps: MapTheme[] = ['lava', 'river', 'polar'];
const creatures = ['Slime1', 'Slime2', 'Slime3'];

// Helper: get idle animation frames for a creature and direction
function getIdleFrames(creature: string, direction: 'left' | 'right') {
  return Array.from({ length: 6 }, (_, i) =>
    `/assets/Menu-Background/Assets/creatures/PNG/${creature}/Idle/${direction}/${creature}_Idle_${i + 1}.PNG`
  );
}
function getRunFrames(creature: string, dir: 'left'|'right'|'front'|'back') {
  return Array.from({ length: 8 }, (_, i) =>
    `/assets/Menu-Background/Assets/creatures/PNG/${creature}/Run/${dir}/${creature}_Run_${i + 1}.PNG`
  );
}
// Helper: get player icon for board grid (PvP style)
function getPlayerIcon(playerId: number, map: MapTheme) {
  return `/assets/Menu-Background/Assets/${map}/player${playerId}_icon_${map}.png`;
}

// --- AI Algorithms ---
type BoardCell = { owner: 1 | 2 | null, moved: boolean };
type Board = BoardCell[][];

function getRandomAIMove(board: Board) {
  const moves: { from: { row: number, col: number }, to: { row: number, col: number } }[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[r][c].owner === 2) {
        const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
        for (const [dr, dc] of dirs) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < 3 && nc >= 0 && nc < 3 && board[nr][nc].owner === null) {
            moves.push({ from: { row: r, col: c }, to: { row: nr, col: nc } });
          }
        }
      }
    }
  }
  if (moves.length === 0) return null;
  return moves[Math.floor(Math.random() * moves.length)];
}

function getGreedyAIMove(board: Board) {
  const moves: { from: { row: number, col: number }, to: { row: number, col: number } }[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[r][c].owner === 2) {
        const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
        for (const [dr, dc] of dirs) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < 3 && nc >= 0 && nc < 3 && board[nr][nc].owner === null) {
            moves.push({ from: { row: r, col: c }, to: { row: nr, col: nc } });
          }
        }
      }
    }
  }
  // Try all moves: if any results in win, take it
  for (const move of moves) {
    const newBoard: Board = board.map(row => row.map(cell => ({ ...cell })));
    newBoard[move.to.row][move.to.col] = { owner: 2, moved: true };
    newBoard[move.from.row][move.from.col] = { owner: null, moved: false };
    if (checkWin(newBoard) === 2) return move;
  }
  // Try all moves: if any blocks player win, take it
  for (const move of moves) {
    const newBoard: Board = board.map(row => row.map(cell => ({ ...cell })));
    newBoard[move.to.row][move.to.col] = { owner: 2, moved: true };
    newBoard[move.from.row][move.from.col] = { owner: null, moved: false };
    // Simulate player move
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (newBoard[r][c].owner === 1) {
          const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
          for (const [dr, dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < 3 && nc >= 0 && nc < 3 && newBoard[nr][nc].owner === null) {
              const testBoard: Board = newBoard.map(row => row.map(cell => ({ ...cell })));
              testBoard[nr][nc] = { owner: 1, moved: true };
              testBoard[r][c] = { owner: null, moved: false };
              if (checkWin(testBoard) === 1) return move;
            }
          }
        }
      }
    }
  }
  if (moves.length === 0) return null;
  return moves[Math.floor(Math.random() * moves.length)];
}

function getMinimaxAIMove(board: Board) {
  function minimax(b: Board, depth: number, isMax: boolean): { score: number, move?: { from: { row: number, col: number }, to: { row: number, col: number } } } {
    if (depth > 6) return { score: 0 }; // Recursion depth limit
    const winner = checkWin(b);
    if (winner === 2) return { score: 10 - depth };
    if (winner === 1) return { score: depth - 10 };
    const moves: { from: { row: number, col: number }, to: { row: number, col: number } }[] = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (b[r][c].owner === (isMax ? 2 : 1)) {
          const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
          for (const [dr, dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < 3 && nc >= 0 && nc < 3 && b[nr][nc].owner === null) {
              moves.push({ from: { row: r, col: c }, to: { row: nr, col: nc } });
            }
          }
        }
      }
    }
    if (moves.length === 0) return { score: 0 };
    let bestMove = undefined;
    let bestScore = isMax ? -Infinity : Infinity;
    for (const move of moves) {
      const newBoard: Board = b.map(row => row.map(cell => ({ ...cell })));
      // Preserve moved state: if already moved, keep true; otherwise, set to true for destination
      const wasMoved = b[move.from.row][move.from.col].moved;
      newBoard[move.to.row][move.to.col] = { owner: isMax ? 2 : 1, moved: wasMoved || true };
      newBoard[move.from.row][move.from.col] = { owner: null, moved: false };
      const result = minimax(newBoard, depth + 1, !isMax);
      if (isMax && result.score > bestScore) {
        bestScore = result.score;
        bestMove = move;
      } else if (!isMax && result.score < bestScore) {
        bestScore = result.score;
        bestMove = move;
      }
    }
    return { score: bestScore, move: bestMove };
  }
  const result = minimax(board, 0, true);
  return result.move || null;
}

// Game win detection (both creatures crossed)
function checkGameWin(board: Board): 1 | 2 | null {
  // Player wins if both their creatures are in row 0 and have moved
  const playerWin = [0, 1, 2].filter(c => board[0][c].owner === 1 && board[0][c].moved).length === 2;
  // AI wins if both their creatures are in row 2 and have moved
  const aiWin = [0, 1, 2].filter(c => board[2][c].owner === 2 && board[2][c].moved).length === 2;
  if (playerWin) return 1;
  if (aiWin) return 2;
  return null;
}

// Update checkWin to only count a win if all three icons in a line have been moved at least once
function checkWin(board: Board): 1 | 2 | null {
  const checkLine = (cells: [number, number][]): 1 | 2 | null => {
    const owners = cells.map(([r, c]) => board[r][c].owner);
    const moved = cells.map(([r, c]) => board[r][c].moved);
    if (owners.every(o => o === 1) && moved.every(m => m)) return 1;
    if (owners.every(o => o === 2) && moved.every(m => m)) return 2;
    return null;
  };
  // Check rows
  for (let r = 0; r < 3; r++) {
    const winner = checkLine([[r,0],[r,1],[r,2]]);
    if (winner) return winner;
  }
  // Check columns
  for (let c = 0; c < 3; c++) {
    const winner = checkLine([[0,c],[1,c],[2,c]]);
    if (winner) return winner;
  }
  // Check diagonals
  let winner = checkLine([[0,0],[1,1],[2,2]]);
  if (winner) return winner;
  winner = checkLine([[0,2],[1,1],[2,0]]);
  if (winner) return winner;
  return null;
}

const bgColors: Record<string, string> = {
  river: 'rgba(66, 127, 59, 0.7)',
  lava: 'rgba(61, 45, 44, 0.7)',
  polar: 'rgba(216, 233, 242, 0.7)'
};

// Add hover and click sound effect paths and helpers after imports
const hoverSound = '/assets/Menu-Background/music/button_hover.wav';
const clickSound = '/assets/Menu-Background/music/Button_click.wav';

export default function AISurvival({ level, onBack, mainVolume, uiSound, muteGlobalMusic, unmuteGlobalMusic }: AISurvivalProps) {
  // Survival state
  const [currentMap, setCurrentMap] = useState<MapTheme>('lava');
  const [playerCreature, setPlayerCreature] = useState('Slime1');
  const [aiCreature, setAiCreature] = useState('Slime2');
  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  // PvP-style board state: 3x3 grid of { owner: 1|2|null, moved: boolean }
  const initialBoard: Board = [
    [ { owner: 2 as 1 | 2, moved: false }, { owner: null, moved: false }, { owner: 1 as 1 | 2, moved: false } ],
    [ { owner: 2 as 1 | 2, moved: false }, { owner: null, moved: false }, { owner: 1 as 1 | 2, moved: false } ],
    [ { owner: 2 as 1 | 2, moved: false }, { owner: null, moved: false }, { owner: 1 as 1 | 2, moved: false } ],
  ];
  const [board, setBoard] = useState(initialBoard);
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [frame, setFrame] = useState(0);
  const [roundWinner, setRoundWinner] = useState<1 | 2 | null>(null);
  // Creature animation state (PvP style)
  const [creatureStates, setCreatureStates] = useState([
    { top: '40%', left: '71%', anim: 'idle', frame: 0, finished: false }, // Player 1, Creature 1
    { top: '50%', left: '71%', anim: 'idle', frame: 0, finished: false }, // Player 1, Creature 2
    { top: '40%', left: '25%', anim: 'idle', frame: 0, finished: false }, // AI, Creature 1
    { top: '50%', left: '25%', anim: 'idle', frame: 0, finished: false }, // AI, Creature 2
  ]);
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);
  const [isAnimatingCreature, setIsAnimatingCreature] = useState(false);
  // Map image variant for transition
  const [mapImageVariant, setMapImageVariant] = useState<'normal' | 'p1' | 'p2'>('normal');
  const mapImageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On mount and after each win, randomize map and creatures
  function randomizeMapAndCreatures() {
    setCurrentMap(maps[Math.floor(Math.random() * maps.length)]);
    setPlayerCreature(creatures[Math.floor(Math.random() * creatures.length)]);
    setAiCreature(creatures[Math.floor(Math.random() * creatures.length)]);
    setBoard(initialBoard);
    setCreatureStates([
      { top: '40%', left: '71%', anim: 'idle', frame: 0, finished: false },
      { top: '50%', left: '71%', anim: 'idle', frame: 0, finished: false },
      { top: '40%', left: '25%', anim: 'idle', frame: 0, finished: false },
      { top: '50%', left: '25%', anim: 'idle', frame: 0, finished: false },
    ]);
    setAnimatingIndex(null);
    setIsAnimatingCreature(false);
    setSelected(null);
    setCurrentPlayer(1);
    setRoundWinner(null);
  }
  useEffect(() => {
    randomizeMapAndCreatures();
  }, []);

  // Animate idle frames
  useEffect(() => {
    const id = setInterval(() => setFrame(f => (f + 1) % 6), 180);
    return () => clearInterval(id);
  }, []);

  // Map image transition logic (PvP style)
  useEffect(() => {
    if (roundWinner) {
      if (mapImageTimerRef.current) clearTimeout(mapImageTimerRef.current);
      setMapImageVariant(roundWinner === 1 ? 'p1' : 'p2');
      mapImageTimerRef.current = setTimeout(() => setMapImageVariant('normal'), 4000);
    }
    return () => { if (mapImageTimerRef.current) clearTimeout(mapImageTimerRef.current); };
  }, [roundWinner]);
  function getMapImage() {
    const base = `/assets/Menu-Background/Assets/${currentMap}/${currentMap}_map`;
    if (mapImageVariant === 'p1') return `${base}_1.png`;
    if (mapImageVariant === 'p2') return `${base}_2.png`;
    return `${base}.png`;
  }

  // --- Insert after state declarations ---
  const [playerRounds, setPlayerRounds] = useState(0);
  const [aiRounds, setAiRounds] = useState(0);
  const [gameWinner, setGameWinner] = useState<1 | 2 | null>(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [pendingAIMove, setPendingAIMove] = useState<null | { from: { row: number, col: number }, to: { row: number, col: number } }>(null);
  // Add state to control the loss screen
  const [showLossScreen, setShowLossScreen] = useState(false);

  // Helper: check if a creature has crossed
  function hasCrossed(row: number, owner: 1 | 2) {
    return (owner === 1 && row === 0) || (owner === 2 && row === 2);
  }

  // --- Update handleCellClick to track crossing and trigger game win ---
  // In handleCellClick, after a valid move and if there is no winner, alternate turns
  function handleCellClick(row: number, col: number) {
    if (roundWinner || isAnimatingCreature || gameWinner) return;
    if (selected) {
      if (board[row][col].owner === null) {
        const { row: fromRow, col: fromCol } = selected;
        if (board[fromRow][fromCol].owner === currentPlayer) {
          const newBoard = board.map(r => r.map(c => ({ ...c })));
          newBoard[row][col] = { owner: currentPlayer, moved: true };
          newBoard[fromRow][fromCol] = { owner: null, moved: board[fromRow][fromCol].moved };
          setBoard(newBoard);
          setSelected(null);
          playPlaceSound(); // Play placing sound
          // Check for round win
          const winner = checkWin(newBoard);
          if (winner) {
            setRoundWinner(winner);
            if (winner === 1) setPlayerRounds(r => r + 1);
            else setAiRounds(r => r + 1);
          } else {
            // Alternate turns
            setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
          }
        }
      } else {
        setSelected(null);
      }
    } else {
      // Only allow selecting Player 1's pieces
      if (board[row][col].owner === 1 && currentPlayer === 1) {
        setSelected({ row, col });
        playClickSound(); // Play select sound
      }
    }
  }

  // Win detection (PvP style)
  useEffect(() => {
    const winner = checkWin(board);
    if (winner) {
      setRoundWinner(winner);
    }
  }, [board]);

  // --- Animate and reset only on game win ---
  useEffect(() => {
    if (roundWinner) {
      let idx = -1;
      if (roundWinner === 1) {
        idx = creatureStates.findIndex((c, i) => i < 2 && !c.finished);
      } else {
        idx = creatureStates.findIndex((c, i) => i >= 2 && !c.finished);
      }
      if (idx === -1) return;
      setAnimatingIndex(idx);
      setIsAnimatingCreature(true);
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
              setCreatureStates(cs => cs.map((c, i) => i === idx ? { ...c, anim: roundWinner === 1 ? 'idle-right' : 'idle-left', frame: 0, finished: true } : c));
              // --- Fix round/game reset logic ---
              // In the round win animation (inside setTimeout after animation):
      setTimeout(() => {
                setIsAnimatingCreature(false);
                setAnimatingIndex(null);
                // Check for game win (best of 3)
                if ((playerRounds + (roundWinner === 1 ? 1 : 0)) >= 2) {
                  setGameWinner(1);
                  setStreak(s => s + 1);
                } else if ((aiRounds + (roundWinner === 2 ? 1 : 0)) >= 2) {
                  setGameWinner(2);
                  setShowLossScreen(true); // Show lost screen immediately when AI wins
                  // Do NOT increment streak for AI win
                } else {
                  // Reset for next round (do NOT randomize map/creatures)
                  setCurrentRound(r => r + 1);
                  setCreatureStates([
                    { top: '40%', left: '71%', anim: 'idle', frame: 0, finished: false },
                    { top: '50%', left: '71%', anim: 'idle', frame: 0, finished: false },
                    { top: '40%', left: '29%', anim: 'idle', frame: 0, finished: false },
                    { top: '50%', left: '29%', anim: 'idle', frame: 0, finished: false },
                  ]);
                  setBoard(initialBoard);
                  setRoundWinner(null);
                  setSelected(null);
                  setCurrentPlayer(1); // Always start with player after round reset
                }
              }, 800);
            }
          }, 60);
        }
      }, 60);
    }
  }, [roundWinner]);

  // On game win, reset everything for a new game
  useEffect(() => {
    if (gameWinner) {
      setTimeout(() => {
        setPlayerRounds(0);
        setAiRounds(0);
        setCurrentRound(1);
        setGameWinner(null);
        randomizeMapAndCreatures(); // Only randomize map/creatures after a GAME win
        setCreatureStates([
          { top: '40%', left: '71%', anim: 'idle', frame: 0, finished: false },
          { top: '50%', left: '71%', anim: 'idle', frame: 0, finished: false },
          { top: '40%', left: '29%', anim: 'idle', frame: 0, finished: false },
          { top: '50%', left: '29%', anim: 'idle', frame: 0, finished: false },
        ]);
        setBoard(initialBoard);
        setRoundWinner(null);
        setSelected(null);
        setCurrentPlayer(1);
      }, 1200);
    }
  }, [gameWinner]);

  // --- Replace AI move effect ---
  useEffect(() => {
    if (currentPlayer === 2 && !roundWinner && !isAnimatingCreature && !aiThinking && !gameWinner) {
      setAiThinking(true);
      setTimeout(() => {
        let aiMove = null;
        if (level === 'easy') aiMove = getRandomAIMove(board);
        else if (level === 'medium') aiMove = getGreedyAIMove(board);
        else {
          aiMove = getMinimaxAIMove(board);
          if (!aiMove) aiMove = getRandomAIMove(board); // fallback if minimax fails
        }
        if (aiMove) {
          setPendingAIMove(aiMove);
          setSelected({ row: aiMove.from.row, col: aiMove.from.col });
        } else {
          setAiThinking(false);
          console.log('AI did not return a valid move.');
        }
      }, 400);
    }
  }, [currentPlayer, roundWinner, isAnimatingCreature, gameWinner]);

  // --- Apply AI move only after 'selected' is set ---
  useEffect(() => {
    if (pendingAIMove && selected && selected.row === pendingAIMove.from.row && selected.col === pendingAIMove.from.col) {
      setTimeout(() => {
        handleCellClick(pendingAIMove.to.row, pendingAIMove.to.col);
        setAiThinking(false);
        setPendingAIMove(null);
      }, 100);
    }
  }, [selected, pendingAIMove]);

  // Add at the top of the AISurvival component
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (muteGlobalMusic) muteGlobalMusic();
    if (!audioRef.current) {
      audioRef.current = new Audio('/assets/Menu-Background/Assets/sounds/Ai_music.wav');
      audioRef.current.loop = true;
      audioRef.current.volume = mainVolume * 0.3;
    }
    audioRef.current.play().catch(() => {});
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (unmuteGlobalMusic) unmuteGlobalMusic();
    };
  }, [mainVolume, muteGlobalMusic, unmuteGlobalMusic]);

  // Add a useEffect to play Gameover1.wav when showLossScreen becomes true
  useEffect(() => {
    if (showLossScreen) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      const gameOverAudio = new Audio('/assets/Menu-Background/Assets/sounds/Ai-mode/Gameover1.wav');
      gameOverAudio.volume = mainVolume * 0.7;
      gameOverAudio.play();
    }
  }, [showLossScreen, mainVolume]);

  // Move sound helpers inside the component to access mainVolume and uiSound
  function playClickSound() {
    const audio = new Audio('/assets/Menu-Background/Assets/sounds/select_icon.wav');
    audio.volume = Math.min(mainVolume * uiSound, 1);
    audio.play();
  }
  function playPlaceSound() {
    const audio = new Audio('/assets/Menu-Background/Assets/sounds/placing_icon.wav');
    audio.volume = Math.min(mainVolume * uiSound, 1);
    audio.play();
  }

  // Main survival UI (PvP style)
  const bgColor = bgColors[currentMap] || 'rgba(0,0,0,0.7)';
    return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden" style={{ background: bgColor }}>
      {/* Map image as background */}
      <img
        src={getMapImage()}
        alt={`${currentMap} Map`}
        className="absolute inset-0 w-full h-full object-contain select-none"
        style={{ zIndex: 0 }}
        draggable="false"
      />
      {/* Info top right */}
      <div style={{ position: 'absolute', top: 32, left: 32, zIndex: 10, textAlign: 'left' }}>
        <img src={"/assets/Menu-Background/Assets/streak.png"} alt="Streak" style={{ width: 300, height: 180, position: 'relative' }} />
        {/* In the streak card, add className="retropix" to the streak number if you want, or to any player name display */}
        <span className="retropix" style={{ position: 'absolute', top: 85, left: 90, width: 100, textAlign: 'center', color: 'black', fontWeight: 'bold', fontSize: 32 }}>{streak}</span>
          </div>
      {/* Animated creatures moving across the map - only show when animating */}
      {creatureStates.map((creature, index) => {
        if (!isAnimatingCreature || animatingIndex !== index || creature.finished) return null;
        let spriteSrc = '';
        const creatureType = index < 2 ? playerCreature : aiCreature;
        if (creature.anim === 'run-back') spriteSrc = getRunFrames(creatureType, 'back')[creature.frame];
        else if (creature.anim === 'run-front') spriteSrc = getRunFrames(creatureType, 'front')[creature.frame];
        else if (creature.anim === 'run-left') spriteSrc = getRunFrames(creatureType, 'left')[creature.frame];
        else if (creature.anim === 'run-right') spriteSrc = getRunFrames(creatureType, 'right')[creature.frame];
        else if (creature.anim === 'idle-left') spriteSrc = getIdleFrames(creatureType, 'left')[creature.frame % 6];
        else if (creature.anim === 'idle-right') spriteSrc = getIdleFrames(creatureType, 'right')[creature.frame % 6];
        else spriteSrc = getIdleFrames(creatureType, index < 2 ? 'left' : 'right')[creature.frame % 6];
        return (
          <img
            key={`animated-${index}`}
            src={spriteSrc}
            alt={`${index < 2 ? 'P1' : 'AI'} Animated Creature`}
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
      })}
      {/* Idle creatures on land (only show if not animating) */}
      {!isAnimatingCreature && (
        <>
          {/* Player creatures (right) */}
          <div style={{ position: 'absolute', right: '25%', top: '40%', transform: 'translateY(-50%)', zIndex: 3, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[0, 1].map(i => (
              !creatureStates[i].finished && animatingIndex !== i && (
                <img
                  key={i}
                  src={getIdleFrames(playerCreature, 'left')[frame]}
                  alt="P1 Creature"
                  style={{ width: 150, height: 150, imageRendering: 'pixelated', marginBottom: 6 }}
                  draggable="false"
                />
              )
            ))}
          </div>
          {/* AI creatures (left) */}
          <div style={{ position: 'absolute', left: '25%', top: '50%', transform: 'translateY(-50%)', zIndex: 3, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[2, 3].map(i => (
              !creatureStates[i].finished && animatingIndex !== i && (
                <img
                  key={i}
                  src={getIdleFrames(aiCreature, 'right')[frame]}
                  alt="AI Creature"
                  style={{ width: 150, height: 150, imageRendering: 'pixelated', marginBottom: 6 }}
                  draggable="false"
                />
              )
            ))}
          </div>
        </>
      )}
      {/* 3x3 Board */}
      <div className="grid grid-cols-3 grid-rows-3 gap-2 bg-white/10 p-6 rounded-2xl shadow-lg" style={{ zIndex: 2 }}>
        {board.map((row, rIdx) =>
          row.map((cell, cIdx) => (
            <div
              key={rIdx + '-' + cIdx}
              className="w-24 h-24 flex items-center justify-center bg-white/40 rounded-lg border-2 border-white/60"
              style={{ fontSize: 50, fontWeight: 'bold', color: cell.owner === 1 ? '#fbbf24' : cell.owner === 2 ? '#60a5fa' : '#222' ,  width: 180,
                height: 180,}}
              onClick={() => { if (currentPlayer === 1) playClickSound(); handleCellClick(rIdx, cIdx); }}
            >
              {cell.owner === 1 ? (
                <img src={getPlayerIcon(1, currentMap)} alt="P1" style={{ width: 160, height: 160 }} />
              ) : cell.owner === 2 ? (
                <img src={getPlayerIcon(2, currentMap)} alt="AI" style={{ width: 160, height: 160 }} />
              ) : ''}
            </div>
          ))
        )}
      </div>
      {showLossScreen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.7)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <img
            src={'/assets/Menu-Background/Assets/lost.png'}
            alt="You Lost"
            style={{
              width: 500,
              height: 'auto',
              animation: 'floatY 2s ease-in-out infinite',
              marginBottom: 40,
            }}
            draggable="false"
          />
          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
              }
              if (unmuteGlobalMusic) unmuteGlobalMusic();
              setStreak(0); // Reset streak on AI win back
              setShowLossScreen(false);
              onBack();
            }}
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              cursor: 'pointer',
              marginTop: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              left: '50%',
              bottom: 60,
              transform: 'translateX(-50%)',
              zIndex: 1001,
            }}
          >
            <img src={'/assets/Menu-Background/Assets/back_button.png'} alt="Back" style={{ width: 300, height: 'auto' }} draggable="false" />
          </button>
          <style>{`
            @keyframes floatY {
              0% { transform: translateY(0); }
              50% { transform: translateY(-30px); }
              100% { transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
      {!gameWinner && (
        <button
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
            if (unmuteGlobalMusic) unmuteGlobalMusic();
            onBack();
          }}
          style={{
            position: 'absolute',
            top: 32,
            right: 32,
            zIndex: 100,
            background: 'none',
            border: 'none',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <img src={'/assets/Menu-Background/Assets/back_button.png'} alt="Back" style={{ width: 120, height: 'auto' }} draggable="false" />
        </button>
      )}
    </div>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import SoundButton from './SoundButton';
import { AILevel, MapTheme } from '../types/game';
import { Volume2, VolumeX } from 'lucide-react';
import { getAIMove } from './openaiMove';

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
        // Check all empty cells on the board, not just adjacent ones
        for (let nr = 0; nr < 3; nr++) {
          for (let nc = 0; nc < 3; nc++) {
            if (board[nr][nc].owner === null) {
              moves.push({ from: { row: r, col: c }, to: { row: nr, col: nc } });
            }
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
        // Check all empty cells on the board, not just adjacent ones
        for (let nr = 0; nr < 3; nr++) {
          for (let nc = 0; nc < 3; nc++) {
            if (board[nr][nc].owner === null) {
              moves.push({ from: { row: r, col: c }, to: { row: nr, col: nc } });
            }
          }
        }
      }
    }
  }
  
  if (moves.length === 0) return null;
  
  // Priority 1: Block player from winning on their next move (FIRST PRIORITY)
  for (const move of moves) {
    const newBoard: Board = board.map(row => row.map(cell => ({ ...cell })));
    newBoard[move.to.row][move.to.col] = { owner: 2, moved: true };
    newBoard[move.from.row][move.from.col] = { owner: null, moved: false };
    
    // Check if this move blocks any immediate player win
    let blocksWin = false;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (newBoard[r][c].owner === 1) {
          // Check all empty cells for player moves, not just adjacent ones
          for (let nr = 0; nr < 3; nr++) {
            for (let nc = 0; nc < 3; nc++) {
              if (newBoard[nr][nc].owner === null) {
                const testBoard: Board = newBoard.map(row => row.map(cell => ({ ...cell })));
                testBoard[nr][nc] = { owner: 1, moved: true };
                testBoard[r][c] = { owner: null, moved: false };
                if (checkWin(testBoard) === 1) {
                  blocksWin = true;
                  break;
                }
              }
            }
            if (blocksWin) break;
          }
          if (blocksWin) break;
        }
      }
      if (blocksWin) break;
    }
    if (blocksWin) return move;
  }
  
  // Priority 2: Win immediately if possible (SECOND PRIORITY)
  for (const move of moves) {
    const newBoard: Board = board.map(row => row.map(cell => ({ ...cell })));
    newBoard[move.to.row][move.to.col] = { owner: 2, moved: true };
    newBoard[move.from.row][move.from.col] = { owner: null, moved: false };
    if (checkWin(newBoard) === 2) return move;
  }
  
  // Priority 3: Try to create a winning opportunity (two in a row)
  for (const move of moves) {
    const newBoard: Board = board.map(row => row.map(cell => ({ ...cell })));
    newBoard[move.to.row][move.to.col] = { owner: 2, moved: true };
    newBoard[move.from.row][move.from.col] = { owner: null, moved: false };
    
    // Check if this creates a potential winning line
    const checkPotentialWin = (cells: [number, number][]): boolean => {
      const owners = cells.map(([r, c]) => newBoard[r][c].owner);
      const moved = cells.map(([r, c]) => newBoard[r][c].moved);
      const aiPieces = owners.filter((o, i) => o === 2 && moved[i]).length;
      const emptySpaces = owners.filter(o => o === null).length;
      return aiPieces === 2 && emptySpaces === 1;
    };
    
    // Check rows, columns, and diagonals for potential wins
    for (let r = 0; r < 3; r++) {
      if (checkPotentialWin([[r,0],[r,1],[r,2]])) return move;
    }
    for (let c = 0; c < 3; c++) {
      if (checkPotentialWin([[0,c],[1,c],[2,c]])) return move;
    }
    if (checkPotentialWin([[0,0],[1,1],[2,2]])) return move;
    if (checkPotentialWin([[0,2],[1,1],[2,0]])) return move;
  }
  
  // Priority 4: Move to strategic positions (center, corners, edges)
  for (const move of moves) {
    if (move.to.row === 1 && move.to.col === 1) return move; // Center
  }
  for (const move of moves) {
    const [r, c] = [move.to.row, move.to.col];
    if ((r === 0 || r === 2) && (c === 0 || c === 2)) return move; // Corners
  }
  for (const move of moves) {
    const [r, c] = [move.to.row, move.to.col];
    if ((r === 0 || r === 2 || c === 0 || c === 2) && !(r === 1 && c === 1)) return move; // Edges
  }
  
  // Priority 5: Random move
  return moves[Math.floor(Math.random() * moves.length)];
}

function getMinimaxAIMove(board: Board) {
  // Performance safeguard: limit the number of moves to consider
  const MAX_MOVES_PER_PIECE = 4; // Limit moves per piece to prevent explosion
  
  function minimax(b: Board, depth: number, isMax: boolean, alpha: number = -Infinity, beta: number = Infinity): { score: number, move?: { from: { row: number, col: number }, to: { row: number, col: number } } } {
    if (depth > 6) return { score: evaluatePosition(b) }; // Reduced depth limit for performance
    
    const winner = checkWin(b);
    if (winner === 2) return { score: 800 - depth }; // Reduced reward for AI win
    if (winner === 1) return { score: depth - 1200 }; // Higher penalty for player win
    
    const moves: { from: { row: number, col: number }, to: { row: number, col: number } }[] = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (b[r][c].owner === (isMax ? 2 : 1)) {
          const pieceMoves: { from: { row: number, col: number }, to: { row: number, col: number } }[] = [];
          // Check all empty cells on the board
          for (let nr = 0; nr < 3; nr++) {
            for (let nc = 0; nc < 3; nc++) {
              if (b[nr][nc].owner === null) {
                pieceMoves.push({ from: { row: r, col: c }, to: { row: nr, col: nc } });
              }
            }
          }
          // Limit moves per piece to prevent combinatorial explosion
          if (pieceMoves.length > MAX_MOVES_PER_PIECE) {
            // Sort moves by strategic value and take the best ones
            pieceMoves.sort((a, b) => {
              const aScore = evaluateMove(board, a);
              const bScore = evaluateMove(board, b);
              return bScore - aScore; // Descending order
            });
            moves.push(...pieceMoves.slice(0, MAX_MOVES_PER_PIECE));
          } else {
            moves.push(...pieceMoves);
          }
        }
      }
    }
    
    if (moves.length === 0) return { score: evaluatePosition(b) };
    
    let bestMove = undefined;
    let bestScore = isMax ? -Infinity : Infinity;
    
    for (const move of moves) {
      const newBoard: Board = b.map(row => row.map(cell => ({ ...cell })));
      const wasMoved = b[move.from.row][move.from.col].moved;
      newBoard[move.to.row][move.to.col] = { owner: isMax ? 2 : 1, moved: wasMoved || true };
      newBoard[move.from.row][move.from.col] = { owner: null, moved: false };
      
      const result = minimax(newBoard, depth + 1, !isMax, alpha, beta);
      
      if (isMax) {
        if (result.score > bestScore) {
          bestScore = result.score;
          bestMove = move;
        }
        alpha = Math.max(alpha, bestScore);
      } else {
        if (result.score < bestScore) {
          bestScore = result.score;
          bestMove = move;
        }
        beta = Math.min(beta, bestScore);
      }
      
      if (alpha >= beta) break;
    }
    
    return { score: bestScore, move: bestMove };
  }
  
  const result = minimax(board, 0, true);
  return result.move || null;
}

// Helper function to evaluate the strategic value of a move
function evaluateMove(board: Board, move: { from: { row: number, col: number }, to: { row: number, col: number } }): number {
  let score = 0;
  const [toRow, toCol] = [move.to.row, move.to.col];
  
  // Bonus for center
  if (toRow === 1 && toCol === 1) score += 10;
  
  // Bonus for corners
  if ((toRow === 0 || toRow === 2) && (toCol === 0 || toCol === 2)) score += 5;
  
  // Bonus for edges
  if ((toRow === 0 || toRow === 2 || toCol === 0 || toCol === 2) && !(toRow === 1 && toCol === 1)) score += 2;
  
  // Check if this move creates a winning line
  const testBoard = board.map(row => row.map(cell => ({ ...cell })));
  testBoard[toRow][toCol] = { owner: 2, moved: true };
  testBoard[move.from.row][move.from.col] = { owner: null, moved: false };
  
  if (checkWin(testBoard) === 2) score += 80; // Reduced priority for winning
  
  // Check if this move blocks a player win (HIGHER PRIORITY)
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (testBoard[r][c].owner === 1) {
        for (let nr = 0; nr < 3; nr++) {
          for (let nc = 0; nc < 3; nc++) {
            if (testBoard[nr][nc].owner === null) {
              const blockTestBoard = testBoard.map(row => row.map(cell => ({ ...cell })));
              blockTestBoard[nr][nc] = { owner: 1, moved: true };
              blockTestBoard[r][c] = { owner: null, moved: false };
              if (checkWin(blockTestBoard) === 1) {
                score += 120; // Higher priority for blocking
                break;
              }
            }
          }
        }
      }
    }
  }
  
  return score;
}

// Evaluation function for positions that don't have a clear winner
function evaluatePosition(board: Board): number {
  let score = 0;
  
  // Evaluate each line (rows, columns, diagonals)
  const lines = [
    // Rows
    [[0,0],[0,1],[0,2]], [[1,0],[1,1],[1,2]], [[2,0],[2,1],[2,2]],
    // Columns
    [[0,0],[1,0],[2,0]], [[0,1],[1,1],[2,1]], [[0,2],[1,2],[2,2]],
    // Diagonals
    [[0,0],[1,1],[2,2]], [[0,2],[1,1],[2,0]]
  ];
  
  for (const line of lines) {
    const owners = line.map(([r, c]) => board[r][c].owner);
    const moved = line.map(([r, c]) => board[r][c].moved);
    
    const aiPieces = owners.filter((o, i) => o === 2 && moved[i]).length;
    const playerPieces = owners.filter((o, i) => o === 1 && moved[i]).length;
    const emptySpaces = owners.filter(o => o === null).length;
    
    // Score based on piece advantage - PRIORITIZE BLOCKING OVER WINNING
    if (playerPieces === 2 && emptySpaces === 1) score -= 100; // Player has winning opportunity (HIGH PRIORITY TO BLOCK)
    else if (aiPieces === 2 && emptySpaces === 1) score += 80; // AI has winning opportunity (SECOND PRIORITY)
    else if (playerPieces === 1 && emptySpaces === 2) score -= 20; // Player has potential (BLOCK)
    else if (aiPieces === 1 && emptySpaces === 2) score += 15; // AI has potential (WIN)
    
    // Bonus for center control (less important with full mobility)
    if (board[1][1].owner === 2 && board[1][1].moved) score += 3;
    else if (board[1][1].owner === 1 && board[1][1].moved) score -= 3;
  }
  
  // Bonus for strategic positioning (corners and edges)
  const corners = [[0,0], [0,2], [2,0], [2,2]];
  const edges = [[0,1], [1,0], [1,2], [2,1]];
  
  for (const [r, c] of corners) {
    if (board[r][c].owner === 2 && board[r][c].moved) score += 2;
    else if (board[r][c].owner === 1 && board[r][c].moved) score -= 2;
  }
  
  for (const [r, c] of edges) {
    if (board[r][c].owner === 2 && board[r][c].moved) score += 1;
    else if (board[r][c].owner === 1 && board[r][c].moved) score -= 1;
  }
  
  return score;
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

export { getRandomAIMove, getGreedyAIMove, getMinimaxAIMove };

export default function AISurvival({ level, onBack, mainVolume, uiSound, muteGlobalMusic, unmuteGlobalMusic, onAIGameBack }: AISurvivalProps & { onAIGameBack?: () => void }) {
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

  // --- Track last board state for AI ---
  const lastAIBoardRef = useRef<string>('');

  // --- Replace AI move effect ---
  useEffect(() => {
    // Flatten the board for comparison
    const flatBoard = board.flat().map(cell => cell.owner === null ? 0 : cell.owner).join(' ');
    // Only allow AI to move if it's their turn AND the board has changed since last AI move
    if (currentPlayer === 2 && !roundWinner && !isAnimatingCreature && !aiThinking && !gameWinner && flatBoard !== lastAIBoardRef.current) {
      lastAIBoardRef.current = flatBoard;
      setAiThinking(true);
      let cancelled = false;
      const timeoutId = setTimeout(() => {
        setAiThinking(false);
        if (!cancelled) {
          console.log('AI timeout - falling back to random move');
          const fallbackMove = getRandomAIMove(board);
          if (fallbackMove) {
            applyAIMove(fallbackMove);
          }
        }
      }, 7000);
      (async () => {
        let aiMove = null;
        try {
          aiMove = await getAIMove(board, level as AILevel);
        } catch (error) {
          console.error('OpenAI API error:', error);
        }
        clearTimeout(timeoutId);
        if (!cancelled) {
          if (aiMove) {
            applyAIMove(aiMove);
          } else {
            setAiThinking(false);
            console.log('AI did not return a valid move, fallback to random.');
            const fallbackMove = getRandomAIMove(board);
            if (fallbackMove) {
              applyAIMove(fallbackMove);
            }
          }
        }
      })();
      return () => { cancelled = true; clearTimeout(timeoutId); };
    }
  }, [currentPlayer, roundWinner, isAnimatingCreature, gameWinner, level, board]);

  // --- Apply AI move directly ---
  function applyAIMove(move: { from: { row: number, col: number }, to: { row: number, col: number } }) {
    const { from, to } = move;
    // Check legality: must move an AI piece to an empty cell
    if (!board[from.row] || !board[from.row][from.col] || board[from.row][from.col].owner !== 2 ||
        !board[to.row] || !board[to.row][to.col] || board[to.row][to.col].owner !== null) {
      console.warn('LLM suggested illegal move, falling back to random valid move:', move);
      const fallbackMove = getRandomAIMove(board);
      if (fallbackMove) {
        // Recursively apply the fallback move (guaranteed legal by getRandomAIMove)
        applyAIMove(fallbackMove);
      } else {
        setAiThinking(false);
      }
      return;
    }
    const newBoard = board.map(r => r.map(c => ({ ...c })));
    newBoard[to.row][to.col] = { owner: 2, moved: true };
    newBoard[from.row][from.col] = { owner: null, moved: false };
    setBoard(newBoard);
    playPlaceSound();
    // Check for round win
    const winner = checkWin(newBoard);
    if (winner) {
      setRoundWinner(winner);
      if (winner === 1) setPlayerRounds(r => r + 1);
      else setAiRounds(r => r + 1);
    } else {
      setCurrentPlayer(1); // Switch back to player
    }
    setAiThinking(false);
  }

  // Add at the top of the AISurvival component
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Add local mute state for AI music
  const [isAIMusicMuted, setIsAIMusicMuted] = useState(false);
  useEffect(() => {
    if (muteGlobalMusic) muteGlobalMusic();
    if (!audioRef.current) {
      audioRef.current = new Audio('/assets/Menu-Background/Assets/sounds/Ai_music.wav');
      audioRef.current.loop = true;
      audioRef.current.volume = mainVolume * 0.3;
    }
    audioRef.current.muted = isAIMusicMuted;
    audioRef.current.play().catch(() => {});
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // Ensure AI music is fully stopped
      }
      if (unmuteGlobalMusic) unmuteGlobalMusic();
    };
  }, [mainVolume, muteGlobalMusic, unmuteGlobalMusic, isAIMusicMuted]);

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
      {/* Mute button for AI music */}
      <button
        onClick={() => {
          setIsAIMusicMuted((m) => {
            if (audioRef.current) audioRef.current.muted = !m;
            return !m;
          });
        }}
        className="p-2 rounded-full bg-black/20 backdrop-blur-custom hover:bg-black/40 transition-all duration-300 button-glow"
        style={{ position: 'absolute', top: 32, right: 32, zIndex: 101 }}
        aria-label={isAIMusicMuted ? 'Unmute AI Music' : 'Mute AI Music'}
      >
        {isAIMusicMuted ? (
          <VolumeX className="w-8 h-8 text-white/70" />
        ) : (
          <Volume2 className="w-8 h-8 text-white/70 audio-pulse" />
        )}
      </button>
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
        <span className="retropix" style={{ position: 'absolute', top: 85, left: 95, width: 100, textAlign: 'center', color: 'black', fontWeight: 'bold', fontSize: 32 }}>{streak}</span>
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
              width: 120,
              height: 120,
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
          <div style={{ position: 'absolute', right: '27%', top: '40%', transform: 'translateY(-50%)', zIndex: 3, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[0].map(i => (
              !creatureStates[i].finished && animatingIndex !== i && (
                <img
                  key={i}
                  src={getIdleFrames(playerCreature, 'left')[frame]}
                  alt="P1 Creature"
                  style={{ width: 120, height: 120, imageRendering: 'pixelated', marginBottom: 6 }}
                  draggable="false"
                />
              )
            ))}
          </div>
          {/* AI creatures (left) */}
          <div style={{ position: 'absolute', left: '27%', top: '50%', transform: 'translateY(-50%)', zIndex: 3, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[2].map(i => (
              !creatureStates[i].finished && animatingIndex !== i && (
                <img
                  key={i}
                  src={getIdleFrames(aiCreature, 'right')[frame]}
                  alt="AI Creature"
                  style={{ width: 120, height: 120, imageRendering: 'pixelated', marginBottom: 6 }}
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
              className="w-24 h-24 flex items-center justify-center bg-white/40 rounded-lg border-1 border-white/60"
              style={{ fontSize: 50, fontWeight: 'bold', color: cell.owner === 1 ? '#fbbf24' : cell.owner === 2 ? '#60a5fa' : '#222', width: 125, height: 125 }}
              onClick={() => { if (currentPlayer === 1) playClickSound(); handleCellClick(rIdx, cIdx); }}
              onTouchStart={() => { if (currentPlayer === 1) playClickSound(); handleCellClick(rIdx, cIdx); }}
            >
              {cell.owner === 1 ? (
                <img src={getPlayerIcon(1, currentMap)} alt="P1" style={{ width: 120, height: 120 }} />
              ) : cell.owner === 2 ? (
                <img src={getPlayerIcon(2, currentMap)} alt="AI" style={{ width: 120, height: 120 }} />
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
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.pause();
                  audioRef.current.currentTime = 0;
                }
                if (unmuteGlobalMusic) unmuteGlobalMusic();
                if (onAIGameBack) onAIGameBack();
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
                // Remove position, left, transform
                bottom: 60,
                zIndex: 1001,
              }}
            >
              <img src={'/assets/Menu-Background/Assets/back_button.png'} alt="Back" style={{ width: 300, height: 'auto' }} draggable="false" />
            </button>
          </div>
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
            if (onAIGameBack) onAIGameBack();
            onBack();
          }}
          style={{
            position: 'absolute',
            top: 32,
            right: 82,
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

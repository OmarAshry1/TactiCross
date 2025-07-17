import React, { useState, useEffect } from 'react';
import { RotateCcw, Crown } from 'lucide-react';
import SoundButton from './SoundButton';
import { MapTheme, Player, GameMode, GamePiece, BoardPosition } from '../types/game';

interface GameBoardProps {
  map: MapTheme;
  players: Player[];
  gameMode: GameMode;
  onGameEnd: () => void;
  onBack: () => void;
  mainVolume?: number;
  uiSound?: number;
}

const mapConfigs = {
  lava: {
    name: 'Lava Realm',
    gradient: 'from-red-900 via-orange-800 to-red-700',
    cellColor: 'bg-red-800/50 border-red-600',
    cellHover: 'hover:bg-red-700/60',
    creature: '🪨'
  },
  river: {
    name: 'River Valley',
    gradient: 'from-blue-900 via-teal-800 to-blue-700',
    cellColor: 'bg-blue-800/50 border-blue-600',
    cellHover: 'hover:bg-blue-700/60',
    creature: '🏝️'
  },
  polar: {
    name: 'Polar Wastes',
    gradient: 'from-cyan-900 via-blue-800 to-indigo-700',
    cellColor: 'bg-cyan-800/50 border-cyan-600',
    cellHover: 'hover:bg-cyan-700/60',
    creature: '❄️'
  }
};

export default function GameBoard({ map, players, gameMode, onGameEnd, onBack, mainVolume = 1, uiSound = 1 }: GameBoardProps) {
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [gameBoard, setGameBoard] = useState<(GamePiece | null)[][]>(
    Array(3).fill(null).map(() => Array(3).fill(null))
  );
  const [selectedPiece, setSelectedPiece] = useState<GamePiece | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);
  const [player1Wins, setPlayer1Wins] = useState(0);
  const [player2Wins, setPlayer2Wins] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const mapConfig = mapConfigs[map];

  // Initialize game pieces
  useEffect(() => {
    initializeBoard();
  }, []);

  const initializeBoard = () => {
    const newBoard = Array(3).fill(null).map(() => Array(3).fill(null));
    
    // Place player 1 pieces (top row)
    for (let col = 0; col < 3; col++) {
      newBoard[0][col] = {
        id: `p1-${col}`,
        playerId: 1,
        position: { row: 0, col },
        hasMoved: false,
        creature: players[0]?.creature || 'rock'
      };
    }

    // Place player 2 pieces (bottom row)
    for (let col = 0; col < 3; col++) {
      newBoard[2][col] = {
        id: `p2-${col}`,
        playerId: 2,
        position: { row: 2, col },
        hasMoved: false,
        creature: players[1]?.creature || 'rock'
      };
    }

    setGameBoard(newBoard);
    setCurrentPlayer(1);
    setSelectedPiece(null);
    setWinner(null);
  };

  const handleCellClick = (row: number, col: number) => {
    if (winner || isAnimating) return;

    const clickedCell = gameBoard[row][col];
    
    if (selectedPiece) {
      // Try to move the selected piece
      if (canMoveTo(selectedPiece, { row, col })) {
        movePiece(selectedPiece, { row, col });
      }
      setSelectedPiece(null);
    } else if (clickedCell && clickedCell.playerId === currentPlayer) {
      // Select a piece
      setSelectedPiece(clickedCell);
    }
  };

  const canMoveTo = (piece: GamePiece, target: BoardPosition): boolean => {
    const { row, col } = target;
    
    // Check if target is within bounds
    if (row < 0 || row >= 3 || col < 0 || col >= 3) return false;
    
    // Check if target is empty
    if (gameBoard[row][col] !== null) return false;
    
    // Check if move is valid (adjacent cell only)
    const rowDiff = Math.abs(row - piece.position.row);
    const colDiff = Math.abs(col - piece.position.col);
    
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  };

  const movePiece = (piece: GamePiece, target: BoardPosition) => {
    const newBoard = [...gameBoard];
    
    // Remove piece from old position
    newBoard[piece.position.row][piece.position.col] = null;
    
    // Place piece in new position
    const movedPiece = {
      ...piece,
      position: target,
      hasMoved: true
    };
    newBoard[target.row][target.col] = movedPiece;
    
    setGameBoard(newBoard);
    
    // Check for win condition
    if (checkWinCondition(newBoard, currentPlayer)) {
      handleRoundWin(currentPlayer);
    } else {
      // Switch player
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    }
  };

  const checkWinCondition = (board: (GamePiece | null)[][], playerId: number): boolean => {
    const playerPieces = board.flat().filter(piece => 
      piece && piece.playerId === playerId && piece.hasMoved
    );
    
    if (playerPieces.length < 3) return false;
    
    // Check for three in a row (horizontal, vertical, diagonal)
    const positions = playerPieces.map(piece => piece!.position);
    
    // Check rows
    for (let row = 0; row < 3; row++) {
      if (positions.filter(pos => pos.row === row).length === 3) return true;
    }
    
    // Check columns
    for (let col = 0; col < 3; col++) {
      if (positions.filter(pos => pos.col === col).length === 3) return true;
    }
    
    // Check diagonals
    if (positions.some(pos => pos.row === 0 && pos.col === 0) &&
        positions.some(pos => pos.row === 1 && pos.col === 1) &&
        positions.some(pos => pos.row === 2 && pos.col === 2)) return true;
        
    if (positions.some(pos => pos.row === 0 && pos.col === 2) &&
        positions.some(pos => pos.row === 1 && pos.col === 1) &&
        positions.some(pos => pos.row === 2 && pos.col === 0)) return true;
    
    return false;
  };

  const handleRoundWin = (winnerId: number) => {
    setIsAnimating(true);
    setWinner(players.find(p => p.id === winnerId) || null);
    
    if (winnerId === 1) {
      setPlayer1Wins(prev => prev + 1);
    } else {
      setPlayer2Wins(prev => prev + 1);
    }
    
    setTimeout(() => {
      setIsAnimating(false);
      // Check if someone won 2 rounds (best of 3)
      if ((winnerId === 1 && player1Wins + 1 >= 2) || (winnerId === 2 && player2Wins + 1 >= 2)) {
        // Game over
        setTimeout(() => {
          onGameEnd();
        }, 2000);
      } else {
        // Reset for next round
        initializeBoard();
      }
    }, 3000);
  };

  const resetGame = () => {
    setPlayer1Wins(0);
    setPlayer2Wins(0);
    initializeBoard();
  };

  const getCreatureEmoji = (creature: string) => {
    const creatureMap = {
      rock: '🪨',
      islander: '🏝️',
      snow: '❄️'
    };
    return creatureMap[creature as keyof typeof creatureMap] || '🪨';
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${mapConfig.gradient} flex items-center justify-center p-4`}>
      <div className="max-w-4xl w-full relative">
        {/* Edge Creatures */}
        {/* Player 1 (left) */}
        {players[0]?.leftIdle && (
          <img
            src={players[0].leftIdle}
            alt="Player 1 Creature"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-24 h-24 z-10 select-none pointer-events-none"
            draggable="false"
            style={{ userSelect: 'none' }}
          />
        )}
        {/* Player 2 (right) */}
        {players[1]?.rightIdle && (
          <img
            src={players[1].rightIdle}
            alt="Player 2 Creature"
            className="absolute right-0 top-1/2 -translate-y-1/2 w-24 h-24 z-10 select-none pointer-events-none"
            draggable="false"
            style={{ userSelect: 'none' }}
          />
        )}
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-2xl">
            {mapConfig.name}
          </h1>
          {/* Header player names */}
          <div className="text-white/80 text-lg retropix">
            {players[0]?.name} vs {players[1]?.name}
          </div>
        </div>

        {/* Score Display */}
        <div className="flex justify-center items-center space-x-8 mb-8">
          <div className="bg-blue-600/30 backdrop-blur-sm rounded-xl p-4 border border-blue-400/20">
            <div className="text-center">
              <div className="text-2xl font-bold text-white retropix">{players[0]?.name}</div>
              <div className="text-4xl font-bold text-blue-400">{player1Wins}</div>
            </div>
          </div>
          
          <div className="text-3xl font-bold text-white">-</div>
          
          <div className="bg-red-600/30 backdrop-blur-sm rounded-xl p-4 border border-red-400/20">
            <div className="text-center">
              <div className="text-2xl font-bold text-white retropix">{players[1]?.name}</div>
              <div className="text-4xl font-bold text-red-400">{player2Wins}</div>
            </div>
          </div>
        </div>

        {/* Current Player Indicator */}
        {!winner && (
          <div className="text-center mb-6">
            {/* Current player indicator */}
            <div className="text-xl font-bold text-white retropix">
              {players[currentPlayer - 1]?.name}'s Turn
            </div>
            <div className="text-white/60">
              {selectedPiece ? 'Select where to move' : 'Select a piece to move'}
            </div>
          </div>
        )}

        {/* Game Board */}
        <div className="grid grid-cols-3 gap-2 max-w-md mx-auto mb-8">
          {gameBoard.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                className={`
                  w-20 h-20 rounded-lg border-2 transition-all duration-300 transform hover:scale-105
                  ${mapConfig.cellColor} ${mapConfig.cellHover}
                  ${selectedPiece && canMoveTo(selectedPiece, { row: rowIndex, col: colIndex }) ? 'ring-2 ring-yellow-400' : ''}
                  ${cell && selectedPiece && cell.id === selectedPiece.id ? 'ring-2 ring-white' : ''}
                `}
                disabled={isAnimating}
              >
                {cell && (
                  <div className="text-2xl animate-pulse">
                    {getCreatureEmoji(cell.creature)}
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        {/* Win Animation */}
        {winner && (
          <>
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 49 }} />
            <div
              style={{
                position: 'fixed',
                left: 0,
                top: 0,
                zIndex: 50,
                marginLeft: '60px', // Adjust this value to move the win card horizontally
                marginTop: '40px',  // Adjust this value to move the win card vertically
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '1rem',
                padding: '2rem',
                textAlign: 'center',
                backdropFilter: 'blur(8px)',
                display: 'inline-block',
              }}
              className="mb-6"
            >
              <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
              {/* Winner modal */}
              <h2 className="text-4xl font-bold text-white mb-4 retropix">
                {winner.name} Wins!
              </h2>
              <div className="text-xl text-white/80">
                Round {Math.max(player1Wins, player2Wins)}
              </div>
            </div>
            <SoundButton
              onClick={onBack}
              style={{
                position: 'fixed',
                left: 5,
                top: 0,
                marginLeft: '180px', // Adjust this value to move the back button horizontally
                marginTop: '220px', // Adjust this value to move the back button vertically (relative to the top of the screen)
                background: 'none',
                border: 'none',
                padding: 0,
                zIndex: 51,
              }}
              className="transition-transform duration-300 hover:scale-110 focus:outline-none bg-transparent shadow-none"
              mainVolume={mainVolume}
              uiSound={uiSound}
            >
              <img
                src="/assets/Menu-Background/Assets/back_button.png"
                alt="Back"
                className="w-[260px] h-auto select-none"
                draggable="false"
              />
            </SoundButton>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <SoundButton
            onClick={onBack}
            className="ml-20 transition-transform duration-300 hover:scale-110 focus:outline-none bg-transparent shadow-none"
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
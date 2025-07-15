import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Sparkles } from 'lucide-react';
import SoundButton from './SoundButton';
import { Player, TournamentMatch } from '../types/game';

interface TournamentBracketProps {
  players: Player[];
  onComplete: () => void;
  onBack: () => void;
  mainVolume?: number;
  uiSound?: number;
}

export default function TournamentBracket({ players, onComplete, onBack, mainVolume = 1, uiSound = 1 }: TournamentBracketProps) {
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [currentMatch, setCurrentMatch] = useState<TournamentMatch | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    initializeTournament();
  }, [players]);

  const initializeTournament = () => {
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    const initialMatches: TournamentMatch[] = [];
    
    // Create first round matches
    for (let i = 0; i < shuffledPlayers.length; i += 2) {
      initialMatches.push({
        id: `match-${i/2}`,
        player1: shuffledPlayers[i],
        player2: shuffledPlayers[i + 1],
        round: 1
      });
    }
    
    setMatches(initialMatches);
    setCurrentMatch(initialMatches[0]);
  };

  const simulateMatch = (match: TournamentMatch): Player => {
    // Simple simulation - random winner with slight bias for human players
    const player1Chance = match.player1.isAI ? 0.4 : 0.6;
    return Math.random() < player1Chance ? match.player1 : match.player2;
  };

  const handleMatchComplete = (matchWinner: Player) => {
    setIsSimulating(true);
    
    setTimeout(() => {
      // Update current match with winner
      const updatedMatches = matches.map(match => 
        match.id === currentMatch?.id 
          ? { ...match, winner: matchWinner }
          : match
      );
      
      setMatches(updatedMatches);
      
      // Check if round is complete
      const currentRound = currentMatch?.round || 1;
      const roundMatches = updatedMatches.filter(m => m.round === currentRound);
      const completedRoundMatches = roundMatches.filter(m => m.winner);
      
      if (completedRoundMatches.length === roundMatches.length) {
        // Round complete, create next round or declare winner
        if (completedRoundMatches.length === 1) {
          // Tournament winner!
          setWinner(completedRoundMatches[0].winner!);
          setCurrentMatch(null);
        } else {
          // Create next round
          const nextRoundMatches: TournamentMatch[] = [];
          const winners = completedRoundMatches.map(m => m.winner!);
          
          for (let i = 0; i < winners.length; i += 2) {
            nextRoundMatches.push({
              id: `match-${currentRound + 1}-${i/2}`,
              player1: winners[i],
              player2: winners[i + 1],
              round: currentRound + 1
            });
          }
          
          setMatches([...updatedMatches, ...nextRoundMatches]);
          setCurrentMatch(nextRoundMatches[0]);
        }
      } else {
        // Find next match in current round
        const nextMatch = roundMatches.find(m => !m.winner);
        setCurrentMatch(nextMatch || null);
      }
      
      setIsSimulating(false);
    }, 2000);
  };

  const handleSimulateMatch = () => {
    if (currentMatch) {
      const winner = simulateMatch(currentMatch);
      handleMatchComplete(winner);
    }
  };

  const getRoundName = (round: number) => {
    const roundNames = {
      1: 'First Round',
      2: 'Semi-Finals',
      3: 'Finals'
    };
    return roundNames[round as keyof typeof roundNames] || `Round ${round}`;
  };

  const renderBracket = () => {
    const rounds = [...new Set(matches.map(m => m.round))].sort();
    
    return (
      <div className="flex justify-center space-x-8 overflow-x-auto">
        {rounds.map(round => (
          <div key={round} className="flex flex-col space-y-4">
            <h3 className="text-xl font-bold text-white text-center mb-4">
              {getRoundName(round)}
            </h3>
            {matches
              .filter(m => m.round === round)
              .map(match => (
                <div
                  key={match.id}
                  className={`bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-sm rounded-xl p-4 border border-purple-400/20 min-w-[200px] ${
                    currentMatch?.id === match.id ? 'ring-2 ring-yellow-400' : ''
                  }`}
                >
                  <div className="space-y-2">
                    <div className={`p-2 rounded-lg ${
                      match.winner?.id === match.player1.id ? 'bg-green-600/50' : 'bg-white/10'
                    }`}>
                      <div className="text-white font-semibold">{match.player1.name}</div>
                      {match.player1.isAI && <div className="text-xs text-blue-300">AI</div>}
                    </div>
                    
                    <div className="text-center text-white/60">vs</div>
                    
                    <div className={`p-2 rounded-lg ${
                      match.winner?.id === match.player2.id ? 'bg-green-600/50' : 'bg-white/10'
                    }`}>
                      <div className="text-white font-semibold">{match.player2.name}</div>
                      {match.player2.isAI && <div className="text-xs text-blue-300">AI</div>}
                    </div>
                  </div>
                  
                  {match.winner && (
                    <div className="mt-2 text-center">
                      <Crown className="w-4 h-4 text-yellow-400 mx-auto" />
                      <div className="text-xs text-green-300">Winner</div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>
    );
  };

  if (winner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900 flex items-center justify-center p-8">
        <div className="text-center">
          {/* Fireworks Animation */}
          <div className="fixed inset-0 pointer-events-none">
            {Array.from({ length: 10 }).map((_, i) => (
              <Sparkles
                key={i}
                className="absolute text-yellow-400 animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  fontSize: `${Math.random() * 20 + 10}px`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>

          <Trophy className="w-32 h-32 text-yellow-400 mx-auto mb-8 animate-bounce" />
          
          <h1 className="text-8xl font-bold text-white mb-4 drop-shadow-2xl">
            CHAMPION!
          </h1>
          
          <div className="text-4xl font-bold text-yellow-400 mb-8">
            {winner.name}
          </div>
          
          <div className="text-xl text-white/80 mb-8">
            {winner.isAI ? 'AI Victory!' : 'Human Victory!'}
          </div>

          {/* Podium */}
          <div className="bg-gradient-to-r from-yellow-600/30 to-orange-600/30 backdrop-blur-sm rounded-2xl p-8 border border-yellow-400/20 mb-8 inline-block">
            <div className="text-6xl mb-4">🏆</div>
            <div className="text-2xl font-bold text-white">{winner.name}</div>
            <div className="text-yellow-400">Tournament Champion</div>
          </div>

          <div className="flex justify-center">
            <SoundButton
              onClick={onComplete}
              className="transition-transform duration-300 hover:scale-110 focus:outline-none drop-shadow-lg"
              style={{ background: 'none', border: 'none', padding: 0 }}
              mainVolume={mainVolume}
              uiSound={uiSound}
            >
              <img
                src="/assets/Menu-Background/Assets/back_button.png"
                alt="Back to Menu"
                className="w-[240px] h-auto select-none"
                draggable="false"
              />
            </SoundButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-pulse" />
          <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-2xl">
            Tournament Bracket
          </h1>
        </div>

        {/* Current Match */}
        {currentMatch && (
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/20 inline-block">
              <div className="text-xl font-bold text-white mb-4">
                {getRoundName(currentMatch.round)}
              </div>
              <div className="text-2xl font-bold text-white mb-4">
                {currentMatch.player1.name} vs {currentMatch.player2.name}
              </div>
              
              {!isSimulating ? (
                <button
                  onClick={handleSimulateMatch}
                  className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                >
                  Simulate Match
                </button>
              ) : (
                <div className="text-white animate-pulse">
                  Simulating match...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bracket Display */}
        <div className="mb-8">
          {renderBracket()}
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
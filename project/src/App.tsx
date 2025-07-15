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

  // Music logic: play on all menus, stop in game
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/assets/Menu-Background/music/summer_nights.ogg');
      audioRef.current.loop = true;
      audioRef.current.volume = settings.mainVolume * settings.menuMusic;
    }
    if (gameState !== 'game' && !isMuted) {
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

  const handleMapSelect = (map: MapTheme) => {
    setSelectedMap(map);
    setGameState('game');
  };

  const handlePlayersReady = () => {
    setGameState('player-customization');
  };

  const handleCustomizationComplete = () => {
    setGameState('map-selection');
  };

  const handleTournamentStart = (playerList: Player[]) => {
    setTournamentPlayers(playerList);
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
      case 'game':
        return (
          <GameBoard
            map={selectedMap}
            players={players}
            gameMode={gameMode}
            onGameEnd={() => setGameState('menu')}
            onBack={() => setGameState('map-selection')}
            mainVolume={settings.mainVolume}
            uiSound={settings.uiSound}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen overflow-hidden ${gameState === 'menu' ? '' : 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900'}`}>
      {/* Animated background on all menus except game */}
      {gameState !== 'game' && <AnimatedBackground />}
      {/* Show mute button on all screens except game */}
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
      {renderCurrentScreen()}
    </div>
  );
}
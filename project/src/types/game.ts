export type GameState = 
  | 'menu' 
  | 'mode-selection' 
  | 'player-setup' 
  | 'player-customization' 
  | 'map-selection' 
  | 'tournament-setup' 
  | 'tournament-bracket' 
  | 'ai-setup' 
  | 'ai-survival' 
  | 'settings' 
  | 'game'
  | 'map-revealed';

export type GameMode = 'pvp' | 'tournament' | 'ai';

export type MapTheme = 'lava' | 'river' | 'polar';

export type CreatureType = 'rock' | 'islander' | 'snow';

export type AILevel = 'easy' | 'medium' | 'hard';

export interface Player {
  id: number;
  name: string;
  creature: CreatureType | string;
  leftIdle?: string;
  rightIdle?: string;
  isAI: boolean;
  hp?: number;
  wins?: number;
}

export interface GameSettings {
  mainVolume: number;
  menuMusic: number;
  uiSound: number;
  soundEnabled: boolean;
}

export interface BoardPosition {
  row: number;
  col: number;
}

export interface GamePiece {
  id: string;
  playerId: number;
  position: BoardPosition;
  hasMoved: boolean;
  creature: CreatureType | string;
}

export interface PowerUp {
  id: string;
  name: string;
  description: string;
  effect: 'heal' | 'damage' | 'hammer';
  value: number;
}

export interface TournamentMatch {
  id: string;
  player1: Player;
  player2: Player;
  winner?: Player;
  round: number;
}
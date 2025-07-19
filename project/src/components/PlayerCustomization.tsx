import React, { useState, useEffect, useRef } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import SoundButton from './SoundButton';
import { Player, CreatureType } from '../types/game';
import AnimatedBackground from './AnimatedBackground';

interface PlayerCustomizationProps {
  players: Player[];
  onPlayersChange: (players: Player[]) => void;
  onComplete: () => void;
  onBack: () => void;
  mainVolume?: number;
  uiSound?: number;
}

// Minimal, bulletproof sprite sheet animation component
interface SpriteSheetAnimationProps {
  spriteSheet: string;
  frameWidth: number;
  frameHeight: number;
  columns: number;
  rows: number;
  frameCount: number;
  fps?: number;
  scale?: number;
  style?: React.CSSProperties;
}

const SpriteSheetAnimation: React.FC<SpriteSheetAnimationProps> = ({
  spriteSheet,
  frameWidth,
  frameHeight,
  columns,
  rows,
  frameCount,
  fps = 6,
  scale = 1,
  style,
}) => {
  const [frame, setFrame] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    let running = true;
    let acc = 0;
    const frameDuration = 1000 / fps;
    function animate(now: number) {
      if (!running) return;
      acc += now - lastTimeRef.current;
      lastTimeRef.current = now;
      if (acc >= frameDuration) {
        setFrame(f => (f + 1) % frameCount);
        acc = acc % frameDuration;
      }
      rafRef.current = requestAnimationFrame(animate);
    }
    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [fps, frameCount]);

  const col = frame % columns;
  const row = Math.floor(frame / columns);
  const displayWidth = frameWidth * scale;
  const displayHeight = frameHeight * scale;

  return (
    <div
      style={{
        width: displayWidth,
        height: displayHeight,
        overflow: 'hidden',
        position: 'absolute',
        left: '50%',
        top: '68%',
        transform: 'translate(-50%, -50%)',
        ...style,
      }}
    >
      <img
        src={spriteSheet}
        alt="Sprite"
        style={{
          position: 'absolute',
          left: -col * displayWidth,
          top: -row * displayHeight,
          width: columns * displayWidth,
          height: rows * displayHeight,
          imageRendering: 'pixelated',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
        draggable={false}
      />
    </div>
  );
};

const creatureSelections = [
  {
    type: 'rock' as CreatureType,
    folder: 'Slime2',
    leftIdle: '/assets/Menu-Background/Assets/creatures/PNG/Slime2/Idle/left/Slime2_Idle_1.PNG',
    rightIdle: '/assets/Menu-Background/Assets/creatures/PNG/Slime2/Idle/right/Slime2_Idle_1.PNG',
    img: '/assets/Menu-Background/Assets/selection_1.png',
    slime: '/assets/Menu-Background/Assets/creatures/PNG/Slime2/Idle/Slime2_Idle_body.png',
    frameWidth: 32, frameHeight: 32, frameCount: 6, columns: 3, rows: 2
  },
  {
    type: 'islander' as CreatureType,
    folder: 'Slime1',
    leftIdle: '/assets/Menu-Background/Assets/creatures/PNG/Slime1/Idle/left/Slime1_Idle_1.PNG',
    rightIdle: '/assets/Menu-Background/Assets/creatures/PNG/Slime1/Idle/right/Slime1_Idle_1.PNG',
    img: '/assets/Menu-Background/Assets/selection_2.png',
    slime: '/assets/Menu-Background/Assets/creatures/PNG/Slime1/Idle/selection/Slime1_Idle_full.PNG',
    frameWidth: 32, frameHeight: 32, frameCount: 6, columns: 3, rows: 2
  },
  {
    type: 'snow' as CreatureType,
    folder: 'Slime3',
    leftIdle: '/assets/Menu-Background/Assets/creatures/PNG/Slime3/Idle/left/Slime3_Idle_1.PNG',
    rightIdle: '/assets/Menu-Background/Assets/creatures/PNG/Slime3/Idle/right/Slime3_Idle_1.PNG',
    img: '/assets/Menu-Background/Assets/selection_3.png',
    slime: '/assets/Menu-Background/Assets/creatures/PNG/Slime3/Idle/Slime3_Idle_body.png',
    frameWidth: 32, frameHeight: 32, frameCount: 6, columns: 3, rows: 2
  },
];

// Frame sequence animation for individual PNGs
const slime1Frames = [
  '/assets/Menu-Background/Assets/creatures/PNG/Slime1/Idle/selection/Slime1_Idle_1.PNG',
  '/assets/Menu-Background/Assets/creatures/PNG/Slime1/Idle/selection/Slime1_Idle_2.PNG',
  '/assets/Menu-Background/Assets/creatures/PNG/Slime1/Idle/selection/Slime1_Idle_3.PNG',
  '/assets/Menu-Background/Assets/creatures/PNG/Slime1/Idle/selection/Slime1_Idle_4.PNG',
  '/assets/Menu-Background/Assets/creatures/PNG/Slime1/Idle/selection/Slime1_Idle_5.PNG',
  '/assets/Menu-Background/Assets/creatures/PNG/Slime1/Idle/selection/Slime1_Idle_6.PNG',
  
];

const slime2Frames = [
  '/assets/Menu-Background/Assets/creatures/PNG/Slime2/Idle/selection/Slime2_Idle_1.PNG',
  '/assets/Menu-Background/Assets/creatures/PNG/Slime2/Idle/selection/Slime2_Idle_2.PNG',
  '/assets/Menu-Background/Assets/creatures/PNG/Slime2/Idle/selection/Slime2_Idle_3.PNG',
  '/assets/Menu-Background/Assets/creatures/PNG/Slime2/Idle/selection/Slime2_Idle_4.PNG',
  '/assets/Menu-Background/Assets/creatures/PNG/Slime2/Idle/selection/Slime2_Idle_5.PNG',
  '/assets/Menu-Background/Assets/creatures/PNG/Slime2/Idle/selection/Slime2_Idle_6.PNG',
];

const slime3Frames = [
  '/assets/Menu-Background/Assets/creatures/PNG/Slime3/Idle/selection/Slime3_Idle_1.PNG',
  '/assets/Menu-Background/Assets/creatures/PNG/Slime3/Idle/selection/Slime3_Idle_2.PNG',
  '/assets/Menu-Background/Assets/creatures/PNG/Slime3/Idle/selection/Slime3_Idle_3.PNG',
  '/assets/Menu-Background/Assets/creatures/PNG/Slime3/Idle/selection/Slime3_Idle_4.PNG',
  '/assets/Menu-Background/Assets/creatures/PNG/Slime3/Idle/selection/Slime3_Idle_5.PNG',
  '/assets/Menu-Background/Assets/creatures/PNG/Slime3/Idle/selection/Slime3_Idle_6.PNG',
];

const slime1RunFrames = [
  '/assets/Menu-Background/Assets/creatures/PNG/Slime1/Run/front/Slime1_Run_1.PNG',
  '/assets/Menu-Background/Assets/creatures/PNG/Slime1/Run/front/Slime1_Run_2.PNG',
  '/assets/Menu-Background/Assets/creatures/PNG/Slime1/Run/front/Slime1_Run_3.PNG',
  '/assets/Menu-Background/Assets/creatures/PNG/Slime1/Run/front/Slime1_Run_4.PNG',
  '/assets/Menu-Background/Assets/creatures/PNG/Slime1/Run/front/Slime1_Run_5.PNG',
  '/assets/Menu-Background/Assets/creatures/PNG/Slime1/Run/front/Slime1_Run_6.PNG',
  '/assets/Menu-Background/Assets/creatures/PNG/Slime1/Run/front/Slime1_Run_7.PNG',
  '/assets/Menu-Background/Assets/creatures/PNG/Slime1/Run/front/Slime1_Run_8.PNG',
];
const slime2RunFrames = [
  '/assets/Menu-Background/Assets/creatures/PNG/Slime2/Run/front/Slime2_Run_1.PNG',
  '/assets/Menu-Background/Assets/creatures/PNG/Slime2/Run/front/Slime2_Run_2.PNG',
  '/assets/Menu-Background/Assets/creatures/PNG/Slime2/Run/front/Slime2_Run_3.PNG',
  '/assets/Menu-Background/Assets/creatures/PNG/Slime2/Run/front/Slime2_Run_4.PNG',
  '/assets/Menu-Background/Assets/creatures/PNG/Slime2/Run/front/Slime2_Run_5.PNG',
  '/assets/Menu-Background/Assets/creatures/PNG/Slime2/Run/front/Slime2_Run_6.PNG',
  '/assets/Menu-Background/Assets/creatures/PNG/Slime2/Run/front/Slime2_Run_7.PNG',
  '/assets/Menu-Background/Assets/creatures/PNG/Slime2/Run/front/Slime2_Run_8.PNG',
];
const slime3RunFrames = [
  '/assets/Menu-Background/Assets/creatures/PNG/Slime3/Run/front/Slime3_Run_1.PNG',
  '/assets/Menu-Background/Assets/creatures/PNG/Slime3/Run/front/Slime3_Run_2.PNG',
  '/assets/Menu-Background/Assets/creatures/PNG/Slime3/Run/front/Slime3_Run_3.PNG',
  '/assets/Menu-Background/Assets/creatures/PNG/Slime3/Run/front/Slime3_Run_4.PNG',
  '/assets/Menu-Background/Assets/creatures/PNG/Slime3/Run/front/Slime3_Run_5.PNG',
  '/assets/Menu-Background/Assets/creatures/PNG/Slime3/Run/front/Slime3_Run_6.PNG',
  '/assets/Menu-Background/Assets/creatures/PNG/Slime3/Run/front/Slime3_Run_7.PNG',
  '/assets/Menu-Background/Assets/creatures/PNG/Slime3/Run/front/Slime3_Run_8.PNG',
];

const FrameSequenceAnimation: React.FC<{ frames: string[]; fps?: number; size?: number; style?: React.CSSProperties }> = ({
  frames,
  fps = 6,
  size = 128,
  style,
}) => {
  const [frame, setFrame] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setFrame(f => (f + 1) % frames.length), 1000 / fps);
    return () => clearInterval(id);
  }, [frames.length, fps]);
  return (
    <img
      src={frames[frame]}
      alt="Slime1 Idle"
      style={{
        width: size,
        height: size,
        imageRendering: 'pixelated',
        position: 'absolute',
        left: '50%',
        top: '68%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        userSelect: 'none',
        ...style,
      }}
      draggable={false}
    />
  );
};

export default function PlayerCustomization({ players, onPlayersChange, onComplete, onBack, mainVolume = 1, uiSound = 1 }: PlayerCustomizationProps) {
  const [step, setStep] = useState(1); // 1 = player 1, 2 = player 2
  const [player1Creature, setPlayer1Creature] = useState<CreatureType | null>(null);
  const [player2Creature, setPlayer2Creature] = useState<CreatureType | null>(null);

  const handleSelect = (creature: CreatureType) => {
    if (step === 1) setPlayer1Creature(creature);
    else setPlayer2Creature(creature);
  };

  const handleReady = () => {
    if (step === 1 && player1Creature) {
      const updated = [...players];
      const selected = creatureSelections.find(c => c.type === player1Creature);
      updated[0] = {
        ...updated[0],
        creature: selected ? selected.folder : player1Creature,
        leftIdle: selected ? selected.leftIdle : undefined,
        rightIdle: selected ? selected.rightIdle : undefined,
      };
      onPlayersChange(updated);
      setStep(2);
    } else if (step === 2 && player2Creature) {
      const updated = [...players];
      const selected = creatureSelections.find(c => c.type === player2Creature);
      updated[1] = {
        ...updated[1],
        creature: selected ? selected.folder : player2Creature,
        leftIdle: selected ? selected.leftIdle : undefined,
        rightIdle: selected ? selected.rightIdle : undefined,
      };
      onPlayersChange(updated);
      onComplete();
    }
  };

  // Choose background and selection state
  const bgImg = step === 1 ? '/assets/Menu-Background/Assets/pvp1_select_creature.png' : '/assets/Menu-Background/Assets/pvp2_select_creature.png';
  const selected = step === 1 ? player1Creature : player2Creature;

  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden">
      <AnimatedBackground className="z-0" />
      {/* Back Button - always visible, fixed top left */}
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
      {/* Main Selection Card */}
      <div className="relative flex flex-col items-center justify-center z-10" style={{ width: 800, height: 450 }}>
        <img
          src={bgImg}
          alt="Select Creature"
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] drop-shadow-2xl z-0 select-none pointer-events-none"
          style={{ display: 'block' }}
          draggable="false"
        />
        {/* Selection Buttons */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[45%] w-full flex flex-row justify-center items-center gap-8 z-10">
          {creatureSelections.map((c, idx) => {
            // Determine if this creature is selected for the current player
            const isSelected = selected === c.type;
            // Choose idle or run frames
            let frames, fps;
            if (idx === 1) {
              frames = isSelected ? slime1RunFrames : slime1Frames;
              fps = isSelected ? 10 : 6;
            } else if (idx === 0) {
              frames = isSelected ? slime2RunFrames : slime2Frames;
              fps = isSelected ? 10 : 6;
            } else {
              frames = isSelected ? slime3RunFrames : slime3Frames;
              fps = isSelected ? 10 : 6;
            }
            return (
              <SoundButton
                key={c.type}
                onClick={() => handleSelect(c.type)}
                className={`transition-transform duration-300 focus:outline-none bg-transparent shadow-none ${selected === c.type ? 'scale-110 z-20' : 'scale-100 opacity-80'}`}
                style={{ background: 'none', border: 'none', padding: 0, position: 'relative' }}
                mainVolume={mainVolume}
                uiSound={uiSound}
              >
                <img
                  src={c.img}
                  alt={c.type}
                  className="select-none"
                  draggable="false"
                  style={{ width: 210, height: 'auto' }}
                />
                {/* Show run animation if selected, idle otherwise */}
                <FrameSequenceAnimation frames={frames} fps={fps} size={128} style={idx === 1 ? { top: 'calc(68% - 3px)' } : undefined} />
              </SoundButton>
            );
          })}
        </div>
      </div>
      {/* Ready Button below the container */}
      <div className="absolute left-1/2 -translate-x-1/2 z-20" style={{ top: 'calc(50% + 260px)' }}>
        <SoundButton
          onClick={handleReady}
          disabled={!selected}
          className={`transition-transform duration-300 hover:scale-110 focus:outline-none bg-transparent shadow-none ${!selected ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{ background: 'none', border: 'none', padding: 0 }}
          mainVolume={mainVolume}
          uiSound={uiSound}
        >
          <img
            src="/assets/Menu-Background/Assets/ready_button.png"
            alt="Ready"
            className="w-[250px] h-auto select-none"
            draggable="false"
          />
        </SoundButton>
      </div>
    </div>
  );
}

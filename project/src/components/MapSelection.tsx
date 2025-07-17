import React, { useState } from 'react';
import SoundButton from './SoundButton';

interface MapSelectionProps {
  players: { name: string }[];
  onMapSelect: (map: number) => void;
  onBack: () => void;
  mainVolume?: number;
  uiSound?: number;
}

const selectionPNGs = [
  '/assets/Menu-Background/Assets/selection_1.png',
  '/assets/Menu-Background/Assets/selection_2.png',
  '/assets/Menu-Background/Assets/selection_3.png',
];

const chooseBFPNGs = [
  '/assets/Menu-Background/Assets/Choose_BF_1.png',
  '/assets/Menu-Background/Assets/Choose_BF_2.png',
  '/assets/Menu-Background/Assets/Choose_BF_3.png',
];

const mapIcons = [
  '/assets/Menu-Background/Assets/polar/polar_select_icon.png', // now first
  '/assets/Menu-Background/Assets/river/river_select_icon.png',
  '/assets/Menu-Background/Assets/lava/lava_select_icon.png', // now third
];

export default function MapSelection({ players, onMapSelect, onBack, mainVolume = 1, uiSound = 1 }: MapSelectionProps) {
  const [step, setStep] = useState(1); // 1: Player 1, 2: Player 2, 3: Reveal
  const [player1Choice, setPlayer1Choice] = useState<number | null>(null);
  const [player2Choice, setPlayer2Choice] = useState<number | null>(null);
  const [revealState, setRevealState] = useState<'idle' | 'animating' | 'done'>('idle');
  const [finalMap, setFinalMap] = useState<number | null>(null);
  const [highlight, setHighlight] = useState<number | null>(null);

  // Animation for suspense
  React.useEffect(() => {
    if (step === 3 && revealState === 'idle') {
      if (player1Choice !== null && player2Choice !== null) {
        if (player1Choice === player2Choice) {
          setFinalMap(player1Choice);
          setRevealState('done');
        } else {
          setRevealState('animating');
          // Animation sequence: alternate highlight, then slow down, then pick one
          let sequence = [player1Choice, player2Choice, player1Choice, player2Choice, player1Choice, player2Choice];
          let delays = [200, 200, 300, 400, 600, 900];
          let i = 0;
          function animate() {
            setHighlight(sequence[i]);
            if (i < sequence.length - 1) {
              setTimeout(animate, delays[i]);
              i++;
            } else {
              // Pick one at random
              const chosen = Math.random() < 0.5 ? player1Choice : player2Choice;
              setTimeout(() => {
                setHighlight(chosen);
                setFinalMap(chosen);
                setRevealState('done');
              }, 1000);
            }
          }
          animate();
        }
      }
    }
  }, [step, revealState, player1Choice, player2Choice]);

  // Step 1: Player 1 selection
  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 relative">
        {/* Back button top left of the screen */}
        <div className="absolute left-8 top-8 z-30">
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
              className="w-[180px] h-auto select-none"
              draggable="false"
            />
          </SoundButton>
        </div>
        {/* Local dark overlay for map selection only */}
        <div className="relative flex flex-col items-center justify-center z-20" style={{ width: 800, height: 500 }}>
          <img
            src={chooseBFPNGs[0]}
            alt="Choose Battlefield Player 1"
            className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
            draggable="false"
          />
          {/* Map selection PNGs inside the container, larger size */}
          <div
            className="relative z-10 flex flex-row justify-center items-end gap-12"
            style={{
              position: 'absolute',
              top: 215, // move row down
              left: 0,
              right: 0,
              width: '100%',
              justifyContent: 'center'
            }}
          >
            {selectionPNGs.map((src, idx) => (
              <button
                key={src}
                onClick={() => setPlayer1Choice(idx)}
                className={`transition-transform duration-200 focus:outline-none ${player1Choice === idx ? 'scale-110 z-20' : 'scale-100 opacity-80'}`}
                style={{ background: 'none', border: 'none', padding: 0, position: 'relative' }}
              >
                <img
                  src={src}
                  alt={`Map ${idx + 1}`}
                  style={{ width: '200px', height: '200px' }}
                  className="object-contain select-none"
                  draggable="false"
                />
                {/* Overlay map icon, centered */}
                <img
                  src={mapIcons[idx]}
                  alt={`Map Icon ${idx + 1}`}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 72,
                    height: 72,
                    pointerEvents: 'none',
                  }}
                  draggable="false"
                />
              </button>
            ))}
          </div>
        </div>
        {/* Ready button bottom center of the screen */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-8 z-30">
          <SoundButton
            onClick={() => player1Choice !== null && setStep(2)}
            disabled={player1Choice === null}
            className={`transition-transform duration-300 hover:scale-110 focus:outline-none bg-transparent shadow-none ${player1Choice === null ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ background: 'none', border: 'none', padding: 0 }}
            mainVolume={mainVolume}
            uiSound={uiSound}
          >
            <img
              src="/assets/Menu-Background/Assets/ready_button.png"
              alt="Ready"
              className="w-[180px] h-auto select-none"
              draggable="false"
            />
          </SoundButton>
        </div>
      </div>
    );
  }

  // Step 2: Player 2 selection
  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 relative">
        {/* Back button top left of the screen */}
        <div className="absolute left-8 top-8 z-30">
          <SoundButton
            onClick={() => { setStep(1); setPlayer2Choice(null); }}
            className="transition-transform duration-300 hover:scale-110 focus:outline-none bg-transparent shadow-none"
            style={{ background: 'none', border: 'none', padding: 0 }}
            mainVolume={mainVolume}
            uiSound={uiSound}
          >
            <img
              src="/assets/Menu-Background/Assets/back_button.png"
              alt="Back"
              className="w-[180px] h-auto select-none"
              draggable="false"
            />
          </SoundButton>
        </div>
        {/* Local dark overlay for map selection only */}
        <div className="relative flex flex-col items-center justify-center z-20" style={{ width: 800, height: 500 }}>
          <img
            src={chooseBFPNGs[1]}
            alt="Choose Battlefield Player 2"
            className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
            draggable="false"
          />
          {/* Map selection PNGs inside the container, larger size */}
          <div
            className="relative z-10 flex flex-row justify-center items-end gap-12"
            style={{
              position: 'absolute',
              top: 215, // move row down
              left: 0,
              right: 0,
              width: '100%',
              justifyContent: 'center'
            }}
          >
            {selectionPNGs.map((src, idx) => (
              <button
                key={src}
                onClick={() => setPlayer2Choice(idx)}
                className={`transition-transform duration-200 focus:outline-none ${player2Choice === idx ? 'scale-110 z-20' : 'scale-100 opacity-80'}`}
                style={{ background: 'none', border: 'none', padding: 0, position: 'relative' }}
              >
                <img
                  src={src}
                  alt={`Map ${idx + 1}`}
                  style={{ width: '200px', height: '200px' }}
                  className="object-contain select-none"
                  draggable="false"
                />
                {/* Overlay map icon, centered */}
                <img
                  src={mapIcons[idx]}
                  alt={`Map Icon ${idx + 1}`}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 72,
                    height: 72,
                    pointerEvents: 'none',
                  }}
                  draggable="false"
                />
              </button>
            ))}
          </div>
        </div>
        {/* Ready button bottom center of the screen */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-8 z-30">
          <SoundButton
            onClick={() => player2Choice !== null && setStep(3)}
            disabled={player2Choice === null}
            className={`transition-transform duration-300 hover:scale-110 focus:outline-none bg-transparent shadow-none ${player2Choice === null ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ background: 'none', border: 'none', padding: 0 }}
            mainVolume={mainVolume}
            uiSound={uiSound}
          >
            <img
              src="/assets/Menu-Background/Assets/ready_button.png"
              alt="Ready"
              className="w-[180px] h-auto select-none"
              draggable="false"
            />
          </SoundButton>
        </div>
      </div>
    );
  }

  // Step 3: Reveal/animation
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-black bg-opacity-80">
      <div className="relative flex flex-col items-center justify-center" style={{ width: 800, height: 500 }}>
        <img
          src={chooseBFPNGs[2]}
          alt="Battlefield Reveal"
          className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
          draggable="false"
        />
        <div className="relative z-10 flex flex-row justify-center items-end gap-8" style={{ height: '100%', marginTop: '-140px' }}>
          {/* If both chose the same, show one card. If different, show both and animate */}
          {player1Choice !== null && player2Choice !== null && (
            player1Choice === player2Choice ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={selectionPNGs[player1Choice]}
                  alt={`Map ${player1Choice + 1}`}
                  className="w-56 h-56 object-contain select-none animate-pulse"
                  draggable="false"
                />
                {/* Overlay map icon, centered */}
                <img
                  src={mapIcons[player1Choice]}
                  alt={`Map Icon ${player1Choice + 1}`}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 72,
                    height: 72,
                    pointerEvents: 'none',
                  }}
                  draggable="false"
                />
              </div>
            ) : (
              selectionPNGs.map((src, idx) => {
                if (idx === player1Choice || idx === player2Choice) {
                  let isHighlighted = highlight === idx || finalMap === idx;
                  return (
                    <div key={src} style={{ position: 'relative', display: 'inline-block' }}>
                      <img
                        src={src}
                        alt={`Map ${idx + 1}`}
                        className={`w-48 h-48 object-contain select-none transition-transform duration-300 ${isHighlighted ? 'scale-125 z-20' : 'scale-100 opacity-80'}`}
                        style={{ filter: finalMap === idx ? 'drop-shadow(0 0 16px #fff)' : undefined }}
                        draggable="false"
                      />
                      {/* Overlay map icon, centered and scaled with selection PNG */}
                      <img
                        src={mapIcons[idx]}
                        alt={`Map Icon ${idx + 1}`}
                        className={`transition-transform duration-300 ${isHighlighted ? 'scale-125 z-20' : 'scale-100 opacity-80'}`}
                        style={{
                          position: 'absolute',
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: 72,
                          height: 72,
                          pointerEvents: 'none',
                        }}
                        draggable="false"
                      />
                    </div>
                  );
                }
                return null;
              })
            )
          )}
        </div>
        {/* Play button appears when animation is done */}
        {revealState === 'done' && finalMap !== null && (
          <div className="fixed left-1/2 -translate-x-1/2 bottom-8 z-30">
            <SoundButton
              onClick={() => onMapSelect(finalMap)}
              className="transition-transform duration-300 hover:scale-110 focus:outline-none bg-transparent shadow-none"
              style={{ background: 'none', border: 'none', padding: 0 }}
              mainVolume={mainVolume}
              uiSound={uiSound}
            >
              <img
                src="/assets/Menu-Background/Assets/play_button.png"
                alt="Play"
                className="w-[240px] h-auto select-none"
                draggable="false"
              />
            </SoundButton>
          </div>
        )}
      </div>
    </div>
  );
}
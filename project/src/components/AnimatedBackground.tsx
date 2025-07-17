import React, { useState, useEffect, useRef } from 'react';

// Manually list all frames for each background (sorted)
const BG1_FRAMES = [
  ...[50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140]
].map(n => `/assets/Menu-Background/Assets/Pixel-Art_Background_1/frame${n.toString().padStart(4,'0')}.png`);

const BG2_FRAMES = [
  ...[52,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152]
].map(n => `/assets/Menu-Background/Assets/Pixel-Art_Background_2/frame${n.toString().padStart(4,'0')}.png`);

const BACKGROUNDS = [BG1_FRAMES, BG2_FRAMES];
const ANIMATION_FPS = 12;
const CROSSFADE_DURATION = 1000; // ms

export default function AnimatedBackground({ className = '' }: { className?: string }) {
  const [bgIndex, setBgIndex] = useState(0); // 0 or 1
  const [frameIndex, setFrameIndex] = useState(0);
  const [isCrossfading, setIsCrossfading] = useState(false);
  const frameTimer = useRef<number | undefined>(undefined);
  const crossfadeTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (isCrossfading) return;
    if (frameTimer.current) window.clearTimeout(frameTimer.current);
    frameTimer.current = window.setTimeout(() => {
      if (frameIndex < BACKGROUNDS[bgIndex].length - 1) {
        setFrameIndex(frameIndex + 1);
      } else {
        setIsCrossfading(true);
        crossfadeTimer.current = window.setTimeout(() => {
          setBgIndex((bgIndex + 1) % BACKGROUNDS.length);
          setFrameIndex(0);
          setIsCrossfading(false);
        }, CROSSFADE_DURATION);
      }
    }, 1000 / ANIMATION_FPS);
    // No cleanup function here; cleanup is handled in the unmount effect
  }, [frameIndex, bgIndex, isCrossfading]);

  useEffect(() => {
    return () => {
      if (frameTimer.current) window.clearTimeout(frameTimer.current);
      if (crossfadeTimer.current) window.clearTimeout(crossfadeTimer.current);
    };
  }, []);

  const currentFrame = BACKGROUNDS[bgIndex][frameIndex];
  const prevBgIndex = (bgIndex + BACKGROUNDS.length - 1) % BACKGROUNDS.length;
  const prevFrame = BACKGROUNDS[prevBgIndex][BACKGROUNDS[prevBgIndex].length - 1];

  return (
    <>
      <img
        src={isCrossfading ? prevFrame : currentFrame}
        alt="background frame"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isCrossfading ? 'opacity-100' : 'opacity-0'} z-0 ${className}`}
        style={{ pointerEvents: 'none' }}
      />
      <img
        src={currentFrame}
        alt="background frame"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isCrossfading ? 'opacity-0' : 'opacity-100'} z-0 ${className}`}
        style={{ pointerEvents: 'none' }}
      />
    </>
  );
} 
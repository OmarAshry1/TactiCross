import React, { useState, useEffect, useRef } from 'react';
import SoundButton from './SoundButton';
import { Play, Settings } from 'lucide-react';
import AnimatedBackground from './AnimatedBackground';

// Helper to generate sorted frame URLs for a background
function getFrameUrls(folder: string, frameCount: number, pad: number = 4) {
  return Array.from({ length: frameCount }, (_, i) => {
    const num = (i + 1).toString().padStart(pad, '0');
    // Find the actual frame file (since your frames start at e.g. 0050, 0060, etc.)
    // We'll try all numbers from 0 to 9999, but only use those that exist
    return `${folder}/frame${num}.png`;
  });
}

// Manually list all frames for each background (sorted)
const BG1_FRAMES = [
  // Sorted by filename (lowest to highest)
  ...[50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140]
].map(n => `/assets/Menu-Background/Assets/Pixel-Art_Background_1/frame${n.toString().padStart(4,'0')}.png`);

const BG2_FRAMES = [
  // Sorted by filename (lowest to highest)
  ...[52,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152]
].map(n => `/assets/Menu-Background/Assets/Pixel-Art_Background_2/frame${n.toString().padStart(4,'0')}.png`);

const BACKGROUNDS = [BG1_FRAMES, BG2_FRAMES];
const ANIMATION_FPS = 12;
const CROSSFADE_DURATION = 1000; // ms

interface StartingPageProps {
  onPlay: () => void;
  onSettings: () => void;
  mainVolume?: number;
  uiSound?: number;
}

export default function StartingPage({ onPlay, onSettings, mainVolume = 1, uiSound = 1 }: StartingPageProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20 z-10 transition-opacity duration-1000" />
      <div className="relative z-20 min-h-screen flex items-center justify-center">
        {/* Game Logo and Buttons */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center z-20">
            <img
              src="/assets/Menu-Background/Assets/title.png"
              alt="TactiCross Title"
              className="mx-auto mb-2 max-w-[80vw] w-[70vw] max-w-[90vw] drop-shadow-2xl floating-title"
              style={{ height: 'auto' }}
            />
            <div className="flex flex-col items-center space-y-2 mt-2">
              {/* Play Button as Image */}
              <SoundButton
                onClick={onPlay}
                className="focus:outline-none z-20 mb-2 transition-transform duration-300 hover:scale-110 hover:z-30"
                style={{ background: 'none', border: 'none', padding: 0 }}
                mainVolume={mainVolume}
                uiSound={uiSound}
              >
                <img
                  src="/assets/Menu-Background/Assets/play_button.png"
                  alt="Play Button"
                  className="w-[20vw] h-auto select-none"
                  draggable="false"
                />
              </SoundButton>
              {/* Settings Button as Image */}
              <SoundButton
                onClick={onSettings}
                className="focus:outline-none z-20 transition-transform duration-300 hover:scale-110 hover:z-30"
                style={{ background: 'none', border: 'none', padding: 0 }}
                mainVolume={mainVolume}
                uiSound={uiSound}
              >
                <img
                  src="/assets/Menu-Background/Assets/settings_button.png"
                  alt="Settings Button"
                  className="w-[20vw] h-auto select-none"
                  draggable="false"
                />
              </SoundButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
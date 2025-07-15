import React, { ButtonHTMLAttributes, useRef } from 'react';

interface SoundButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  mainVolume?: number;
  uiSound?: number;
}

const hoverSound = '/assets/Menu-Background/music/button_hover.wav';
const clickSound = '/assets/Menu-Background/music/Button_click.wav';

export default function SoundButton({ className = '', children, mainVolume = 1, uiSound = 1, ...props }: SoundButtonProps) {
  const handleMouseEnter = () => {
    const audio = new Audio(hoverSound);
    audio.volume = mainVolume * uiSound;
    audio.play();
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const audio = new Audio(clickSound);
    audio.volume = mainVolume * uiSound;
    audio.play();
    if (props.onClick) props.onClick(e);
  };

  return (
    <button
      {...props}
      className={className}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
    >
      {children}
    </button>
  );
} 
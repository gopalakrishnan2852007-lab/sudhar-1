"use client";

import { Play, Pause } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface MediaControlsProps {
  audioUrl: string | null;
  onClose?: () => void;
}

export function MediaControls({ audioUrl, onClose }: MediaControlsProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(e => console.error("Audio playback failed", e));
      setIsPlaying(true);
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const changeSpeed = () => {
    if (audioRef.current) {
      const newRate = playbackRate === 1 ? 0.75 : playbackRate === 0.75 ? 1.25 : 1;
      audioRef.current.playbackRate = newRate;
      setPlaybackRate(newRate);
    }
  };

  if (!audioUrl) return null;

  return (
    <motion.div 
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-32 left-1/2 transform -translate-x-1/2 bg-[#112240] rounded-full px-6 py-3 shadow-neumorphic border border-[#162b50] flex items-center gap-6 z-50"
    >
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} className="hidden" />
      
      <button onClick={changeSpeed} className="text-textMuted hover:text-primary text-sm font-bold w-8 focus-ring">
        {playbackRate}x
      </button>

      <button onClick={togglePlay} className="text-textMain hover:text-primary focus-ring rounded-full bg-background p-2 shadow-neumorphic-inset">
        {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
      </button>

      {onClose && (
        <button onClick={onClose} className="text-textMuted hover:text-red-400 focus-ring rounded-full text-xs uppercase tracking-widest font-semibold pl-2 border-l border-[#1a365d]">
          Close
        </button>
      )}
    </motion.div>
  );
}

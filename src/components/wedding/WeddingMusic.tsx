"use client";

import { Music2, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function WeddingMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    const handleOpenInvitation = () => {
      const audio = audioRef.current;
      if (!audio) return;

      void audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    };

    window.addEventListener("wedding:open", handleOpenInvitation);
    return () => window.removeEventListener("wedding:open", handleOpenInvitation);
  }, []);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      void audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        loop
        preload="metadata"
        src="./audio/you-are-the-one-raef.mp3"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setIsAvailable(false)}
      />

      {isAvailable ? (
        <button
          type="button"
          onClick={toggleMusic}
          aria-label={isPlaying ? "Matikan musik" : "Putar musik"}
          title="You Are The One — Raef"
          className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-[#D8C7A8]/35 bg-[#485340]/92 text-[#F6F0E6] shadow-[0_12px_35px_rgba(50,53,47,0.24)] backdrop-blur-md transition hover:bg-[#3C4636]"
        >
          <span className={isPlaying ? "absolute animate-ping opacity-15" : "hidden"}>
            <Music2 className="h-5 w-5" />
          </span>
          {isPlaying ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </button>
      ) : null}
    </>
  );
}

"use client";

import { Music2, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const SEGMENT_START = 85; // 01:25
const SEGMENT_END = 170; // 02:45

const TARGET_VOLUME = 0.32;
const INITIAL_FADE_DURATION = 1500;
const CROSSFADE_DURATION = 5000;

type AudioIndex = 0 | 1;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function WeddingMusic() {
  const audioARef = useRef<HTMLAudioElement>(null);
  const audioBRef = useRef<HTMLAudioElement>(null);

  const activeIndexRef = useRef<AudioIndex>(0);
  const crossfadingRef = useRef(false);
  const animationRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  const getAudios = useCallback(() => {
    return [audioARef.current, audioBRef.current] as const;
  }, []);

  const cancelAnimation = useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const fadeIn = useCallback(
    (audio: HTMLAudioElement) => {
      cancelAnimation();

      const startedAt = performance.now();
      audio.volume = 0;

      const animate = (now: number) => {
        const progress = clamp(
          (now - startedAt) / INITIAL_FADE_DURATION,
          0,
          1,
        );

        audio.volume = TARGET_VOLUME * progress;

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          audio.volume = TARGET_VOLUME;
          animationRef.current = null;
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    },
    [cancelAnimation],
  );

  const crossfade = useCallback(async () => {
    if (crossfadingRef.current) return;

    const audios = getAudios();

    const activeIndex = activeIndexRef.current;
    const nextIndex: AudioIndex = activeIndex === 0 ? 1 : 0;

    const outgoing = audios[activeIndex];
    const incoming = audios[nextIndex];

    if (!outgoing || !incoming) return;

    crossfadingRef.current = true;
    cancelAnimation();

    incoming.currentTime = SEGMENT_START;
    incoming.volume = 0;
    incoming.muted = false;

    try {
      await incoming.play();
    } catch {
      crossfadingRef.current = false;
      return;
    }

    const startedAt = performance.now();

    const animate = (now: number) => {
      const progress = clamp(
        (now - startedAt) / CROSSFADE_DURATION,
        0,
        1,
      );

      /*
       * Equal-power-ish crossfade.
       * Lebih smooth daripada linear:
       *
       * outgoing: 100% -> 0%
       * incoming: 0%   -> 100%
       */
      const fadeOut = Math.cos((progress * Math.PI) / 2);
      const fadeInValue = Math.sin((progress * Math.PI) / 2);

      outgoing.volume = clamp(
        TARGET_VOLUME * fadeOut,
        0,
        TARGET_VOLUME,
      );

      incoming.volume = clamp(
        TARGET_VOLUME * fadeInValue,
        0,
        TARGET_VOLUME,
      );

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      outgoing.pause();
      outgoing.currentTime = SEGMENT_START;
      outgoing.volume = 0;

      incoming.volume = TARGET_VOLUME;

      activeIndexRef.current = nextIndex;
      crossfadingRef.current = false;
      animationRef.current = null;
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [cancelAnimation, getAudios]);

  const startMusic = useCallback(async () => {
    const [audioA, audioB] = getAudios();

    if (!audioA || !audioB) return;

    cancelAnimation();

    audioA.pause();
    audioB.pause();

    audioA.currentTime = SEGMENT_START;
    audioB.currentTime = SEGMENT_START;

    audioA.volume = 0;
    audioB.volume = 0;

    audioA.muted = false;
    audioB.muted = false;

    activeIndexRef.current = 0;
    crossfadingRef.current = false;

    try {
      await audioA.play();

      setIsPlaying(true);
      fadeIn(audioA);
    } catch {
      setIsPlaying(false);
    }
  }, [cancelAnimation, fadeIn, getAudios]);

  /*
   * Klik "Buka Undangan" dari CoverSection
   * langsung memulai musik.
   */
  useEffect(() => {
    const handleOpenInvitation = () => {
      void startMusic();
    };

    window.addEventListener(
      "wedding:open",
      handleOpenInvitation,
    );

    return () => {
      window.removeEventListener(
        "wedding:open",
        handleOpenInvitation,
      );
    };
  }, [startMusic]);

  /*
   * Monitor posisi lagu.
   *
   * Crossfade dimulai 5 detik sebelum SEGMENT_END,
   * jadi pada 02:40 audio berikutnya sudah mulai
   * bermain dari 01:25.
   */
  useEffect(() => {
    if (!isPlaying) return;

    const timer = window.setInterval(() => {
      if (crossfadingRef.current) return;

      const audios = getAudios();
      const active = audios[activeIndexRef.current];

      if (!active || active.paused) return;

      const crossfadeStart =
        SEGMENT_END - CROSSFADE_DURATION / 1000;

      if (active.currentTime >= crossfadeStart) {
        void crossfade();
      }
    }, 100);

    return () => window.clearInterval(timer);
  }, [crossfade, getAudios, isPlaying]);

  const toggleMusic = async () => {
    const audios = getAudios();

    const active = audios[activeIndexRef.current];
    const inactive =
      audios[activeIndexRef.current === 0 ? 1 : 0];

    if (!active) return;

    if (isPlaying) {
      cancelAnimation();

      active.pause();
      inactive?.pause();

      /*
       * Kalau user pause saat crossfade,
       * kita bersihkan audio kedua supaya saat resume
       * tidak ada dua track nyangkut.
       */
      if (inactive) {
        inactive.currentTime = SEGMENT_START;
        inactive.volume = 0;
      }

      active.volume = TARGET_VOLUME;
      crossfadingRef.current = false;

      setIsPlaying(false);
      return;
    }

    if (
      active.currentTime < SEGMENT_START ||
      active.currentTime >= SEGMENT_END
    ) {
      active.currentTime = SEGMENT_START;
      active.volume = 0;
    }

    active.muted = false;

    try {
      await active.play();
      setIsPlaying(true);

      fadeIn(active);
    } catch {
      setIsPlaying(false);
    }
  };

  /*
   * Dua audio memakai source yang sama.
   * Audio B hanya digunakan beberapa detik
   * ketika proses crossfade.
   */
  return (
    <>
      <audio
        ref={audioARef}
        preload="auto"
        src="./audio/you-are-the-one-raef.mp3"
        onError={() => setIsAvailable(false)}
      />

      <audio
        ref={audioBRef}
        preload="auto"
        src="./audio/you-are-the-one-raef.mp3"
        onError={() => setIsAvailable(false)}
      />

      {isAvailable && (
        <button
          type="button"
          onClick={toggleMusic}
          aria-label={
            isPlaying ? "Jeda musik" : "Putar musik"
          }
          title="You Are The One — Raef"
          className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-[#D8C7A8]/35 bg-[#485340]/92 text-[#F6F0E6] shadow-[0_12px_35px_rgba(50,53,47,0.24)] backdrop-blur-md transition hover:bg-[#3C4636]"
        >
          {isPlaying ? (
            <>
              <span className="absolute animate-ping opacity-15">
                <Music2 className="h-5 w-5" />
              </span>

              <Volume2 className="h-5 w-5" />
            </>
          ) : (
            <VolumeX className="h-5 w-5" />
          )}
        </button>
      )}
    </>
  );
}